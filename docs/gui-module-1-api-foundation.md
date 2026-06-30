# GUI Module 1: API Foundation Development Plan

## Module Goal

Create the backend foundation for all GUI-specific APIs inside the existing
VyOS HTTP API service. This module must add a clean `/gui/*` API namespace
without changing the behavior of the existing REST, GraphQL, CLI, or commit
paths.

This module is backend-only. It does not include frontend UI work yet.

Implementation status:

- Added shared API-key auth helper: `src/services/api/auth.py`.
- Added GUI router package: `src/services/api/gui/`.
- Added `GET /gui/health`.
- Added `GET /gui/capabilities`.
- Registered GUI routes when REST API routes are enabled.
- Added `/gui` to the nginx API proxy path list.

## Project-Specific UI Naming Rule

Do not use the term "VyOS" anywhere in user-facing GUI text, page titles,
navigation, labels, notifications, dialogs, bundled frontend metadata, or
visible assets. The GUI should use project/product-neutral wording such as
"DevGate", "router", "system", or "device".

Backend code and developer documentation may still reference existing VyOS
package names, modules, paths, and APIs when describing or integrating with the
current codebase.

For any GUI, frontend, visual design, interaction design, layout, or
user-experience development, use the project-specific `ui-ux-pro-max` standard.
GUI work must be treated as a high-quality product design task, not only a
functional form wrapper: clear workflows, polished controls, responsive layouts,
accessible states, consistent terminology, careful error handling, and
production-grade usability are required.

## Why This Comes First

All later GUI modules need a stable API layer for:

- authentication reuse
- common response structure
- request/error handling
- GUI-specific routing
- future schema endpoints
- future config workflow endpoints
- future dashboard/op-mode endpoints

If this foundation is not isolated first, later modules will spread GUI logic
across existing REST handlers and become hard to maintain.

## Existing Code To Reuse

Relevant current files:

- `src/services/vyos-http-api-server`
  - Main FastAPI application.
  - Loads API config from `/run/http-api-state`.
  - Enables REST and GraphQL routes based on `service https api`.

- `src/services/api/session.py`
  - Shared singleton `SessionState`.
  - Holds API keys, debug state, REST/GraphQL flags, CORS origins, auth state.

- `src/services/api/rest/routers.py`
  - Existing API key authentication logic.
  - Existing response behavior.
  - Existing config locks and background operation manager.

- `src/services/api/rest/models.py`
  - Existing `success()` and `error()` response helpers.
  - Existing Pydantic model patterns.

- `src/conf_mode/service_https.py`
  - Controls API runtime configuration and service reload behavior.

- `data/templates/https/nginx.default.j2`
  - Proxies API paths to `/run/api.sock`.

## Proposed File Structure

Add:

```text
src/services/api/gui/
  __init__.py
  routers.py
  models.py
```

Later modules may add:

```text
src/services/api/gui/
  schema.py
  config.py
  opmode.py
  dashboard.py
```

Module 1 should keep the structure small and focused.

## Proposed Endpoints

### `GET /gui/health`

Purpose:

- Verify the GUI API namespace is alive.
- Verify the user/API key is accepted.
- Return minimal API state needed by the future frontend shell.

Response data:

```json
{
  "status": "ok",
  "api": {
    "rest": true,
    "graphql": false,
    "debug": false,
    "strict": false
  }
}
```

Notes:

- It must require the same API key authentication as existing REST endpoints.
- It must not expose secret key values.

### `GET /gui/capabilities`

Purpose:

- Return a stable list of GUI backend capabilities.
- Let the frontend enable/disable modules based on backend availability.

Initial response data:

```json
{
  "modules": {
    "schema": false,
    "config": false,
    "dashboard": false,
    "opmode": false
  },
  "version": 1
}
```

Notes:

- Module 1 returns only foundation capability state.
- Later modules flip capabilities to `true` as they are implemented.

## Authentication Plan

Use the same API key model as the existing REST API.

Current REST auth is implemented in `src/services/api/rest/routers.py`:

- `check_auth(key_list, key)`
- `auth_required(data: ApiModel)`

For Module 1, avoid creating a new auth system.

Implementation options:

1. Move common auth helpers to a shared module, for example:

   ```text
   src/services/api/auth.py
   ```

   Then REST and GUI routers both import it.

2. Or keep a minimal GUI-local wrapper first and refactor shared auth later.

Preferred choice:

- Create `src/services/api/auth.py`.
- Move shared key lookup/auth logic there.
- Update existing REST router to import from the shared module.

Reason:

- Prevent duplicated auth behavior.
- GUI and REST should reject/accept keys identically.

## Response Model Plan

Existing API responses use:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Module 1 should keep this envelope for consistency.

Implementation options:

1. Reuse `api.rest.models.success` and `api.rest.models.error`.
2. Move response helpers to a shared module later.

Preferred choice for Module 1:

- Reuse existing `success()` and `error()` helpers.
- Do not refactor response helpers yet unless necessary.

Reason:

- Keeps the first module small.
- Avoids unnecessary churn in existing REST behavior.

## Router Registration Plan

Current service initializes routes in `vyos-http-api-server`:

```python
if session.rest:
    from api.rest.routers import rest_init
    rest_init(app)
else:
    from api.rest.routers import rest_clear
    rest_clear(app)
```

Module 1 should add GUI route registration in the same initialization flow.

Proposed behavior:

- GUI routes are active when REST API is active.
- GUI routes are cleared when REST API is inactive.

Reason:

- GUI API depends on API key auth and same HTTP API service.
- This keeps `service https api rest` as the first activation path.

Future option:

- Add a dedicated CLI node like `service https gui`.
- That should be a later decision, after the backend foundation is stable.

## Nginx Plan

Current nginx API proxy regex does not include `/gui`.

Current template:

```nginx
location ~ ^/(retrieve|configure|config-file|image|import-pki|container-image|generate|show|reboot|reset|poweroff|traceroute|info|docs|openapi.json|redoc|graphql|renew) {
```

Module 1 must add `gui` to this list:

```nginx
location ~ ^/(gui|retrieve|configure|...)
```

This is required so `/gui/*` reaches `vyos-http-api-server` through nginx.

## Implementation Steps

### Step 1: Add Shared Auth Helper

Add:

```text
src/services/api/auth.py
```

Responsibilities:

- Validate API key against `SessionState().keys`.
- Set authenticated key id on `SessionState().id`.
- Raise `HTTPException(401, ...)` on invalid key.

Then update REST router to import the shared helper.

### Step 2: Add GUI Models

Add:

```text
src/services/api/gui/models.py
```

Initial models:

- `GuiAuthQuery`
  - accepts `key` as a query parameter for `GET` requests

Possible model:

```python
class GuiAuthQuery(BaseModel):
    key: StrictStr
```

Reason:

- Existing REST endpoints are mostly `POST` bodies.
- GUI health/capability checks are naturally `GET`.
- FastAPI dependencies need a clean way to authenticate query keys.

### Step 3: Add GUI Router

Add:

```text
src/services/api/gui/routers.py
```

Responsibilities:

- Define `APIRouter`.
- Add auth dependency.
- Add `/gui/health`.
- Add `/gui/capabilities`.
- Provide `gui_init(app)` and `gui_clear(app)` helpers.

The route clear behavior should match REST/GraphQL clear behavior.

### Step 4: Register GUI Router

Update:

```text
src/services/vyos-http-api-server
```

Behavior:

- If REST is enabled, initialize GUI routes.
- If REST is disabled, clear GUI routes.

### Step 5: Update Nginx Proxy

Update:

```text
data/templates/https/nginx.default.j2
```

Add `gui` to the proxied route list.

### Step 6: Add Tests

Preferred test locations:

```text
tests/
src/tests/
```

Exact placement should follow existing test conventions after inspection.

Test cases:

- `/gui/health` rejects missing/invalid key.
- `/gui/health` returns success for valid key.
- `/gui/capabilities` returns expected module flags.
- REST routes are still registered normally.
- GUI routes are cleared when disabled.

If full FastAPI route tests are awkward in the local environment, add targeted
unit tests for the auth helper and router registration logic first.

## Acceptance Criteria

Module 1 is complete when:

1. `/gui/health` exists and requires API key authentication.
2. `/gui/capabilities` exists and requires API key authentication.
3. Existing REST and GraphQL routes continue to work unchanged.
4. `/gui/*` is proxied by nginx when `service https api` is enabled.
5. GUI route registration and clearing works during API reload.
6. No config commit behavior changes.
7. No frontend code is required for this module.

## Out Of Scope For Module 1

Do not implement these yet:

- config schema endpoint
- op-mode schema endpoint
- config edit/diff/commit endpoint
- dashboard endpoint
- frontend shell
- login UI
- RBAC
- WebSocket/live updates
- separate `service https gui` CLI node

## Not Included In The GUI Yet

Module 1 is backend foundation only. It does not add visible GUI screens or
user workflows.

Not included in the GUI at this stage:

- API key login/connect form.
- Dashboard or landing screen.
- Configuration browser.
- Commit/discard controls.
- Schema browser.
- Operational command screens.
- Curated modules for interfaces, system, firewall, services, routing, VPN, or
  PKI.
- RBAC, role-aware navigation, or user permissions UI.
- Live status updates or WebSocket indicators.
- Dedicated GUI enable/disable CLI and UI controls separate from the existing
  HTTPS API service.

## Risks And Mitigations

### Risk: Breaking Existing REST Auth

Mitigation:

- Keep auth behavior identical.
- Move logic carefully if shared auth helper is introduced.
- Add regression tests or manual route checks.

### Risk: Route Duplication On Reload

Mitigation:

- Implement `gui_clear(app)` like existing `rest_clear()` and `graphql_clear()`.
- Remove routes by path prefix `/gui`.

### Risk: Nginx Does Not Proxy `/gui/*`

Mitigation:

- Add `gui` to the existing proxied location regex.
- Verify generated nginx config after `service https` render.

### Risk: Expanding Scope Too Early

Mitigation:

- Keep Module 1 limited to health, capabilities, auth, routing, nginx proxy.
- Do not add schema/config functionality until Module 2 and Module 3.

## Manual Verification Plan

After implementation, verify on a running VyOS image or suitable test instance:

```shell
set service https api keys id gui key '<test-key>'
set service https api rest
commit
```

Then:

```shell
curl -k 'https://<router>/gui/health?key=<test-key>'
curl -k 'https://<router>/gui/capabilities?key=<test-key>'
curl -k 'https://<router>/gui/health?key=bad-key'
```

Expected:

- Valid key returns `success: true`.
- Invalid key returns HTTP 401-style error envelope.
- Existing endpoints such as `/retrieve` are unaffected.

## Development Checkpoint

Before implementation starts, confirm:

1. GUI routes should be enabled whenever `service https api rest` is enabled.
2. API key in query string is acceptable for initial GET endpoints.
3. We should postpone a dedicated `service https gui` CLI node until after the
   first end-to-end GUI milestone.
