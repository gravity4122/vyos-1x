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

import logging
import traceback
from typing import TYPE_CHECKING
from typing import Callable

from fastapi import APIRouter
from fastapi import BackgroundTasks
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from fastapi import Request
from fastapi import Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute

from ..auth import query_auth_required
from ..locks import config_lock
from ..rest.models import error
from ..rest.models import responses
from ..rest.models import success
from ..session import SessionState
from .config import CommitConfirmModel
from .config import ConfigDeleteModel
from .config import ConfigSectionModel
from .config import ConfigSetModel
from .config import GuiConfigError
from .config import SaveConfigModel
from .config import commit
from .config import commit_confirm
from .config import commit_background
from .config import commit_confirm_background
from .config import confirm
from .config import discard
from .config import get_candidate_config
from .config import get_diff
from .config import get_running_config
from .config import https_config_changed
from .config import load_section
from .config import save
from .config import stage_delete
from .config import stage_set
from .dashboard import get_dashboard_status
from .firewall import FirewallError
from .firewall import get_firewall_status
from .interfaces import InterfacesError
from .interfaces import get_interfaces_status
from .models import GUI_API_VERSION
from .models import GUI_CAPABILITIES
from .schema import SchemaError
from .schema import get_config_schema
from .schema import get_op_schema
from .services import ServicesError
from .services import get_services_status
from .system import SystemError
from .system import get_system_status

from vyos.configsession import ConfigSessionError


if TYPE_CHECKING:
    from fastapi import FastAPI


LOG = logging.getLogger('http_api.gui.routers')

GUI_ROUTE_PREFIX = '/gui'


class GuiRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            try:
                return await original_route_handler(request)
            except HTTPException as e:
                return error(e.status_code, e.detail)
            except RequestValidationError as e:
                return error(400, str(e.errors()[0]))
            except Exception:
                LOG.critical(traceback.format_exc())
                return error(
                    500,
                    'An internal error occurred. Check the logs for details.',
                )

        return custom_route_handler


router = APIRouter(
    prefix=GUI_ROUTE_PREFIX,
    route_class=GuiRoute,
    responses={**responses},
    dependencies=[Depends(query_auth_required)],
)


@router.get('/health')
def health():
    state = SessionState()

    return success({
        'status': 'ok',
        'api': {
            'rest': state.rest,
            'graphql': state.graphql,
            'debug': state.debug,
            'strict': state.strict,
        },
    })


@router.get('/capabilities')
def capabilities():
    return success({
        'modules': GUI_CAPABILITIES,
        'version': GUI_API_VERSION,
    })


@router.get('/dashboard/status')
def dashboard_status():
    return success(get_dashboard_status())


@router.get('/interfaces/status')
def interfaces_status():
    try:
        return success(get_interfaces_status())
    except InterfacesError as e:
        return error(400, str(e))


@router.get('/system/status')
def system_status():
    try:
        return success(get_system_status())
    except SystemError as e:
        return error(400, str(e))


@router.get('/firewall/status')
def firewall_status():
    try:
        return success(get_firewall_status())
    except FirewallError as e:
        return error(400, str(e))


@router.get('/services/status')
def services_status():
    try:
        return success(get_services_status())
    except ServicesError as e:
        return error(400, str(e))


@router.get('/schema/config')
def config_schema_root(
    depth: int = Query(1, ge=0),
    include_hidden: bool = False,
):
    try:
        return success(get_config_schema(depth=depth, include_hidden=include_hidden))
    except SchemaError as e:
        return error(404, str(e))


@router.get('/schema/config/path')
def config_schema_path(
    path: str,
    depth: int = Query(1, ge=0),
    include_hidden: bool = False,
):
    try:
        return success(
            get_config_schema(
                path=path,
                depth=depth,
                include_hidden=include_hidden,
            )
        )
    except SchemaError as e:
        return error(404, str(e))


@router.get('/schema/op')
def op_schema_root(depth: int = Query(1, ge=0)):
    try:
        return success(get_op_schema(depth=depth))
    except SchemaError as e:
        return error(404, str(e))


@router.get('/schema/op/path')
def op_schema_path(path: str, depth: int = Query(1, ge=0)):
    try:
        return success(get_op_schema(path=path, depth=depth))
    except SchemaError as e:
        return error(404, str(e))


@router.get('/config/running')
def running_config(
    path: str = '',
    config_format: str = Query('json', alias='format'),
):
    try:
        return success(get_running_config(path=path, fmt=config_format))
    except GuiConfigError as e:
        return error(400, str(e))


@router.get('/config/candidate')
def candidate_config(
    path: str = '',
    config_format: str = Query('json', alias='format'),
):
    try:
        return success(get_candidate_config(path=path, fmt=config_format))
    except GuiConfigError as e:
        return error(400, str(e))


@router.post('/config/set')
def config_set(data: ConfigSetModel):
    try:
        return success(stage_set(data))
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.post('/config/delete')
def config_delete(data: ConfigDeleteModel):
    try:
        return success(stage_delete(data))
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.post('/config/load-section')
def config_load_section(data: ConfigSectionModel):
    try:
        return success(load_section(data))
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.get('/config/diff')
def config_diff(path: str = ''):
    try:
        return success(get_diff(path=path))
    except GuiConfigError as e:
        return error(400, str(e))


@router.post('/config/commit')
def config_commit(background_tasks: BackgroundTasks):
    try:
        with config_lock:
            if https_config_changed():
                background_tasks.add_task(commit_background)
                return success(
                    'Requested HTTPS/API configuration change; commit will run in the background'
                )
            return success(commit())
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.post('/config/commit-confirm')
def config_commit_confirm(data: CommitConfirmModel, background_tasks: BackgroundTasks):
    try:
        with config_lock:
            if https_config_changed():
                background_tasks.add_task(commit_confirm_background, data)
                return success(
                    'Requested HTTPS/API configuration change; commit-confirm will run in the background'
                )
            return success(commit_confirm(data))
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.post('/config/confirm')
def config_confirm():
    try:
        return success(confirm())
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.post('/config/discard')
def config_discard():
    try:
        return success(discard())
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


@router.post('/config/save')
def config_save(data: SaveConfigModel):
    try:
        return success(save(data))
    except (ConfigSessionError, GuiConfigError) as e:
        return error(400, str(e))


def _is_gui_route(route) -> bool:
    return route.path == GUI_ROUTE_PREFIX or route.path.startswith(f'{GUI_ROUTE_PREFIX}/')


def gui_init(app: 'FastAPI'):
    if any(_is_gui_route(r) for r in app.routes):
        return
    app.include_router(router)


def gui_clear(app: 'FastAPI'):
    for r in list(app.routes):
        if _is_gui_route(r):
            app.routes.remove(r)
