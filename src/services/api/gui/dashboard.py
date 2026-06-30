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

from vyos.defaults import directories

from ..session import SessionState


class DashboardError(Exception):
    pass


def _op_module(name: str):
    path = os.path.join(directories['op_mode'], f'{name}.py')
    if not os.path.exists(path):
        path = os.path.abspath(os.path.join(os.getcwd(), 'src', 'op_mode', f'{name}.py'))

    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise DashboardError(f"Unable to load status source '{name}'")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _safe(source: str, errors: list[dict], fallback, func):
    try:
        return func()
    except Exception as e:
        errors.append({'source': source, 'error': str(e)})
        return fallback


def _version():
    data = _op_module('version').show(raw=True, funny=False)
    return {
        'version': data.get('version', 'unknown'),
        'release_train': data.get('release_train', ''),
        'system_arch': data.get('system_arch', ''),
        'system_type': data.get('system_type', ''),
        'hardware_model': data.get('hardware_model', ''),
    }


def _uptime():
    return _op_module('uptime').show(raw=True)


def _cpu():
    return _op_module('cpu').show_summary(raw=True)


def _memory():
    data = _op_module('memory').show(raw=True)
    total = data.get('total') or 0
    used = data.get('used') or 0
    data['used_percent'] = round((used / total) * 100, 1) if total else 0
    return data


def _storage():
    data = _op_module('storage').show(raw=True)
    if not data:
        return {}
    if 'use_percentage' in data:
        try:
            data['use_percentage'] = int(data['use_percentage'])
        except (TypeError, ValueError):
            pass
    return data


def _interfaces():
    data = _op_module('interfaces').show_summary(
        raw=True,
        intf_name=None,
        intf_type=None,
        vif=False,
        vrrp=False,
    )
    if not isinstance(data, list):
        return {'total': 0, 'up': 0, 'down': 0, 'items': []}

    items = []
    up = 0
    for item in data:
        admin = item.get('admin') or item.get('admin_state') or ''
        oper = item.get('oper') or item.get('oper_state') or item.get('state') or ''
        if str(oper).lower() in ('up', 'u'):
            up += 1
        items.append({
            'name': item.get('ifname') or item.get('name') or '',
            'type': item.get('type') or '',
            'address': item.get('addr') or item.get('address') or '',
            'admin': admin,
            'oper': oper,
            'description': item.get('description') or '',
        })

    return {
        'total': len(items),
        'up': up,
        'down': max(len(items) - up, 0),
        'items': items[:12],
    }


def _routes():
    mod = _op_module('route')
    data = {
        'ipv4': mod.show_summary(raw=True, family='inet', table=None, vrf=None),
        'ipv6': mod.show_summary(raw=True, family='inet6', table=None, vrf=None),
    }
    return data


def _configuration():
    state = SessionState()
    if state.session is None:
        raise DashboardError('Configuration session is not initialized')

    from vyos.config import Config
    from vyos.configdiff import get_config_diff

    config = Config(session_env=state.session.get_session_env())
    diff = get_config_diff(config)
    return {
        'changed': diff.is_node_changed([]),
        'children': diff.node_changed_children([]),
        'summary': diff.get_child_nodes_diff_str([]),
    }


def get_dashboard_status():
    state = SessionState()
    errors = []

    version = _safe('version', errors, {}, _version)
    uptime = _safe('uptime', errors, {}, _uptime)
    cpu = _safe('cpu', errors, {}, _cpu)
    memory = _safe('memory', errors, {}, _memory)
    storage = _safe('storage', errors, {}, _storage)
    interfaces = _safe('interfaces', errors, {}, _interfaces)
    routes = _safe('routes', errors, {}, _routes)
    configuration = _safe(
        'configuration',
        errors,
        {'changed': False, 'children': [], 'summary': {}},
        _configuration,
    )

    hostname = ''
    if state.session is not None:
        hostname = _safe(
            'hostname',
            errors,
            '',
            lambda: state.session.show(['host', 'name']).strip(),
        )

    return {
        'identity': {
            'hostname': hostname or 'unknown',
            'version': version.get('version', 'unknown'),
            'release_train': version.get('release_train', ''),
            'system_arch': version.get('system_arch', ''),
            'system_type': version.get('system_type', ''),
            'hardware_model': version.get('hardware_model', ''),
            'uptime': uptime.get('uptime', 'unknown'),
            'load_average': uptime.get('load_average', {}),
        },
        'resources': {
            'cpu': cpu,
            'memory': memory,
            'storage': storage,
        },
        'network': {
            'interfaces': interfaces,
            'routes': routes,
        },
        'configuration': configuration,
        'api': {
            'rest': state.rest,
            'graphql': state.graphql,
            'strict': state.strict,
        },
        'errors': errors,
    }
