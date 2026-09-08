from langchain.tools import ToolRuntime, tool

from app.core.weather.agent.context import WeatherContext, resolve_weather_context


@tool
async def get_weather(city: str, runtime: ToolRuntime[WeatherContext]) -> str:
    """This function returns weather info given the city

    Args:
        city (str): City to get weather infos

    Returns:
        str: JSON object with city, temperature and condition
    """
    ctx = resolve_weather_context(runtime)
    weather = await ctx.weather_service.find_by_city(city)
    return weather.model_dump_json()
