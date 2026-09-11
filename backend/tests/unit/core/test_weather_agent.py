from collections.abc import AsyncIterator, Mapping
from typing import Any
from uuid import uuid4

import pytest

from app.core.weather.agent.agent import WeatherAgent
from app.core.weather.agent.context import WeatherContext
from app.core.weather.agent.dispatcher import UnknownStreamType


class FakeGraph:
    def __init__(self, events: tuple[dict[str, Any], ...]) -> None:
        self.events = events
        self.kwargs: Mapping[str, Any] | None = None

    async def astream_events(
        self, *_args: Any, **kwargs: Any
    ) -> AsyncIterator[dict[str, Any]]:
        self.kwargs = kwargs
        for event in self.events:
            yield event


async def test_execute_dispatches_known_events() -> None:
    graph = FakeGraph((
        {
            'event': 'on_chat_model_stream',
            'run_id': 'run-1',
            'data': {'chunk': {'content': 'hi'}},
        },
    ))
    agent = WeatherAgent(graph=graph, context=WeatherContext())  # type: ignore[arg-type]
    messages = [{'role': 'user', 'content': 'hi'}]

    frames = [frame async for frame in agent.execute(messages, uuid4())]

    assert len(frames) == 1
    assert frames[0].startswith(b'event: on_chat_model_stream\n')
    assert graph.kwargs is not None
    assert graph.kwargs['version'] == 'v2'
    assert graph.kwargs['include_types'] == ['chat_model', 'tool']


async def test_execute_raises_on_unknown_event() -> None:
    graph = FakeGraph(({'event': 'on_chain_start'},))
    agent = WeatherAgent(graph=graph, context=WeatherContext())  # type: ignore[arg-type]

    with pytest.raises(UnknownStreamType):
        async for _frame in agent.execute([{'role': 'user', 'content': 'hi'}], uuid4()):
            pass
