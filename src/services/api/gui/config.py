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
import logging
import traceback
from typing import Dict
from typing import List

from pydantic import BaseModel
from pydantic import Field
from pydantic import StrictInt
from pydantic import StrictStr
from pydantic import field_validator

from vyos.config import Config
from vyos.configdiff import get_config_diff
from vyos.configsession import DEFAULT_COMMIT_CONFIRM_MINUTES
from vyos.configsession import ConfigSessionError

from ..locks import config_lock
from ..session import SessionState


LOG = logging.getLogger('http_api.gui.config')

CONFIG_FORMATS = ('json', 'json_ast', 'raw')


class BaseConfigPathModel(BaseModel):
    path: List[StrictStr]

    @field_validator('path')
    @classmethod
    def check_non_empty(cls, path: list[str]) -> list[str]:
        if not path:
            raise ValueError('path must be non-empty')
        return path


class ConfigSetModel(BaseConfigPathModel):
    value: StrictStr = None


class ConfigDeleteModel(BaseConfigPathModel):
    value: StrictStr = None


class ConfigSectionModel(BaseConfigPathModel):
    section: Dict


class CommitConfirmModel(BaseModel):
    minutes: StrictInt = Field(DEFAULT_COMMIT_CONFIRM_MINUTES, ge=1)


class SaveConfigModel(BaseModel):
    file: StrictStr = '/config/config.boot'


class GuiConfigError(Exception):
    pass


def parse_path(path: str | None) -> list[str]:
    if not path:
        return []
    return [part for part in path.split('/') if part]


def _state_session():
    state = SessionState()
    if state.session is None:
        raise GuiConfigError('Configuration session is not initialized')
    return state, state.session


def _config():
    _, session = _state_session()
    return Config(session_env=session.get_session_env())


def _format_config_tree(config: Config, path: list[str], effective: bool, fmt: str):
    if fmt not in CONFIG_FORMATS:
        raise GuiConfigError(f"Unsupported config format '{fmt}'")

    if fmt == 'json':
        return config.get_config_dict(
            path=path,
            effective=effective,
            get_first_key=True,
        )

    tree = config.get_config_tree(effective=effective)
    if tree is None:
        return {} if fmt == 'json_ast' else ''

    if path:
        raw = config.show_config(path=path, effective=effective)
        if fmt == 'raw':
            return raw
        from vyos.configtree import ConfigTree
        tree = ConfigTree(raw)

    if fmt == 'json_ast':
        return json.loads(tree.to_json_ast())
    if fmt == 'raw':
        return tree.to_string()


def get_running_config(path: str | None = None, fmt: str = 'json'):
    return _format_config_tree(_config(), parse_path(path), True, fmt)


def get_candidate_config(path: str | None = None, fmt: str = 'json'):
    return _format_config_tree(_config(), parse_path(path), False, fmt)


def stage_set(data: ConfigSetModel):
    _, session = _state_session()
    with config_lock:
        session.set(data.path, value=data.value)
    return {'changed': True}


def stage_delete(data: ConfigDeleteModel):
    _, session = _state_session()
    with config_lock:
        session.delete(data.path, value=data.value)
    return {'changed': True}


def load_section(data: ConfigSectionModel):
    _, session = _state_session()
    with config_lock:
        session.load_section(data.path, data.section)
    return {'changed': True}


def get_diff(path: str | None = None):
    config = _config()
    diff = get_config_diff(config)
    parsed_path = parse_path(path)
    return {
        'path': parsed_path,
        'changed': diff.is_node_changed(parsed_path),
        'children': diff.node_changed_children(parsed_path),
        'summary': diff.get_child_nodes_diff_str(parsed_path),
    }


def https_config_changed() -> bool:
    config = _config()
    diff = get_config_diff(config)
    return diff.is_node_changed(['service', 'https'])


def commit():
    _, session = _state_session()
    with config_lock:
        try:
            return session.commit()
        except ConfigSessionError:
            session.discard()
            raise


def commit_confirm(data: CommitConfirmModel):
    _, session = _state_session()
    env = session.get_session_env()
    with config_lock:
        env['IN_COMMIT_CONFIRM'] = 't'
        try:
            out = session.commit()
            out += '\n' + session.commit_confirm(minutes=data.minutes)
            return out
        except ConfigSessionError:
            session.discard()
            raise
        finally:
            if 'IN_COMMIT_CONFIRM' in env:
                del env['IN_COMMIT_CONFIRM']


def commit_background():
    try:
        commit()
    except Exception:
        LOG.warning('Background GUI commit failed:\n%s', traceback.format_exc())


def commit_confirm_background(data: CommitConfirmModel):
    try:
        commit_confirm(data)
    except Exception:
        LOG.warning(
            'Background GUI commit-confirm failed:\n%s',
            traceback.format_exc(),
        )


def confirm():
    _, session = _state_session()
    with config_lock:
        return session.confirm()


def discard():
    _, session = _state_session()
    with config_lock:
        session.discard()
    return 'Configuration changes discarded'


def save(data: SaveConfigModel):
    _, session = _state_session()
    with config_lock:
        return session.save_config(data.file)
