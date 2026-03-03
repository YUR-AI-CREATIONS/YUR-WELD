import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile

from trinity_intelligence_cloud.queue.manager import job_service
from trinity_intelligence_cloud.security.decorators import enforce_job_scope, require_auth
from trinity_intelligence_cloud.security.tenants import get_tenant_from_user
from trinity_intelligence_cloud.storage.object_store import save_upload

router = APIRouter()


@router.post("/upload", summary="Ingest arbitrary file payloads")
async def upload_artifact(
    file: UploadFile = File(...),
    job_type: str = Query("pdf_to_sheet", description="Microcontainer job type"),
    user=Depends(require_auth),
) -> dict:
    enforce_job_scope(job_type, user)
    tenant = get_tenant_from_user(user)
    job_id = str(uuid.uuid4())
    payload_ref = await save_upload(job_id, file, tenant)
    payload = {"input_key": payload_ref, "tenant": tenant}

    job = await job_service.enqueue_job(job_type, payload, job_id=job_id, tenant=tenant)
    return {"job_id": job.job_id, "object_uri": payload_ref}
