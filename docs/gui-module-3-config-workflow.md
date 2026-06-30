# GUI Module 3: Config Session Workflow Development Guide

## Module Goal

Expose a GUI-specific candidate configuration workflow under `/gui/config/*`.
Unlike the existing classic `/configure` endpoint, GUI config operations must
separate staging from commit so users can review changes, preview diffs, commit,
commit-confirm, confirm, discard, and save.

This module is backend-only. It builds on Module 1 and Module 2.

Implementation status:

- Added shared reentrant config lock: `src/services/api/locks.py`.
- Updated REST config mutations to use the shared config lock.
- Added GUI config helper service: `src/services/api/gui/config.py`.
- Added `GET /gui/config/running`.
- Added `GET /gui/config/candidate`.
- Added `POST /gui/config/set`.
- Added `POST /gui/config/delete`.
- Added `POST /gui/config/load-section`.
- Added `GET /gui/config/diff`.
- Added `POST /gui/config/commit`.
- Added `POST /gui/config/commit-confirm`.
- Added `POST /gui/config/confirm`.
- Added `POST /gui/config/discard`.
- Added `POST /gui/config/save`.
- Updated `/gui/capabilities` to report `"config": true`.
- Added background commit behavior for staged `service https` changes so API
  reloads do not interrupt the HTTP response.
- Added non-empty path validation for stage endpoints.
- Added explicit config format validation for config read endpoints.
- Added safe background commit wrappers that log failures instead of allowing
  unhandled background exceptions.

## Project-Specific UI Rules

User-facing GUI text must not use the term "VyOS". Use project/product-neutral
wording such as "DevGate", "router", "system", or "device".

For future frontend work, use the project-specific `ui-ux-pro-max` standard:
clear workflows, polished controls, responsive layouts, accessible states,
consistent terminology, careful error handling, and production-grade usability.

Backend code and developer documentation may still reference existing VyOS
package names, modules, paths, and APIs when describing or integrating with the
current codebase.

## Existing Code To Reuse

Important existing code:

- `python/vyos/configsession.py`
  - write/session API
  - `set`, `delete`, `load_section`, `commit`, `commit_confirm`, `confirm`,
    `discard`, `save_config`

- `python/vyos/config.py`
  - read API for running and candidate config

- `python/vyos/configtree.py`
  - config tree serialization

- `python/vyos/configdiff.py`
  - candidate/running diff helpers

- `src/services/api/rest/routers.py`
  - current auto-commit REST implementation
  - important reference for locking and self-reload behavior

- `src/services/api/gui/schema.py`
  - schema path validation may be used later by frontend; commit remains the
    authoritative validation path

## Endpoint Contract

All endpoints require API key query authentication:

```text
?key=<api-key>
```

All responses use the existing API envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Endpoints

### `GET /gui/config/running`

Returns running/effective config.

Query parameters:

```text
path=interfaces/ethernet
format=json|json_ast|raw
```

Default:

```text
path=
format=json
```

### `GET /gui/config/candidate`

Returns candidate/session config.

Query parameters:

```text
path=interfaces/ethernet
format=json|json_ast|raw
```

Default:

```text
path=
format=json
```

### `POST /gui/config/set`

Stages a set operation without committing.

Body:

```json
{
  "path": ["system", "host-name"],
  "value": "router-1"
}
```

### `POST /gui/config/delete`

Stages a delete operation without committing.

Body:

```json
{
  "path": ["system", "host-name"],
  "value": null
}
```

### `POST /gui/config/load-section`

Replaces a config section without committing.

Body:

```json
{
  "path": ["interfaces", "ethernet", "eth0"],
  "section": {
    "description": "WAN",
    "address": ["dhcp"]
  }
}
```

### `GET /gui/config/diff`

Returns candidate-vs-running diff.

Query parameters:

```text
path=interfaces/ethernet
```

Default:

```text
path=
```

### `POST /gui/config/commit`

Commits staged candidate changes.

Body:

```json
{}
```

### `POST /gui/config/commit-confirm`

Commits staged candidate changes and starts commit-confirm timer.

Body:

```json
{
  "minutes": 10
}
```

### `POST /gui/config/confirm`

Confirms a commit-confirm operation.

Body:

```json
{}
```

### `POST /gui/config/discard`

Discards staged candidate changes.

Body:

```json
{}
```

### `POST /gui/config/save`

Saves committed config.

Body:

```json
{
  "file": "/config/config.boot"
}
```

Default file:

```text
/config/config.boot
```

## Safety Rules

1. Stage endpoints must not commit.
2. Commit endpoints must use the existing `ConfigSession` commit path.
3. Failed commit should discard candidate changes, matching existing API
   behavior.
4. Discard should never commit.
5. Save should not stage config changes.
6. A shared config lock must serialize REST and GUI config mutations.
7. `service https` changes may reload the API; callers must tolerate reconnects.
   Commit and commit-confirm requests for those changes return before scheduling
   the actual commit in the background.
8. Commit-confirm must be available before any frontend module performs
   disruptive networking changes.
9. Stage endpoints must reject empty paths.
10. Config read endpoints must reject unsupported formats.

## Implementation Steps

### Step 1: Shared Config Lock

Add:

```text
src/services/api/locks.py
```

Expose:

```python
config_lock = RLock()
```

Update REST config operations to use this shared lock instead of a local lock.

Reason:

- REST and GUI config writes must not run concurrently.

### Step 2: Config Helper Service

Add:

```text
src/services/api/gui/config.py
```

Responsibilities:

- get shared session and session env
- serialize config trees
- read running/candidate config
- stage set/delete/load-section
- calculate diff
- commit
- commit-confirm
- confirm
- discard
- save

### Step 3: Request Models

Add models in:

```text
src/services/api/gui/config.py
```

Models:

- `ConfigSetModel`
- `ConfigDeleteModel`
- `ConfigSectionModel`
- `CommitConfirmModel`
- `SaveConfigModel`

### Step 4: Router Endpoints

Update:

```text
src/services/api/gui/routers.py
```

Add:

```text
GET /gui/config/running
GET /gui/config/candidate
POST /gui/config/set
POST /gui/config/delete
POST /gui/config/load-section
GET /gui/config/diff
POST /gui/config/commit
POST /gui/config/commit-confirm
POST /gui/config/confirm
POST /gui/config/discard
POST /gui/config/save
```

### Step 5: Capabilities

Update:

```text
src/services/api/gui/models.py
```

Set:

```json
"config": true
```

## Acceptance Criteria

Module 3 is complete when:

1. GUI can read running config.
2. GUI can read candidate config.
3. GUI can stage a set operation without commit.
4. GUI can stage a delete operation without commit.
5. GUI can stage a section replacement without commit.
6. GUI can preview diff.
7. GUI can commit staged changes.
8. GUI can commit-confirm and confirm.
9. GUI can discard staged changes.
10. GUI can save config.
11. REST and GUI config mutations share the same lock.
12. `/gui/capabilities` reports `config: true`.

## Out Of Scope For Module 3

Do not implement these yet:

- frontend config editor
- dashboard
- curated interface/system/firewall modules
- RBAC
- live updates
- rollback browser
- config file import/merge

## Not Included In The GUI Yet

Module 3 is backend config workflow only. It provides the mutation and lifecycle
endpoints used by later GUI modules, but it does not provide a complete visual
configuration product by itself.

Not included in the GUI at this stage:

- Generic visual config editor.
- Generated schema forms.
- Curated interface/system/firewall/service/routing screens.
- Commit-confirm timer UI.
- Commit history and rollback browser.
- Config file upload, merge, compare, or download workflows.
- Candidate conflict detection between browser sessions.
- Per-operation progress and background task monitoring.
- RBAC controls for commit permissions.
- Live diff updates or WebSocket state sync.

## Manual Verification Plan

On a running image or suitable test instance:

```shell
curl -k 'https://<router>/gui/config/running?key=<api-key>'
curl -k 'https://<router>/gui/config/set?key=<api-key>' \
  -H 'Content-Type: application/json' \
  --data '{"path":["system","host-name"],"value":"router-1"}'
curl -k 'https://<router>/gui/config/diff?key=<api-key>'
curl -k 'https://<router>/gui/config/discard?key=<api-key>' \
  -H 'Content-Type: application/json' --data '{}'
```

Expected:

- `set` succeeds without committing.
- `diff` shows pending changes.
- `discard` removes pending changes.
