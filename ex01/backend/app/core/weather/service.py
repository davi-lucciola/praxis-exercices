from app.core.weather.schemas import WeatherOut


class WeatherService:
    def find_by_city(self, city: str):  # ruff: ignore[no-self-use]
        return WeatherOut(temperature=26)
