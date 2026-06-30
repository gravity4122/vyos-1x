# GUI Module 4: Frontend Shell Development Guide

## Module Goal

Create the first user-facing GUI shell served from `/srv/localui`. This module
does not implement full feature pages yet. It provides the app foundation:
authentication, layout, API health, backend capabilities, schema availability,
and candidate diff visibility.

Implementation status:

- Added static frontend source files under `src/localui/`.
- Added `index.html`, `styles.css`, and `app.js`.
- Added package install copy step in `debian/rules`.
- Implemented API-key entry and browser-local key storage.
- Implemented calls to `/gui/health`, `/gui/capabilities`,
  `/gui/schema/config`, and `/gui/config/diff`.
- Implemented responsive app layout, sidebar, top status bar, dashboard panels,
  notices, and commit/status bar placeholder.
- Verified static UI files contain no user-facing forbidden product wording.

## Frontend Strategy

Use dependency-free static HTML, CSS, and JavaScript for this first shell.

Reason:

- The current repository has no frontend package manager/toolchain.
- Static assets fit the existing nginx root at `/srv/localui`.
- This avoids adding Node/npm/pnpm build dependencies before the project
  confirms a long-term frontend stack.
- The shell can later be migrated to a framework while preserving the API
  contracts.

Source path:

```text
src/localui/
```

Installed path:

```text
/srv/localui/
```

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

The first screen must be the actual app experience, not a marketing or landing
page.

## Initial Shell Features

### Authentication

- API key input.
- Save key locally in browser storage.
- Clear saved key.
- Use same-origin API calls.
- Send key as query parameter for `/gui/*` endpoints.

### Layout

- Sidebar navigation.
- Top status bar.
- Main dashboard area.
- Commit/status bar.
- Notification/error region.

### Initial API Calls

After authentication, call:

```text
GET /gui/health
GET /gui/capabilities
GET /gui/schema/config?depth=1
GET /gui/config/diff
```

### Dashboard Panels

Initial panels:

- API health
- backend capabilities
- config schema status
- candidate change summary

### Commit Bar Placeholder

The shell should display candidate diff state and expose inactive placeholders
for future commit/discard actions. Full commit controls will be wired in a later
frontend module after the config editor is implemented.

## Files

Add:

```text
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Update:

```text
debian/rules
```

The package install step should copy `src/localui/*` into:

```text
$(DIR)/$(VYOS_LOCALUI_DIR)
```

## Acceptance Criteria

Module 4 is complete when:

1. `/srv/localui/index.html` is installed by the package build.
2. The UI contains no user-facing "VyOS" text.
3. The UI can store and clear an API key.
4. The UI calls `/gui/health`.
5. The UI calls `/gui/capabilities`.
6. The UI calls `/gui/schema/config`.
7. The UI calls `/gui/config/diff`.
8. API errors are shown clearly.
9. The layout is responsive for desktop and mobile.
10. No Node/npm build dependency is required.

## Out Of Scope

Do not implement these yet:

- generic config editor
- curated interface/system/firewall modules
- op-mode command runner
- live updates
- RBAC
- theme customization
- frontend framework migration

## Not Included In The GUI Yet

Module 4 creates the static shell and connection workflow. It intentionally
does not make the shell feature-complete.

Not included in the GUI at this stage:

- Real Configuration workspace.
- Real Interfaces workspace.
- Real System workspace.
- Firewall, NAT, Services, Routing, VPN, PKI, and Operational Tools
  workspaces.
- Generated forms or schema-driven editing.
- User profile, RBAC, and session management screens.
- Theme switcher or branding customization panel.
- Live notifications, WebSocket status, or background task tray.
- Modal confirmation flows for destructive actions.
- Frontend build pipeline, component framework, or test harness.

## Manual Verification Plan

On a built image:

```shell
set service https api keys id gui key '<api-key>'
set service https api rest
commit
```

Open:

```text
https://<router>/
```

Expected:

- The shell loads from `/srv/localui`.
- API key authentication succeeds.
- Health, capabilities, schema status, and diff status display.
- Invalid key shows a clear authentication error.
