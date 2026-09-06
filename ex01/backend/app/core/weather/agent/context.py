from dataclasses import dataclass

from langchain.chat_models import BaseChatModel

from app.core.weather.service import WeatherService


@dataclass
class WeatherContext:
    llm: BaseChatModel
    weather_service: WeatherService
