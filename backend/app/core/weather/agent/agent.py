"""Agent owns the graph run. The dispatcher owns the SSE wire."""

from __future__ import annotations

from collections.abc import AsyncIterator, Mapping, Sequence
from typing import Any
from uuid import UUID

from app.core.weather.agent.context import WeatherContext
from app.core.weather.agent.dispatcher import StreamDispatcher
from app.core.weather.agent.graph import WeatherGraph


class WeatherAgent:
    def __init__(
        self,
        graph: WeatherGraph,
        context: WeatherContext,
        dispatcher: StreamDispatcher | None = None,
    ) -> None:
        self._graph = graph
        self._context = context
        self._dispatcher = dispatcher or StreamDispatcher.default()

    async def execute(
        self,
        messages: Sequence[Mapping[str, Any]],
        thread_id: UUID | str,
    ) -> AsyncIterator[bytes]:
        async for event in self._graph.astream_events(
            {'messages': list(messages)},
            config={'configurable': {'thread_id': str(thread_id)}},
            context=self._context,
            version='v2',
            include_types=self._dispatcher.include_types,
        ):
            yield self._dispatcher.dispatch(event)
