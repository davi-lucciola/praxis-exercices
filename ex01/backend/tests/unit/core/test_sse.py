import json

from langchain_core.messages import AIMessage

from app.core.weather.agent.sse import SseFrame


def test_sse_frame_dumps_plain_payload() -> None:
    frame = (
        SseFrame(
            'on_tool_end',
            {'event': 'on_tool_end', 'data': {'output': {'temperature': 26}}},
        )
        .encode()
        .decode()
    )

    assert frame.startswith('event: on_tool_end\n')
    data_line = next(line for line in frame.splitlines() if line.startswith('data: '))
    payload = json.loads(data_line.removeprefix('data: '))
    assert payload['data']['output']['temperature'] == 26


def test_sse_frame_dumps_langchain_message() -> None:
    frame = (
        SseFrame(
            'on_chat_model_end',
            {
                'event': 'on_chat_model_end',
                'data': {'output': AIMessage(content='nublado')},
            },
        )
        .encode()
        .decode()
    )

    data_line = next(line for line in frame.splitlines() if line.startswith('data: '))
    payload = json.loads(data_line.removeprefix('data: '))
    output = payload['data']['output']
    dumped = output.get('kwargs', {}).get('content') or output.get('content')
    assert dumped == 'nublado'
