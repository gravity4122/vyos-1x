# GUI Module 8: System Development Guide

## Module Goal

Build a curated system administration workspace for essential device settings.

This module uses:

- `GET /gui/system/status`
- `POST /gui/config/set`
- `POST /gui/config/delete`
- `GET /gui/config/diff`
- `POST /gui/config/commit`
- `POST /gui/config/discard`
- `POST /gui/config/save`

## Project-Specific UI Rules

User-facing GUI text must not use the forbidden product term. Use wording such
as "DevGate", "router", "system", or "device".

For all GUI work, use the project-specific `ui-ux-pro-max` standard:

- clear workflows
- polished controls
- responsive layouts
- accessible states
- consistent terminology
- careful error handling
- production-grade usability

## First Version Scope

The first curated System module provides:

- System identity and runtime summary.
- Hostname edit.
- DNS name-server add/delete.
- Timezone edit.
- NTP server add/delete.
- SSH enable/disable and port edit.
- HTTPS/API visibility.
- Configured user summary.
- Syslog host summary.
- Diff refresh after staging.
- Shared commit, discard, and save actions through the existing commit bar.

## Backend Architecture

New file:

```text
src/services/api/gui/system.py
```

The backend endpoint merges:

1. Candidate configuration under `system`.
2. Candidate configuration under `service`.
3. Runtime version and uptime data from existing op-mode modules.
4. Runtime API flags from `SessionState`.

The endpoint is read-only. Configuration changes continue to use the shared
GUI config endpoints so locking, validation, commit, discard, and save behavior
remain consistent across modules.

## API Contract

```text
GET /gui/system/status?key=<api-key>
```

Response data:

```json
{
  "identity": {
    "hostname": "router",
    "version": "1.0",
    "uptime": "1 day"
  },
  "dns": {
    "name_servers": ["1.1.1.1"]
  },
  "time": {
    "timezone": "UTC",
    "ntp_enabled": true,
    "ntp_servers": ["pool.ntp.org"]
  },
  "access": {
    "ssh_enabled": true,
    "ssh_port": "22",
    "https_enabled": true,
    "https_port": "443",
    "api_rest": true,
    "api_graphql": false,
    "api_keys": ["default"],
    "runtime_api": {
      "rest": true,
      "graphql": false,
      "strict": false
    }
  },
  "users": {
    "configured": []
  },
  "logging": {
    "syslog_hosts": [],
    "global_facilities": []
  },
  "errors": []
}
```

## Frontend Workflow

1. Connect with API key.
2. Open System.
3. Review identity, DNS, time, access, users, and logging status.
4. Stage essential setting changes.
5. Review pending diff in the commit bar.
6. Commit, discard, or save.

## Acceptance Criteria

Module 8 first pass is complete when:

1. System navigation opens a real workspace.
2. The frontend calls `/gui/system/status`.
3. Hostname can be staged.
4. DNS name-server add/delete can be staged.
5. Timezone can be staged.
6. NTP server add/delete can be staged.
7. SSH enable/disable can be staged.
8. SSH port can be staged.
9. Diff refreshes after staging.
10. API errors display clearly.
11. User-facing UI contains no forbidden product wording.

## Implemented First Pass

Implemented in:

```text
src/services/api/gui/system.py
src/services/api/gui/routers.py
src/services/api/gui/models.py
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Delivered behavior:

- Added `/gui/system/status`.
- Added the `system` GUI capability flag.
- Added System navigation and workspace.
- Displays identity, version, uptime, DNS, time, access, user, and logging
  summary data.
- Stages hostname changes.
- Stages DNS name-server add/delete.
- Stages timezone changes.
- Stages NTP server add/delete.
- Stages SSH enable/disable and SSH port changes.
- Refreshes diff after staging.
- Reuses shared commit, discard, and save controls.
- Displays partial-data errors from the backend.
- User-facing frontend files were scanned for forbidden product wording.

## Not Included In The GUI Yet

Module 8 provides the first curated System workspace, but several
administrative workflows still need dedicated safety and validation design.

Not included in the GUI at this stage:

- User account editing is not implemented.
- SSH key editing is not implemented.
- HTTPS/API key editing is not implemented.
- Syslog editing is not implemented.
- Image management is not implemented.
- Reboot/shutdown workflows are not implemented.
- Local user password, level, OTP, and public-key management.
- RADIUS/TACACS login configuration.
- SSH listen-address, access-control, ciphers, MACs, key exchange, and dynamic
  protection controls.
- HTTPS certificate, virtual-host, API key, REST strict mode, GraphQL,
  introspection, token authentication, CORS, and API debug controls.
- NTP advanced options such as VRF, allow-client, listen-address, and pool
  options.
- DNS search domain, domain name, static host, and resolver advanced options.
- Syslog facility, host, file, console, and level editors.
- Config management, task scheduler, proxy, watchdog, LCD, console, and
  update-check forms.
- Image show/add/delete/set-default workflows.
- Reboot, shutdown, or destructive action confirmation flows.
- Live status polling for system services.

## Out Of Scope

Do not implement these yet:

- local user create/edit/delete
- SSH key management
- HTTPS/API key management
- syslog editor
- image management
- reboot/shutdown confirmation flows
- update checks
- live polling

## Manual Verification Plan

On a built image:

1. Connect with an API key.
2. Open System.
3. Stage a hostname change.
4. Confirm pending diff updates.
5. Discard and verify the diff clears.
6. Stage DNS and NTP server changes.
7. Commit and save after reviewing candidate diff.
