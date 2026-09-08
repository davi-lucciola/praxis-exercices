from app.core.weather.schemas import WeatherOut


class WeatherService:
    async def find_by_city(self, city: str) -> WeatherOut:  # ruff: ignore[no-self-use]
        return WeatherOut(temperature=26)
