# GUI Module 2: Schema and Metadata Service Development Guide

## Module Goal

Expose backend configuration and operational-command metadata through the GUI
API namespace so future GUI modules can build forms, navigation, help text, and
safe command pickers without hardcoding router feature schemas.

This module is backend-only. It extends Module 1's `/gui/*` namespace.

Implementation status:

- Added schema helper service: `src/services/api/gui/schema.py`.
- Added `GET /gui/schema/config`.
- Added `GET /gui/schema/config/path`.
- Added `GET /gui/schema/op`.
- Added `GET /gui/schema/op/path`.
- Updated `/gui/capabilities` to report `"schema": true`.
- Added config tag-node traversal support.
- Added op-mode tag-node and virtual-tag traversal support.

## Project-Specific UI Rules

User-facing GUI text must not use the term "VyOS". Use project/product-neutral
wording such as "DevGate", "router", "system", or "device".

For future frontend work, use the project-specific `ui-ux-pro-max` standard:
clear workflows, polished controls, responsive layouts, accessible states,
consistent terminology, careful error handling, and production-grade usability.

Backend code and developer documentation may still reference existing VyOS
package names, modules, paths, and APIs when describing or integrating with the
current codebase.

## Existing Metadata Sources

Module 2 must read from generated backend metadata, not from hand-maintained UI
schemas.

Config metadata:

```text
data/reftree.cache
```

Operational command metadata:

```text
data/op_cache.json
```

Standardized op-mode function list:

```text
data/op-mode-standardized.json
```

## Endpoint Contract

All endpoints require the same API key query authentication as Module 1:

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

### `GET /gui/schema/config`

Returns the root configuration schema summary.

Optional query parameters:

```text
depth=<integer>
include_hidden=true|false
```

Default behavior:

- `depth=1`
- `include_hidden=false`

Response data:

```json
{
  "path": [],
  "schema": {
    "name": "",
    "node_type": "other",
    "help": "No help available",
    "children": []
  }
}
```

### `GET /gui/schema/config/path`

Returns metadata for one configuration path.

Query parameters:

```text
path=interfaces/ethernet
depth=1
include_hidden=false
```

Path rules:

- Slash-style paths are accepted.
- Leading/trailing slashes are ignored.
- Repeated slashes are ignored.
- Tag values may be included and are skipped when traversing tag nodes.

Examples:

```text
interfaces/ethernet
interfaces/ethernet/eth0
interfaces/ethernet/eth0/address
```

### `GET /gui/schema/op`

Returns the root operational command schema summary.

Optional query parameters:

```text
depth=<integer>
```

Default behavior:

- `depth=1`

### `GET /gui/schema/op/path`

Returns metadata for one operational command path.

Query parameters:

```text
path=show/interfaces
depth=1
```

Path rules:

- Slash-style paths are accepted.
- Leading/trailing slashes are ignored.
- Repeated slashes are ignored.

## Normalized Node Shape

The API should return a normalized shape instead of exposing raw cache internals.

Configuration node:

```json
{
  "name": "address",
  "path": ["interfaces", "ethernet", "address"],
  "node_type": "leaf",
  "help": "IP address",
  "default_value": null,
  "multi": true,
  "valueless": false,
  "hidden": false,
  "secret": false,
  "constraints": [],
  "constraint_error_message": "Invalid value",
  "completion_help": [],
  "value_help": [],
  "owner": null,
  "priority": null,
  "children": []
}
```

Operational command node:

```json
{
  "name": "interfaces",
  "path": ["show", "interfaces"],
  "node_type": "node",
  "help": "Show interface information",
  "command": "",
  "children": []
}
```

## Implementation Steps

### Step 1: Add Schema Service Helpers

Add:

```text
src/services/api/gui/schema.py
```

Responsibilities:

- Load JSON cache files.
- Normalize config schema nodes.
- Normalize op-mode schema nodes.
- Traverse slash-style paths.
- Enforce depth limits.
- Hide hidden config nodes by default.
- Preserve secret metadata while not exposing secret values.

### Step 2: Add Schema Routes

Update:

```text
src/services/api/gui/routers.py
```

Add:

```text
GET /gui/schema/config
GET /gui/schema/config/path
GET /gui/schema/op
GET /gui/schema/op/path
```

### Step 3: Update Capabilities

Update:

```text
src/services/api/gui/models.py
```

Set:

```json
"schema": true
```

Keep these disabled until their modules are implemented:

```json
"config": false,
"dashboard": false,
"opmode": false
```

### Step 4: Update Documentation

Update:

```text
docs/current-api-reference.md
docs/gui-roadmap.md
```

The current API reference must list the new schema endpoints.

## Acceptance Criteria

Module 2 is complete when:

1. `/gui/schema/config` returns normalized root config metadata.
2. `/gui/schema/config/path?path=interfaces/ethernet` returns normalized
   metadata for that path.
3. `/gui/schema/op` returns normalized root op-mode metadata.
4. `/gui/schema/op/path?path=show/interfaces` returns normalized metadata for
   that path.
5. Invalid paths return the existing API error envelope with a clear message.
6. Hidden config nodes are excluded unless `include_hidden=true`.
7. `/gui/capabilities` reports `schema: true`.
8. Existing REST, GraphQL, and Module 1 endpoints continue to work.

## Out Of Scope For Module 2

Do not implement these yet:

- config editing
- candidate diff endpoint
- commit/confirm/discard GUI workflow
- dashboard aggregation
- frontend schema browser
- op-mode command execution wrappers
- RBAC
- live updates

## Not Included In The GUI Yet

Module 2 exposes schema metadata to the GUI API but does not build user-facing
schema workflows by itself.

Not included in the GUI at this stage:

- Visual schema tree browser.
- Schema path search.
- Generated forms from node metadata.
- Tag-node instance picker.
- Schema-driven validation hints beside inputs.
- Op-mode command browser or command execution UI.
- Per-node documentation panel.
- Hidden-node toggle in the frontend.
- RBAC-aware schema filtering.
- Live schema refresh or cache invalidation controls.

## Manual Verification Plan

On a running image or suitable test instance:

```shell
curl -k 'https://<router>/gui/schema/config?key=<api-key>'
curl -k 'https://<router>/gui/schema/config/path?key=<api-key>&path=interfaces/ethernet'
curl -k 'https://<router>/gui/schema/op?key=<api-key>'
curl -k 'https://<router>/gui/schema/op/path?key=<api-key>&path=show/interfaces'
curl -k 'https://<router>/gui/capabilities?key=<api-key>'
```

Expected:

- All valid schema calls return `success: true`.
- Invalid path calls return `success: false`.
- Capabilities include `"schema": true`.
