# GUI Module 5: Dashboard Status Development Guide

## Module Goal

Add a read-only dashboard status endpoint and wire the frontend shell to display
useful operational status on the first screen.

This module makes the GUI shell operationally useful without adding any
configuration or restart actions.

Implementation status:

- Added dashboard aggregator: `src/services/api/gui/dashboard.py`.
- Added `GET /gui/dashboard/status`.
- Updated `/gui/capabilities` to report `"dashboard": true`.
- Updated the frontend shell to call `/gui/dashboard/status`.
- Updated dashboard panels to show identity, uptime, resource summary, network
  summary, candidate status, capabilities, and schema areas.

## Project-Specific UI Rules

User-facing GUI text must not use the term "VyOS". Use wording such as
"DevGate", "router", "system", or "device".

For all GUI work, use the project-specific `ui-ux-pro-max` standard:

- clear workflows
- polished controls
- responsive layouts
- accessible states
- consistent terminology
- careful error handling
- production-grade usability

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

## Endpoint

### `GET /gui/dashboard/status`

Returns read-only dashboard status.

Response shape:

```json
{
  "identity": {
    "hostname": "router",
    "version": "unknown",
    "uptime": "unknown"
  },
  "resources": {
    "cpu": {},
    "memory": {},
    "storage": {}
  },
  "network": {
    "interfaces": {},
    "routes": {}
  },
  "configuration": {
    "changed": false,
    "children": []
  },
  "api": {
    "rest": true,
    "graphql": false,
    "strict": false
  },
  "errors": []
}
```

## Data Source Rules

Prefer existing op-mode implementations or existing API/session wrappers.

Allowed sources:

- `ConfigSession.show()` for stable show commands.
- Standardized op-mode modules where import and function signatures are safe.
- `get_config_diff()` for candidate configuration status.
- `SessionState` for API flags.

Do not add direct arbitrary shell command execution.

## Backend Implementation

Add:

```text
src/services/api/gui/dashboard.py
```

Responsibilities:

- aggregate read-only status
- isolate failures per subsection
- return partial data when one status source fails
- include an `errors` list with source and message

Update:

```text
src/services/api/gui/routers.py
src/services/api/gui/models.py
```

Add route:

```text
GET /gui/dashboard/status
```

Update capability:

```json
"dashboard": true
```

## Frontend Implementation

Update:

```text
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Dashboard should show:

- hostname
- version
- uptime
- CPU status
- memory status
- storage status
- interface summary
- route summary
- config pending status
- status-source errors, if any

## Acceptance Criteria

Module 5 is complete when:

1. `/gui/dashboard/status` returns a structured response.
2. Status source failures do not fail the entire dashboard response.
3. `/gui/capabilities` reports `dashboard: true`.
4. The frontend calls `/gui/dashboard/status`.
5. The first screen displays dashboard status when connected.
6. The UI remains read-only.
7. The UI contains no user-facing forbidden product wording.

## Out Of Scope

Do not implement these yet:

- live polling/streaming
- restart/reset actions
- log viewer
- packet capture
- generic config editor
- curated config modules

## Not Included In The GUI Yet

Module 5 gives the first read-only overview screen. It does not include
interactive operational or configuration workflows.

Not included in the GUI at this stage:

- Live polling, streaming updates, or WebSocket status.
- Historical resource graphs.
- Interface counters or traffic charts.
- Log viewer.
- Packet capture viewer.
- Restart/reset actions.
- Service health drill-down pages.
- Route table browser.
- Alerting, notification rules, or acknowledgement workflows.
- Dashboard widget customization.
- Any direct configuration editing from dashboard panels.

## Manual Verification Plan

On a built image:

```shell
curl -k 'https://<router>/gui/dashboard/status?key=<api-key>'
```

Expected:

- `success: true`
- partial status data is present
- failed subsections are listed under `errors`
- frontend dashboard panels display returned status
