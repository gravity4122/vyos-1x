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

from typing import Any

from vyos.config import Config

from ..locks import config_lock
from ..session import SessionState


class ServicesError(Exception):
    pass


def _state_config() -> Config:
    state = SessionState()
    if state.session is None:
        raise ServicesError('Configuration session is not initialized')
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


def _enabled(root: dict, key: str) -> bool:
    return key in root


def _service_item(key: str, label: str, path: list[str], enabled: bool, details: dict) -> dict:
    return {
        'key': key,
        'label': label,
        'path': path,
        'enabled': enabled,
        'details': details,
    }


def get_services_status() -> dict:
    service = _candidate(['service'])
    load_balancing = _candidate(['load-balancing'])
    monitoring = service.get('monitoring') if isinstance(service.get('monitoring'), dict) else {}
    dns = service.get('dns') if isinstance(service.get('dns'), dict) else {}
    dhcp_server = service.get('dhcp-server') if isinstance(service.get('dhcp-server'), dict) else {}
    dhcp_relay = service.get('dhcp-relay') if isinstance(service.get('dhcp-relay'), dict) else {}
    dns_forwarding = dns.get('forwarding') if isinstance(dns.get('forwarding'), dict) else {}
    snmp = service.get('snmp') if isinstance(service.get('snmp'), dict) else {}
    lldp = service.get('lldp') if isinstance(service.get('lldp'), dict) else {}
    prometheus = monitoring.get('prometheus') if isinstance(monitoring.get('prometheus'), dict) else {}
    telegraf = monitoring.get('telegraf') if isinstance(monitoring.get('telegraf'), dict) else {}
    haproxy = load_balancing.get('haproxy') if isinstance(load_balancing.get('haproxy'), dict) else {}

    items = [
        _service_item(
            'dhcp-server',
            'DHCP server',
            ['service', 'dhcp-server'],
            _enabled(service, 'dhcp-server'),
            {
                'shared_networks': sorted((dhcp_server.get('shared-network-name') or {}).keys()) if isinstance(dhcp_server.get('shared-network-name'), dict) else [],
            },
        ),
        _service_item(
            'dhcp-relay',
            'DHCP relay',
            ['service', 'dhcp-relay'],
            _enabled(service, 'dhcp-relay'),
            {
                'interfaces': _as_list(dhcp_relay.get('interface')),
                'servers': _as_list(dhcp_relay.get('server')),
            },
        ),
        _service_item(
            'dns-forwarding',
            'DNS forwarding',
            ['service', 'dns', 'forwarding'],
            isinstance(dns, dict) and _enabled(dns, 'forwarding'),
            {
                'listen_addresses': _as_list(dns_forwarding.get('listen-address')),
                'allow_from': _as_list(dns_forwarding.get('allow-from')),
                'name_servers': _as_list(dns_forwarding.get('name-server')),
            },
        ),
        _service_item(
            'lldp',
            'LLDP',
            ['service', 'lldp'],
            _enabled(service, 'lldp'),
            {
                'interfaces': sorted((lldp.get('interface') or {}).keys()) if isinstance(lldp.get('interface'), dict) else [],
                'snmp_enabled': 'snmp' in lldp,
            },
        ),
        _service_item(
            'snmp',
            'SNMP',
            ['service', 'snmp'],
            _enabled(service, 'snmp'),
            {
                'communities': sorted((snmp.get('community') or {}).keys()) if isinstance(snmp.get('community'), dict) else [],
                'listen_addresses': _as_list(snmp.get('listen-address')),
                'contact': snmp.get('contact') or '',
                'location': snmp.get('location') or '',
            },
        ),
        _service_item(
            'prometheus',
            'Prometheus exporters',
            ['service', 'monitoring', 'prometheus'],
            isinstance(monitoring, dict) and _enabled(monitoring, 'prometheus'),
            {
                'configured_sections': sorted(prometheus.keys()) if isinstance(prometheus, dict) else [],
            },
        ),
        _service_item(
            'telegraf',
            'Telegraf',
            ['service', 'monitoring', 'telegraf'],
            isinstance(monitoring, dict) and _enabled(monitoring, 'telegraf'),
            {
                'configured_sections': sorted(telegraf.keys()) if isinstance(telegraf, dict) else [],
            },
        ),
        _service_item(
            'haproxy',
            'HAProxy load balancing',
            ['load-balancing', 'haproxy'],
            _enabled(load_balancing, 'haproxy'),
            {
                'frontends': sorted((haproxy.get('service') or {}).keys()) if isinstance(haproxy.get('service'), dict) else [],
                'backends': sorted((haproxy.get('backend') or {}).keys()) if isinstance(haproxy.get('backend'), dict) else [],
            },
        ),
    ]

    enabled = sum(1 for item in items if item['enabled'])
    return {
        'summary': {
            'total': len(items),
            'enabled': enabled,
            'disabled': len(items) - enabled,
        },
        'items': items,
        'errors': [],
    }
