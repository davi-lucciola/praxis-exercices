"""SSE frame. Serializes LangChain objects with the library dump."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from langchain_core.load.dump import dumps


@dataclass(frozen=True)
class SseFrame:
    event: str
    data: Any

    def encode(self) -> bytes:
        payload = dumps(self.data, ensure_ascii=False)
        return f'event: {self.event}\ndata: {payload}\n\n'.encode()
