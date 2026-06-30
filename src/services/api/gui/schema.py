# Copyright Devray maintainers and contributors <maintainers@vyos.io>
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this library. If not, see <http://www.gnu.org/licenses/>.

import json
import os
from functools import lru_cache
from typing import Any

from vyos.defaults import directories


CONFIG_CACHE = 'reftree.cache'
OP_CACHE = 'op_cache.json'
MAX_DEPTH = 8


class SchemaError(Exception):
    pass


def _data_file(name: str) -> str:
    path = os.path.join(directories['data'], name)
    if os.path.exists(path):
        return path

    local_path = os.path.abspath(os.path.join(os.getcwd(), 'data', name))
    if os.path.exists(local_path):
        return local_path

    raise SchemaError(f"Schema cache '{name}' was not found")


@lru_cache(maxsize=2)
def _load_json(name: str) -> Any:
    with open(_data_file(name), encoding='utf-8') as f:
        return json.load(f)


def _parse_path(path: str | None) -> list[str]:
    if not path:
        return []
    return [part for part in path.split('/') if part]


def _safe_depth(depth: int) -> int:
    if depth < 0:
        return 0
    if depth > MAX_DEPTH:
        return MAX_DEPTH
    return depth


def _config_node_data(node: dict) -> dict:
    return node.get('data') or {}


def _config_children(node: dict, include_hidden: bool) -> list[dict]:
    children = node.get('children') or []
    if include_hidden:
        return children
    return [child for child in children if not _config_node_data(child).get('hidden')]


def _find_config_child(node: dict, name: str, include_hidden: bool) -> dict | None:
    for child in _config_children(node, include_hidden):
        if child.get('name') == name:
            return child
    return None


def _is_config_tag_node(node: dict) -> bool:
    return _config_node_data(node).get('node_type') == 'tag'


def _lookup_config_node(path: list[str], include_hidden: bool) -> dict:
    node = _load_json(CONFIG_CACHE)

    index = 0
    while index < len(path):
        part = path[index]
        child = _find_config_child(node, part, include_hidden)
        if child is not None:
            node = child
            index += 1
            continue

        if _is_config_tag_node(node):
            index += 1
            continue

        raise SchemaError(f"Configuration schema path '{'/'.join(path)}' was not found")

    return node


def _normalize_config_node(
    node: dict,
    depth: int,
    include_hidden: bool,
    path: list[str] | None = None,
) -> dict:
    depth = _safe_depth(depth)
    data = _config_node_data(node)
    name = node.get('name', '')
    node_path = path if path is not None else data.get('path') or []

    result = {
        'name': name,
        'path': node_path,
        'node_type': data.get('node_type'),
        'help': data.get('help'),
        'default_value': data.get('default_value'),
        'multi': data.get('multi', False),
        'valueless': data.get('valueless', False),
        'hidden': data.get('hidden', False),
        'secret': data.get('secret', False),
        'constraints': data.get('constraints') or [],
        'constraint_group': data.get('constraint_group') or [],
        'constraint_error_message': data.get('constraint_error_message'),
        'completion_help': data.get('completion_help') or [],
        'value_help': data.get('value_help') or [],
        'owner': data.get('owner'),
        'priority': data.get('priority'),
        'docs': data.get('docs') or {},
        'children': [],
    }

    if depth > 0:
        children = []
        for child in _config_children(node, include_hidden):
            child_name = child.get('name', '')
            children.append(
                _normalize_config_node(
                    child,
                    depth - 1,
                    include_hidden,
                    node_path + [child_name],
                )
            )
        result['children'] = children

    return result


def get_config_schema(
    path: str | None = None,
    depth: int = 1,
    include_hidden: bool = False,
) -> dict:
    parsed_path = _parse_path(path)
    node = _lookup_config_node(parsed_path, include_hidden)
    return {
        'path': parsed_path,
        'schema': _normalize_config_node(node, depth, include_hidden, parsed_path),
    }


def _op_node_data(node: dict) -> dict:
    return node.get('__node_data') or {}


def _op_child_keys(node: dict) -> list[str]:
    return [key for key in node if key != '__node_data']


def _find_op_child(node: dict, name: str) -> dict | None:
    child = node.get(name)
    if isinstance(child, dict):
        return child
    return None


def _is_op_tag_node(node: dict) -> bool:
    return _op_node_data(node).get('node_type') == 'tagNode'


def _lookup_op_node(path: list[str]) -> dict:
    root = _load_json(OP_CACHE)
    if not path:
        return {
            '__node_data': {
                'name': '',
                'node_type': 'root',
                'help_text': 'Operational commands',
                'path': [],
                'children': list(root),
            },
            **root,
        }

    node = root
    index = 0
    while index < len(path):
        part = path[index]
        child = _find_op_child(node, part)
        if child is not None:
            node = child
            index += 1
            continue

        virtual_tag = _find_op_child(node, '__virtual_tag')
        if virtual_tag is not None:
            node = virtual_tag
            index += 1
            continue

        if _is_op_tag_node(node):
            index += 1
            continue

        raise SchemaError(f"Operational schema path '{'/'.join(path)}' was not found")

    return node


def _normalize_op_node(
    node: dict,
    depth: int,
    path: list[str] | None = None,
) -> dict:
    depth = _safe_depth(depth)
    data = _op_node_data(node)
    name = data.get('name', '')
    node_path = path if path is not None else data.get('path') or []

    result = {
        'name': name,
        'path': node_path,
        'node_type': data.get('node_type'),
        'help': data.get('help_text'),
        'completion_help': data.get('comp_help') or {},
        'command': data.get('command'),
        'standalone_help': data.get('standalone_help_text'),
        'standalone_command': data.get('standalone_command'),
        'constraints': data.get('constraints'),
        'constraint_error_message': data.get('constraint_error_message'),
        'files': data.get('files') or [],
        'children': [],
    }

    if depth > 0:
        children = []
        for key in _op_child_keys(node):
            child = node[key]
            if not isinstance(child, dict):
                continue
            child_name = _op_node_data(child).get('name', key)
            children.append(
                _normalize_op_node(child, depth - 1, node_path + [child_name])
            )
        result['children'] = children

    return result


def get_op_schema(path: str | None = None, depth: int = 1) -> dict:
    parsed_path = _parse_path(path)
    node = _lookup_op_node(parsed_path)
    return {
        'path': parsed_path,
        'schema': _normalize_op_node(node, depth, parsed_path),
    }
