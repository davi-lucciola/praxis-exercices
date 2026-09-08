import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app import create_app
from app.config import settings
from app.core.weather.agent.context import WeatherContext as WeatherContextImpl
from app.core.weather.dependencies import get_weather_agent, get_weather_context


class FakeAgent:
    events: tuple[dict[str, Any], ...] = (
        {
            'event': 'on_chat_model_stream',
            'run_id': 'run-1',
            'name': 'assistant',
            'data': {'chunk': {'content': 'Nublado'}},
        },
        {
            'event': 'on_tool_start',
            'run_id': 'tool-1',
            'name': 'get_weather',
            'data': {'input': {'city': 'Recife'}},
        },
        {
            'event': 'on_tool_end',
            'run_id': 'tool-1',
            'name': 'get_weather',
            'data': {
                'input': {'city': 'Recife'},
                'output': {'temperature': 26},
            },
        },
    )

    async def astream_events(
        self, *_args: Any, **_kwargs: Any
    ) -> AsyncIterator[dict[str, Any]]:
        for event in self.events:
            yield event


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    yield


def _fake_agent() -> FakeAgent:
    return FakeAgent()


def _fake_context() -> WeatherContextImpl:
    return WeatherContextImpl()


def _client() -> TestClient:
    app = create_app(title=settings.title, lifespan=_lifespan)
    app.dependency_overrides[get_weather_agent] = _fake_agent
    app.dependency_overrides[get_weather_context] = _fake_context
    return TestClient(app)


def _parse_sse(body: str) -> list[tuple[str, dict[str, Any]]]:
    events: list[tuple[str, dict[str, Any]]] = []
    event_name = 'message'

    for block in body.split('\n\n'):
        if not block.strip():
            continue
        data_line = None
        for line in block.splitlines():
            if line.startswith('event: '):
                event_name = line.removeprefix('event: ')
            elif line.startswith('data: '):
                data_line = line.removeprefix('data: ')
        if data_line is not None:
            events.append((event_name, json.loads(data_line)))
            event_name = 'message'

    return events


def test_execute_stream_emits_sse_for_chat_and_weather_tool() -> None:
    with _client() as client:
        response = client.post(
            '/agent/execute/stream',
            params={'thread_id': str(uuid4())},
            json={'messages': {'type': 'human', 'content': 'tempo em Recife'}},
        )

    assert response.status_code == 200
    assert response.headers['content-type'].startswith('text/event-stream')

    events = _parse_sse(response.text)
    names = [name for name, _payload in events]
    assert names == [
        'on_chat_model_stream',
        'on_tool_start',
        'on_tool_end',
    ]
    assert events[1][1]['name'] == 'get_weather'
    assert events[2][1]['data']['output']['temperature'] == 26


def test_execute_stream_rejects_invalid_thread_id() -> None:
    with _client() as client:
        response = client.post(
            '/agent/execute/stream',
            params={'thread_id': 'not-a-uuid'},
            json={'messages': [{'role': 'user', 'content': 'hi'}]},
        )

    assert response.status_code == 422
