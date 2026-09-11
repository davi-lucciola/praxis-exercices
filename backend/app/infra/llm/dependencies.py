from langchain.chat_models import BaseChatModel, init_chat_model

from app.infra.llm.config import llm_settings


def get_chat_model(model: str, temperature: float = 0) -> BaseChatModel:
    return init_chat_model(
        model,
        temperature=temperature,
        model_provider='openai',
        openai_api_key=llm_settings.openrouter_api_key,
        openai_api_base=llm_settings.openrouter_api_url,
    )
