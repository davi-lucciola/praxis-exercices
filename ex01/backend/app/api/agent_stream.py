import json
from collections.abc import Mapping, Sequence
from dataclasses import asdict, is_dataclass
from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


def _to_jsonish(value: Any) -> Any:
    converted: Any = value

    if isinstance(value, UUID):
        converted = str(value)
    elif isinstance(value, datetime | date):
        converted = value.isoformat()
    elif isinstance(value, bytes):
        converted = value.decode('utf-8', errors='replace')
    elif isinstance(value, BaseModel):
        converted = value.model_dump()
    elif is_dataclass(value) and not isinstance(value, type):
        converted = asdict(value)
    elif isinstance(value, Mapping):
        converted = dict(value)
    elif isinstance(value, Sequence) and not isinstance(value, str | bytes):
        converted = list(value)
    elif hasattr(value, 'model_dump'):
        converted = value.model_dump()
    else:
        converted = str(value)

    return converted


def sanitize_for_json(value: Any) -> Any:
    if value is None or isinstance(value, bool | int | float | str):
        return value

    converted = _to_jsonish(value)

    if isinstance(converted, dict):
        return {str(key): sanitize_for_json(item) for key, item in converted.items()}

    if isinstance(converted, list):
        return [sanitize_for_json(item) for item in converted]

    return converted


def encode_sse(event: Mapping[str, Any]) -> bytes:
    event_name = event.get('event', 'message')
    payload = sanitize_for_json(dict(event))
    return f'event: {event_name}\ndata: {json.dumps(payload)}\n\n'.encode()
