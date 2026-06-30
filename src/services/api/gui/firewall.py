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


class FirewallError(Exception):
    pass


def _state_config() -> Config:
    state = SessionState()
    if state.session is None:
        raise FirewallError('Configuration session is not initialized')
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


def _rule_summary(rule: dict) -> dict:
    return {
        'action': rule.get('action') or '',
        'protocol': rule.get('protocol') or '',
        'description': rule.get('description') or '',
        'log': 'log' in rule,
        'disabled': 'disable' in rule,
        'source': rule.get('source') or {},
        'destination': rule.get('destination') or {},
    }


def _firewall_groups(firewall: dict) -> list[dict]:
    groups = []
    group_root = firewall.get('group') or {}
    if not isinstance(group_root, dict):
        return groups

    for group_type, type_items in sorted(group_root.items()):
        if not isinstance(type_items, dict):
            continue
        for name, settings in sorted(type_items.items()):
            if not isinstance(settings, dict):
                settings = {}
            members = []
            for member_key in ('address', 'network', 'port', 'interface', 'domain'):
                members.extend(_as_list(settings.get(member_key)))
            groups.append({
                'type': group_type,
                'name': name,
                'description': settings.get('description') or '',
                'members': members,
                'includes': _as_list(settings.get('include')),
            })
    return groups


def _firewall_rules(firewall: dict) -> list[dict]:
    rules = []
    for family in ('ipv4', 'ipv6'):
        family_root = firewall.get(family) or {}
        if not isinstance(family_root, dict):
            continue
        for chain_type, chains in sorted(family_root.items()):
            if not isinstance(chains, dict):
                continue
            for chain_name, chain in sorted(chains.items()):
                if not isinstance(chain, dict):
                    continue
                for rule_id, rule in sorted((chain.get('rule') or {}).items(), key=lambda item: str(item[0])):
                    rules.append({
                        'family': family,
                        'chain_type': chain_type,
                        'chain': chain_name,
                        'rule': rule_id,
                        **_rule_summary(rule if isinstance(rule, dict) else {}),
                    })
    return rules


def _zones(firewall: dict) -> list[dict]:
    zones = []
    zone_root = firewall.get('zone') or {}
    if not isinstance(zone_root, dict):
        return zones
    for name, settings in sorted(zone_root.items()):
        if not isinstance(settings, dict):
            settings = {}
        member = settings.get('member') if isinstance(settings.get('member'), dict) else {}
        zones.append({
            'name': name,
            'local': 'local-zone' in settings,
            'interfaces': _as_list(member.get('interface')),
            'vrfs': _as_list(member.get('vrf')),
            'from_zones': sorted((settings.get('from') or {}).keys()) if isinstance(settings.get('from'), dict) else [],
        })
    return zones


def _nat_rules(nat: dict, family: str = 'ipv4') -> list[dict]:
    rules = []
    for direction in ('source', 'destination'):
        direction_root = nat.get(direction) or {}
        if not isinstance(direction_root, dict):
            continue
        for rule_id, rule in sorted((direction_root.get('rule') or {}).items(), key=lambda item: str(item[0])):
            if not isinstance(rule, dict):
                rule = {}
            translation = rule.get('translation') if isinstance(rule.get('translation'), dict) else {}
            inbound = rule.get('inbound-interface') if isinstance(rule.get('inbound-interface'), dict) else {}
            outbound = rule.get('outbound-interface') if isinstance(rule.get('outbound-interface'), dict) else {}
            rules.append({
                'family': family,
                'direction': direction,
                'rule': rule_id,
                'description': rule.get('description') or '',
                'protocol': rule.get('protocol') or '',
                'source': rule.get('source') or {},
                'destination': rule.get('destination') or {},
                'translation': translation,
                'inbound_interface': inbound.get('name') or '',
                'outbound_interface': outbound.get('name') or '',
                'disabled': 'disable' in rule,
            })
    return rules


def get_firewall_status() -> dict:
    firewall = _candidate(['firewall'])
    nat = _candidate(['nat'])
    nat66 = _candidate(['nat66'])
    nat64 = _candidate(['nat64'])

    groups = _firewall_groups(firewall)
    filter_rules = _firewall_rules(firewall)
    zones = _zones(firewall)
    nat_rules = _nat_rules(nat, 'ipv4') + _nat_rules(nat66, 'ipv6')

    nat64_rules = (nat64.get('source') or {}).get('rule') if isinstance(nat64.get('source'), dict) else {}
    nat64_count = len(nat64_rules) if isinstance(nat64_rules, dict) else 0

    return {
        'summary': {
            'groups': len(groups),
            'filter_rules': len(filter_rules),
            'zones': len(zones),
            'nat_rules': len(nat_rules),
            'nat64_rules': nat64_count,
        },
        'groups': groups,
        'filter_rules': filter_rules,
        'zones': zones,
        'nat_rules': nat_rules,
        'nat64': {
            'source_rules': nat64_count,
        },
        'errors': [],
    }
