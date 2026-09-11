from typing import Annotated, cast

from fastapi import Depends, Request

from app.core.weather.agent import WeatherAgent as WeatherAgentImpl


def get_weather_agent(request: Request) -> WeatherAgentImpl:
    return cast(WeatherAgentImpl, request.app.state.agent)


WeatherAgent = Annotated[WeatherAgentImpl, Depends(get_weather_agent)]
