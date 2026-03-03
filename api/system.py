from datetime import datetime

from fastapi import APIRouter, Depends

from trinity_intelligence_cloud.api.schemas import (
    MicrocontainerListResponse,
    SystemHealthResponse,
)
from trinity_intelligence_cloud.microcontainers.registry import MICROCONTAINERS
from trinity_intelligence_cloud.queue.redis_queue import RedisQueue
from trinity_intelligence_cloud.security.decorators import require_auth
from trinity_intelligence_cloud.storage.minio_client import (
    MINIO_BUCKET,
    get_minio_client,
)

router = APIRouter(
    prefix="/system",
    tags=["System"],
    responses={404: {"description": "Not found"}},
)
_redis_queue = RedisQueue()


@router.get(
    "/health",
    summary="Check overall system health",
    description="Returns status information for Redis, MinIO, and registered microcontainers.",
    response_model=SystemHealthResponse,
)
async def health_check(user=Depends(require_auth)) -> SystemHealthResponse:
    service_status = "ok"
    dependencies = {
        "redis": {"status": "ok"},
        "object_store": {"status": "ok"},
    }

    try:
        await _redis_queue.redis.ping()
    except Exception as exc:  # pragma: no cover - defensive
        dependencies["redis"] = {"status": "error", "detail": str(exc)}
        service_status = "degraded"

    try:
        client = get_minio_client()
        client.bucket_exists(MINIO_BUCKET)
    except Exception as exc:  # pragma: no cover - defensive
        dependencies["object_store"] = {"status": "error", "detail": str(exc)}
        service_status = "degraded"

    return SystemHealthResponse(
        status=service_status,
        service="Trinity Intelligence Cloud",
        timestamp=datetime.utcnow().isoformat(),
        dependencies=dependencies,
        microcontainers=sorted(MICROCONTAINERS.keys()),
    )


@router.get(
    "/microcontainers",
    summary="List registered microcontainers",
    response_model=MicrocontainerListResponse,
)
async def list_microcontainers(user=Depends(require_auth)) -> MicrocontainerListResponse:
    return MicrocontainerListResponse(
        count=len(MICROCONTAINERS),
        microcontainers=sorted(MICROCONTAINERS.keys()),
    )
