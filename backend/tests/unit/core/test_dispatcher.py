import json

import pytest

from app.core.weather.agent.dispatcher import StreamDispatcher, UnknownStreamType


def test_dispatch_encodes_known_event() -> None:
    frame = (
        StreamDispatcher
        .default()
        .dispatch({
            'event': 'on_chat_model_stream',
            'run_id': 'run-1',
            'data': {'chunk': {'content': 'hi'}},
        })
        .decode()
    )

    assert frame.startswith('event: on_chat_model_stream\n')
    assert frame.endswith('\n\n')

    data_line = next(line for line in frame.splitlines() if line.startswith('data: '))
    payload = json.loads(data_line.removeprefix('data: '))
    assert payload['event'] == 'on_chat_model_stream'
    assert payload['data']['chunk']['content'] == 'hi'


def test_dispatch_rejects_unknown_event() -> None:
    with pytest.raises(UnknownStreamType, match='on_chain_start'):
        StreamDispatcher.default().dispatch({'event': 'on_chain_start'})


def test_include_types_are_chat_model_and_tool() -> None:
    assert StreamDispatcher.default().include_types == ['chat_model', 'tool']
