import os

from openai import AsyncOpenAI

from trinity_intelligence_cloud.ai_router.base import AIClient


class OpenAIClient(AIClient):
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def complete(self, prompt: str, **kwargs) -> str:
        response = await self.client.chat.completions.create(
            model=kwargs.get("model", "gpt-4.1"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=kwargs.get("max_tokens", 4096),
            temperature=kwargs.get("temperature", 0.2),
        )
        return response.choices[0].message["content"]

    async def vision(self, image_bytes: bytes, prompt: str, **kwargs) -> str:
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": prompt},
                        {"type": "input_image", "image": image_bytes},
                    ],
                }
            ],
        )
        return response.choices[0].message["content"]

    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        response = await self.client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size=kwargs.get("size", "1024x1024"),
        )
        return response.data[0].b64_json

    async def embed(self, text: str):
        response = await self.client.embeddings.create(
            model="text-embedding-3-large",
            input=text,
        )
        return response.data[0].embedding

    async def transcribe(self, audio_bytes: bytes) -> str:
        response = await self.client.audio.transcriptions.create(
            file=("audio.wav", audio_bytes),
            model="gpt-4o-mini-tts",
        )
        return response.text
