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

from typing import Annotated

from fastapi import HTTPException
from fastapi import Query

from .rest.models import ApiModel
from .session import SessionState


def check_auth(key_list: list[dict], key: str) -> str | None:
    key_id = None
    for k in key_list:
        if k['key'] == key:
            key_id = k['id']
    return key_id


def require_api_key(key: str) -> str:
    session = SessionState()
    api_keys = session.keys
    key_id = check_auth(api_keys, key)
    if not key_id:
        raise HTTPException(status_code=401, detail='Valid API key is required')
    session.id = key_id
    return key_id


def auth_required(data: ApiModel):
    require_api_key(data.key)


def query_auth_required(key: Annotated[str, Query()]):
    return require_api_key(key)
