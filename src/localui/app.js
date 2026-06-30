(function () {
  'use strict';

  const STORAGE_KEY = 'devgate.apiKey';
  const state = {
    key: window.localStorage.getItem(STORAGE_KEY) || '',
    health: null,
    capabilities: null,
    schema: null,
    diff: null,
    dashboard: null,
    activeView: 'overview',
    configSchema: null,
    selectedConfigPath: [],
    candidatePreview: null,
    interfaces: null,
    selectedInterface: null,
    system: null,
    firewall: null,
    services: null,
  };

  const els = {
    authPanel: document.getElementById('authPanel'),
    authForm: document.getElementById('authForm'),
    apiKey: document.getElementById('apiKey'),
    refreshButton: document.getElementById('refreshButton'),
    clearKeyButton: document.getElementById('clearKeyButton'),
    notice: document.getElementById('notice'),
    apiStatus: document.getElementById('apiStatus'),
    schemaStatus: document.getElementById('schemaStatus'),
    topbarTitle: document.querySelector('.topbar h1'),
    topbarSubtitle: document.getElementById('topbarSubtitle'),
    overviewWorkspace: document.getElementById('overviewWorkspace'),
    configurationWorkspace: document.getElementById('configurationWorkspace'),
    interfacesWorkspace: document.getElementById('interfacesWorkspace'),
    systemWorkspace: document.getElementById('systemWorkspace'),
    firewallWorkspace: document.getElementById('firewallWorkspace'),
    servicesWorkspace: document.getElementById('servicesWorkspace'),
    healthIndicator: document.getElementById('healthIndicator'),
    healthMetrics: document.getElementById('healthMetrics'),
    resourceList: document.getElementById('resourceList'),
    networkList: document.getElementById('networkList'),
    capabilityList: document.getElementById('capabilityList'),
    schemaList: document.getElementById('schemaList'),
    diffSummary: document.getElementById('diffSummary'),
    commitState: document.getElementById('commitState'),
    commitDetail: document.getElementById('commitDetail'),
    discardButton: document.getElementById('discardButton'),
    saveButton: document.getElementById('saveButton'),
    commitButton: document.getElementById('commitButton'),
    configRootButton: document.getElementById('configRootButton'),
    configBreadcrumb: document.getElementById('configBreadcrumb'),
    configChildren: document.getElementById('configChildren'),
    configNodeDetails: document.getElementById('configNodeDetails'),
    candidatePreview: document.getElementById('candidatePreview'),
    configStageForm: document.getElementById('configStageForm'),
    configPath: document.getElementById('configPath'),
    configOperation: document.getElementById('configOperation'),
    configValue: document.getElementById('configValue'),
    reloadConfigButton: document.getElementById('reloadConfigButton'),
    interfaceSummary: document.getElementById('interfaceSummary'),
    interfaceList: document.getElementById('interfaceList'),
    interfaceDetails: document.getElementById('interfaceDetails'),
    interfaceEditForm: document.getElementById('interfaceEditForm'),
    interfaceDescription: document.getElementById('interfaceDescription'),
    interfaceAddress: document.getElementById('interfaceAddress'),
    interfaceMtu: document.getElementById('interfaceMtu'),
    interfaceEnabled: document.getElementById('interfaceEnabled'),
    reloadInterfacesButton: document.getElementById('reloadInterfacesButton'),
    clearDescriptionButton: document.getElementById('clearDescriptionButton'),
    deleteAddressButton: document.getElementById('deleteAddressButton'),
    clearMtuButton: document.getElementById('clearMtuButton'),
    stageInterfaceStateButton: document.getElementById('stageInterfaceStateButton'),
    systemSummary: document.getElementById('systemSummary'),
    systemDetails: document.getElementById('systemDetails'),
    systemIdentityForm: document.getElementById('systemIdentityForm'),
    systemHostname: document.getElementById('systemHostname'),
    reloadSystemButton: document.getElementById('reloadSystemButton'),
    dnsServerList: document.getElementById('dnsServerList'),
    dnsServerForm: document.getElementById('dnsServerForm'),
    dnsServer: document.getElementById('dnsServer'),
    deleteDnsServerButton: document.getElementById('deleteDnsServerButton'),
    timeDetails: document.getElementById('timeDetails'),
    timeForm: document.getElementById('timeForm'),
    systemTimezone: document.getElementById('systemTimezone'),
    ntpServerForm: document.getElementById('ntpServerForm'),
    ntpServer: document.getElementById('ntpServer'),
    deleteNtpServerButton: document.getElementById('deleteNtpServerButton'),
    accessDetails: document.getElementById('accessDetails'),
    sshForm: document.getElementById('sshForm'),
    sshEnabled: document.getElementById('sshEnabled'),
    sshPort: document.getElementById('sshPort'),
    clearSshPortButton: document.getElementById('clearSshPortButton'),
    systemAuxList: document.getElementById('systemAuxList'),
    firewallSummary: document.getElementById('firewallSummary'),
    firewallOverviewList: document.getElementById('firewallOverviewList'),
    firewallGroupList: document.getElementById('firewallGroupList'),
    firewallGroupForm: document.getElementById('firewallGroupForm'),
    firewallGroupType: document.getElementById('firewallGroupType'),
    firewallGroupName: document.getElementById('firewallGroupName'),
    firewallGroupMember: document.getElementById('firewallGroupMember'),
    deleteFirewallGroupMemberButton: document.getElementById('deleteFirewallGroupMemberButton'),
    firewallRuleList: document.getElementById('firewallRuleList'),
    firewallRuleForm: document.getElementById('firewallRuleForm'),
    firewallFamily: document.getElementById('firewallFamily'),
    firewallChainName: document.getElementById('firewallChainName'),
    firewallRuleId: document.getElementById('firewallRuleId'),
    firewallAction: document.getElementById('firewallAction'),
    firewallProtocol: document.getElementById('firewallProtocol'),
    firewallSource: document.getElementById('firewallSource'),
    firewallDestination: document.getElementById('firewallDestination'),
    firewallDestinationPort: document.getElementById('firewallDestinationPort'),
    firewallRuleDescription: document.getElementById('firewallRuleDescription'),
    firewallLog: document.getElementById('firewallLog'),
    deleteFirewallRuleButton: document.getElementById('deleteFirewallRuleButton'),
    natRuleList: document.getElementById('natRuleList'),
    natRuleForm: document.getElementById('natRuleForm'),
    natDirection: document.getElementById('natDirection'),
    natRuleId: document.getElementById('natRuleId'),
    natInterface: document.getElementById('natInterface'),
    natSource: document.getElementById('natSource'),
    natDestination: document.getElementById('natDestination'),
    natTranslationAddress: document.getElementById('natTranslationAddress'),
    natTranslationPort: document.getElementById('natTranslationPort'),
    natDescription: document.getElementById('natDescription'),
    deleteNatRuleButton: document.getElementById('deleteNatRuleButton'),
    reloadFirewallButton: document.getElementById('reloadFirewallButton'),
    servicesSummary: document.getElementById('servicesSummary'),
    servicesList: document.getElementById('servicesList'),
    reloadServicesButton: document.getElementById('reloadServicesButton'),
    serviceToggleForm: document.getElementById('serviceToggleForm'),
    serviceKey: document.getElementById('serviceKey'),
    serviceState: document.getElementById('serviceState'),
    dnsForwardingForm: document.getElementById('dnsForwardingForm'),
    dnsForwardingListenAddress: document.getElementById('dnsForwardingListenAddress'),
    deleteDnsForwardingListenButton: document.getElementById('deleteDnsForwardingListenButton'),
    dhcpRelayForm: document.getElementById('dhcpRelayForm'),
    dhcpRelayServer: document.getElementById('dhcpRelayServer'),
    deleteDhcpRelayServerButton: document.getElementById('deleteDhcpRelayServerButton'),
    dhcpRelayInterface: document.getElementById('dhcpRelayInterface'),
    deleteDhcpRelayInterfaceButton: document.getElementById('deleteDhcpRelayInterfaceButton'),
    snmpForm: document.getElementById('snmpForm'),
    snmpCommunity: document.getElementById('snmpCommunity'),
    deleteSnmpCommunityButton: document.getElementById('deleteSnmpCommunityButton'),
    snmpAuthorization: document.getElementById('snmpAuthorization'),
    snmpContact: document.getElementById('snmpContact'),
    snmpLocation: document.getElementById('snmpLocation'),
  };

  function setNotice(message, type) {
    if (!message) {
      els.notice.className = 'notice hidden';
      els.notice.textContent = '';
      return;
    }
    els.notice.className = `notice ${type || ''}`.trim();
    els.notice.textContent = message;
  }

  function setPill(el, text, tone) {
    el.className = `status-pill ${tone || 'muted'}`.trim();
    el.textContent = text;
  }

  function apiUrl(path) {
    const url = new URL(path, window.location.origin);
    url.searchParams.set('key', state.key);
    return url;
  }

  async function apiGet(path) {
    const response = await fetch(apiUrl(path), {
      headers: { Accept: 'application/json' },
    });
    return parseApiResponse(response);
  }

  async function apiPost(path, body) {
    const options = {
      method: 'POST',
      headers: { Accept: 'application/json' },
    };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const response = await fetch(apiUrl(path), options);
    return parseApiResponse(response);
  }

  async function parseApiResponse(response) {
    const payload = await response.json().catch(() => null);
    if (!payload || payload.success !== true) {
      const message = payload && payload.error ? payload.error : `Request failed: ${response.status}`;
      throw new Error(message);
    }
    return payload.data;
  }

  function renderHealth() {
    const health = state.health;
    const dashboard = state.dashboard;
    if (!health && !dashboard) {
      els.healthIndicator.className = 'panel-indicator';
      els.healthMetrics.innerHTML = [
        metric('Status', 'Waiting'),
        metric('Hostname', 'Unknown'),
        metric('Version', 'Unknown'),
        metric('Uptime', 'Unknown'),
      ].join('');
      return;
    }

    els.healthIndicator.className = 'panel-indicator ok';
    const identity = dashboard && dashboard.identity ? dashboard.identity : {};
    els.healthMetrics.innerHTML = [
      metric('Status', health ? health.status || 'Unknown' : 'Unknown'),
      metric('Hostname', identity.hostname || 'Unknown'),
      metric('Version', identity.version || 'Unknown'),
      metric('Uptime', identity.uptime || 'Unknown'),
    ].join('');
  }

  function renderDashboard() {
    const dashboard = state.dashboard;
    if (!dashboard) {
      els.resourceList.innerHTML = empty('No resource data loaded.');
      els.networkList.innerHTML = empty('No network data loaded.');
      return;
    }

    const resources = dashboard.resources || {};
    const memory = resources.memory || {};
    const storage = resources.storage || {};
    const cpu = resources.cpu || {};

    els.resourceList.innerHTML = [
      row('CPU cores', String(cpu.count || 'Unknown'), tag((cpu.models || []).slice(0, 1).join(', ') || 'Unknown', 'muted')),
      row('Memory used', formatPercent(memory.used_percent), tag(formatBytes(memory.used), memory.used_percent > 85 ? 'warn' : 'ok')),
      row('Storage used', formatPercent(storage.use_percentage), tag(formatBytes(storage.used), storage.use_percentage > 85 ? 'warn' : 'ok')),
    ].join('');

    const network = dashboard.network || {};
    const interfaces = network.interfaces || {};
    const routes = network.routes || {};
    els.networkList.innerHTML = [
      row('Interfaces', `${interfaces.total || 0} total`, tag(`${interfaces.up || 0} up`, interfaces.up ? 'ok' : 'muted')),
      row('IPv4 routes', routeCount(routes.ipv4), tag('inet', 'muted')),
      row('IPv6 routes', routeCount(routes.ipv6), tag('inet6', 'muted')),
    ].join('');

    if (Array.isArray(dashboard.errors) && dashboard.errors.length > 0) {
      setNotice(`${dashboard.errors.length} dashboard source(s) returned partial data.`, 'error');
    }
  }

  function renderCapabilities() {
    const modules = state.capabilities && state.capabilities.modules;
    if (!modules) {
      els.capabilityList.innerHTML = empty('No capability data loaded.');
      return;
    }

    els.capabilityList.innerHTML = Object.keys(modules).map((name) => {
      const enabled = modules[name] === true;
      return row(titleCase(name), 'Backend module', tag(enabled ? 'Ready' : 'Pending', enabled ? 'ok' : 'muted'));
    }).join('');
  }

  function renderSchema() {
    const children = state.schema && state.schema.schema && state.schema.schema.children;
    if (!children || children.length === 0) {
      els.schemaList.innerHTML = empty('No schema data loaded.');
      setPill(els.schemaStatus, 'Schema pending', 'muted');
      return;
    }

    setPill(els.schemaStatus, `${children.length} schema areas`, 'ok');
    els.schemaList.innerHTML = children.slice(0, 10).map((node) => {
      const help = node.help || 'Configuration area';
      return row(node.name || 'root', help, tag(node.node_type || 'node', 'muted'));
    }).join('');
  }

  function renderDiff() {
    const diff = state.diff;
    if (!diff) {
      els.diffSummary.innerHTML = empty('No candidate data loaded.');
      els.commitState.textContent = 'No pending status';
      els.commitDetail.textContent = 'Connect to check candidate changes.';
      setLifecycleButtons(false, false);
      return;
    }

    if (!diff.changed) {
      els.diffSummary.innerHTML = empty('No staged configuration changes.');
      els.commitState.textContent = 'No staged changes';
      els.commitDetail.textContent = 'Candidate configuration matches running configuration.';
      setLifecycleButtons(false, Boolean(state.key));
      return;
    }

    const summary = diff.summary || {};
    const counts = {
      added: Object.keys(summary.add || {}).length,
      changed: Object.keys(summary.change || {}).length,
      deleted: Object.keys(summary.delete || {}).length,
    };

    els.diffSummary.innerHTML = [
      row('Added', `${counts.added} entries`, tag(String(counts.added), counts.added ? 'warn' : 'muted')),
      row('Changed', `${counts.changed} entries`, tag(String(counts.changed), counts.changed ? 'warn' : 'muted')),
      row('Deleted', `${counts.deleted} entries`, tag(String(counts.deleted), counts.deleted ? 'warn' : 'muted')),
    ].join('');
    els.commitState.textContent = 'Staged changes detected';
    els.commitDetail.textContent = 'Review, commit, discard, or save configuration state.';
    setLifecycleButtons(true, Boolean(state.key));
  }

  function clearLoadedData() {
    state.health = null;
    state.capabilities = null;
    state.schema = null;
    state.diff = null;
    state.dashboard = null;
    state.configSchema = null;
    state.candidatePreview = null;
    state.selectedConfigPath = [];
    state.interfaces = null;
    state.selectedInterface = null;
    state.system = null;
    state.firewall = null;
    state.services = null;
  }

  function setLifecycleButtons(hasChanges, canSave) {
    els.discardButton.disabled = !hasChanges;
    els.commitButton.disabled = !hasChanges;
    els.saveButton.disabled = !canSave;
  }

  function renderConnected() {
    els.authPanel.classList.add('hidden');
    setPill(els.apiStatus, 'Connected', 'ok');
    renderViewHeader();
    renderHealth();
    renderDashboard();
    renderCapabilities();
    renderSchema();
    renderDiff();
  }

  function renderDisconnected(message) {
    els.authPanel.classList.remove('hidden');
    renderViewHeader();
    setPill(els.apiStatus, 'Disconnected', 'error');
    setPill(els.schemaStatus, 'Schema pending', 'muted');
    els.healthIndicator.className = 'panel-indicator error';
    setLifecycleButtons(false, false);
    if (message) {
      setNotice(message, 'error');
    }
  }

  function renderViewHeader() {
    const connectedText = state.key ? 'Connected to the local management API.' : 'Connect with an API key to load system state.';
    if (state.activeView === 'configuration') {
      els.topbarTitle.textContent = 'Configuration';
      els.topbarSubtitle.textContent = state.key ? 'Browse schema paths and stage candidate changes.' : connectedText;
      return;
    }
    if (state.activeView === 'interfaces') {
      els.topbarTitle.textContent = 'Interfaces';
      els.topbarSubtitle.textContent = state.key ? 'Review live state and stage common interface changes.' : connectedText;
      return;
    }
    if (state.activeView === 'system') {
      els.topbarTitle.textContent = 'System';
      els.topbarSubtitle.textContent = state.key ? 'Review and stage essential system settings.' : connectedText;
      return;
    }
    if (state.activeView === 'firewall') {
      els.topbarTitle.textContent = 'Firewall';
      els.topbarSubtitle.textContent = state.key ? 'Review policy objects and stage firewall or NAT changes.' : connectedText;
      return;
    }
    if (state.activeView === 'services') {
      els.topbarTitle.textContent = 'Services';
      els.topbarSubtitle.textContent = state.key ? 'Review service state and stage common service changes.' : connectedText;
      return;
    }
    if (state.activeView === 'operations') {
      els.topbarTitle.textContent = 'Operations';
      els.topbarSubtitle.textContent = 'Operational tools will be added in a later module.';
      return;
    }
    els.topbarTitle.textContent = 'System Overview';
    els.topbarSubtitle.textContent = connectedText;
  }

  async function loadShell() {
    if (!state.key) {
      renderDisconnected();
      return;
    }

    setNotice('Loading system state...');
    try {
      const [health, capabilities, schema, diff, dashboard] = await Promise.all([
        apiGet('/gui/health'),
        apiGet('/gui/capabilities'),
        apiGet('/gui/schema/config?depth=1'),
        apiGet('/gui/config/diff'),
        apiGet('/gui/dashboard/status'),
      ]);

      state.health = health;
      state.capabilities = capabilities;
      state.schema = schema;
      state.diff = diff;
      state.dashboard = dashboard;
      window.localStorage.setItem(STORAGE_KEY, state.key);
      setNotice('');
      renderConnected();
      if (state.activeView === 'configuration') {
        await loadConfigWorkspace(state.selectedConfigPath);
      } else if (state.activeView === 'interfaces') {
        await loadInterfacesWorkspace();
      } else if (state.activeView === 'system') {
        await loadSystemWorkspace();
      } else if (state.activeView === 'firewall') {
        await loadFirewallWorkspace();
      } else if (state.activeView === 'services') {
        await loadServicesWorkspace();
      }
    } catch (err) {
      state.health = null;
      state.capabilities = null;
      state.schema = null;
      state.diff = null;
      state.dashboard = null;
      renderHealth();
      renderDashboard();
      renderCapabilities();
      renderSchema();
      renderDiff();
      renderDisconnected(err.message || 'Unable to connect.');
    }
  }

  async function loadConfigWorkspace(pathParts) {
    if (!state.key) {
      renderConfigWorkspace();
      return;
    }

    const selectedPath = Array.isArray(pathParts) ? pathParts : parseConfigPath(String(pathParts || ''));
    const joinedPath = selectedPath.join('/');
    state.selectedConfigPath = selectedPath;
    els.configPath.value = joinedPath;
    setNotice('Loading configuration path...');

    try {
      const schemaPath = joinedPath
        ? `/gui/schema/config/path?path=${encodeURIComponent(joinedPath)}&depth=1`
        : '/gui/schema/config?depth=1';
      const candidatePath = `/gui/config/candidate?path=${encodeURIComponent(joinedPath)}&format=json`;
      const [schema, candidate] = await Promise.all([
        apiGet(schemaPath),
        apiGet(candidatePath),
      ]);
      state.configSchema = schema;
      state.candidatePreview = candidate;
      setNotice('');
      renderConfigWorkspace();
    } catch (err) {
      state.configSchema = null;
      state.candidatePreview = null;
      renderConfigWorkspace();
      setNotice(err.message || 'Unable to load configuration path.', 'error');
    }
  }

  function renderConfigWorkspace() {
    const schema = state.configSchema || state.schema;
    const node = schema && schema.schema ? schema.schema : null;

    renderBreadcrumb(state.selectedConfigPath);
    if (!node) {
      els.configChildren.innerHTML = empty(state.key ? 'No schema node loaded.' : 'Connect to browse configuration.');
      els.configNodeDetails.innerHTML = detail('Path', pathLabel(state.selectedConfigPath)) + detail('Status', 'Waiting');
      els.candidatePreview.textContent = 'No candidate data loaded.';
      return;
    }

    const children = Array.isArray(node.children) ? node.children : [];
    if (children.length === 0) {
      els.configChildren.innerHTML = empty('No child paths at this level.');
    } else {
      els.configChildren.innerHTML = children.map((child) => {
        const path = Array.isArray(child.path) ? child.path.join('/') : '';
        const help = child.help || 'Configuration path';
        return `
          <button class="path-row" type="button" data-path="${escapeHtml(path)}">
            <span>
              <strong>${escapeHtml(child.name || 'root')}</strong>
              <small>${escapeHtml(help)}</small>
            </span>
            ${tag(child.node_type || 'node', 'muted')}
          </button>
        `;
      }).join('');
    }

    els.configNodeDetails.innerHTML = [
      detail('Path', pathLabel(state.selectedConfigPath)),
      detail('Type', node.node_type || 'root'),
      detail('Multi value', yesNo(node.multi)),
      detail('Valueless', yesNo(node.valueless)),
      detail('Secret', yesNo(node.secret)),
      detail('Default', node.default_value || 'None'),
      detail('Owner', node.owner || 'System'),
      detail('Help', node.help || 'No help text available.'),
      detail('Constraints', constraintText(node)),
    ].join('');

    els.candidatePreview.textContent = formatPreview(state.candidatePreview);
  }

  function renderBreadcrumb(pathParts) {
    const parts = Array.isArray(pathParts) ? pathParts : [];
    const buttons = [
      `<button type="button" data-path="">Root</button>`,
      ...parts.map((part, index) => {
        const path = parts.slice(0, index + 1).join('/');
        return `<button type="button" data-path="${escapeHtml(path)}">${escapeHtml(part)}</button>`;
      }),
    ];
    els.configBreadcrumb.innerHTML = buttons.join('<span>/</span>');
  }

  async function refreshDiff() {
    state.diff = await apiGet('/gui/config/diff');
    renderDiff();
  }

  async function stageConfig(event) {
    event.preventDefault();
    if (!state.key) {
      setNotice('Connect before staging configuration changes.', 'error');
      return;
    }

    const path = parseConfigPath(els.configPath.value);
    if (path.length === 0) {
      setNotice('Enter a configuration path before staging.', 'error');
      return;
    }

    const operation = els.configOperation.value;
    const value = els.configValue.value.trim();
    const body = { path };
    if (value) {
      body.value = value;
    }

    setNotice(`Staging ${operation} operation...`);
    try {
      await apiPost(operation === 'delete' ? '/gui/config/delete' : '/gui/config/set', body);
      await refreshDiff();
      await loadConfigWorkspace(path);
      setNotice('Configuration change staged.');
    } catch (err) {
      setNotice(err.message || 'Unable to stage configuration change.', 'error');
    }
  }

  async function loadInterfacesWorkspace() {
    if (!state.key) {
      renderInterfacesWorkspace();
      return;
    }

    setNotice('Loading interfaces...');
    try {
      state.interfaces = await apiGet('/gui/interfaces/status');
      const items = interfaceItems();
      if (!state.selectedInterface && items.length > 0) {
        state.selectedInterface = items[0].name;
      }
      if (state.selectedInterface && !items.some((item) => item.name === state.selectedInterface)) {
        state.selectedInterface = items.length > 0 ? items[0].name : null;
      }
      renderInterfacesWorkspace();
      const errorsText = interfaceErrorsText(state.interfaces);
      setNotice(errorsText, errorsText ? 'error' : '');
    } catch (err) {
      state.interfaces = null;
      state.selectedInterface = null;
      renderInterfacesWorkspace();
      setNotice(err.message || 'Unable to load interfaces.', 'error');
    }
  }

  function renderInterfacesWorkspace() {
    const data = state.interfaces;
    const items = interfaceItems();
    const selected = selectedInterface();

    if (!data) {
      els.interfaceSummary.innerHTML = [
        summaryTile('Total', '0'),
        summaryTile('Up', '0'),
        summaryTile('Down', '0'),
        summaryTile('Configured', '0'),
      ].join('');
      els.interfaceList.innerHTML = empty(state.key ? 'No interface data loaded.' : 'Connect to view interfaces.');
      renderSelectedInterface(null);
      return;
    }

    const summary = data.summary || {};
    els.interfaceSummary.innerHTML = [
      summaryTile('Total', summary.total || 0),
      summaryTile('Up', summary.up || 0),
      summaryTile('Down', summary.down || 0),
      summaryTile('Configured', summary.configured || 0),
    ].join('');

    if (items.length === 0) {
      els.interfaceList.innerHTML = empty('No interfaces found.');
    } else {
      els.interfaceList.innerHTML = items.map((item) => {
        const active = selected && selected.name === item.name ? ' active' : '';
        const subtitle = [
          item.type || 'unknown',
          item.configured ? 'configured' : 'detected',
          addressText(item.addresses),
        ].filter(Boolean).join(' · ');
        return `
          <button class="path-row${active}" type="button" data-interface="${escapeHtml(item.name)}">
            <span>
              <strong>${escapeHtml(item.name)}</strong>
              <small>${escapeHtml(subtitle)}</small>
            </span>
            ${tag(stateText(item), stateTone(item))}
          </button>
        `;
      }).join('');
    }

    renderSelectedInterface(selected);
  }

  function renderSelectedInterface(item) {
    if (!item) {
      els.interfaceDetails.innerHTML = detail('Status', 'No interface selected.');
      els.interfaceDescription.value = '';
      els.interfaceAddress.value = '';
      els.interfaceMtu.value = '';
      els.interfaceEnabled.value = 'unchanged';
      setInterfaceFormEnabled(false);
      return;
    }

    els.interfaceDetails.innerHTML = [
      detail('Name', item.name || 'Unknown'),
      detail('Type', item.type || 'Unknown'),
      detail('Path', item.path && item.path.length ? item.path.join('/') : 'Not configured'),
      detail('Operational state', item.oper_state || 'Unknown'),
      detail('Admin state', item.admin_state || 'Unknown'),
      detail('Candidate state', item.enabled === false ? 'Disabled' : 'Enabled'),
      detail('MAC', item.mac || 'Unknown'),
      detail('MTU', item.mtu || 'Unknown'),
      detail('VRF', item.vrf || 'default'),
      detail('Addresses', addressText(item.addresses) || 'None'),
      detail('Description', item.description || 'None'),
      detail('Child interfaces', childInterfaceText(item.children)),
    ].join('');

    els.interfaceDescription.value = item.description || '';
    els.interfaceAddress.value = '';
    els.interfaceMtu.value = item.mtu || '';
    els.interfaceEnabled.value = item.enabled === false ? 'disabled' : 'enabled';
    setInterfaceFormEnabled(Boolean(item.path && item.path.length));
  }

  function setInterfaceFormEnabled(enabled) {
    [
      els.interfaceDescription,
      els.interfaceAddress,
      els.interfaceMtu,
      els.interfaceEnabled,
      els.clearDescriptionButton,
      els.deleteAddressButton,
      els.clearMtuButton,
      els.stageInterfaceStateButton,
    ].forEach((el) => {
      el.disabled = !enabled;
    });
    els.interfaceEditForm.querySelector('button[type="submit"]').disabled = !enabled;
  }

  async function stageInterfaceFields(event) {
    event.preventDefault();
    const item = selectedConfiguredInterface();
    if (!item) {
      return;
    }

    const operations = [];
    const description = els.interfaceDescription.value.trim();
    const mtu = els.interfaceMtu.value.trim();
    const address = els.interfaceAddress.value.trim();

    if (description && description !== (item.description || '')) {
      operations.push(setConfig([...item.path, 'description'], description));
    }
    if (mtu && String(mtu) !== String(item.mtu || '')) {
      operations.push(setConfig([...item.path, 'mtu'], mtu));
    }
    if (address) {
      operations.push(setConfig([...item.path, 'address'], address));
    }

    await runInterfaceOperations(operations, 'Interface fields staged.');
  }

  async function clearInterfaceDescription() {
    const item = selectedConfiguredInterface();
    if (!item) {
      return;
    }
    await runInterfaceOperations(
      [deleteConfig([...item.path, 'description'])],
      'Interface description cleared.',
    );
  }

  async function deleteInterfaceAddress() {
    const item = selectedConfiguredInterface();
    const address = els.interfaceAddress.value.trim();
    if (!item || !address) {
      setNotice('Enter an address to delete.', 'error');
      return;
    }
    await runInterfaceOperations(
      [deleteConfig([...item.path, 'address'], address)],
      'Interface address delete staged.',
    );
  }

  async function clearInterfaceMtu() {
    const item = selectedConfiguredInterface();
    if (!item) {
      return;
    }
    await runInterfaceOperations(
      [deleteConfig([...item.path, 'mtu'])],
      'Interface MTU cleared.',
    );
  }

  async function stageInterfaceState() {
    const item = selectedConfiguredInterface();
    if (!item) {
      return;
    }
    const value = els.interfaceEnabled.value;
    if (value === 'unchanged') {
      setNotice('Select enabled or disabled before staging state.', 'error');
      return;
    }
    const operation = value === 'disabled'
      ? setConfig([...item.path, 'disable'])
      : deleteConfig([...item.path, 'disable']);
    await runInterfaceOperations([operation], 'Interface state staged.');
  }

  async function runInterfaceOperations(operations, successMessage) {
    if (!state.key) {
      setNotice('Connect before staging interface changes.', 'error');
      return;
    }
    const filtered = operations.filter(Boolean);
    if (filtered.length === 0) {
      setNotice('No interface changes to stage.');
      return;
    }

    setNotice('Staging interface change...');
    try {
      for (const operation of filtered) {
        await operation;
      }
      await refreshDiff();
      await loadInterfacesWorkspace();
      setNotice(successMessage);
    } catch (err) {
      setNotice(err.message || 'Unable to stage interface change.', 'error');
    }
  }

  function setConfig(path, value) {
    const body = { path };
    if (value !== undefined && value !== '') {
      body.value = String(value);
    }
    return apiPost('/gui/config/set', body);
  }

  function deleteConfig(path, value) {
    const body = { path };
    if (value !== undefined && value !== '') {
      body.value = String(value);
    }
    return apiPost('/gui/config/delete', body);
  }

  async function loadSystemWorkspace() {
    if (!state.key) {
      renderSystemWorkspace();
      return;
    }

    setNotice('Loading system settings...');
    try {
      state.system = await apiGet('/gui/system/status');
      renderSystemWorkspace();
      const errorsText = sourceErrorsText(state.system && state.system.errors, 'system');
      setNotice(errorsText, errorsText ? 'error' : '');
    } catch (err) {
      state.system = null;
      renderSystemWorkspace();
      setNotice(err.message || 'Unable to load system settings.', 'error');
    }
  }

  function renderSystemWorkspace() {
    const data = state.system;
    if (!data) {
      els.systemSummary.innerHTML = [
        summaryTile('Hostname', 'Unknown'),
        summaryTile('SSH', 'Unknown'),
        summaryTile('REST API', 'Unknown'),
        summaryTile('Users', '0'),
      ].join('');
      els.systemDetails.innerHTML = detail('Status', state.key ? 'No system data loaded.' : 'Connect to view system settings.');
      els.dnsServerList.innerHTML = empty('No DNS data loaded.');
      els.timeDetails.innerHTML = detail('Status', 'No time data loaded.');
      els.accessDetails.innerHTML = detail('Status', 'No access data loaded.');
      els.systemAuxList.innerHTML = empty('No user or logging data loaded.');
      setSystemFormEnabled(false);
      return;
    }

    const identity = data.identity || {};
    const access = data.access || {};
    const users = data.users || {};
    els.systemSummary.innerHTML = [
      summaryTile('Hostname', identity.hostname || 'Unset'),
      summaryTile('SSH', access.ssh_enabled ? 'Enabled' : 'Disabled'),
      summaryTile('REST API', access.api_rest ? 'Enabled' : 'Disabled'),
      summaryTile('Users', configuredUsers(data).length),
    ].join('');

    els.systemDetails.innerHTML = [
      detail('Hostname', identity.hostname || 'Unset'),
      detail('Version', identity.version || 'Unknown'),
      detail('Uptime', identity.uptime || 'Unknown'),
      detail('Hardware', identity.hardware_model || 'Unknown'),
      detail('Architecture', identity.system_arch || 'Unknown'),
      detail('Load average', loadAverageText(identity.load_average)),
    ].join('');

    const dns = data.dns || {};
    els.dnsServerList.innerHTML = listRows(dns.name_servers, 'No name servers configured.');

    const time = data.time || {};
    els.timeDetails.innerHTML = [
      detail('Timezone', time.timezone || 'Unset'),
      detail('NTP', time.ntp_enabled ? 'Enabled' : 'Disabled'),
      detail('NTP servers', listText(time.ntp_servers) || 'None'),
    ].join('');

    els.accessDetails.innerHTML = [
      detail('SSH', access.ssh_enabled ? 'Enabled' : 'Disabled'),
      detail('SSH port', access.ssh_port || 'Default'),
      detail('SSH listen addresses', listText(access.ssh_listen_addresses) || 'All'),
      detail('HTTPS', access.https_enabled ? 'Enabled' : 'Disabled'),
      detail('HTTPS port', access.https_port || 'Default'),
      detail('GraphQL API', access.api_graphql ? 'Enabled' : 'Disabled'),
      detail('API keys', listText(access.api_keys) || 'None'),
      detail('Runtime strict mode', access.runtime_api && access.runtime_api.strict ? 'Enabled' : 'Disabled'),
    ].join('');

    const logging = data.logging || {};
    els.systemAuxList.innerHTML = [
      row('Configured users', `${configuredUsers(data).length} accounts`, tag(listText(configuredUsers(data).map((user) => user.name)) || 'none', 'muted')),
      row('Syslog hosts', listText(logging.syslog_hosts) || 'None', tag(String((logging.syslog_hosts || []).length), 'muted')),
      row('Global log facilities', listText(logging.global_facilities) || 'None', tag(String((logging.global_facilities || []).length), 'muted')),
    ].join('');

    els.systemHostname.value = identity.hostname || '';
    els.dnsServer.value = '';
    els.systemTimezone.value = time.timezone || '';
    els.ntpServer.value = '';
    els.sshEnabled.value = access.ssh_enabled ? 'enabled' : 'disabled';
    els.sshPort.value = access.ssh_port || '';
    setSystemFormEnabled(true);
  }

  function setSystemFormEnabled(enabled) {
    [
      els.systemHostname,
      els.dnsServer,
      els.deleteDnsServerButton,
      els.systemTimezone,
      els.ntpServer,
      els.deleteNtpServerButton,
      els.sshEnabled,
      els.sshPort,
      els.clearSshPortButton,
    ].forEach((el) => {
      el.disabled = !enabled;
    });
    [
      els.systemIdentityForm,
      els.dnsServerForm,
      els.timeForm,
      els.ntpServerForm,
      els.sshForm,
    ].forEach((form) => {
      form.querySelectorAll('button[type="submit"]').forEach((button) => {
        button.disabled = !enabled;
      });
    });
  }

  async function stageHostname(event) {
    event.preventDefault();
    const hostname = els.systemHostname.value.trim();
    if (!hostname) {
      setNotice('Enter a hostname before staging.', 'error');
      return;
    }
    await runSystemOperations([setConfig(['system', 'host-name'], hostname)], 'Hostname staged.');
  }

  async function stageDnsServer(event) {
    event.preventDefault();
    const server = els.dnsServer.value.trim();
    if (!server) {
      setNotice('Enter a name server before staging.', 'error');
      return;
    }
    await runSystemOperations([setConfig(['system', 'name-server'], server)], 'Name server staged.');
  }

  async function deleteDnsServer() {
    const server = els.dnsServer.value.trim();
    if (!server) {
      setNotice('Enter a name server to delete.', 'error');
      return;
    }
    await runSystemOperations([deleteConfig(['system', 'name-server'], server)], 'Name server delete staged.');
  }

  async function stageTimezone(event) {
    event.preventDefault();
    const timezone = els.systemTimezone.value.trim();
    if (!timezone) {
      setNotice('Enter a timezone before staging.', 'error');
      return;
    }
    await runSystemOperations([setConfig(['system', 'time-zone'], timezone)], 'Timezone staged.');
  }

  async function stageNtpServer(event) {
    event.preventDefault();
    const server = els.ntpServer.value.trim();
    if (!server) {
      setNotice('Enter an NTP server before staging.', 'error');
      return;
    }
    await runSystemOperations([setConfig(['service', 'ntp', 'server', server])], 'NTP server staged.');
  }

  async function deleteNtpServer() {
    const server = els.ntpServer.value.trim();
    if (!server) {
      setNotice('Enter an NTP server to delete.', 'error');
      return;
    }
    await runSystemOperations([deleteConfig(['service', 'ntp', 'server', server])], 'NTP server delete staged.');
  }

  async function stageSsh(event) {
    event.preventDefault();
    const operations = [];
    if (els.sshEnabled.value === 'enabled') {
      operations.push(setConfig(['service', 'ssh']));
      const port = els.sshPort.value.trim();
      if (port) {
        operations.push(setConfig(['service', 'ssh', 'port'], port));
      }
    } else if (els.sshEnabled.value === 'disabled') {
      operations.push(deleteConfig(['service', 'ssh']));
    }
    await runSystemOperations(operations, 'SSH settings staged.');
  }

  async function clearSshPort() {
    await runSystemOperations([deleteConfig(['service', 'ssh', 'port'])], 'SSH port cleared.');
  }

  async function runSystemOperations(operations, successMessage) {
    if (!state.key) {
      setNotice('Connect before staging system changes.', 'error');
      return;
    }
    const filtered = operations.filter(Boolean);
    if (filtered.length === 0) {
      setNotice('No system changes to stage.');
      return;
    }

    setNotice('Staging system change...');
    try {
      for (const operation of filtered) {
        await operation;
      }
      await refreshDiff();
      await loadSystemWorkspace();
      setNotice(successMessage);
    } catch (err) {
      setNotice(err.message || 'Unable to stage system change.', 'error');
    }
  }

  async function loadFirewallWorkspace() {
    if (!state.key) {
      renderFirewallWorkspace();
      return;
    }

    setNotice('Loading firewall policy...');
    try {
      state.firewall = await apiGet('/gui/firewall/status');
      renderFirewallWorkspace();
      const errorsText = sourceErrorsText(state.firewall && state.firewall.errors, 'firewall');
      setNotice(errorsText, errorsText ? 'error' : '');
    } catch (err) {
      state.firewall = null;
      renderFirewallWorkspace();
      setNotice(err.message || 'Unable to load firewall policy.', 'error');
    }
  }

  function renderFirewallWorkspace() {
    const data = state.firewall;
    if (!data) {
      els.firewallSummary.innerHTML = [
        summaryTile('Groups', '0'),
        summaryTile('Filter rules', '0'),
        summaryTile('Zones', '0'),
        summaryTile('NAT rules', '0'),
      ].join('');
      els.firewallOverviewList.innerHTML = empty(state.key ? 'No firewall data loaded.' : 'Connect to view firewall policy.');
      els.firewallGroupList.innerHTML = empty('No group data loaded.');
      els.firewallRuleList.innerHTML = empty('No filter rule data loaded.');
      els.natRuleList.innerHTML = empty('No NAT rule data loaded.');
      setFirewallFormEnabled(false);
      return;
    }

    const summary = data.summary || {};
    els.firewallSummary.innerHTML = [
      summaryTile('Groups', summary.groups || 0),
      summaryTile('Filter rules', summary.filter_rules || 0),
      summaryTile('Zones', summary.zones || 0),
      summaryTile('NAT rules', summary.nat_rules || 0),
    ].join('');

    els.firewallOverviewList.innerHTML = [
      row('Zones', `${summary.zones || 0} configured`, tag(String(summary.zones || 0), 'muted')),
      row('NAT64 source rules', `${summary.nat64_rules || 0} configured`, tag(String(summary.nat64_rules || 0), 'muted')),
      row('Policy source', 'Candidate configuration', tag('read only', 'muted')),
    ].join('');

    const groups = Array.isArray(data.groups) ? data.groups : [];
    els.firewallGroupList.innerHTML = groups.length
      ? groups.slice(0, 12).map((group) => {
        const members = group.members && group.members.length ? group.members.join(', ') : 'No members';
        return row(`${group.type} ${group.name}`, members, tag(String((group.members || []).length), 'muted'));
      }).join('')
      : empty('No firewall groups configured.');

    const rules = Array.isArray(data.filter_rules) ? data.filter_rules : [];
    els.firewallRuleList.innerHTML = rules.length
      ? rules.slice(0, 12).map((rule) => {
        const title = `${rule.family} ${rule.chain} rule ${rule.rule}`;
        const details = [
          rule.action || 'no action',
          rule.protocol || 'any protocol',
          addressRuleText(rule),
        ].filter(Boolean).join(' · ');
        return row(title, details, tag(rule.disabled ? 'disabled' : 'active', rule.disabled ? 'warn' : 'ok'));
      }).join('')
      : empty('No filter rules configured.');

    const natRules = Array.isArray(data.nat_rules) ? data.nat_rules : [];
    els.natRuleList.innerHTML = natRules.length
      ? natRules.slice(0, 12).map((rule) => {
        const title = `${titleCase(rule.direction)} NAT rule ${rule.rule}`;
        const details = [
          rule.inbound_interface ? `in ${rule.inbound_interface}` : '',
          rule.outbound_interface ? `out ${rule.outbound_interface}` : '',
          translationText(rule.translation),
        ].filter(Boolean).join(' · ');
        return row(title, details || 'No translation summary', tag(rule.family || 'ipv4', 'muted'));
      }).join('')
      : empty('No NAT rules configured.');

    setFirewallFormEnabled(true);
  }

  function setFirewallFormEnabled(enabled) {
    [
      els.firewallGroupType,
      els.firewallGroupName,
      els.firewallGroupMember,
      els.deleteFirewallGroupMemberButton,
      els.firewallFamily,
      els.firewallChainName,
      els.firewallRuleId,
      els.firewallAction,
      els.firewallProtocol,
      els.firewallSource,
      els.firewallDestination,
      els.firewallDestinationPort,
      els.firewallRuleDescription,
      els.firewallLog,
      els.deleteFirewallRuleButton,
      els.natDirection,
      els.natRuleId,
      els.natInterface,
      els.natSource,
      els.natDestination,
      els.natTranslationAddress,
      els.natTranslationPort,
      els.natDescription,
      els.deleteNatRuleButton,
    ].forEach((el) => {
      el.disabled = !enabled;
    });
    [els.firewallGroupForm, els.firewallRuleForm, els.natRuleForm].forEach((form) => {
      form.querySelectorAll('button[type="submit"]').forEach((button) => {
        button.disabled = !enabled;
      });
    });
  }

  async function stageFirewallGroup(event) {
    event.preventDefault();
    const groupType = els.firewallGroupType.value;
    const groupName = els.firewallGroupName.value.trim();
    const member = els.firewallGroupMember.value.trim();
    if (!groupName || !member) {
      setNotice('Enter a group name and member before staging.', 'error');
      return;
    }
    await runFirewallOperations(
      [setConfig(['firewall', 'group', groupType, groupName, firewallGroupMemberNode(groupType)], member)],
      'Firewall group member staged.',
    );
  }

  async function deleteFirewallGroupMember() {
    const groupType = els.firewallGroupType.value;
    const groupName = els.firewallGroupName.value.trim();
    const member = els.firewallGroupMember.value.trim();
    if (!groupName || !member) {
      setNotice('Enter a group name and member to delete.', 'error');
      return;
    }
    await runFirewallOperations(
      [deleteConfig(['firewall', 'group', groupType, groupName, firewallGroupMemberNode(groupType)], member)],
      'Firewall group member delete staged.',
    );
  }

  async function stageFirewallRule(event) {
    event.preventDefault();
    const base = firewallRuleBasePath();
    if (!base) {
      return;
    }
    const operations = [setConfig([...base, 'action'], els.firewallAction.value)];
    pushSetOperation(operations, [...base, 'protocol'], els.firewallProtocol.value);
    pushSetOperation(operations, [...base, 'source', 'address'], els.firewallSource.value);
    pushSetOperation(operations, [...base, 'destination', 'address'], els.firewallDestination.value);
    pushSetOperation(operations, [...base, 'destination', 'port'], els.firewallDestinationPort.value);
    pushSetOperation(operations, [...base, 'description'], els.firewallRuleDescription.value);
    if (els.firewallLog.value === 'enabled') {
      operations.push(setConfig([...base, 'log']));
    } else if (els.firewallLog.value === 'disabled') {
      operations.push(deleteConfig([...base, 'log']));
    }
    await runFirewallOperations(operations, 'Firewall rule staged.');
  }

  async function deleteFirewallRule() {
    const base = firewallRuleBasePath();
    if (!base) {
      return;
    }
    await runFirewallOperations([deleteConfig(base)], 'Firewall rule delete staged.');
  }

  async function stageNatRule(event) {
    event.preventDefault();
    const base = natRuleBasePath();
    if (!base) {
      return;
    }
    const operations = [];
    const interfaceNode = els.natDirection.value === 'source' ? 'outbound-interface' : 'inbound-interface';
    pushSetOperation(operations, [...base, interfaceNode, 'name'], els.natInterface.value);
    pushSetOperation(operations, [...base, 'source', 'address'], els.natSource.value);
    pushSetOperation(operations, [...base, 'destination', 'address'], els.natDestination.value);
    pushSetOperation(operations, [...base, 'translation', 'address'], els.natTranslationAddress.value);
    pushSetOperation(operations, [...base, 'translation', 'port'], els.natTranslationPort.value);
    pushSetOperation(operations, [...base, 'description'], els.natDescription.value);
    await runFirewallOperations(operations, 'NAT rule staged.');
  }

  async function deleteNatRule() {
    const base = natRuleBasePath();
    if (!base) {
      return;
    }
    await runFirewallOperations([deleteConfig(base)], 'NAT rule delete staged.');
  }

  function firewallRuleBasePath() {
    const chainName = els.firewallChainName.value.trim();
    const ruleId = els.firewallRuleId.value.trim();
    if (!chainName || !ruleId) {
      setNotice('Enter a chain name and rule number.', 'error');
      return null;
    }
    return ['firewall', els.firewallFamily.value, 'name', chainName, 'rule', ruleId];
  }

  function natRuleBasePath() {
    const ruleId = els.natRuleId.value.trim();
    if (!ruleId) {
      setNotice('Enter a NAT rule number.', 'error');
      return null;
    }
    return ['nat', els.natDirection.value, 'rule', ruleId];
  }

  function pushSetOperation(operations, path, value) {
    const trimmed = String(value || '').trim();
    if (trimmed) {
      operations.push(setConfig(path, trimmed));
    }
  }

  async function runFirewallOperations(operations, successMessage) {
    if (!state.key) {
      setNotice('Connect before staging firewall changes.', 'error');
      return;
    }
    const filtered = operations.filter(Boolean);
    if (filtered.length === 0) {
      setNotice('No firewall changes to stage.');
      return;
    }

    setNotice('Staging firewall change...');
    try {
      for (const operation of filtered) {
        await operation;
      }
      await refreshDiff();
      await loadFirewallWorkspace();
      setNotice(successMessage);
    } catch (err) {
      setNotice(err.message || 'Unable to stage firewall change.', 'error');
    }
  }

  async function loadServicesWorkspace() {
    if (!state.key) {
      renderServicesWorkspace();
      return;
    }

    setNotice('Loading services...');
    try {
      state.services = await apiGet('/gui/services/status');
      renderServicesWorkspace();
      const errorsText = sourceErrorsText(state.services && state.services.errors, 'services');
      setNotice(errorsText, errorsText ? 'error' : '');
    } catch (err) {
      state.services = null;
      renderServicesWorkspace();
      setNotice(err.message || 'Unable to load services.', 'error');
    }
  }

  function renderServicesWorkspace() {
    const data = state.services;
    if (!data) {
      els.servicesSummary.innerHTML = [
        summaryTile('Services', '0'),
        summaryTile('Enabled', '0'),
        summaryTile('Disabled', '0'),
        summaryTile('Managed', '0'),
      ].join('');
      els.servicesList.innerHTML = empty(state.key ? 'No service data loaded.' : 'Connect to view services.');
      setServicesFormEnabled(false);
      return;
    }

    const summary = data.summary || {};
    els.servicesSummary.innerHTML = [
      summaryTile('Services', summary.total || 0),
      summaryTile('Enabled', summary.enabled || 0),
      summaryTile('Disabled', summary.disabled || 0),
      summaryTile('Managed', serviceItems().length),
    ].join('');

    const items = serviceItems();
    els.servicesList.innerHTML = items.length
      ? items.map((item) => {
        return row(
          item.label || item.key,
          serviceDetailsText(item.details),
          tag(item.enabled ? 'enabled' : 'disabled', item.enabled ? 'ok' : 'muted'),
        );
      }).join('')
      : empty('No services found.');

    setServicesFormEnabled(true);
  }

  function setServicesFormEnabled(enabled) {
    [
      els.serviceKey,
      els.serviceState,
      els.dnsForwardingListenAddress,
      els.deleteDnsForwardingListenButton,
      els.dhcpRelayServer,
      els.deleteDhcpRelayServerButton,
      els.dhcpRelayInterface,
      els.deleteDhcpRelayInterfaceButton,
      els.snmpCommunity,
      els.deleteSnmpCommunityButton,
      els.snmpAuthorization,
      els.snmpContact,
      els.snmpLocation,
    ].forEach((el) => {
      el.disabled = !enabled;
    });
    [
      els.serviceToggleForm,
      els.dnsForwardingForm,
      els.dhcpRelayForm,
      els.snmpForm,
    ].forEach((form) => {
      form.querySelectorAll('button[type="submit"]').forEach((button) => {
        button.disabled = !enabled;
      });
    });
  }

  async function stageServiceState(event) {
    event.preventDefault();
    const path = servicePath(els.serviceKey.value);
    if (!path) {
      setNotice('Select a supported service.', 'error');
      return;
    }
    const operation = els.serviceState.value === 'enabled'
      ? setConfig(path)
      : deleteConfig(path);
    await runServicesOperations([operation], 'Service state staged.');
  }

  async function stageDnsForwarding(event) {
    event.preventDefault();
    const address = els.dnsForwardingListenAddress.value.trim();
    if (!address) {
      setNotice('Enter a DNS forwarding listen address.', 'error');
      return;
    }
    await runServicesOperations(
      [setConfig(['service', 'dns', 'forwarding', 'listen-address'], address)],
      'DNS forwarding listener staged.',
    );
  }

  async function deleteDnsForwardingListen() {
    const address = els.dnsForwardingListenAddress.value.trim();
    if (!address) {
      setNotice('Enter a DNS forwarding listen address to delete.', 'error');
      return;
    }
    await runServicesOperations(
      [deleteConfig(['service', 'dns', 'forwarding', 'listen-address'], address)],
      'DNS forwarding listener delete staged.',
    );
  }

  async function stageDhcpRelay(event) {
    event.preventDefault();
    const operations = [];
    pushSetOperation(operations, ['service', 'dhcp-relay', 'server'], els.dhcpRelayServer.value);
    pushSetOperation(operations, ['service', 'dhcp-relay', 'interface'], els.dhcpRelayInterface.value);
    await runServicesOperations(operations, 'DHCP relay settings staged.');
  }

  async function deleteDhcpRelayServer() {
    const server = els.dhcpRelayServer.value.trim();
    if (!server) {
      setNotice('Enter a DHCP relay server to delete.', 'error');
      return;
    }
    await runServicesOperations(
      [deleteConfig(['service', 'dhcp-relay', 'server'], server)],
      'DHCP relay server delete staged.',
    );
  }

  async function deleteDhcpRelayInterface() {
    const name = els.dhcpRelayInterface.value.trim();
    if (!name) {
      setNotice('Enter a DHCP relay interface to delete.', 'error');
      return;
    }
    await runServicesOperations(
      [deleteConfig(['service', 'dhcp-relay', 'interface'], name)],
      'DHCP relay interface delete staged.',
    );
  }

  async function stageSnmp(event) {
    event.preventDefault();
    const operations = [];
    const community = els.snmpCommunity.value.trim();
    if (community) {
      operations.push(setConfig(['service', 'snmp', 'community', community, 'authorization'], els.snmpAuthorization.value));
    }
    pushSetOperation(operations, ['service', 'snmp', 'contact'], els.snmpContact.value);
    pushSetOperation(operations, ['service', 'snmp', 'location'], els.snmpLocation.value);
    await runServicesOperations(operations, 'SNMP settings staged.');
  }

  async function deleteSnmpCommunity() {
    const community = els.snmpCommunity.value.trim();
    if (!community) {
      setNotice('Enter an SNMP community to delete.', 'error');
      return;
    }
    await runServicesOperations(
      [deleteConfig(['service', 'snmp', 'community', community])],
      'SNMP community delete staged.',
    );
  }

  async function runServicesOperations(operations, successMessage) {
    if (!state.key) {
      setNotice('Connect before staging service changes.', 'error');
      return;
    }
    const filtered = operations.filter(Boolean);
    if (filtered.length === 0) {
      setNotice('No service changes to stage.');
      return;
    }

    setNotice('Staging service change...');
    try {
      for (const operation of filtered) {
        await operation;
      }
      await refreshDiff();
      await loadServicesWorkspace();
      setNotice(successMessage);
    } catch (err) {
      setNotice(err.message || 'Unable to stage service change.', 'error');
    }
  }

  function servicePath(key) {
    const paths = {
      'dhcp-server': ['service', 'dhcp-server'],
      'dhcp-relay': ['service', 'dhcp-relay'],
      'dns-forwarding': ['service', 'dns', 'forwarding'],
      lldp: ['service', 'lldp'],
      snmp: ['service', 'snmp'],
      prometheus: ['service', 'monitoring', 'prometheus'],
      telegraf: ['service', 'monitoring', 'telegraf'],
      haproxy: ['load-balancing', 'haproxy'],
    };
    return paths[key] || null;
  }

  async function runLifecycleAction(action) {
    if (!state.key) {
      setNotice('Connect before running configuration actions.', 'error');
      return;
    }

    const endpoints = {
      commit: ['/gui/config/commit', undefined, 'Configuration commit requested.'],
      discard: ['/gui/config/discard', undefined, 'Candidate changes discarded.'],
      save: ['/gui/config/save', { file: '/config/config.boot' }, 'Configuration saved.'],
    };
    const request = endpoints[action];
    if (!request) {
      return;
    }

    setNotice(`Running ${action}...`);
    try {
      await apiPost(request[0], request[1]);
      await refreshDiff();
      if (state.activeView === 'configuration') {
        await loadConfigWorkspace(state.selectedConfigPath);
      } else if (state.activeView === 'interfaces') {
        await loadInterfacesWorkspace();
      } else if (state.activeView === 'system') {
        await loadSystemWorkspace();
      } else if (state.activeView === 'firewall') {
        await loadFirewallWorkspace();
      } else if (state.activeView === 'services') {
        await loadServicesWorkspace();
      }
      setNotice(request[2]);
    } catch (err) {
      setNotice(err.message || `Unable to ${action}.`, 'error');
    }
  }

  function switchView(view) {
    state.activeView = view;
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.view === view);
    });
    els.overviewWorkspace.classList.toggle('hidden', view !== 'overview');
    els.configurationWorkspace.classList.toggle('hidden', view !== 'configuration');
    els.interfacesWorkspace.classList.toggle('hidden', view !== 'interfaces');
    els.systemWorkspace.classList.toggle('hidden', view !== 'system');
    els.firewallWorkspace.classList.toggle('hidden', view !== 'firewall');
    els.servicesWorkspace.classList.toggle('hidden', view !== 'services');
    renderViewHeader();
    if (view === 'configuration') {
      loadConfigWorkspace(state.selectedConfigPath);
    } else if (view === 'interfaces') {
      loadInterfacesWorkspace();
    } else if (view === 'system') {
      loadSystemWorkspace();
    } else if (view === 'firewall') {
      loadFirewallWorkspace();
    } else if (view === 'services') {
      loadServicesWorkspace();
    } else if (view === 'operations') {
      setNotice('Operations workspace will be added in a later module.');
    } else {
      setNotice('');
    }
  }

  function metric(label, value) {
    return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
  }

  function row(title, subtitle, right) {
    return `
      <div class="row-item">
        <div>
          <div class="row-title">${escapeHtml(title)}</div>
          <div class="row-subtitle">${escapeHtml(subtitle)}</div>
        </div>
        ${right}
      </div>
    `;
  }

  function detail(label, value) {
    return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
  }

  function tag(textValue, tone) {
    return `<span class="tag ${tone || 'muted'}">${escapeHtml(textValue)}</span>`;
  }

  function empty(textValue) {
    return `<div class="empty-state">${escapeHtml(textValue)}</div>`;
  }

  function summaryTile(label, value) {
    return `<div class="summary-tile"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
  }

  function yesNo(value) {
    return value ? 'Enabled' : 'Disabled';
  }

  function formatBytes(value) {
    const bytes = Number(value || 0);
    if (!bytes) {
      return 'Unknown';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
  }

  function formatPercent(value) {
    if (value === undefined || value === null || value === '') {
      return 'Unknown';
    }
    return `${value}%`;
  }

  function routeCount(value) {
    if (!value || typeof value !== 'object') {
      return 'Unknown';
    }
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return '0 entries';
    }
    return `${keys.length} groups`;
  }

  function titleCase(value) {
    return String(value)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function parseConfigPath(value) {
    return String(value || '')
      .trim()
      .split(/[\/\s]+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function pathLabel(pathParts) {
    if (!pathParts || pathParts.length === 0) {
      return 'root';
    }
    return pathParts.join('/');
  }

  function constraintText(node) {
    const constraints = []
      .concat(node.constraints || [])
      .concat(node.constraint_group || [])
      .filter(Boolean);
    if (node.constraint_error_message) {
      constraints.push(node.constraint_error_message);
    }
    return constraints.length ? constraints.map(formatConstraint).join(', ') : 'None';
  }

  function formatConstraint(value) {
    if (typeof value === 'string') {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch (err) {
      return String(value);
    }
  }

  function formatPreview(value) {
    if (value === undefined || value === null || value === '') {
      return 'No candidate data at this path.';
    }
    if (typeof value === 'string') {
      return value || 'No candidate data at this path.';
    }
    return JSON.stringify(value, null, 2);
  }

  function interfaceItems() {
    const items = state.interfaces && Array.isArray(state.interfaces.items)
      ? state.interfaces.items
      : [];
    return items.slice().sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')));
  }

  function selectedInterface() {
    return interfaceItems().find((item) => item.name === state.selectedInterface) || null;
  }

  function selectedConfiguredInterface() {
    const item = selectedInterface();
    if (!item || !item.path || item.path.length === 0) {
      setNotice('Select a configured interface before staging changes.', 'error');
      return null;
    }
    return item;
  }

  function interfaceErrorsText(data) {
    const errors = data && Array.isArray(data.errors) ? data.errors : [];
    if (errors.length === 0) {
      return '';
    }
    return `${errors.length} interface source(s) returned partial data.`;
  }

  function sourceErrorsText(errors, label) {
    const values = Array.isArray(errors) ? errors : [];
    if (values.length === 0) {
      return '';
    }
    return `${values.length} ${label} source(s) returned partial data.`;
  }

  function serviceItems() {
    const items = state.services && Array.isArray(state.services.items)
      ? state.services.items
      : [];
    return items.slice().sort((left, right) => String(left.label || '').localeCompare(String(right.label || '')));
  }

  function serviceDetailsText(details) {
    if (!details || typeof details !== 'object') {
      return 'No details';
    }
    const parts = [];
    Object.keys(details).forEach((key) => {
      const value = details[key];
      if (Array.isArray(value) && value.length > 0) {
        parts.push(`${titleCase(key)}: ${value.join(', ')}`);
      } else if (typeof value === 'string' && value) {
        parts.push(`${titleCase(key)}: ${value}`);
      } else if (typeof value === 'boolean') {
        parts.push(`${titleCase(key)}: ${value ? 'enabled' : 'disabled'}`);
      }
    });
    return parts.length ? parts.join(' · ') : 'No configured details';
  }

  function listRows(values, emptyText) {
    const items = Array.isArray(values) ? values : [];
    if (items.length === 0) {
      return empty(emptyText);
    }
    return items.map((value) => row(String(value), 'Configured value', tag('active', 'muted'))).join('');
  }

  function listText(values) {
    const items = Array.isArray(values) ? values.filter(Boolean) : [];
    return items.join(', ');
  }

  function configuredUsers(data) {
    const users = data && data.users && Array.isArray(data.users.configured)
      ? data.users.configured
      : [];
    return users;
  }

  function loadAverageText(value) {
    if (!value) {
      return 'Unknown';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return Object.keys(value).map((key) => `${key}: ${value[key]}`).join(', ');
    }
    return String(value);
  }

  function addressText(addresses) {
    const values = Array.isArray(addresses) ? addresses : [];
    if (values.length === 0) {
      return '';
    }
    return values.join(', ');
  }

  function stateText(item) {
    if (!item) {
      return 'Unknown';
    }
    if (item.oper_state) {
      return item.oper_state;
    }
    if (item.enabled === false) {
      return 'disabled';
    }
    return item.exists ? 'detected' : 'configured';
  }

  function stateTone(item) {
    const stateValue = String(stateText(item)).toLowerCase();
    if (stateValue === 'up') {
      return 'ok';
    }
    if (stateValue === 'down' || stateValue === 'disabled') {
      return 'warn';
    }
    return 'muted';
  }

  function childInterfaceText(children) {
    if (!children || typeof children !== 'object') {
      return 'None';
    }
    const values = Object.keys(children)
      .filter((key) => children[key])
      .map((key) => `${key}: ${children[key]}`);
    return values.length ? values.join(', ') : 'None';
  }

  function firewallGroupMemberNode(groupType) {
    const mapping = {
      'address-group': 'address',
      'network-group': 'network',
      'port-group': 'port',
      'interface-group': 'interface',
    };
    return mapping[groupType] || 'address';
  }

  function addressRuleText(rule) {
    const source = rule.source && rule.source.address ? `src ${rule.source.address}` : '';
    const destination = rule.destination && rule.destination.address ? `dst ${rule.destination.address}` : '';
    const port = rule.destination && rule.destination.port ? `dport ${rule.destination.port}` : '';
    return [source, destination, port].filter(Boolean).join(' ');
  }

  function translationText(translation) {
    if (!translation || typeof translation !== 'object') {
      return '';
    }
    const address = translation.address ? `to ${translation.address}` : '';
    const port = translation.port ? `port ${translation.port}` : '';
    return [address, port].filter(Boolean).join(' ');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  els.authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.key = els.apiKey.value.trim();
    loadShell();
  });

  els.refreshButton.addEventListener('click', () => {
    loadShell();
  });

  els.clearKeyButton.addEventListener('click', () => {
    state.key = '';
    els.apiKey.value = '';
    window.localStorage.removeItem(STORAGE_KEY);
    clearLoadedData();
    setNotice('Stored API key cleared.');
    renderHealth();
    renderDashboard();
    renderCapabilities();
    renderSchema();
    renderDiff();
    renderDisconnected();
    renderConfigWorkspace();
    renderInterfacesWorkspace();
    renderSystemWorkspace();
    renderFirewallWorkspace();
    renderServicesWorkspace();
  });

  els.configRootButton.addEventListener('click', () => {
    loadConfigWorkspace([]);
  });

  els.reloadConfigButton.addEventListener('click', () => {
    loadConfigWorkspace(parseConfigPath(els.configPath.value));
  });

  els.configStageForm.addEventListener('submit', stageConfig);

  els.configChildren.addEventListener('click', (event) => {
    const button = event.target.closest('[data-path]');
    if (!button) {
      return;
    }
    loadConfigWorkspace(parseConfigPath(button.dataset.path));
  });

  els.configBreadcrumb.addEventListener('click', (event) => {
    const button = event.target.closest('[data-path]');
    if (!button) {
      return;
    }
    loadConfigWorkspace(parseConfigPath(button.dataset.path));
  });

  els.reloadInterfacesButton.addEventListener('click', loadInterfacesWorkspace);

  els.interfaceList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-interface]');
    if (!button) {
      return;
    }
    state.selectedInterface = button.dataset.interface;
    renderInterfacesWorkspace();
  });

  els.interfaceEditForm.addEventListener('submit', stageInterfaceFields);
  els.clearDescriptionButton.addEventListener('click', clearInterfaceDescription);
  els.deleteAddressButton.addEventListener('click', deleteInterfaceAddress);
  els.clearMtuButton.addEventListener('click', clearInterfaceMtu);
  els.stageInterfaceStateButton.addEventListener('click', stageInterfaceState);

  els.reloadSystemButton.addEventListener('click', loadSystemWorkspace);
  els.systemIdentityForm.addEventListener('submit', stageHostname);
  els.dnsServerForm.addEventListener('submit', stageDnsServer);
  els.deleteDnsServerButton.addEventListener('click', deleteDnsServer);
  els.timeForm.addEventListener('submit', stageTimezone);
  els.ntpServerForm.addEventListener('submit', stageNtpServer);
  els.deleteNtpServerButton.addEventListener('click', deleteNtpServer);
  els.sshForm.addEventListener('submit', stageSsh);
  els.clearSshPortButton.addEventListener('click', clearSshPort);

  els.reloadFirewallButton.addEventListener('click', loadFirewallWorkspace);
  els.firewallGroupForm.addEventListener('submit', stageFirewallGroup);
  els.deleteFirewallGroupMemberButton.addEventListener('click', deleteFirewallGroupMember);
  els.firewallRuleForm.addEventListener('submit', stageFirewallRule);
  els.deleteFirewallRuleButton.addEventListener('click', deleteFirewallRule);
  els.natRuleForm.addEventListener('submit', stageNatRule);
  els.deleteNatRuleButton.addEventListener('click', deleteNatRule);

  els.reloadServicesButton.addEventListener('click', loadServicesWorkspace);
  els.serviceToggleForm.addEventListener('submit', stageServiceState);
  els.dnsForwardingForm.addEventListener('submit', stageDnsForwarding);
  els.deleteDnsForwardingListenButton.addEventListener('click', deleteDnsForwardingListen);
  els.dhcpRelayForm.addEventListener('submit', stageDhcpRelay);
  els.deleteDhcpRelayServerButton.addEventListener('click', deleteDhcpRelayServer);
  els.deleteDhcpRelayInterfaceButton.addEventListener('click', deleteDhcpRelayInterface);
  els.snmpForm.addEventListener('submit', stageSnmp);
  els.deleteSnmpCommunityButton.addEventListener('click', deleteSnmpCommunity);

  els.discardButton.addEventListener('click', () => runLifecycleAction('discard'));
  els.commitButton.addEventListener('click', () => runLifecycleAction('commit'));
  els.saveButton.addEventListener('click', () => runLifecycleAction('save'));

  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      switchView(button.dataset.view || 'overview');
    });
  });

  if (state.key) {
    els.apiKey.value = state.key;
  }

  renderHealth();
  renderDashboard();
  renderCapabilities();
  renderSchema();
  renderDiff();
  renderConfigWorkspace();
  renderInterfacesWorkspace();
  renderSystemWorkspace();
  renderFirewallWorkspace();
  renderServicesWorkspace();
  loadShell();
})();
