import json
import uuid
from typing import Dict, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from trinity_intelligence_cloud.api.schemas import (
    JobListResponse,
    JobStatusResponse,
    JobSubmitRequest,
    JobSubmitResponse,
)
from trinity_intelligence_cloud.queue.events import JobRecord
from trinity_intelligence_cloud.queue.manager import job_service
from trinity_intelligence_cloud.security.decorators import (
    enforce_job_scope,
    require_auth,
)
from trinity_intelligence_cloud.security.tenants import get_tenant_from_user
from trinity_intelligence_cloud.storage.object_store import save_upload
from trinity_intelligence_cloud.storage.presigned import create_presigned_download_url

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
    responses={404: {"description": "Job not found"}},
)


@router.post(
    "/",
    status_code=202,
    summary="Submit a job to Trinity Intelligence Cloud",
    description="Submit a new job to the distributed queue using JSON payloads.",
    response_model=JobSubmitResponse,
)
async def submit_job(
    body: JobSubmitRequest,
    user=Depends(require_auth),
) -> JobSubmitResponse:
    enforce_job_scope(body.job_type, user)
    payload = dict(body.payload or {})
    tenant = get_tenant_from_user(user)
    payload.setdefault("tenant", tenant)

    job = await job_service.enqueue_job(body.job_type, payload, tenant=tenant)
    return JobSubmitResponse(job_id=job.job_id, status=job.status.value, job_type=job.job_type)


@router.post(
    "/submit",
    status_code=202,
    summary="Submit a job via multipart form-data",
    description=(
        "Submit a job with optional file uploads. Payload should be provided as a JSON string"
        " in the `payload` field and files are streamed directly into object storage."
    ),
    response_model=JobSubmitResponse,
)
async def submit_job_form(
    job_type: str = Form(..., description="Registered microcontainer job type"),
    payload: str = Form("{}", description="JSON payload string"),
    file: UploadFile | None = File(
        None,
        description="Optional file to upload before executing the job",
    ),
    user=Depends(require_auth),
) -> JobSubmitResponse:
    enforce_job_scope(job_type, user)
    try:
        payload_dict = json.loads(payload) if payload else {}
    except json.JSONDecodeError as exc:  # pragma: no cover - validation
        raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {exc}") from exc
    tenant = get_tenant_from_user(user)
    job_id = str(uuid.uuid4())
    if file:
        input_key = await save_upload(job_id, file, tenant)
        payload_dict["input_key"] = input_key

    payload_dict.setdefault("tenant", tenant)

    job = await job_service.enqueue_job(job_type, payload_dict, job_id=job_id, tenant=tenant)
    return JobSubmitResponse(job_id=job.job_id, status=job.status.value, job_type=job.job_type)


@router.get(
    "/{job_id}",
    summary="Get job status",
    description="Returns the current status of a job, including download links when available.",
    response_model=JobStatusResponse,
)
async def job_status(
    job_id: str,
    include_download_url: bool = Query(
        False,
        description="Include presigned download URL when output is ready.",
    ),
    user=Depends(require_auth),
) -> JobStatusResponse:
    job = await job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    _authorize_job_access(job, user)
    return _serialize_job(job, include_download_url)


@router.get(
    "/",
    summary="List recent jobs",
    description="Returns paginated job metadata for observability dashboards.",
    response_model=JobListResponse,
)
async def list_jobs(user=Depends(require_auth)) -> JobListResponse:
    jobs = await job_service.list_jobs()
    jobs = _filter_jobs_for_user(jobs, user)
    return JobListResponse(jobs=[_serialize_job(job) for job in jobs])


def _serialize_job(job: JobRecord, include_download_url: bool = False) -> JobStatusResponse:
    download_url = None
    if include_download_url and job.output_path:
        _assert_output_path(job)
        download_url = create_presigned_download_url(job.output_path, tenant=job.tenant)

    return JobStatusResponse(
        job_id=job.job_id,
        job_type=job.job_type,
        status=job.status.value,
        tenant=job.tenant,
        output_path=job.output_path,
        download_url=download_url,
        error=job.error,
        created_at=job.created_at,
        updated_at=job.updated_at,
        payload=job.payload,
    )


def _filter_jobs_for_user(jobs: List[JobRecord], user: Dict) -> List[JobRecord]:
    role = user.get("role")
    if role == "admin":
        return jobs
    tenant = get_tenant_from_user(user)
    return [job for job in jobs if job.tenant == tenant]


def _authorize_job_access(job: JobRecord, user: Dict) -> None:
    role = user.get("role")
    if role == "admin":
        return

    tenant = get_tenant_from_user(user)
    if job.tenant != tenant:
        raise HTTPException(status_code=403, detail="Cross-tenant job access denied.")


def _assert_output_path(job: JobRecord) -> None:
    if job.output_path and not job.output_path.startswith(f"{job.tenant}/"):
        raise HTTPException(status_code=500, detail="Job output escaped tenant boundary")
