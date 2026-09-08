import json

import pytest
from pydantic import BaseModel, ValidationError

from app.api.agent_stream import encode_sse, sanitize_for_json
from app.api.schemas.agent import AgentExecuteIn, LangChainMessage, normalize_messages


class _SampleModel(BaseModel):
    temperature: float


def test_sanitize_for_json_dumps_pydantic_models() -> None:
    payload = sanitize_for_json({'output': _SampleModel(temperature=26)})

    assert payload == {'output': {'temperature': 26}}


def test_encode_sse_uses_event_name_and_json_data() -> None:
    frame = encode_sse({
        'event': 'on_chat_model_stream',
        'run_id': 'run-1',
        'data': {'chunk': {'content': 'hi'}},
    }).decode()

    assert frame.startswith('event: on_chat_model_stream\n')
    assert 'data: ' in frame
    assert frame.endswith('\n\n')

    data_line = next(line for line in frame.splitlines() if line.startswith('data: '))
    payload = json.loads(data_line.removeprefix('data: '))
    assert payload['data']['chunk']['content'] == 'hi'


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
