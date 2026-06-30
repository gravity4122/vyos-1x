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

import importlib.util
import os
from typing import Any

from vyos.config import Config
from vyos.defaults import directories

from ..locks import config_lock
from ..session import SessionState


class InterfacesError(Exception):
    pass


def _op_module(name: str):
    path = os.path.join(directories['op_mode'], f'{name}.py')
    if not os.path.exists(path):
        path = os.path.abspath(os.path.join(os.getcwd(), 'src', 'op_mode', f'{name}.py'))

    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise InterfacesError(f"Unable to load operational source '{name}'")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _state_config() -> Config:
    state = SessionState()
    if state.session is None:
        raise InterfacesError('Configuration session is not initialized')
    return Config(session_env=state.session.get_session_env())


def _as_list(value: Any) -> list:
    if value is None or value == '':
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    if isinstance(value, dict):
        return list(value)
    return [value]


def _candidate_interfaces() -> dict:
    config = _state_config()
    with config_lock:
        try:
            data = config.get_config_dict(
                path=['interfaces'],
                effective=False,
                get_first_key=True,
            )
        except Exception:
            return {}

    if isinstance(data, dict):
        return data
    return {}


def _configured_items() -> dict[str, dict]:
    items = {}
    interfaces = _candidate_interfaces()
    for interface_type, group in interfaces.items():
        if not isinstance(group, dict):
            continue
        for name, settings in group.items():
            if not isinstance(settings, dict):
                settings = {}
            items[name] = {
                'name': name,
                'type': interface_type,
                'path': ['interfaces', interface_type, name],
                'configured': True,
                'exists': False,
                'enabled': 'disable' not in settings,
                'description': settings.get('description') or '',
                'addresses': _as_list(settings.get('address')),
                'mtu': settings.get('mtu') or '',
                'vrf': settings.get('vrf') or '',
                'children': {
                    'vif': len(settings.get('vif') or {}),
                    'vif_s': len(settings.get('vif-s') or {}),
                },
            }
    return items


def _operational_items() -> list[dict]:
    data = _op_module('interfaces').show_summary(
        raw=True,
        intf_name=None,
        intf_type=None,
        vif=True,
        vrrp=False,
    )
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return [data]
    return []


def _infer_type(name: str) -> str:
    prefixes = (
        ('eth', 'ethernet'),
        ('en', 'ethernet'),
        ('bond', 'bonding'),
        ('br', 'bridge'),
        ('dum', 'dummy'),
        ('lo', 'loopback'),
        ('tun', 'tunnel'),
        ('wg', 'wireguard'),
        ('vxlan', 'vxlan'),
        ('pppoe', 'pppoe'),
    )
    for prefix, interface_type in prefixes:
        if name.startswith(prefix):
            return interface_type
    return ''


def _merge_operational(items: dict[str, dict], operational: list[dict]):
    for op_item in operational:
        name = op_item.get('ifname') or op_item.get('name')
        if not name:
            continue

        interface_type = op_item.get('type') or _infer_type(name)

        item = items.setdefault(
            name,
            {
                'name': name,
                'type': interface_type,
                'path': ['interfaces', interface_type, name] if interface_type else [],
                'configured': False,
                'exists': True,
                'enabled': None,
                'description': '',
                'addresses': [],
                'mtu': '',
                'vrf': '',
                'children': {},
            },
        )
        item['exists'] = True
        item['admin_state'] = op_item.get('admin_state') or op_item.get('admin') or ''
        item['oper_state'] = op_item.get('oper_state') or op_item.get('oper') or op_item.get('state') or ''
        item['addresses'] = item['addresses'] or _as_list(op_item.get('addr') or op_item.get('address'))
        item['description'] = item['description'] or op_item.get('description') or ''
        item['mtu'] = item['mtu'] or op_item.get('mtu') or ''
        item['mac'] = op_item.get('mac') or ''
        item['vrf'] = item['vrf'] or op_item.get('vrf') or ''


def get_interfaces_status() -> dict:
    items = _configured_items()
    errors = []
    try:
        _merge_operational(items, _operational_items())
    except Exception as e:
        errors.append({'source': 'interfaces', 'error': str(e)})

    normalized = sorted(items.values(), key=lambda item: item.get('name') or '')
    up = sum(1 for item in normalized if str(item.get('oper_state', '')).lower() == 'up')
    configured = sum(1 for item in normalized if item.get('configured'))
    types = sorted({item.get('type') for item in normalized if item.get('type')})

    return {
        'summary': {
            'total': len(normalized),
            'up': up,
            'down': max(len(normalized) - up, 0),
            'configured': configured,
            'types': types,
        },
        'items': normalized,
        'errors': errors,
    }
