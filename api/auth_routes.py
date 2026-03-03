from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from trinity_intelligence_cloud.security.api_keys import generate_api_key
from trinity_intelligence_cloud.security.auth import create_jwt
from trinity_intelligence_cloud.security.decorators import require_role
from trinity_intelligence_cloud.security.rbac import ROLE_SCOPES

router = APIRouter(prefix="/auth", tags=["Auth"])

USERS = {
    "admin@tic.local": {"password": "admin", "role": "admin", "tenant": "tic-admin"},
    "operator@tic.local": {
        "password": "operator",
        "role": "operator",
        "tenant": "tenant-alpha",
    },
}


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    tenant: str


class APIKeyRequest(BaseModel):
    label: str
    role: str = "admin"
    tenant: str | None = None


class APIKeyResponse(BaseModel):
    api_key: str


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest) -> LoginResponse:
    user = USERS.get(body.username)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_jwt(body.username, user["role"], user["tenant"])
    return LoginResponse(access_token=token, role=user["role"], tenant=user["tenant"])


@router.get("/roles")
async def list_roles(user=Depends(require_role("admin"))):
    return ROLE_SCOPES


@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    body: APIKeyRequest,
    user=Depends(require_role("admin")),
) -> APIKeyResponse:
    tenant = body.tenant or user.get("tenant")
    key = generate_api_key(body.label, role=body.role, tenant=tenant)
    return APIKeyResponse(api_key=key)
