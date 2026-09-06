from fastapi import APIRouter

router = APIRouter(prefix='/agent', tags=['Agents'])


@router.post('/execute/stream')
async def execute_agent_stream():
    pass
