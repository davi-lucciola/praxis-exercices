from typing import Any, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LangChainMessage(BaseModel):
    model_config = ConfigDict(extra='allow')

    content: str | list[Any]
    type: Literal['human', 'ai', 'tool', 'system'] | None = None
    role: Literal['user', 'assistant', 'tool', 'system'] | None = None

    @model_validator(mode='after')
    def require_type_or_role(self) -> Self:
        if self.type is None and self.role is None:
            raise ValueError('message must include type or role')
        return self


class AgentExecuteIn(BaseModel):
    messages: LangChainMessage | list[LangChainMessage] = Field(
        ...,
        description='Graph input messages, matching useStream.submit()',
    )


def normalize_messages(
    messages: LangChainMessage | list[LangChainMessage],
) -> list[dict[str, Any]]:
    items = messages if isinstance(messages, list) else [messages]
    return [item.model_dump(exclude_none=True) for item in items]
