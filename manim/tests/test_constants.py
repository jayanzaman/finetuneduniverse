"""constants.py must mirror the owner-reviewed fixture numbers.json exactly.

Epic rule: the test reads manim/tests/fixtures/numbers.json; it never restates
values. Every fixture key must exist in constants.py with exactly that value,
constants.py must hold no data value missing from the fixture, and every
constant must carry a basis comment.
"""

import ast
import json
from pathlib import Path

import ftu.constants as C

FIXTURE = Path(__file__).parent / "fixtures" / "numbers.json"
CONSTANTS_SRC = Path(C.__file__)


def _load_fixture():
    data = json.loads(FIXTURE.read_text())
    data.pop("_source")
    return data


def _normalize(value):
    if isinstance(value, tuple):
        return [_normalize(v) for v in value]
    if isinstance(value, list):
        return [_normalize(v) for v in value]
    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in value.items()}
    return value


def _assigned_names():
    tree = ast.parse(CONSTANTS_SRC.read_text())
    names = {}
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and not target.id.startswith("_"):
                    names[target.id] = node.lineno
    return names


def test_every_fixture_key_exists_with_exact_value():
    fixture = _load_fixture()
    for key, expected in fixture.items():
        assert hasattr(C, key), f"constants.py is missing fixture key {key}"
        actual = _normalize(getattr(C, key))
        assert actual == _normalize(expected), (
            f"{key}: fixture says {expected!r}, constants.py has {actual!r}"
        )


def test_constants_holds_no_data_value_missing_from_fixture():
    fixture = _load_fixture()
    extra = set(_assigned_names()) - set(fixture)
    assert not extra, (
        f"constants.py defines values not in the owner-reviewed fixture: {sorted(extra)}. "
        "Adding a data value needs the owner's sign-off on #62."
    )


def test_every_constant_carries_a_basis_comment():
    src_lines = CONSTANTS_SRC.read_text().splitlines()
    missing = []
    for name, lineno in _assigned_names().items():
        line = src_lines[lineno - 1]
        _, _, comment = line.partition("#")
        if not comment.strip():
            missing.append(name)
    assert not missing, f"constants missing a basis comment: {missing}"
