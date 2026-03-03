from typing import List

from trinity_intelligence_cloud.ai_router.base import AIClient


class LocalModelClient(AIClient):
    """Placeholder local GPU inference hooks."""

    async def complete(self, prompt: str, **kwargs) -> str:
        return f"[LocalModel] Prompt received: {prompt[:120]}"

    async def vision(self, image_bytes: bytes, prompt: str, **kwargs) -> str:
        return f"[LocalVision] Prompt: {prompt[:80]}"

    async def embed(self, text: str) -> List[float]:
        return [0.0] * 768

    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        raise NotImplementedError("Local image generation pipeline pending wiring")

    async def transcribe(self, audio_bytes: bytes) -> str:
        return "[LocalTranscriber]"
}