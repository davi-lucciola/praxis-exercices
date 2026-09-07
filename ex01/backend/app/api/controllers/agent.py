from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.schemas import AgentExecuteIn
from app.core.weather.dependencies import WeatherAgent, WeatherContext

router = APIRouter(prefix='/agent', tags=['Agents'])


@router.post('/execute/stream')
async def execute_agent_stream(
    body: AgentExecuteIn, agent: WeatherAgent, context: WeatherContext
):
    config = {'configurable': {'thread_id': body.thread_id}}

    async def event_stream() -> AsyncIterator[bytes]:
        async for chunk in agent.astream_events(
            {'messages': body.messages},
            config=config,
            context=context,
        ):
            yield f'{chunk}\n'.encode()

    return StreamingResponse(event_stream(), media_type='text/event-stream')
