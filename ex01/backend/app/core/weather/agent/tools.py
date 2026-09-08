from langchain.tools import ToolRuntime, tool

from app.core.weather.agent.context import WeatherContext, resolve_weather_context
from app.core.weather.schemas import WeatherOut


@tool
async def get_weather(city: str, runtime: ToolRuntime[WeatherContext]) -> WeatherOut:
    """This function returns weather info given the city

    Args:
        city (str): City to get weather infos

    Returns:
        WeatherOut: All weather information about the city
    """
    ctx = resolve_weather_context(runtime)
    return await ctx.weather_service.find_by_city(city)
