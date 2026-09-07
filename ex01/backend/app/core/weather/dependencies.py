from typing import Annotated, cast

from fastapi import Depends, Request

from app.config import settings
from app.core.weather.agent import WeatherAgent as WeatherAgentImpl
from app.core.weather.agent.context import WeatherContext as WeatherContextImpl
from app.core.weather.service import WeatherService as WeatherServiceImpl
from app.infra.llm.dependencies import get_chat_model


def get_weather_service() -> WeatherServiceImpl:
    return WeatherServiceImpl()


WeatherService = Annotated[WeatherServiceImpl, Depends(get_weather_service)]


def get_weather_context(weather_service: WeatherService) -> WeatherContextImpl:
    llm = get_chat_model(settings.weather_model)
    return WeatherContextImpl(llm=llm, weather_service=weather_service)


WeatherContext = Annotated[WeatherContextImpl, Depends(get_weather_context)]


def get_weather_agent(request: Request) -> WeatherAgentImpl:
    return cast(WeatherAgentImpl, request.app.state.agent)


WeatherAgent = Annotated[WeatherAgentImpl, Depends(get_weather_agent)]
