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


class SystemError(Exception):
    pass


def _op_module(name: str):
    path = os.path.join(directories['op_mode'], f'{name}.py')
    if not os.path.exists(path):
        path = os.path.abspath(os.path.join(os.getcwd(), 'src', 'op_mode', f'{name}.py'))

    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise SystemError(f"Unable to load operational source '{name}'")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _state_config() -> Config:
    state = SessionState()
    if state.session is None:
        raise SystemError('Configuration session is not initialized')
    return Config(session_env=state.session.get_session_env())


def _candidate(path: list[str]) -> dict:
    config = _state_config()
    with config_lock:
        try:
            data = config.get_config_dict(
                path=path,
                effective=False,
                get_first_key=True,
            )
        except Exception:
            return {}
    return data if isinstance(data, dict) else {}


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


def _safe(source: str, errors: list[dict], fallback, func):
    try:
        return func()
    except Exception as e:
        errors.append({'source': source, 'error': str(e)})
        return fallback


def _version() -> dict:
    data = _op_module('version').show(raw=True, funny=False)
    return {
        'version': data.get('version', 'unknown'),
        'release_train': data.get('release_train', ''),
        'system_arch': data.get('system_arch', ''),
        'system_type': data.get('system_type', ''),
        'hardware_model': data.get('hardware_model', ''),
    }


def _uptime() -> dict:
    return _op_module('uptime').show(raw=True)


def _ntp_servers(service: dict) -> list[str]:
    ntp = service.get('ntp') or {}
    servers = ntp.get('server') or {}
    return sorted(servers) if isinstance(servers, dict) else _as_list(servers)


def _login_users(system: dict) -> list[dict]:
    login = system.get('login') or {}
    users = login.get('user') or {}
    if not isinstance(users, dict):
        return []
    return [
        {
            'name': name,
            'level': (settings or {}).get('level') or '',
            'has_ssh_keys': bool(((settings or {}).get('authentication') or {}).get('public-keys')),
        }
        for name, settings in sorted(users.items())
        if isinstance(settings, dict)
    ]


def get_system_status() -> dict:
    state = SessionState()
    errors = []

    system = _candidate(['system'])
    service = _candidate(['service'])
    ssh = service.get('ssh') if isinstance(service.get('ssh'), dict) else {}
    https = service.get('https') if isinstance(service.get('https'), dict) else {}
    api = https.get('api') if isinstance(https.get('api'), dict) else {}
    syslog = system.get('syslog') if isinstance(system.get('syslog'), dict) else {}

    version = _safe('version', errors, {}, _version)
    uptime = _safe('uptime', errors, {}, _uptime)

    return {
        'identity': {
            'hostname': system.get('host-name') or '',
            'version': version.get('version', 'unknown'),
            'release_train': version.get('release_train', ''),
            'system_arch': version.get('system_arch', ''),
            'system_type': version.get('system_type', ''),
            'hardware_model': version.get('hardware_model', ''),
            'uptime': uptime.get('uptime', 'unknown'),
            'load_average': uptime.get('load_average', {}),
        },
        'dns': {
            'name_servers': _as_list(system.get('name-server')),
        },
        'time': {
            'timezone': system.get('time-zone') or '',
            'ntp_enabled': 'ntp' in service,
            'ntp_servers': _ntp_servers(service),
        },
        'access': {
            'ssh_enabled': 'ssh' in service,
            'ssh_port': ssh.get('port') or '',
            'ssh_listen_addresses': _as_list(ssh.get('listen-address')),
            'https_enabled': 'https' in service,
            'https_port': https.get('port') or '',
            'api_rest': 'rest' in api,
            'api_graphql': 'graphql' in api,
            'api_keys': sorted(api.get('keys', {}).keys()) if isinstance(api.get('keys'), dict) else [],
            'runtime_api': {
                'rest': state.rest,
                'graphql': state.graphql,
                'strict': state.strict,
            },
        },
        'users': {
            'configured': _login_users(system),
        },
        'logging': {
            'syslog_hosts': sorted((syslog.get('host') or {}).keys()) if isinstance(syslog.get('host'), dict) else [],
            'global_facilities': sorted((syslog.get('global') or {}).keys()) if isinstance(syslog.get('global'), dict) else [],
        },
        'errors': errors,
    }
