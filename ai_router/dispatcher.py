from typing import Dict

from trinity_intelligence_cloud.ai_router.anthropic_provider import AnthropicClient
from trinity_intelligence_cloud.ai_router.base import AIClient
from trinity_intelligence_cloud.ai_router.gemini_provider import GeminiClient
from trinity_intelligence_cloud.ai_router.local_provider import LocalModelClient
from trinity_intelligence_cloud.ai_router.openai_provider import OpenAIClient

openai_client = OpenAIClient()
gemini_client = GeminiClient()
anthropic_client = AnthropicClient()
local_client = LocalModelClient()

ENGINE_MATRIX: Dict[str, AIClient] = {
    "ingest": anthropic_client,
    "pdf_to_sheet": anthropic_client,
    "render_image": gemini_client,
    "render_video": gemini_client,
    "website_autogen": openai_client,
    "marketing": openai_client,
    "local": local_client,
}


def pick_engine(job_type: str) -> AIClient:
    return ENGINE_MATRIX.get(job_type, openai_client)
