from pydantic import BaseModel


class WeatherOut(BaseModel):
    temperature: float
