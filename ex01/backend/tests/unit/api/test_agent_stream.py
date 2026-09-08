import pytest
from pydantic import ValidationError

from app.api.schemas.agent import AgentExecuteIn, LangChainMessage, normalize_messages


def test_normalize_messages_accepts_type_human() -> None:
    body = AgentExecuteIn(messages={'type': 'human', 'content': 'tempo em Recife'})

    assert normalize_messages(body.messages) == [
        {'type': 'human', 'content': 'tempo em Recife'}
    ]


def test_normalize_messages_accepts_role_user_list() -> None:
    body = AgentExecuteIn(messages=[{'role': 'user', 'content': 'tempo em Recife'}])

    assert normalize_messages(body.messages) == [
        {'role': 'user', 'content': 'tempo em Recife'}
    ]


def test_langchain_message_requires_type_or_role() -> None:
    with pytest.raises(ValidationError, match='type or role'):
        LangChainMessage(content='hi')
