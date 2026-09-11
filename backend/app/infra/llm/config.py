from pydantic_settings import BaseSettings

from app.config import app_settings_config


class LLMSettings(BaseSettings):
    model_config = app_settings_config()

    openrouter_api_url: str
    openrouter_api_key: str


llm_settings = LLMSettings()
