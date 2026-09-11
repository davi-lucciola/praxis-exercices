from functools import lru_cache
from typing import Protocol

from langchain.chat_models import BaseChatModel
from pydantic import BaseModel, ConfigDict

from app.config import settings
from app.core.weather.service import WeatherService
from app.infra.llm.dependencies import get_chat_model


class WeatherContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, extra='ignore')

    llm: BaseChatModel | None = None
    weather_service: WeatherService | None = None


class _HasWeatherContext(Protocol):
    context: WeatherContext | None


@lru_cache(maxsize=8)
def _cached_weather_context(model: str) -> WeatherContext:
    return WeatherContext(
        llm=get_chat_model(model),
        weather_service=WeatherService(),
    )


def create_weather_context(
    llm: BaseChatModel | None = None, weather_service: WeatherService | None = None
) -> WeatherContext:
    resolved_model = settings.weather_model

    if llm is None and weather_service is None:
        return _cached_weather_context(resolved_model)

    return WeatherContext(
        llm=llm or get_chat_model(resolved_model),
        weather_service=weather_service or WeatherService(),
    )


def resolve_weather_context(runtime: _HasWeatherContext) -> WeatherContext:
    ctx = runtime.context

    if ctx is not None and ctx.llm is not None and ctx.weather_service is not None:
        return ctx

    defaults = create_weather_context()

    if ctx is None:
        return defaults

    return ctx.model_copy(
        update={
            'llm': ctx.llm or defaults.llm,
            'weather_service': ctx.weather_service or defaults.weather_service,
        }
    )
