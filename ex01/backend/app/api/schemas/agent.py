import uuid
from typing import Any

from app.api.schemas.base import BaseSchema


class AgentExecuteIn(BaseSchema):
    messages: list[dict[str, Any]]
    thread_id: uuid.UUID
