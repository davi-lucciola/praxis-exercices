from typing import Optional

from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.runtime import Runtime

from app.core.weather.agent.context import WeatherContext, resolve_weather_context
from app.core.weather.agent.prompt import WEATHER_ASSISTANT
from app.core.weather.agent.tools import get_weather

type WeatherGraph = CompiledStateGraph[
    MessagesState, WeatherContext, MessagesState, MessagesState
]

TOOLS = [get_weather]


async def assistant(
    state: MessagesState, runtime: Runtime[WeatherContext]
) -> MessagesState:
    ctx = resolve_weather_context(runtime)
    assert ctx.llm is not None
    model = ctx.llm.bind_tools(TOOLS)

    message = await model.ainvoke(
        [('system', WEATHER_ASSISTANT)] + state.get('messages', [])
    )

    return {'messages': [message]}


def build_weather_graph(
    checkpointer: Optional[BaseCheckpointSaver] = None,
) -> WeatherGraph:
    builder = StateGraph(state_schema=MessagesState, context_schema=WeatherContext)

    builder.add_node('assistant', assistant)
    builder.add_node('tools', ToolNode(TOOLS))

    builder.add_edge(START, 'assistant')
    builder.add_conditional_edges('assistant', tools_condition, ['tools', END])
    builder.add_edge('tools', 'assistant')

    return builder.compile(checkpointer=checkpointer)


def make_weather_agent() -> WeatherGraph:
    """Compiled graph factory for LangGraph Studio (`langgraph.json`)."""

    return build_weather_graph()
