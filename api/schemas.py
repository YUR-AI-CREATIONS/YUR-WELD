from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class JobSubmitRequest(BaseModel):
    job_type: str = Field(..., example="pdf_to_sheet")
    payload: Dict[str, Any] = Field(
        default_factory=dict,
        example={"prompt": "Render a modern commercial building."},
    )


class JobSubmitResponse(BaseModel):
    job_id: str = Field(..., example="f2d5a1f2-889b-4d62-8a5a-3af7d0f8205b")
    status: str = Field(..., example="queued")
    job_type: str = Field(..., example="pdf_to_sheet")


class JobStatusResponse(BaseModel):
    job_id: str = Field(..., example="f2d5a1f2-889b-4d62-8a5a-3af7d0f8205b")
    job_type: str = Field(..., example="website_autogen")
    status: str = Field(..., example="completed")
    tenant: str = Field(..., example="tenant-alpha")
    output_path: Optional[str] = Field(
        None,
        example="tenant-alpha/outputs/f2d5a1f2-889b-4d62-8a5a-3af7d0f8205b/site.zip",
    )
    download_url: Optional[str] = Field(
        None,
        example="https://storage.local/outputs/...",
        description="Presigned download URL when available.",
    )
    error: Optional[str] = Field(None, example=None)
    created_at: float = Field(..., example=1_700_000_000.0)
    updated_at: float = Field(..., example=1_700_000_500.0)
    payload: Dict[str, Any] = Field(default_factory=dict)


class JobListResponse(BaseModel):
    jobs: List[JobStatusResponse]


class SystemHealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    service: str = Field(..., example="Trinity Intelligence Cloud")
    timestamp: Optional[str] = Field(None, example="2025-11-21T12:00:00Z")
    dependencies: Optional[Dict[str, Dict[str, str]]] = None
    microcontainers: Optional[List[str]] = None


class MicrocontainerListResponse(BaseModel):
    count: int = Field(..., example=4)
    microcontainers: List[str] = Field(
        ..., example=["pdf_to_sheet", "render_image", "render_video", "website_autogen"],
    )
