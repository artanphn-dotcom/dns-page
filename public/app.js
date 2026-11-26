const domainInput = document.getElementById('domainInput');
const commandSelector = document.getElementById('commandSelector');
const commandInfo = document.getElementById('commandInfo');
const searchBtn = document.getElementById('searchBtn');
const currentDomainBtn = document.getElementById('currentDomainBtn');
const statusBanner = document.getElementById('statusBanner');
const healthBadge = document.getElementById('healthBadge');
const healthSummaryText = document.getElementById('healthSummaryText');
const toolButtons = Array.from(document.querySelectorAll('[data-tool-tab]'));

const commandDescriptions = {
  'A': 'IPv4 address records - standard DNS host addressing',
  'AAAA': 'IPv6 address records - modern internet protocol addresses',
  'MX': 'Mail exchange records - directs email routing',
  'TXT': 'Text records - verification, policies, and configurations',
  'CNAME': 'Canonical name records - domain aliases',
  'NS': 'Nameserver records - authoritative DNS servers',
  'PTR': 'Pointer records - reverse DNS lookups',
  'SOA': 'Start of Authority - zone administration details',
  'SRV': 'Service records - location of specific services',
  'CAA': 'Certificate Authority Authorization - certificate issuance control',
  'SPF': 'Sender Policy Framework - email sender authentication',
  'DKIM': 'DomainKeys Identified Mail - email digital signatures',
  'DMARC': 'Domain-based Message Authentication - email authentication policy'
};

const labelMap = {
  A: 'A',
  AAAA: 'AAAA',
  NS: 'NS',
  MX: 'MX',
  TXT: 'TXT',
  PTR: 'PTR',
  CNAME: 'CNAME',
  SOA: 'SOA',
  SRV: 'SRV',
  CAA: 'CAA',
  SPF: 'SPF',
  DKIM: 'DKIM',
  DMARC: 'DMARC'
};

const state = {
  activeTool: 'overview',
  summary: null,
  lookup: null,
  fetchError: null,
  selectedCommand: null
};

function fillField(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value ?? 'N/A';
}

function setStatus(message, type = 'info') {
  if (!statusBanner) return;
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`;
}

function normalizeDomain(value) {
  return (value || 'example.com').trim().replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\s+/g, '') || 'example.com';
}

function formatValue(value, fallback = 'N/A') {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) {
    return value.length ? value.map((item) => formatValue(item, fallback)).join('<br/>') : fallback;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  const str = String(value);
  return str.replace(/\n/g, '<br/>').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatCheckLabel(name) {
  const aliases = {
    hasA: 'A record presence',
    hasAAAA: 'AAAA record presence',
    hasNS: 'Nameserver records',
    hasMX: 'Mail exchanger records',
    hasDMARC: 'DMARC policy',
    websiteReachable: 'Website reachability',
    hasReverse: 'Reverse DNS'
  };

  const key = String(name || '').trim();
  if (aliases[key]) return aliases[key];

  const label = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!label) return 'Check';
  return label.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function parseMxRecords(records) {
  if (!Array.isArray(records)) return [];

  return records
    .map((record) => {
      if (typeof record === 'string') {
        try {
          const parsed = JSON.parse(record);
          if (parsed && typeof parsed === 'object' && parsed.exchange) {
            return { priority: parsed.priority ?? 0, exchange: parsed.exchange, value: parsed.exchange };
          }
        } catch (error) {
          // fall through to string-based parsing
        }

        const match = record.match(/\(?\s*(\d+)\s*\)?\s*(.*)/);
        if (match) {
          return { priority: Number(match[1]) || 0, exchange: match[2] || 'N/A', value: match[2] || 'N/A' };
        }

        return { priority: 0, exchange: record, value: record };
      }

      if (record && typeof record === 'object') {
        const exchange = record.exchange || record.host || 'N/A';
        return { priority: Number(record.priority) || 0, exchange, value: exchange };
      }

      return { priority: 0, exchange: formatValue(record), value: formatValue(record) };
    })
    .sort((a, b) => a.priority - b.priority);
}

function parseDmarcPolicies(value) {
  const entries = Array.isArray(value) ? value : [value];
  const rows = [];

  entries.forEach((entry) => {
    if (!entry) return;
    const raw = String(entry).trim();
    if (!raw) return;

    const parts = raw.split(';').filter(Boolean);
    const map = {};

    parts.forEach((part) => {
      const [key, ...rest] = part.split('=');
      if (!key) return;
      map[key.trim().toLowerCase()] = rest.join('=').trim();
    });

    rows.push({ raw, policy: map });
  });

  return rows;
}

function renderSkeletonState() {
  const detailPanel = document.getElementById('detailPanel');
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <div class="loading-state" aria-busy="true">
      <div class="loading-skeleton">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  `;
}

function renderEmptyState(title, message) {
  const detailPanel = document.getElementById('detailPanel');
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <div class="empty-state">
      <strong>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong>
      <span>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
    </div>
  `;
}

function renderErrorState(message) {
  const detailPanel = document.getElementById('detailPanel');
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <div class="error-state">
      <strong>Lookup error</strong>
      <span>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
    </div>
  `;
}

function updateHealthStatus(summary) {
  const { healthSummary } = summary?.domainInfo || {};
  if (!healthBadge || !healthSummaryText) return;

  const grade = healthSummary?.grade || 'Unknown';
  const checks = healthSummary?.checks || {};
  const checkCount = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length || 1;

  healthBadge.textContent = grade;
  healthBadge.className = `health-pill ${String(grade).toLowerCase()}`;

  const message = `${checkCount}/${totalChecks} checks passed`;
  healthSummaryText.textContent = message;
}

function renderRecordList(records, fallbackMessage = 'No records found.') {
  const list = document.getElementById('recordList');
  if (!list) return;

  list.innerHTML = '';
  if (!records || !records.length) {
    const item = document.createElement('li');
    item.textContent = fallbackMessage;
    list.appendChild(item);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement('li');
    const content = typeof record === 'object' ? JSON.stringify(record) : String(record);
    item.innerHTML = content.replace(/\n/g, '<br>');
    list.appendChild(item);
  });
}

function applySummary(summary) {
  const { summary: overview, myGeo, geo, domainInfo } = summary;

  fillField('myIp', overview.myIp);
  fillField('myIpv6', overview.myIpv6);
  fillField('country', overview.country || myGeo.country || 'N/A');
  fillField('localIp', overview.localIp);

  fillField('geoIp', geo.ip || 'N/A');
  fillField('geoIsp', geo.isp || 'N/A');
  fillField('geoCity', geo.city || 'N/A');
  fillField('geoState', geo.state || 'N/A');
  fillField('geoPostal', geo.postal || 'N/A');
  fillField('geoCountry', geo.country || 'N/A');
  fillField('geoLat', geo.latitude || 'N/A');
  fillField('geoLon', geo.longitude || 'N/A');

  fillField('ipReport', overview.myIp || 'N/A');
  fillField('ipCity', myGeo.city || 'N/A');
  fillField('ipState', myGeo.region || 'N/A');
  fillField('ipPostal', myGeo.postal || 'N/A');
  fillField('ipCountryCode', myGeo.countryCode || 'N/A');
  fillField('ipCountry', myGeo.country || 'N/A');
  fillField('ipLat', myGeo.latitude || 'N/A');
  fillField('ipLon', myGeo.longitude || 'N/A');
  fillField('ipIsp', myGeo.isp || 'N/A');
  fillField('ipAsn', myGeo.asn || 'N/A');

  const recordDomain = document.getElementById('recordDomain');
  if (recordDomain) recordDomain.textContent = domainInfo.domain || normalizeDomain(domainInput.value);

  const typeLabel = document.getElementById('recordTypeLabel');
  const displayType = state.selectedCommand || 'A';
  if (typeLabel) typeLabel.textContent = labelMap[displayType] || displayType;

  updateHealthStatus(summary);
  renderFullReportTable(summary);
}

function getFullReportRows(summary) {
  const { summary: overview, geo, domainInfo, myGeo } = summary || {};
  const tls = domainInfo?.tls || {};
  const advanced = domainInfo?.advanced || {};

  return [
    ['Domain', domainInfo?.domain || 'N/A'],
    ['Primary IP', domainInfo?.primaryIp || 'N/A'],
    ['Current public IP', overview?.myIp || 'N/A'],
    ['IPv6', overview?.myIpv6 || 'N/A'],
    ['Local IP', overview?.localIp || 'N/A'],
    ['Country', overview?.country || myGeo?.country || 'N/A'],
    ['Domain IP', geo?.ip || 'N/A'],
    ['Geo ISP', geo?.isp || 'N/A'],
    ['Geo City', geo?.city || 'N/A'],
    ['Geo State', geo?.state || 'N/A'],
    ['Geo Postal', geo?.postal || 'N/A'],
    ['Geo Country', geo?.country || 'N/A'],
    ['A Records', (domainInfo?.a || []).join(', ') || 'N/A'],
    ['AAAA Records', (domainInfo?.aaaa || []).join(', ') || 'N/A'],
    ['NS Records', (domainInfo?.ns || []).join(', ') || 'N/A'],
    ['MX Records', parseMxRecords(domainInfo?.mx || []).map((entry) => `${entry.priority} ${entry.exchange}`).join(', ') || 'N/A'],
    ['TXT Records', (domainInfo?.txt || []).join(', ') || 'N/A'],
    ['DMARC', (domainInfo?.dmarc || []).join(', ') || 'N/A'],
    ['Reverse DNS', (domainInfo?.reverse || []).join(', ') || 'N/A'],
    ['Propagation Status', advanced?.propagation?.status || 'N/A'],
    ['DNSSEC Status', advanced?.dnssec?.enabled ? 'Enabled' : 'Not detected'],
    ['SPF Policies', (advanced?.mailSecurity?.spf || []).join(', ') || 'N/A'],
    ['DKIM Records', (advanced?.mailSecurity?.dkim || []).map((item) => `${item.domain}: ${item.records.join(', ')}`).join(' | ') || 'N/A'],
    ['Health Grade', domainInfo?.healthSummary?.grade || 'N/A'],
    ['HTTP Checks', (domainInfo?.health || []).map((item) => `${item.scheme.toUpperCase()}: ${item.status}`).join(' | ') || 'N/A'],
    ['HTTPS Status', tls?.https?.status ?? 'N/A'],
    ['TLS Protocol', tls?.tls?.protocol || 'N/A'],
    ['TLS Cipher', tls?.tls?.cipher || 'N/A'],
    ['Certificate Issuer', tls?.certificate?.issuer || 'N/A'],
    ['Certificate Expires', tls?.certificate?.valid_to || 'N/A'],
    ['Hostname Validation', tls?.tls?.hostnameValid === undefined ? 'N/A' : tls.tls.hostnameValid ? 'Valid' : 'Mismatch']
  ];
}

function renderFullReportTable(summary) {
  const reportTable = document.getElementById('fullReportTable');
  if (!reportTable) return;

  if (!summary) {
    reportTable.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; border: 1px dashed var(--border);">
        <strong>No report data yet</strong>
        <span>Search for a domain to generate the full report.</span>
      </div>
    `;
    return;
  }

  const rows = getFullReportRows(summary);
  reportTable.innerHTML = rows.map(([label, value]) => `
    <div class="report-row" role="row">
      <div class="report-label" role="rowheader">${label}</div>
      <div class="report-value" role="cell">${formatValue(value)}</div>
    </div>
  `).join('');
  reportTable.setAttribute('aria-label', 'Complete domain diagnostics report');
}

function renderToolDetails() {
  const detailPanel = document.getElementById('detailPanel');
  if (!detailPanel || !state.summary) {
    renderSkeletonState();
    return;
  }

  const { domainInfo, summary: overview } = state.summary;
  const selectedType = state.selectedCommand || 'A';
  const tool = state.activeTool;

  if (tool === 'overview') {
    const checks = domainInfo?.healthSummary?.checks || {};
    const checkItems = Object.entries(checks).map(([name, passed]) => {
      const formattedName = formatCheckLabel(name);
      return `<li class="health-check-item"><span class="health-check-name">${formattedName}</span><span class="status-pill ${passed ? 'good' : 'warn'}">${passed ? 'Pass' : 'Pending'}</span></li>`;
    }).join('');

    detailPanel.innerHTML = `
      <div class="detail-pane-layout">
        <div class="detail-card detail-summary-card">
          <div class="detail-header-row">
            <h3>Domain overview</h3>
            <span class="detail-tag">${domainInfo?.healthSummary?.grade || 'Unknown'}</span>
          </div>
          <div class="detail-summary-grid">
            <div class="metric-box"><span>Domain</span><strong>${domainInfo?.domain || 'N/A'}</strong></div>
            <div class="metric-box"><span>Primary IP</span><strong>${domainInfo?.primaryIp || 'N/A'}</strong></div>
            <div class="metric-box"><span>Reverse DNS</span><strong>${(domainInfo?.reverse || []).join(', ') || 'N/A'}</strong></div>
            <div class="metric-box"><span>Public IP</span><strong>${overview?.myIp || 'N/A'}</strong></div>
          </div>
        </div>

        <div class="detail-card">
          <h3>Health checks</h3>
          <ul class="health-check-list">${checkItems || '<li class="health-check-item"><span class="health-check-name">No checks available</span></li>'}</ul>
        </div>
      </div>
    `;
    return;
  }

  if (tool === 'dns') {
    const records = state.lookup?.records || [];
    if (!records.length) {
      renderEmptyState('No records found', `${selectedType} records are not published for ${domainInfo?.domain || 'this domain'}. The domain may not use this record type.`);
      return;
    }

    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>${selectedType} records</h3>
        <span class="detail-tag">${selectedType}</span>
      </div>
      <ul class="record-list-inline">
        ${records.map((record) => `<li>${formatValue(record)}</li>`).join('')}
      </ul>
    `;
    return;
  }

  if (tool === 'reverse') {
    const reverse = domainInfo?.reverse || [];
    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>Reverse DNS lookup</h3>
        <span class="detail-tag">PTR</span>
      </div>
      ${reverse.length ? `<ul class="record-list-inline">${reverse.map((entry) => `<li>${formatValue(entry)}</li>`).join('')}</ul>` : '<div class="empty-state"><strong>No reverse DNS</strong><span>No PTR record exists for the primary IP address. This is common for many domains.</span></div>'}
    `;
    return;
  }

  if (tool === 'mx') {
    const mxRows = parseMxRecords(domainInfo?.mx || []);
    if (!mxRows.length) {
      renderEmptyState('No mail records', 'No MX records are configured for this domain. Email delivery may not be available.');
      return;
    }

    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>Mail exchangers</h3>
        <span class="detail-tag">MX</span>
      </div>
      <table class="detail-table">
        <thead>
          <tr><th>Priority</th><th>Exchange server</th></tr>
        </thead>
        <tbody>
          ${mxRows.map((row) => `<tr><td style="font-weight:600;">${row.priority}</td><td>${formatValue(row.exchange)}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    return;
  }

  if (tool === 'ns') {
    const nsRecords = domainInfo?.ns || [];
    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>Authoritative nameservers</h3>
        <span class="detail-tag">NS</span>
      </div>
      ${nsRecords.length ? `<ul class="record-list-inline">${nsRecords.map((entry) => `<li>${formatValue(entry)}</li>`).join('')}</ul>` : '<div class="empty-state"><strong>No nameservers found</strong><span>No NS records are available. The domain may not be properly configured.</span></div>'}
    `;
    return;
  }

  if (tool === 'dmarc') {
    const dmarcRows = parseDmarcPolicies(domainInfo?.dmarc || []);
    if (!dmarcRows.length) {
      renderEmptyState('No DMARC policy', 'No DMARC record is published for this domain. DMARC helps prevent email spoofing.');
      return;
    }

    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>DMARC policy</h3>
        <span class="detail-tag">DMARC</span>
      </div>
      ${dmarcRows.map((row) => {
        const policyEntries = Object.entries(row.policy || {}).map(([key, value]) => `<tr><th>${key.toUpperCase()}</th><td>${formatValue(value)}</td></tr>`).join('');
        return `
          <div class="detail-card">
            <strong style="display:block; margin-bottom:12px; font-size:0.9rem; color:var(--muted);">Full DMARC record:</strong>
            <div style="padding:12px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid var(--border); font-family:monospace; font-size:0.85rem; word-break:break-all; line-height:1.6;">${formatValue(row.raw)}</div>
            ${policyEntries ? `<div style="margin-top:16px;"><strong style="display:block; margin-bottom:12px; font-size:0.9rem; color:var(--muted);">Policy breakdown:</strong><table class="detail-table"><tbody>${policyEntries}</tbody></table></div>` : ''}
          </div>
        `;
      }).join('')}
    `;
    return;
  }

  if (tool === 'health') {
    const checks = domainInfo?.health || [];
    if (!checks.length) {
      renderEmptyState('No health data', 'No reachability checks were performed. The domain may not be resolvable.');
      return;
    }

    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>Website reachability</h3>
        <span class="detail-tag">HTTP</span>
      </div>
      <table class="detail-table">
        <thead>
          <tr><th>Protocol</th><th>Status</th><th>Result</th></tr>
        </thead>
        <tbody>
          ${checks.map((item) => {
            const statusCode = item.status === 'ERR' ? '—' : item.status;
            const statusColor = item.ok ? 'var(--success)' : 'var(--warning)';
            return `<tr><td style="font-weight:600;">${item.scheme.toUpperCase()}</td><td style="color:${statusColor};">${statusCode}</td><td>${item.ok ? 'Reachable' : 'Unavailable'}</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
    return;
  }

  if (tool === 'advanced') {
    const advanced = domainInfo?.advanced || {};
    const propagation = advanced.propagation || {};
    const dnssec = advanced.dnssec || {};
    const mailSecurity = advanced.mailSecurity || {};
    const spf = Array.isArray(mailSecurity.spf) ? mailSecurity.spf : [];
    const dkim = Array.isArray(mailSecurity.dkim) ? mailSecurity.dkim : [];
    const dmarc = Array.isArray(mailSecurity.dmarc) ? mailSecurity.dmarc : [];
    const hasAnyAdvancedData = Boolean(
      propagation.status ||
      propagation.summary ||
      propagation.ttl !== null && propagation.ttl !== undefined ||
      propagation.records?.length ||
      dnssec.enabled ||
      dnssec.summary ||
      spf.length ||
      dkim.length ||
      dmarc.length
    );

    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>DNS intelligence</h3>
        <span class="detail-tag">ADVANCED</span>
      </div>
      ${!hasAnyAdvancedData ? `
        <div class="empty-state">
          <strong>No advanced DNS intelligence available</strong>
          <span>This domain does not currently publish DNSSEC, SPF, DKIM, DMARC, or propagation details that the resolver can report.</span>
        </div>
      ` : `
        <div class="detail-summary-grid">
          <div class="metric-box"><span>Propagation</span><strong>${propagation.status || 'Not available'}</strong></div>
          <div class="metric-box"><span>TTL</span><strong>${propagation.ttl ?? 'Not available'}</strong></div>
          <div class="metric-box"><span>DNSSEC</span><strong>${dnssec.enabled ? 'Enabled' : 'Not detected'}</strong></div>
          <div class="metric-box"><span>SPF</span><strong>${spf.length ? 'Detected' : 'Not detected'}</strong></div>
        </div>
        <div class="detail-card">
          <h3>Propagation snapshot</h3>
          <p>${formatValue(propagation.summary || 'No propagation information available')}</p>
          ${propagation.records?.length ? `<ul class="record-list-inline">${propagation.records.map((entry) => `<li>${formatValue(entry)}</li>`).join('')}</ul>` : '<div class="empty-state"><strong>No propagation data</strong><span>No A records were returned for this domain.</span></div>'}
        </div>
        <div class="detail-card">
          <h3>DNSSEC analysis</h3>
          <p>${formatValue(dnssec.summary || 'No DNSSEC summary available')}</p>
          ${dnssec.details ? `<ul class="record-list-inline">${Object.entries(dnssec.details).flatMap(([key, values]) => values.map((item) => `<li>${key.toUpperCase()}: ${formatValue(item)}</li>`)).join('')}</ul>` : ''}
        </div>
        <div class="detail-card">
          <h3>Mail security policies</h3>
          <ul class="record-list-inline">
            ${spf.length ? spf.map((entry) => `<li>SPF: ${formatValue(entry)}</li>`).join('') : '<li>No SPF record found</li>'}
            ${dkim.length ? dkim.map((entry) => `<li>DKIM: ${formatValue(entry.domain)} - ${formatValue(entry.records.join(', '))}</li>`).join('') : '<li>No DKIM record found</li>'}
            ${dmarc.length ? dmarc.map((entry) => `<li>DMARC: ${formatValue(entry)}</li>`).join('') : '<li>No DMARC record found</li>'}
          </ul>
        </div>
      `}
    `;
    return;
  }

  if (tool === 'tls') {
    const tls = domainInfo?.tls || {};
    const cert = tls.certificate || {};
    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>SSL/TLS diagnostics</h3>
        <span class="detail-tag">TLS</span>
      </div>
      <div class="tls-grid">
        <div class="metric-box"><span>HTTPS status</span><strong>${tls.https?.status ?? 'N/A'}</strong></div>
        <div class="metric-box"><span>Protocol</span><strong>${tls.tls?.protocol || 'N/A'}</strong></div>
        <div class="metric-box"><span>Cipher</span><strong>${tls.tls?.cipher || 'N/A'}</strong></div>
        <div class="metric-box"><span>Hostname match</span><strong>${tls.tls?.hostnameValid === undefined ? 'N/A' : tls.tls.hostnameValid ? 'Valid' : 'Mismatch'}</strong></div>
      </div>
      <div class="detail-card">
        <h3>Certificate details</h3>
        <table class="detail-table">
          <tbody>
            <tr><th>Subject</th><td>${formatValue(cert.subject)}</td></tr>
            <tr><th>Issuer</th><td>${formatValue(cert.issuer)}</td></tr>
            <tr><th>Valid from</th><td>${formatValue(cert.valid_from)}</td></tr>
            <tr><th>Valid to</th><td>${formatValue(cert.valid_to)}</td></tr>
            <tr><th>SubjectAltName</th><td>${formatValue(cert.subjectAltName)}</td></tr>
            <tr><th>Connection note</th><td>${formatValue(tls.tls?.error || 'No certificate or connection issue detected')}</td></tr>
          </tbody>
        </table>
      </div>
    `;
    return;
  }

  if (tool === 'report') {
    const rows = getFullReportRows(state.summary);
    detailPanel.innerHTML = `
      <div class="detail-header-row">
        <h3>Full diagnostics report</h3>
        <span class="detail-tag">REPORT</span>
      </div>
      <div class="detail-card">
        <div class="report-grid report-grid-compact" role="table" aria-label="Diagnostic report details">
          ${rows.map(([label, value]) => `
            <div class="report-row" role="row">
              <div class="report-label" role="rowheader">${label}</div>
              <div class="report-value" role="cell">${formatValue(value)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  renderEmptyState('No data', 'Select a DNS tool to inspect details.');
}

async function fetchSummary(domain) {
  const url = `/api/summary?domain=${encodeURIComponent(normalizeDomain(domain))}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch DNS summary');
  }
  return response.json();
}

async function fetchLookup(domain, type) {
  const url = `/api/lookup?domain=${encodeURIComponent(normalizeDomain(domain))}&type=${encodeURIComponent(type)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch DNS records');
  }
  return response.json();
}

function setActiveTool(tool) {
  state.activeTool = tool;
  toolButtons.forEach((button) => {
    const active = button.dataset.toolTab === tool;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  if (state.summary && state.lookup) {
    renderToolDetails();
  }
}

async function updateLookup() {
  const domain = normalizeDomain(domainInput.value);
  const selectedType = state.selectedCommand || 'A';

  statusBanner.textContent = 'Checking DNS data...';
  statusBanner.className = 'status-banner info';
  renderSkeletonState();

  try {
    const [summary, lookup] = await Promise.all([
      fetchSummary(domain),
      fetchLookup(domain, selectedType)
    ]);

    state.summary = summary;
    state.lookup = lookup;
    state.fetchError = null;

    applySummary(summary);
    document.getElementById('recordTypeLabel').textContent = labelMap[selectedType] || selectedType;
    document.getElementById('recordDomain').textContent = summary.domainInfo.domain || domain;

    if (lookup.records && lookup.records.length) {
      setStatus(`Found ${lookup.records.length} ${selectedType} record(s) for ${summary.domainInfo.domain || domain}.`, 'success');
    } else {
      setStatus(`No ${selectedType} record found for ${summary.domainInfo.domain || domain}.`, 'warning');
    }

    renderRecordList(lookup.records || [], `No ${selectedType} record found.`);
    renderToolDetails();
  } catch (error) {
    state.fetchError = error.message;
    setStatus(`Lookup failed: ${error.message}`, 'error');
    renderRecordList([`Lookup failed: ${error.message}`]);
    renderErrorState(error.message);
  }
}

function exportCurrentReport(theme = 'light') {
  const exportButton = theme === 'dark' ? document.getElementById('exportPdfDarkBtn') : document.getElementById('exportPdfWhiteBtn');
  if (exportButton) {
    exportButton.disabled = true;
    exportButton.textContent = 'Preparing...';
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.textContent = theme === 'dark' ? 'Download Black PDF' : 'Download White PDF';
    }
    window.alert('PDF generation library did not load. Please refresh the page and try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const domain = normalizeDomain(domainInput.value || 'example.com');
  const rows = state.summary ? getFullReportRows(state.summary) : [];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const headerHeight = 96;
  const dark = theme === 'dark';

  if (dark) {
    doc.setFillColor(5, 15, 24);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(237, 246, 255);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(16, 24, 33);
  }

  const primaryColor = dark ? [125, 211, 252] : [37, 99, 235];
  const mutedColor = dark ? [191, 219, 254] : [71, 85, 105];

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, 28, pageWidth - margin * 2, headerHeight, 12, 12, 'F');
  doc.setTextColor(dark ? 7 : 255, dark ? 17 : 255, dark ? 27 : 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DNS Diagnostics Export', margin + 18, 58);

  doc.setFontSize(11);
  doc.setTextColor(dark ? 226 : 25, dark ? 232 : 25, dark ? 240 : 25);
  doc.text(`Domain: ${domain}`, margin + 18, 80);

  let y = 140;
  const summaryItems = rows.slice(0, 6);
  const columnWidth = (pageWidth - margin * 2 - 12) / 2;

  for (let index = 0; index < summaryItems.length; index += 1) {
    const [label, value] = summaryItems[index];
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (column * (columnWidth + 12));
    const boxY = y + row * 72;

    doc.setFillColor(dark ? 14 : 248, dark ? 20 : 250, dark ? 33 : 252);
    doc.roundedRect(x, boxY, columnWidth, 52, 8, 8, 'F');
    doc.setDrawColor(dark ? 59 : 203, dark ? 130 : 213, dark ? 246 : 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, boxY, columnWidth, 52, 8, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(String(label).toUpperCase(), x + 12, boxY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(dark ? 240 : 17, dark ? 246 : 24, dark ? 255 : 33);
    const textLines = doc.splitTextToSize(String(value || 'N/A'), columnWidth - 24);
    doc.text(textLines.slice(0, 3), x + 12, boxY + 34);
  }

  y = 140 + (Math.ceil(summaryItems.length / 2) * 72) + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(dark ? 240 : 17, dark ? 246 : 24, dark ? 255 : 33);
  doc.text('Full Report', margin, y);
  y += 18;

  const bodyWidth = pageWidth - margin * 2;
  const labelWidth = bodyWidth * 0.34;
  const valueWidth = bodyWidth * 0.66;

  doc.setDrawColor(dark ? 71 : 203, dark ? 85 : 213, dark ? 105 : 255);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);

  rows.forEach(([label, value], index) => {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 40;
      doc.setDrawColor(dark ? 71 : 203, dark ? 85 : 213, dark ? 105 : 255);
      doc.line(margin, y, pageWidth - margin, y);
      y += 24;
    }

    const boxStart = y + (index % 2 === 0 ? 0 : 0);
    const labelText = String(label || 'N/A');
    const valueText = String(value || 'N/A');
    const labelLines = doc.splitTextToSize(labelText, labelWidth - 18);
    const valueLines = doc.splitTextToSize(valueText, valueWidth - 22);
    const height = Math.max(labelLines.length * 12, valueLines.length * 12, 18) + 16;

    doc.setFillColor(dark ? 9 : 248, dark ? 15 : 250, dark ? 24 : 252);
    doc.rect(margin, y, labelWidth, height, 'F');
    doc.setFillColor(dark ? 15 : 255, dark ? 23 : 255, dark ? 35 : 255);
    doc.rect(margin + labelWidth, y, valueWidth, height, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(dark ? 191 : 71, dark ? 219 : 85, dark ? 254 : 105);
    doc.text(labelLines, margin + 12, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(dark ? 240 : 17, dark ? 246 : 24, dark ? 255 : 33);
    doc.text(valueLines, margin + labelWidth + 12, y + 18);

    y += height + 2;
  });

  const cleanDomain = String(domain || 'domain')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'domain';

  const fileName = `dns-report-${cleanDomain}.pdf`;
  doc.save(fileName);

  if (exportButton) {
    exportButton.disabled = false;
    exportButton.textContent = theme === 'dark' ? 'Download Black PDF' : 'Download White PDF';
  }
}

document.getElementById('exportPdfWhiteBtn')?.addEventListener('click', () => exportCurrentReport('light'));
document.getElementById('exportPdfDarkBtn')?.addEventListener('click', () => exportCurrentReport('dark'));

searchBtn.addEventListener('click', updateLookup);
commandSelector.addEventListener('change', (event) => {
  const command = event.target.value;
  if (!command) {
    commandInfo.classList.remove('active');
    commandInfo.innerHTML = '<span>Select a command to begin</span>';
    state.selectedCommand = null;
    return;
  }
  
  state.selectedCommand = command;
  const description = commandDescriptions[command] || 'DNS record lookup';
  commandInfo.classList.add('active');
  commandInfo.innerHTML = `<strong>${command}:</strong> ${description}`;
  
  // Auto-trigger lookup when a command is selected
  if (domainInput.value && domainInput.value !== 'www.example.com') {
    updateLookup();
  }
});
domainInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') updateLookup();
});
currentDomainBtn.addEventListener('click', () => {
  const current = window.location.hostname || 'www.example.com';
  domainInput.value = current;
  updateLookup();
});

toolButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveTool(button.dataset.toolTab));
  button.setAttribute('aria-pressed', button.dataset.toolTab === 'overview' ? 'true' : 'false');
});

setStatus('Checking DNS data...', 'info');
renderSkeletonState();
updateLookup();
