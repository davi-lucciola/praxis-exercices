from contextlib import asynccontextmanager

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app import create_app
from app.config import settings


@asynccontextmanager
async def test_lifespan(app: FastAPI):
    yield


app = create_app(
    title=settings.title,
    lifespan=test_lifespan,
)


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client
