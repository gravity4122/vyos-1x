# GUI Module 10: Services Development Guide

## Module Goal

Build the first curated services workspace for common router services.

This module uses:

- `GET /gui/services/status`
- `POST /gui/config/set`
- `POST /gui/config/delete`
- `GET /gui/config/diff`
- `POST /gui/config/commit`
- `POST /gui/config/discard`
- `POST /gui/config/save`

## Project-Specific UI Rules

User-facing GUI text must not use the forbidden product term. Use wording such
as "DevGate", "router", "system", or "device".

For all GUI work, use the project-specific `ui-ux-pro-max` standard.

## First Version Scope

The first curated Services module provides:

- Service inventory for:
  - DHCP server
  - DHCP relay
  - DNS forwarding
  - LLDP
  - SNMP
  - Prometheus exporters
  - Telegraf
  - HAProxy load balancing
- Enabled/disabled summary.
- Basic service enable/disable staging.
- DNS forwarding listen-address add/delete.
- DHCP relay server add/delete.
- DHCP relay interface add/delete.
- SNMP community add/delete with authorization.
- SNMP contact/location staging.
- Diff refresh after staging.
- Shared commit, discard, and save actions through the existing commit bar.

## Backend Architecture

New file:

```text
src/services/api/gui/services.py
```

The backend endpoint reads candidate configuration from:

```text
service
load-balancing haproxy
```

The endpoint is read-only. Configuration changes continue to use the shared GUI
config endpoints so locking, validation, commit, discard, and save behavior
remain consistent across modules.

## API Contract

```text
GET /gui/services/status?key=<api-key>
```

Response data:

```json
{
  "summary": {
    "total": 8,
    "enabled": 3,
    "disabled": 5
  },
  "items": [
    {
      "key": "dns-forwarding",
      "label": "DNS forwarding",
      "path": ["service", "dns", "forwarding"],
      "enabled": true,
      "details": {
        "listen_addresses": ["192.0.2.1"]
      }
    }
  ],
  "errors": []
}
```

## Acceptance Criteria

Module 10 first pass is complete when:

1. Services navigation opens a real workspace.
2. The frontend calls `/gui/services/status`.
3. Service enabled/disabled state is visible.
4. Common service enable/disable can be staged.
5. DNS forwarding listen-address add/delete can be staged.
6. DHCP relay server add/delete can be staged.
7. DHCP relay interface add/delete can be staged.
8. SNMP community add/delete can be staged.
9. SNMP contact/location can be staged.
10. Diff refreshes after staging.
11. API errors display clearly.
12. User-facing UI contains no forbidden product wording.

## Implemented First Pass

Implemented in:

```text
src/services/api/gui/services.py
src/services/api/gui/routers.py
src/services/api/gui/models.py
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Delivered behavior:

- Added `/gui/services/status`.
- Added the `services` GUI capability flag.
- Added Services navigation and workspace.
- Displays enabled/disabled state for common services.
- Stages basic service enable/disable.
- Stages DNS forwarding listen-address add/delete.
- Stages DHCP relay server and interface add/delete.
- Stages SNMP community, contact, and location changes.
- Refreshes diff after staging.
- Reuses shared commit, discard, and save controls.

## Not Included In The GUI Yet

Module 10 first pass intentionally avoids full service-specific editors.

Not included in the GUI at this stage:

- DHCP server shared-network, subnet, pool, option, static mapping, and lease
  management.
- DHCPv6 server and relay editors.
- DNS forwarding domain zones, forward zones, cache settings, DNSSEC, DoH/DoT,
  and statistics.
- LLDP per-interface options and neighbor operational drill-down.
- SNMP v3 groups, users, views, trap targets, certificates, and engine IDs.
- Prometheus exporter-specific settings.
- Telegraf input/output plugin editors.
- HAProxy frontend/backend/server editor, health checks, certificates, and
  runtime statistics.
- Service restart/reset actions.
- Live service health polling.
- Service logs.

## Manual Verification Plan

On a built image:

1. Connect with an API key.
2. Open Services.
3. Stage DNS forwarding enable and listen-address.
4. Stage DHCP relay server/interface.
5. Stage SNMP community.
6. Confirm pending diff updates.
7. Discard and verify the diff clears.
8. Stage again, commit, then save.
