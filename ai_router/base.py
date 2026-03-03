from typing import List


class AIClient:
    """Base interface for all AI model providers."""

    async def complete(self, prompt: str, **kwargs) -> str:
        raise NotImplementedError

    async def vision(self, image_bytes: bytes, prompt: str, **kwargs) -> str:
        raise NotImplementedError

    async def embed(self, text: str) -> List[float]:
        raise NotImplementedError

    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        raise NotImplementedError

    async def transcribe(self, audio_bytes: bytes) -> str:
        raise NotImplementedError
