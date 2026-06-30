# GUI Module 6: Generic Config Browser and Editor Development Guide

## Module Goal

Build the first generic configuration workspace. The goal is broad config
coverage before curated feature modules exist.

This module uses:

- `/gui/schema/config`
- `/gui/schema/config/path`
- `/gui/config/candidate`
- `/gui/config/set`
- `/gui/config/delete`
- `/gui/config/diff`
- `/gui/config/commit`
- `/gui/config/discard`
- `/gui/config/save`

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

## First Version Scope

This first editor version should be useful but conservative:

- Configuration workspace in the existing shell.
- Schema tree navigation.
- Path breadcrumb.
- Node details panel.
- Child node list.
- Candidate config preview for selected path.
- Manual stage set operation.
- Manual stage delete operation.
- Diff refresh.
- Commit, discard, and save actions.

It does not need full generated forms for every node type yet.

## User Workflow

1. Connect with API key.
2. Open Configuration workspace.
3. Browse schema from root into a path.
4. Review node help, node type, defaults, constraints, and child nodes.
5. Stage a set or delete operation.
6. Review candidate diff.
7. Commit or discard.
8. Save committed config.

## Frontend Files

Update:

```text
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

No new backend endpoint is expected for this module.

## API Calls

Schema browsing:

```text
GET /gui/schema/config?depth=1
GET /gui/schema/config/path?path=<path>&depth=1
```

Candidate preview:

```text
GET /gui/config/candidate?path=<path>&format=json
```

Staging:

```text
POST /gui/config/set
POST /gui/config/delete
```

Diff and lifecycle:

```text
GET /gui/config/diff
POST /gui/config/commit
POST /gui/config/discard
POST /gui/config/save
```

## Acceptance Criteria

Module 6 is complete when:

1. The Configuration navigation item opens a real workspace.
2. The user can browse top-level config schema areas.
3. The user can open a child node and see its metadata.
4. The user can stage a set operation by path and value.
5. The user can stage a delete operation by path and optional value.
6. Candidate diff refreshes after staging.
7. Commit and discard buttons call backend endpoints.
8. Save calls backend endpoint.
9. API errors display clearly.
10. User-facing UI contains no forbidden product wording.

## Implemented First Pass

Implemented in:

```text
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Delivered behavior:

- Configuration navigation opens a real workspace.
- Root and child schema paths are browsable from the config schema API.
- Breadcrumb navigation moves back to root or parent paths.
- Selected node details show path, type, multi-value flag, valueless flag,
  secret flag, default, owner, help, and constraints.
- Candidate preview loads for the selected path.
- Manual set/delete staging accepts slash-separated or space-separated paths.
- Staging refreshes candidate preview and pending diff.
- Commit, discard, and save buttons call their backend endpoints.
- API failures are surfaced through the shared notice area.
- Clearing the API key clears cached UI state.
- User-facing frontend files were scanned for forbidden product wording.

## Not Included In The GUI Yet

Module 6 provides the first generic editor pass, but it is still a conservative
manual editor rather than a fully generated configuration UI.

Not included in the GUI at this stage:

- Path search is not implemented yet.
- Node metadata is displayed, but generated per-node value controls are not
  implemented yet.
- Tag-node instance selection is manual through the path field.
- Multi-value paths are supported through manual staging, not specialized
  repeatable controls.
- Generated leaf widgets for enum/list/range/IP/MAC constraints.
- Inline schema validation before API submission.
- Drag/drop rule ordering or rule resequencing.
- Config rollback browser.
- Config file import, merge, compare, or download.
- Per-path commit preview beyond the current diff summary.
- RBAC-aware field visibility.
- Live candidate change sync across browser sessions.

## Out Of Scope

Do not implement these yet:

- fully generated per-node forms
- drag/drop rule ordering
- schema-driven value widgets
- curated interface/system/firewall pages
- rollback browser
- RBAC
- live updates

## Manual Verification Plan

On a built image:

1. Connect with an API key.
2. Open Configuration.
3. Browse to `system`.
4. Stage:

```json
{
  "path": ["system", "host-name"],
  "value": "router-1"
}
```

5. Confirm diff shows staged change.
6. Discard and verify diff clears.
7. Stage again, commit, then save.
