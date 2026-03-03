import asyncio
import os

import google.generativeai as genai

from trinity_intelligence_cloud.ai_router.base import AIClient


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class GeminiClient(AIClient):
    async def complete(self, prompt: str, **kwargs) -> str:
        model = genai.GenerativeModel("gemini-2.0-pro")
        response = await asyncio.to_thread(model.generate_content, prompt)
        return response.text

    async def vision(self, image_bytes: bytes, prompt: str, **kwargs) -> str:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = await asyncio.to_thread(model.generate_content, [prompt, image_bytes])
        return response.text

    async def generate_image(self, prompt: str, **kwargs) -> bytes:
        model = genai.GenerativeModel("imagen-3.0")
        result = await asyncio.to_thread(model.generate_image, prompt)
        return result.image_as_bytes()

    async def embed(self, text: str):
        embed_model = genai.GenerativeModel("embedding-1")
        response = await asyncio.to_thread(embed_model.embed_content, text)
        return response

    async def transcribe(self, audio_bytes: bytes) -> str:
        return "Gemini transcription pipeline pending public release"
