import os

import pytest

os.environ.setdefault('APP_ENV', 'development')

# --------------------------------------------------------------------------- #
# automatic markers
# --------------------------------------------------------------------------- #
# Each test gets two markers derived from the file path: the suite
# (`unit`/`integration`) and the domain (`health`, `infra`, ...). That avoids
# repeating `pytestmark` in every file and keeps markers correct when a test
# moves folders. Names must be registered in `pyproject.toml` because
# `--strict-markers` is on.

_LAYER_DIRS = frozenset({'api', 'core'})


def _markers_for(parts: tuple[str, ...]) -> tuple[str, ...]:
    """('unit', 'infra', 'test_x.py') -> ('unit', 'infra')."""
    suite = parts[0]
    rest = parts[1:-1]  # directories between the suite and the file

    if suite == 'unit' and rest[:1] and rest[0] in _LAYER_DIRS:
        rest = rest[1:]

    if not rest:
        return (suite,)

    return (suite, rest[0])


def pytest_collection_modifyitems(
    config: pytest.Config, items: list[pytest.Item]
) -> None:
    tests_root = config.rootpath / 'tests'

    for item in items:
        parts = item.path.relative_to(tests_root).parts
        for marker in _markers_for(parts):
            item.add_marker(marker)
