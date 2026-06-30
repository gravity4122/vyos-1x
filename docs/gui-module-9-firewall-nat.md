# GUI Module 9: Firewall And NAT Development Guide

## Module Goal

Build the first curated security policy workspace for firewall groups, basic
filter rules, and basic NAT rules.

This module uses:

- `GET /gui/firewall/status`
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

The first curated Firewall and NAT module provides:

- Firewall/NAT summary counts.
- Firewall group list.
- Firewall filter rule list for IPv4 and IPv6 named chains.
- Firewall zone summary.
- Source and destination NAT rule summary.
- Firewall group member add/delete.
- Basic filter rule staging:
  - action
  - protocol
  - description
  - source address
  - destination address
  - destination port
  - log on/off
- Basic filter rule delete.
- Basic source/destination NAT rule staging:
  - inbound/outbound interface
  - source address
  - destination address
  - translation address
  - translation port
  - description
- Basic NAT rule delete.
- Diff refresh after staging.
- Shared commit, discard, and save actions through the existing commit bar.

## Backend Architecture

New file:

```text
src/services/api/gui/firewall.py
```

The backend endpoint reads candidate configuration from:

```text
firewall
nat
nat66
nat64
```

The endpoint is read-only. Configuration changes continue to use the shared
GUI config endpoints so locking, validation, commit, discard, and save behavior
remain consistent across modules.

## API Contract

```text
GET /gui/firewall/status?key=<api-key>
```

Response data:

```json
{
  "summary": {
    "groups": 2,
    "filter_rules": 4,
    "zones": 1,
    "nat_rules": 2,
    "nat64_rules": 0
  },
  "groups": [],
  "filter_rules": [],
  "zones": [],
  "nat_rules": [],
  "nat64": {
    "source_rules": 0
  },
  "errors": []
}
```

## Frontend Workflow

1. Connect with API key.
2. Open Firewall.
3. Review group, filter rule, zone, and NAT summaries.
4. Stage common group/rule/NAT changes.
5. Review pending diff in the commit bar.
6. Commit, discard, or save.

## Acceptance Criteria

Module 9 first pass is complete when:

1. Firewall navigation opens a real workspace.
2. The frontend calls `/gui/firewall/status`.
3. Firewall groups are summarized.
4. Filter rules are summarized.
5. NAT rules are summarized.
6. Group member add/delete can be staged.
7. Basic filter rule add/update can be staged.
8. Basic filter rule delete can be staged.
9. Basic source/destination NAT rule add/update can be staged.
10. Basic NAT rule delete can be staged.
11. Diff refreshes after staging.
12. API errors display clearly.
13. User-facing UI contains no forbidden product wording.

## Implemented First Pass

Implemented in:

```text
src/services/api/gui/firewall.py
src/services/api/gui/routers.py
src/services/api/gui/models.py
src/localui/index.html
src/localui/styles.css
src/localui/app.js
```

Delivered behavior:

- Added `/gui/firewall/status`.
- Added the `firewall` GUI capability flag.
- Added Firewall navigation and workspace.
- Displays group, filter rule, zone, NAT, and NAT64 counts.
- Displays configured firewall groups, filter rules, zones, and NAT rules.
- Stages firewall group member add/delete.
- Stages basic IPv4/IPv6 named-chain filter rule fields.
- Stages basic source/destination NAT rule fields.
- Refreshes diff after staging.
- Reuses shared commit, discard, and save controls.

## Not Included In The GUI Yet

Module 9 first pass intentionally avoids advanced policy authoring.

Not included in the GUI at this stage:

- Rule ordering and resequencing workflows.
- Full generated firewall rule editor.
- Zone policy editor.
- Firewall default-action/global-options editor.
- IPv6-specific advanced rule helpers.
- NAT66 advanced editor.
- NAT64 editor.
- CGNAT editor.
- Static NAT editor.
- Dynamic groups, remote groups, domain resolver workflows, and geoip provider
  workflows.
- Flowtable/offload controls.
- Conntrack helper/state policy editor.
- Rule hit counters, live packet counters, and traffic charts.
- Packet capture from a rule.
- Warnings for broad/empty match conditions beyond backend validation.

## Out Of Scope

Do not implement these yet:

- drag/drop rule ordering
- rule clone/move/resequence
- zone policy matrix
- NAT64/NAT66/CGNAT forms
- geoip and dynamic group workflows
- conntrack operational actions
- live counters
- packet capture

## Manual Verification Plan

On a built image:

1. Connect with an API key.
2. Open Firewall.
3. Stage an address group member.
4. Stage a basic IPv4 filter rule.
5. Stage a basic source NAT masquerade rule.
6. Confirm pending diff updates.
7. Discard and verify the diff clears.
8. Stage again, commit, then save.
