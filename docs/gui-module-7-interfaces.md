# GUI Module 7: Interfaces Development Guide

## Module Goal

Build the first curated networking workspace for interface visibility and
common interface edits.

This module uses:

- `GET /gui/interfaces/status`
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

The first curated Interfaces module provides:

- Interface list with live state and candidate config merged together.
- Summary counts for total, up, down, and configured interfaces.
- Interface selection.
- Details for operational state, admin state, MAC, MTU, VRF, addresses, and
  description.
- Common candidate edits:
  - description set/delete
  - address add/delete
  - MTU set/delete
  - enable/disable through the `disable` config node
- Diff refresh after staging.
- Shared commit, discard, and save actions through the existing commit bar.

## Backend Architecture

New file:

```text
src/services/api/gui/interfaces.py
```

The backend endpoint merges two sources:

1. Candidate configuration under `interfaces`.
2. Operational interface summary from `src/op_mode/interfaces.py`.

The endpoint is read-only. Configuration changes continue to use the shared
GUI config endpoints so locking, validation, commit, discard, and save behavior
remain consistent across modules.

## API Contract

```text
GET /gui/interfaces/status?key=<api-key>
```

Response data:

```json
{
  "summary": {
    "total": 2,
    "up": 1,
    "down": 1,
    "configured": 1,
    "types": ["ethernet"]
  },
  "items": [
    {
      "name": "eth0",
      "type": "ethernet",
      "path": ["interfaces", "ethernet", "eth0"],
      "configured": true,
      "exists": true,
      "enabled": true,
      "admin_state": "up",
      "oper_state": "up",
      "addresses": ["192.0.2.10/24"],
      "description": "WAN",
      "mtu": "1500",
      "mac": "00:00:00:00:00:00",
      "vrf": "",
      "children": {
        "vif": 0,
        "vif_s": 0
      }
    }
  ],
  "errors": []
}
```

## Frontend Workflow

1. Connect with API key.
2. Open Interfaces.
3. Select an interface.
4. Review status and configuration.
5. Stage common edits.
6. Review pending diff in the commit bar.
7. Commit, discard, or save.

## Acceptance Criteria

Module 7 first pass is complete when:

1. Interfaces navigation opens a real workspace.
2. The frontend calls `/gui/interfaces/status`.
3. The interface list shows merged live/configured state.
4. Selecting an interface fills the editor.
5. Description can be staged as set/delete.
6. Address can be staged as add/delete.
7. MTU can be staged as set/delete.
8. Enable/disable can be staged.
9. Diff refreshes after staging.
10. API errors display clearly.
11. User-facing UI contains no forbidden product wording.

## Implemented First Pass

Implemented in:

```text
src/services/api/gui/interfaces.py
src/services/api/gui/routers.py
src/services/api/gui/models.py
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Delivered behavior:

- Added `/gui/interfaces/status`.
- Added the `interfaces` GUI capability flag.
- Added Interfaces navigation and workspace.
- Displays summary counts for total, up, down, and configured interfaces.
- Lists configured and detected interfaces.
- Shows selected interface details.
- Stages description, address, MTU, and enable/disable changes through the
  shared candidate config endpoints.
- Refreshes diff after staging.
- Reuses shared commit, discard, and save controls.
- Displays partial-data errors from the backend.
- User-facing frontend files were scanned for forbidden product wording.

## Not Included In The GUI Yet

Module 7 provides the first curated Interfaces workspace, but it only covers
common status and basic candidate edits.

Not included in the GUI at this stage:

- New interface creation is not implemented.
- VLAN/VIF forms are not implemented.
- Bridge and bonding member editors are not implemented.
- Address delete requires entering the exact address value.
- Counters and live polling are not implemented.
- Wireless, WireGuard, tunnel, PPPoE, OpenVPN, MACsec, VXLAN, Geneve, VTI, and
  other specialized interface forms.
- Bridge STP, bridge port options, and BVI controls.
- Bonding mode, hash policy, LACP, member ordering, and member status controls.
- VLAN/VIF-S advanced options.
- DHCP/DHCPv6 address mode helpers.
- Interface reset, clear counters, packet capture, or diagnostics actions.
- Interface dependency warnings before disabling/removing paths.
- Interface creation validation by type-specific naming rules.

## Out Of Scope

Do not implement these yet:

- creating new interfaces
- VLAN/VIF creation forms
- bonding member management
- bridge member management
- wireless, WireGuard, tunnel, PPPoE, OpenVPN specialized forms
- live polling
- packet counters charts
- interface reset/clear operations

## Manual Verification Plan

On a built image:

1. Connect with an API key.
2. Open Interfaces.
3. Select `eth0`.
4. Stage a description change.
5. Confirm pending diff updates.
6. Discard and verify the diff clears.
7. Stage an address add/delete on a test interface.
8. Commit and save after reviewing candidate diff.
