# VyOS GUI Development Roadmap

## Purpose

This document defines the module-by-module development plan for adding a GUI to
this VyOS codebase. The GUI must use the existing VyOS configuration and
operational command system as the source of truth. It must not create a parallel
configuration engine.

The target architecture is:

```text
Browser GUI
  -> nginx service https
  -> /srv/localui static frontend
  -> /run/api.sock
  -> vyos-http-api-server
  -> ConfigSession, Config, XML reference cache, op-mode cache
  -> existing conf_mode/op_mode scripts and commit backend
```

## Core Principles

1. Reuse the existing `service https` and `vyos-http-api-server` lifecycle.
2. Serve the frontend as static assets from `/srv/localui`.
3. Keep `ConfigSession`, config XML, op-mode XML, and commit scripts as the
   authoritative implementation.
4. Use generated metadata from `data/reftree.cache` and `data/op_cache.json`
   to avoid hardcoding feature schemas.
5. Use client-side validation only as early feedback. Commit-time validation
   remains authoritative.
6. Build generic coverage first, then curated UX modules.
7. Keep all changes compatible with existing CLI behavior.
8. Do not use the term "VyOS" anywhere in user-facing GUI text, page titles,
   navigation, labels, notifications, dialogs, bundled frontend metadata, or
   visible assets. Use project/product-neutral wording such as "DevGate",
   "router", "system", or "device" in the UI. Internal backend code and
   developer documentation may still reference existing VyOS package names,
   modules, paths, and APIs when describing the current codebase.
9. For any GUI, frontend, visual design, interaction design, layout, or
   user-experience development, use the project-specific `ui-ux-pro-max`
   standard. This means GUI work must be treated as a high-quality product
   design task, not only a functional form wrapper: clear workflows, polished
   controls, responsive layouts, accessible states, consistent terminology,
   careful error handling, and production-grade usability are required.

## Current GUI Gap Tracker

This section tracks what is not included in the GUI yet, even when backend
support or generic config APIs already exist.

### Module 1: API Foundation

Not included in the GUI yet:

- API key login/connect form from Module 1 alone.
- Visible dashboard or workspace.
- Config, schema, operational command, RBAC, or live-update screens.
- Dedicated GUI enable/disable control separate from the existing HTTPS API
  service.

### Module 2: Schema And Metadata

Not included in the GUI yet:

- Full visual schema explorer.
- Schema path search.
- Generated forms from node metadata.
- Tag-node instance picker.
- Inline schema validation hints.
- Op-mode command browser or execution UI.
- RBAC-aware schema filtering.

### Module 3: Config Session Workflow

Not included in the GUI yet:

- Full visual config editor from Module 3 alone.
- Commit-confirm countdown and confirmation UI.
- Rollback browser.
- Config import, merge, compare, export, or download workflows.
- Candidate conflict detection across browser sessions.
- Background operation progress UI.

### Module 4: Frontend Shell

Not included in the GUI yet:

- Feature-complete workspaces for all router areas.
- User profile, RBAC, and session management screens.
- Theme customization.
- Live notifications or background task tray.
- Frontend component framework or automated browser test harness.

### Module 5: Dashboard

Not included in the GUI yet:

- Live polling or streaming updates.
- Historical charts.
- Interface traffic charts.
- Route table drill-down.
- Log viewer.
- Packet capture viewer.
- Service restart/reset actions.
- Alerting and notification workflows.

### Module 6: Generic Config Browser And Editor

Not included in the GUI yet:

- Path search.
- Fully generated per-node forms.
- Type-specific widgets for enum/list/range/IP/MAC constraints.
- Tag-node instance picker.
- Specialized repeatable controls for multi-value leaves.
- Drag/drop ordering or rule resequencing.
- Config rollback and config file workflows.
- Live candidate sync across browser sessions.

### Module 7: Interfaces

Not included in the GUI yet:

- New interface creation.
- VLAN/VIF forms.
- Bridge and bonding member editors.
- Wireless, WireGuard, tunnel, PPPoE, OpenVPN, MACsec, VXLAN, Geneve, and VTI
  specialized forms.
- DHCP/DHCPv6 address helpers.
- Interface reset, clear counters, packet capture, and diagnostics actions.
- Dependency warnings before disabling or removing interface paths.
- Counters and live polling.

### Module 8: System

Not included in the GUI yet:

- Local user account editing, password management, OTP, and SSH keys.
- RADIUS/TACACS login configuration.
- Full SSH advanced settings.
- HTTPS certificate, API key, REST strict mode, GraphQL, token authentication,
  CORS, and API debug controls.
- NTP, DNS, syslog, config-management, scheduler, proxy, watchdog, console, and
  update-check advanced forms.
- Image show/add/delete/set-default workflows.
- Reboot and shutdown confirmation flows.
- Live service status polling.

### Module 9: Firewall And NAT

Not included in the GUI yet:

- Rule ordering and resequencing workflows.
- Full generated firewall rule editor.
- Zone policy editor.
- Firewall default-action and global-options editor.
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

### Module 10: Services

Not included in the GUI yet:

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

## Priority Roadmap

### P0: GUI Foundation

#### 1. GUI API Foundation

Goal: add a dedicated `/gui/*` API namespace inside the existing FastAPI service.

Scope:

- Add `src/services/api/gui/`.
- Add router registration from `vyos-http-api-server`.
- Reuse existing API key authentication/session state.
- Add common response models.
- Add consistent error handling.
- Add basic request logging with API key/user identity.
- Preserve existing REST and GraphQL behavior.

Acceptance criteria:

- `/gui/health` returns service status.
- Existing `/retrieve`, `/configure`, `/show`, `/graphql` behavior is unchanged.
- API is available only when `service https api` is configured.

#### 2. Schema and Metadata Service

Goal: expose config and op-mode metadata for frontend form generation.

Implementation status:

- Implemented under `src/services/api/gui/schema.py`.
- Exposed `GET /gui/schema/config`.
- Exposed `GET /gui/schema/config/path`.
- Exposed `GET /gui/schema/op`.
- Exposed `GET /gui/schema/op/path`.
- Updated `/gui/capabilities` to report `schema: true`.

Scope:

- Read config metadata from `data/reftree.cache`.
- Read op-mode metadata from `data/op_cache.json`.
- Expose node type, help text, default value, constraints, value help,
  completion help, multi-value state, valueless state, tag-node state,
  hidden/secret flags, owner, and priority.
- Add path lookup endpoints.

Initial endpoints:

- `GET /gui/schema/config`
- `GET /gui/schema/config/path?path=interfaces/ethernet`
- `GET /gui/schema/op`
- `GET /gui/schema/op/path?path=show/interfaces`

Acceptance criteria:

- Frontend can discover valid config paths without hardcoded schemas.
- Hidden and secret nodes are marked correctly.
- Tag nodes and multi-value leaves are represented clearly.

#### 3. Config Session Workflow

Goal: expose safe end-to-end candidate configuration operations for the GUI.

Implementation status:

- Implemented under `src/services/api/gui/config.py`.
- Added shared config lock in `src/services/api/locks.py`.
- Updated REST config mutations to share the same lock.
- Exposed running/candidate config read endpoints.
- Exposed set/delete/load-section staging endpoints.
- Exposed diff, commit, commit-confirm, confirm, discard, and save endpoints.
- Updated `/gui/capabilities` to report `config: true`.

Scope:

- Read running config.
- Read candidate/session config.
- Set path.
- Delete path.
- Load section/tree.
- Preview diff.
- Commit.
- Commit-confirm.
- Confirm.
- Discard.
- Save config.

Initial endpoints:

- `GET /gui/config/running`
- `GET /gui/config/candidate`
- `POST /gui/config/set`
- `POST /gui/config/delete`
- `POST /gui/config/load-section`
- `GET /gui/config/diff`
- `POST /gui/config/commit`
- `POST /gui/config/commit-confirm`
- `POST /gui/config/confirm`
- `POST /gui/config/discard`
- `POST /gui/config/save`

Acceptance criteria:

- A user can stage, preview, commit, discard, and save a config change.
- Commit-confirm workflow works from the GUI.
- Failed commits discard the candidate changes consistently with existing API
  behavior.
- Changes to `service https` are handled safely with background commit behavior.

### P1: First Usable GUI

#### 4. Frontend Shell

Goal: create the static GUI application installed into `/srv/localui`.

Implementation status:

- Implemented dependency-free static shell under `src/localui/`.
- Installed static assets into `/srv/localui` through `debian/rules`.
- Added API-key connection flow.
- Added same-origin calls to health, capabilities, config schema, and config
  diff endpoints.
- Added responsive app layout and initial operational panels.

Scope:

- Add frontend source tree.
- Build static assets during package build or as a controlled build artifact.
- Add same-origin API client.
- Add API key login/session storage.
- Add layout: sidebar, top bar, content area, commit bar.
- Add notification and error display system.
- Add route protection for unauthenticated users.

Acceptance criteria:

- Opening `https://router/` loads the GUI.
- The GUI can authenticate against the existing API key model.
- The GUI can call `/gui/health` and display API status.

#### 5. Dashboard

Goal: provide immediate router visibility.

Implementation status:

- Implemented `GET /gui/dashboard/status`.
- Added dashboard aggregation under `src/services/api/gui/dashboard.py`.
- Updated `/gui/capabilities` to report `dashboard: true`.
- Updated the static frontend shell to display identity, uptime, resource,
  network, candidate, capability, and schema status.

Scope:

- Hostname.
- Version.
- Uptime.
- CPU.
- Memory.
- Disk.
- Interface summary.
- Route summary.
- Service/API health.
- Recent background operation status.

Backend may aggregate existing op-mode calls into one dashboard endpoint.

Acceptance criteria:

- Dashboard loads without requiring configuration edits.
- Failed op-mode calls are displayed clearly without breaking the full page.

#### 6. Generic Config Browser and Editor

Goal: provide broad router feature coverage before curated screens exist.

Scope:

- Tree navigation generated from config schema.
- Path search.
- Node help/default display.
- Input controls based on node metadata.
- Add/edit/delete for leaf, multi, valueless, and tag nodes.
- Stage changes through GUI config endpoints.
- Show pending diff.
- Commit/discard from commit bar.

Acceptance criteria:

- User can configure a simple path such as `system host-name`.
- User can configure a tag-node path such as `interfaces ethernet eth0 description`.
- User can configure a multi-value path such as interface addresses.
- Diff/commit/discard works end to end.

Status:

- First pass implemented in the local UI shell.
- Implemented schema browsing, breadcrumbs, selected node metadata, candidate
  preview, manual set/delete staging, diff refresh, commit, discard, and save.
- Remaining work: path search, generated per-node controls, tag instance
  pickers, and specialized multi-value editors.

### P2: High-Value Curated Modules

#### 7. Interfaces Module

Goal: provide curated interface management with status and config together.

Scope:

- Ethernet.
- VLAN/VIF.
- Bridge.
- Bonding.
- Loopback.
- Tunnel basics.
- WireGuard basics.
- Interface status, counters, MTU, MAC, addresses.

Acceptance criteria:

- User can view all interfaces and operational state.
- User can configure addresses, descriptions, disable state, MTU, VLANs, bridge
  members, and bond members.
- UI uses generic config workflow under the hood.

Status:

- First pass implemented in the GUI API and local UI shell.
- Implemented `/gui/interfaces/status` with candidate config and live interface
  state merged into one read model.
- Implemented curated UI for interface list, selected interface details,
  description, address, MTU, enable/disable staging, diff refresh, commit,
  discard, and save.
- Remaining work: create-interface flows, VLAN/VIF editors, bridge member
  editor, bonding member editor, specialized tunnel/WireGuard forms, and
  counters/live polling.

#### 8. System Module

Goal: cover appliance administration workflows.

Scope:

- Hostname.
- Users.
- DNS/name-server.
- NTP.
- Timezone.
- SSH.
- HTTPS/API.
- Logging/syslog.
- Image management.
- Reboot and shutdown.

Acceptance criteria:

- User can manage essential system settings from curated forms.
- Image show/add/delete/set-default operations are available.
- Dangerous actions require confirmation.

Status:

- First pass implemented in the GUI API and local UI shell.
- Implemented `/gui/system/status` with candidate `system` and `service`
  config plus runtime version, uptime, and API state.
- Implemented curated UI for hostname, DNS name servers, timezone, NTP
  servers, SSH enable/disable, SSH port, HTTPS/API visibility, configured user
  summary, syslog host summary, diff refresh, commit, discard, and save.
- Remaining work: local user management, SSH key management, HTTPS/API key
  management, syslog editor, image operations, reboot/shutdown confirmation
  flows, update checks, and live polling.

#### 9. Firewall and NAT Module

Goal: provide safe management of packet filtering and translation.

Scope:

- Firewall groups.
- IPv4 rules.
- IPv6 rules.
- Zone policy.
- Source NAT.
- Destination NAT.
- NAT66/NAT64/CGNAT in later iteration.

Acceptance criteria:

- User can create groups and rules.
- Rule ordering and resequencing are supported.
- UI warns about broad/empty match conditions.
- Diff preview is mandatory before commit.

Status:

- First pass implemented in the GUI API and local UI shell.
- Implemented `/gui/firewall/status` with candidate firewall, NAT, NAT66, and
  NAT64 configuration summaries.
- Implemented curated UI for group member add/delete, basic IPv4/IPv6 named
  chain filter rule staging, basic NAT source/destination rule staging, rule
  delete actions, diff refresh, commit, discard, and save.
- Remaining work: rule ordering/resequencing, full rule editor, zone policy
  editor, NAT64/NAT66/CGNAT/static NAT forms, geoip/dynamic/remote group
  workflows, conntrack controls, live counters, packet capture, and stronger
  broad-rule warning UX.

#### 10. Services Module

Goal: cover commonly used router services.

Scope:

- DHCP server.
- DHCP relay.
- DNS forwarding.
- LLDP.
- SNMP.
- Prometheus.
- Telegraf.
- HAProxy/load balancing.

Acceptance criteria:

- Each service page combines config state and operational state where possible.
- Common service enable/disable workflows are simple and reversible.

Status:

- First pass implemented in the GUI API and local UI shell.
- Implemented `/gui/services/status` with candidate service and HAProxy
  configuration summaries.
- Implemented curated UI for common service enabled/disabled state, DNS
  forwarding listener add/delete, DHCP relay server/interface add/delete, SNMP
  community/contact/location staging, diff refresh, commit, discard, and save.
- Remaining work: DHCP pool editors, DHCPv6 support, DNS forwarding advanced
  editor, LLDP neighbor drill-down, SNMPv3, Prometheus/Telegraf plugin editors,
  HAProxy frontend/backend/server editor, service logs, restart/reset actions,
  and live health polling.

### P3: Advanced Networking

#### 11. Routing Module

Goal: manage routing features with VRF awareness.

Scope:

- Static routes.
- Policy routing.
- BGP.
- OSPF.
- OSPFv3.
- Route maps.
- Prefix lists.
- Access lists.
- VRF-aware route and neighbor views.

Acceptance criteria:

- Static routing is delivered first.
- BGP and OSPF pages include neighbor/session operational state.
- Route policy objects can be edited without losing ordering.

#### 12. VPN and PKI Module

Goal: manage VPN and certificate workflows safely.

Scope:

- PKI CA/cert/key import.
- Certificate display with secret masking.
- WireGuard full management.
- IPsec.
- OpenVPN.
- L2TP/SSTP/PPTP if required.

Acceptance criteria:

- Secret fields are masked and never displayed unintentionally.
- Import/generate workflows use existing op-mode/config-session paths.
- VPN pages show tunnel/session status.

#### 13. Operational Tools Module

Goal: expose common troubleshooting and maintenance tools.

Scope:

- Show command browser.
- Ping.
- Traceroute.
- MTR.
- Logs.
- Packet capture.
- Restart/reset actions.
- Tech-support archive generation.

Acceptance criteria:

- Long-running operations are backgrounded or streamed safely.
- Output is downloadable where useful.
- Dangerous reset/restart actions require confirmation.

### P4: Production Quality

#### 14. RBAC and Audit

Goal: add role-aware access control and traceability.

Scope:

- Read-only role.
- Operator role.
- Admin role.
- Per-module permissions.
- Commit audit trail.
- API key/user attribution.

Acceptance criteria:

- Read-only users cannot stage or commit changes.
- Commits record identity and origin.

#### 15. Live Updates

Goal: improve operational visibility.

Scope:

- Interface counters.
- Service state.
- Log streaming.
- Background operation progress.
- WebSocket or polling transport.

Acceptance criteria:

- Dashboard and operational pages refresh without manual reload.
- Live updates do not overload low-resource router platforms.

#### 16. Backup, Restore, and Rollback

Goal: support reliable configuration lifecycle management.

Scope:

- Config export.
- Config import.
- Saved config comparison.
- Rollback workflow.
- Optional scheduled backup hooks.

Acceptance criteria:

- User can export current config.
- User can load/merge config with preview.
- Rollback operations are explicit and confirmed.

## Recommended Development Sequence

1. GUI API foundation.
2. Schema and metadata service.
3. Config session workflow.
4. Frontend shell.
5. Dashboard.
6. Generic config browser and editor.
7. Interfaces module.
8. System module.
9. Firewall and NAT module.
10. Services module.
11. Routing module.
12. VPN and PKI module.
13. Operational tools module.
14. RBAC and audit.
15. Live updates.
16. Backup, restore, and rollback.

## Milestone 1: Minimal End-to-End GUI

This is the first target before building full feature modules.

Scope:

- API key login.
- GUI shell served from `/srv/localui`.
- Dashboard with basic system information.
- Config schema browser.
- Edit one config path.
- Preview diff.
- Commit.
- Commit-confirm.
- Confirm.
- Discard.
- Save config.

Success criteria:

- A user can open the GUI, authenticate, edit `system host-name`, preview the
  diff, commit the change, and save the configuration.
- The same workflow also works for one interface path, for example
  `interfaces ethernet eth0 description`.
- No existing CLI, REST, or GraphQL behavior regresses.

## Implementation Notes

- Prefer extending existing FastAPI code under `src/services/api/`.
- Prefer reusing `ConfigSession` instead of shelling out directly from new code.
- Prefer using existing `/configure-section` logic where practical.
- Keep frontend state as candidate edits until the backend confirms staging.
- Mask secret values based on schema metadata.
- Do not expose arbitrary shell execution.
- Keep op-mode execution constrained to valid op-mode metadata.
- Add tests for API endpoints before adding large UI modules.
