import os

from anthropic import AsyncAnthropic

from trinity_intelligence_cloud.ai_router.base import AIClient


class AnthropicClient(AIClient):
    def __init__(self) -> None:
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    async def complete(self, prompt: str, **kwargs) -> str:
        response = await self.client.messages.create(
            model=kwargs.get("model", "claude-3-opus-20240229"),
            max_tokens=kwargs.get("max_tokens", 4096),
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    async def vision(self, image_bytes: bytes, prompt: str, **kwargs) -> str:
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image", "source": {"bytes": image_bytes}},
                    ],
                }
            ],
        )
        return response.content[0].text

    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        raise NotImplementedError("Anthropic does not support image generation")

    async def embed(self, text: str):
        raise NotImplementedError("Anthropic embeddings are not available")

    async def transcribe(self, audio_bytes: bytes) -> str:
        raise NotImplementedError("Anthropic does not support audio transcription")
