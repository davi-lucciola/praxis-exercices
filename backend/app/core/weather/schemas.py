from pydantic import BaseModel


class WeatherOut(BaseModel):
    city: str
    temperature: float
    condition: str
