from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.api.schemas import AgentExecuteIn
from app.api.schemas.agent import normalize_messages
from app.core.weather.dependencies import WeatherAgent

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
    thread_id: UUID = Query(...),
):
    messages = normalize_messages(body.messages)
    return StreamingResponse(
        agent.execute(messages, thread_id),
        media_type='text/event-stream',
        headers=SSE_HEADERS,
    )
