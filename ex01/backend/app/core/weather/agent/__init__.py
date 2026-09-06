from typing import Optional

from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.runtime import Runtime

from app.core.weather.agent.context import WeatherContext
from app.core.weather.agent.prompt import WEATHER_ASSISTANT
from app.core.weather.agent.tools import get_weather

TOOLS = [get_weather]


async def assistant(
    state: MessagesState, runtime: Runtime[WeatherContext]
) -> MessagesState:
    ctx = runtime.context
    model = ctx.llm.bind_tools(TOOLS)

    message = await model.ainvoke(
        [('system', WEATHER_ASSISTANT)] + state.get('messages', [])
    )

    return {'messages': [message]}


def build_weather_agent(checkpointer: Optional[BaseCheckpointSaver] = None):
    graph = StateGraph(MessagesState)

    graph.add_node('assistant', assistant)
    graph.add_node('tools', ToolNode(TOOLS))

    graph.add_edge(START, 'assistant')
    graph.add_conditional_edges('assistant', tools_condition)
    graph.add_edge('tools', 'assistant')

    return graph.compile(checkpointer=checkpointer)
