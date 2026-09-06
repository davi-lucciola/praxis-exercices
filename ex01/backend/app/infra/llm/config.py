from app.config import app_settings_config


class LLMSettings:
    model_config = app_settings_config('LLM_')

    openrouter_api_url: str
    openrouter_api_key: str


llm_settings = LLMSettings()
