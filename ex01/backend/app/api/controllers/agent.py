from collections.abc import AsyncIterator
from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.api.agent_stream import encode_sse
from app.api.schemas import AgentExecuteIn
from app.api.schemas.agent import normalize_messages
from app.core.weather.dependencies import WeatherAgent, WeatherContext

router = APIRouter(prefix='/agent', tags=['Agents'])

SSE_HEADERS = {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
}


@router.post('/execute/stream', response_model=None)
async def execute_agent_stream(
    body: AgentExecuteIn,
    agent: WeatherAgent,
    context: WeatherContext,
    thread_id: UUID = Query(...),
):
    config = {'configurable': {'thread_id': str(thread_id)}}
    messages = normalize_messages(body.messages)

    async def event_stream() -> AsyncIterator[bytes]:
        async for chunk in agent.astream_events(
            {'messages': messages},
            config=config,
            context=context,
            include_types=['chat_model', 'tool'],
        ):
            yield encode_sse(chunk)

    return StreamingResponse(
        event_stream(),
        media_type='text/event-stream',
        headers=SSE_HEADERS,
    )
