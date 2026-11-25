const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const os = require('os');
const tls = require('tls');

const DEFAULT_PORT = Number(process.env.PORT) || 3001;
const MAX_PORT_ATTEMPTS = 20;
const PUBLIC_PATH = path.join(__dirname, 'public');
const DNS_CACHE_TTL_MS = 60_000;
const DNS_QUERY_TIMEOUT_MS = 4000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const dnsCache = new Map();
const requestLog = new Map();

function normalizeDomain(value) {
  if (!value) return 'example.com';
  const cleaned = String(value).trim().replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
  return cleaned || 'example.com';
}

function validateDomain(value) {
  const cleaned = normalizeDomain(value);

  if (!cleaned || cleaned.length > 253) {
    throw new Error('Domain is required and must be shorter than 253 characters.');
  }

  if (cleaned.includes('..') || cleaned.startsWith('.') || cleaned.endsWith('.')) {
    throw new Error('Domain contains invalid formatting (double dots or leading/trailing dots).');
  }

  if (/\s/.test(cleaned) || /[\/\\:@?&=#%\[\]]/.test(cleaned)) {
    throw new Error('Domain contains unsupported characters.');
  }

  const labels = cleaned.split('.');
  if (labels.length < 2 && cleaned !== 'localhost') {
    throw new Error('Domain must have at least two labels (e.g., example.com).');
  }

  if (labels.some((label) => label.length === 0 || label.length > 63 || label.startsWith('-') || label.endsWith('-'))) {
    throw new Error('Each DNS label must be 1 to 63 characters and cannot start or end with a hyphen.');
  }

  if (!/^[a-z0-9.-]+$/i.test(cleaned)) {
    throw new Error('Only letters, numbers, dots, and hyphens are allowed in the domain.');
  }

  if (/^(\d+\.){3}\d+$/.test(cleaned)) {
    throw new Error('IP addresses should be looked up with PTR records, not as domain names.');
  }

  return cleaned;
}

function getClientIp(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return request.socket?.remoteAddress || 'unknown-client';
}

function checkRateLimit(request) {
  const clientIp = getClientIp(request);
  const now = Date.now();
  const entries = requestLog.get(clientIp) || [];
  const recent = entries.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  recent.push(now);
  requestLog.set(clientIp, recent);
  return true;
}

function getCachedDnsResult(domain, rrtype) {
  const key = `${String(rrtype).toUpperCase()}:${normalizeDomain(domain)}`;
  const entry = dnsCache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    dnsCache.delete(key);
    return null;
  }

  return entry.value;
}

function setCachedDnsResult(domain, rrtype, value) {
  const key = `${String(rrtype).toUpperCase()}:${normalizeDomain(domain)}`;
  dnsCache.set(key, { value, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
}

function withTimeout(promiseFactory, timeoutMs, fallbackValue) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallbackValue), timeoutMs);

    Promise.resolve()
      .then(promiseFactory)
      .then((result) => resolve(result))
      .catch(() => resolve(fallbackValue))
      .finally(() => clearTimeout(timer));
  });
}

function flattenRecords(input) {
  if (Array.isArray(input)) {
    return input.flatMap((item) => flattenRecords(item));
  }

  if (input && typeof input === 'object') {
    if (Array.isArray(input.answers)) {
      return flattenRecords(input.answers);
    }

    if (input.exchange) {
      return [`${input.priority || 0} ${input.exchange}`];
    }

    return [JSON.stringify(input)];
  }

  return input === undefined || input === null || input === '' ? [] : [String(input)];
}

function getLocalInterfaces() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const item of interfaces[name] || []) {
      if (!item.internal && item.family === 'IPv4') {
        addresses.push(item.address);
      }
    }
  }

  return addresses.length ? addresses : ['N/A'];
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'DNS-Tool/1.0' },
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'text/plain', 'User-Agent': 'DNS-Tool/1.0' },
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function getPublicIp() {
  try {
    const ipv4 = await fetchJson('https://api.ipify.org?format=json');
    return { ipv4: ipv4.ip || 'N/A' };
  } catch (error) {
    return { ipv4: 'N/A' };
  }
}

async function getIpv6() {
  try {
    const ipv6Resp = await fetchText('https://api64.ipify.org?format=json');
    const ipv6 = JSON.parse(ipv6Resp);
    return { ipv6: ipv6.ip || 'N/A' };
  } catch (error) {
    return { ipv6: 'N/A' };
  }
}

async function getGeoInfo(ip) {
  if (!ip || ip === 'N/A') {
    return { city: 'N/A', region: 'N/A', country: 'N/A', countryCode: 'N/A', postal: 'N/A', latitude: 'N/A', longitude: 'N/A', isp: 'N/A', asn: 'N/A' };
  }

  try {
    const geo = await fetchJson(`https://ipapi.co/${ip}/json/`);
    return {
      city: geo.city || 'N/A',
      region: geo.region || 'N/A',
      country: geo.country_name || 'N/A',
      countryCode: geo.country_code || 'N/A',
      postal: geo.postal || 'N/A',
      latitude: geo.latitude ?? 'N/A',
      longitude: geo.longitude ?? 'N/A',
      isp: geo.org || 'N/A',
      asn: geo.asn ? `AS${geo.asn}` : 'N/A'
    };
  } catch (error) {
    return { city: 'N/A', region: 'N/A', country: 'N/A', countryCode: 'N/A', postal: 'N/A', latitude: 'N/A', longitude: 'N/A', isp: 'N/A', asn: 'N/A' };
  }
}

async function lookupDns(domain, rrtype) {
  const safeDomain = validateDomain(domain);
  const type = String(rrtype || 'A').toUpperCase();

  const cached = getCachedDnsResult(safeDomain, type);
  if (cached) {
    return cached;
  }

  let records = [];

  if (type === 'PTR') {
    const targetIp = safeDomain.trim();
    records = await withTimeout(() => dns.promises.reverse(targetIp), DNS_QUERY_TIMEOUT_MS, []);
  } else if (type === 'MX') {
    records = await withTimeout(() => dns.promises.resolveMx(safeDomain), DNS_QUERY_TIMEOUT_MS, []);
  } else if (type === 'TXT') {
    records = await withTimeout(() => dns.promises.resolveTxt(safeDomain), DNS_QUERY_TIMEOUT_MS, []);
  } else {
    records = await withTimeout(() => dns.promises.resolve(safeDomain, type), DNS_QUERY_TIMEOUT_MS, []);
  }

  const flattened = flattenRecords(records);
  setCachedDnsResult(safeDomain, type, flattened);
  return flattened;
}

async function getDmarc(domain) {
  const safeDomain = validateDomain(domain);
  const cacheKey = `_dmarc.${safeDomain}`;
  const cached = getCachedDnsResult(cacheKey, 'TXT');
  if (cached) {
    return cached;
  }

  const records = await withTimeout(() => dns.promises.resolveTxt(`_dmarc.${safeDomain}`), DNS_QUERY_TIMEOUT_MS, []);
  const flattened = flattenRecords(records);
  setCachedDnsResult(cacheKey, 'TXT', flattened);
  return flattened;
}

async function getDnssecAnalysis(domain) {
  const safeDomain = validateDomain(domain);

  try {
    const records = await withTimeout(() => dns.promises.resolveAny(safeDomain), 6000, []);
    const dnskey = records.filter((record) => record && record.type === 'DNSKEY');
    const ds = records.filter((record) => record && record.type === 'DS');
    const rrsig = records.filter((record) => record && record.type === 'RRSIG');

    return {
      enabled: dnskey.length > 0 || ds.length > 0 || rrsig.length > 0,
      summary: dnskey.length || ds.length || rrsig.length ? 'DNSSEC records detected.' : 'No DNSSEC records were found.',
      details: {
        dnskey: dnskey.map((record) => record.data || JSON.stringify(record)).slice(0, 3),
        ds: ds.map((record) => record.data || JSON.stringify(record)).slice(0, 3),
        rrsig: rrsig.map((record) => record.data || JSON.stringify(record)).slice(0, 3)
      }
    };
  } catch (error) {
    return {
      enabled: false,
      summary: 'Unable to verify DNSSEC records for this domain.',
      details: { dnskey: [], ds: [], rrsig: [] },
      error: error.message
    };
  }
}

async function getPropagationSnapshot(domain) {
  const safeDomain = validateDomain(domain);

  try {
    const aRecords = await lookupDns(safeDomain, 'A');
    const answer = await withTimeout(() => dns.promises.resolve4(safeDomain, { ttl: true }), 5000, []);
    const ttlValues = Array.isArray(answer)
      ? answer
          .map((item) => (typeof item === 'object' && item && item.ttl !== undefined ? Number(item.ttl) : null))
          .filter((value) => value !== null)
      : [];

    const ttl = ttlValues.length ? Math.min(...ttlValues) : null;

    return {
      status: aRecords.length ? 'Likely propagated' : 'No A record data detected',
      summary: aRecords.length ? `Current A data returned ${aRecords.length} visible records.` : 'No A records were returned for this domain.',
      ttl,
      records: aRecords.slice(0, 5)
    };
  } catch (error) {
    return {
      status: 'Unavailable',
      summary: 'Propagation data could not be validated from the current resolver.',
      ttl: null,
      records: [],
      error: error.message
    };
  }
}

async function getMailSecurityAnalysis(domain) {
  const safeDomain = validateDomain(domain);
  const txtRecords = await lookupDns(safeDomain, 'TXT');
  const spf = txtRecords.filter((entry) => /v=spf1/i.test(String(entry)));

  const dkimTargets = [
    `default._domainkey.${safeDomain}`,
    `selector1._domainkey.${safeDomain}`,
    `selector2._domainkey.${safeDomain}`
  ];

  const dkim = [];
  for (const target of dkimTargets) {
    try {
      const values = await lookupDns(target, 'TXT');
      const matched = values.filter((entry) => /v=dkim1/i.test(String(entry)));
      if (matched.length) {
        dkim.push({ domain: target, records: matched });
      }
    } catch (error) {
      // ignore missing DKIM records
    }
  }

  const dmarc = await getDmarc(safeDomain);

  return {
    spf,
    dkim,
    dmarc,
    summary: {
      spfDetected: spf.length > 0,
      dkimDetected: dkim.length > 0,
      dmarcDetected: dmarc.length > 0
    }
  };
}

async function getAdvancedDnsAnalysis(domain) {
  const safeDomain = validateDomain(domain);

  const [propagation, dnssec, mailSecurity] = await Promise.all([
    getPropagationSnapshot(safeDomain),
    getDnssecAnalysis(safeDomain),
    getMailSecurityAnalysis(safeDomain)
  ]);

  return {
    domain: safeDomain,
    propagation,
    dnssec,
    mailSecurity
  };
}

async function getReverseDns(domain) {
  const safeDomain = validateDomain(domain);
  const aRecords = await lookupDns(safeDomain, 'A');
  const targetIp = aRecords[0] || null;

  if (!targetIp) {
    return ['N/A'];
  }

  try {
    const reverse = await withTimeout(() => dns.promises.reverse(targetIp), DNS_QUERY_TIMEOUT_MS, []);
    return reverse.length ? reverse : ['N/A'];
  } catch (error) {
    return ['N/A'];
  }
}

async function getHttpHealth(domain) {
  const safeDomain = validateDomain(domain);
  const urls = [`https://${safeDomain}`, `http://${safeDomain}`];
  const results = [];

  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Unsupported URL protocol');
      }
      if (parsed.username || parsed.password) {
        throw new Error('Credentials are not allowed in health checks');
      }

      const response = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(7000),
        headers: {
          'User-Agent': 'DNS-Tool/1.0',
          Accept: 'text/html,application/xhtml+xml'
        },
        cache: 'no-store'
      });

      results.push({
        url,
        status: response.status,
        ok: response.ok || (response.status >= 300 && response.status < 400),
        scheme: parsed.protocol.replace(':', '')
      });
    } catch (error) {
      const parsed = new URL(url);
      results.push({
        url,
        status: 'ERR',
        ok: false,
        error: error.message,
        scheme: parsed.protocol.replace(':', '')
      });
    }
  }

  return results;
}

async function getTlsDiagnostics(domain) {
  const safeDomain = validateDomain(domain);
  const result = {
    domain: safeDomain,
    https: { status: 'ERR', ok: false },
    tls: { connected: false, protocol: 'N/A', cipher: 'N/A', hostnameValid: false, error: null },
    certificate: null
  };

  try {
    const response = await fetch(`https://${safeDomain}`, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(12000),
      headers: {
        'User-Agent': 'DNS-Tool/1.0',
        Accept: 'text/html,application/xhtml+xml'
      },
      cache: 'no-store'
    });
    result.https = {
      status: response.status,
      ok: response.ok || (response.status >= 300 && response.status < 400)
    };
  } catch (error) {
    result.https = { status: 'ERR', ok: false, error: error.message };
  }

  let socket;
  try {
    socket = tls.connect({
      host: safeDomain,
      port: 443,
      servername: safeDomain,
      rejectUnauthorized: false,
      ALPNProtocols: ['http/1.1', 'h2'],
      timeout: 8000
    });

    await new Promise((resolve, reject) => {
      const onSecure = () => {
        cleanup();
        resolve();
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      const onTimeout = () => {
        cleanup();
        reject(new Error('TLS handshake timed out'));
      };

      function cleanup() {
        socket.removeListener('secureConnect', onSecure);
        socket.removeListener('error', onError);
        socket.removeListener('timeout', onTimeout);
      }

      socket.once('secureConnect', onSecure);
      socket.once('error', onError);
      socket.once('timeout', onTimeout);
      socket.setTimeout(8000);
    });

    const cert = socket.getPeerCertificate ? socket.getPeerCertificate() : null;
    const cipher = socket.getCipher ? socket.getCipher() : null;
    const protocol = socket.getProtocol ? socket.getProtocol() : 'N/A';
    const hostnameCheck = cert && typeof tls.checkServerIdentity === 'function' ? tls.checkServerIdentity(safeDomain, cert) : null;

    result.tls = {
      connected: true,
      protocol: protocol || 'N/A',
      cipher: cipher ? (cipher.standardName || cipher.name || 'N/A') : 'N/A',
      hostnameValid: !hostnameCheck,
      error: hostnameCheck ? hostnameCheck.message : null
    };

    if (cert) {
      result.certificate = {
        subject: cert.subject ? cert.subject.CN || cert.subjectAltName || 'N/A' : 'N/A',
        issuer: cert.issuer ? cert.issuer.O || cert.issuer.CN || JSON.stringify(cert.issuer) : 'N/A',
        valid_from: cert.valid_from || 'N/A',
        valid_to: cert.valid_to || 'N/A',
        subjectAltName: cert.subjectaltname || 'N/A'
      };
    }
  } catch (error) {
    result.tls = {
      connected: false,
      protocol: 'N/A',
      cipher: 'N/A',
      hostnameValid: false,
      error: error.message
    };
  } finally {
    if (socket) {
      socket.end();
    }
  }

  return result;
}

async function getDomainInfo(domain) {
  const safeDomain = validateDomain(domain);

  const [a, aaaa, ns, mx, txt, dmarc, reverse, tls, advanced] = await Promise.all([
    lookupDns(safeDomain, 'A'),
    lookupDns(safeDomain, 'AAAA'),
    lookupDns(safeDomain, 'NS'),
    lookupDns(safeDomain, 'MX'),
    lookupDns(safeDomain, 'TXT'),
    getDmarc(safeDomain),
    getReverseDns(safeDomain),
    getTlsDiagnostics(safeDomain),
    getAdvancedDnsAnalysis(safeDomain)
  ]);

  const health = await getHttpHealth(safeDomain);
  const primaryIp = a[0] || aaaa[0] || 'N/A';

  const overall = {
    hasA: a.length > 0,
    hasAAAA: aaaa.length > 0,
    hasNS: ns.length > 0,
    hasMX: mx.length > 0,
    hasDMARC: dmarc.length > 0,
    websiteReachable: health.some((item) => item.ok),
    hasReverse: reverse[0] && reverse[0] !== 'N/A'
  };

  const score = Object.values(overall).filter(Boolean).length;
  const grade = score >= 5 ? 'Healthy' : score >= 3 ? 'Warning' : 'Critical';

  return {
    domain: safeDomain,
    a,
    aaaa,
    ns,
    mx,
    txt,
    dmarc,
    reverse,
    primaryIp,
    health,
    tls,
    advanced,
    healthSummary: {
      grade,
      score,
      checks: overall
    }
  };
}

async function getPublicGeoSummary(domain) {
  const localIps = getLocalInterfaces();
  const ipData = await getPublicIp();
  const ipv6Data = await getIpv6();
  const geo = await getGeoInfo(ipData.ipv4);
  const domainInfo = await getDomainInfo(domain);
  const domainIp = domainInfo.primaryIp !== 'N/A' ? domainInfo.primaryIp : ipData.ipv4;
  const domainGeo = await getGeoInfo(domainIp);

  return {
    summary: {
      myIp: ipData.ipv4,
      myIpv6: ipv6Data.ipv6,
      country: geo.country,
      localIp: localIps[0],
      localIps,
      domain: domainInfo.domain,
      dnsRecord: domainInfo.a[0] || 'No A record',
      reverseDns: domainInfo.reverse[0] || 'N/A'
    },
    geo: {
      activeDomain: domainInfo.domain,
      ip: domainIp,
      city: domainGeo.city,
      state: domainGeo.region,
      country: domainGeo.country,
      countryCode: domainGeo.countryCode,
      postal: domainGeo.postal,
      latitude: domainGeo.latitude,
      longitude: domainGeo.longitude,
      isp: domainGeo.isp,
      asn: domainGeo.asn
    },
    domainInfo,
    myGeo: geo,
    status: 'ok'
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(payload));
}

function serveStaticFile(response, filePath) {
  const safePath = filePath === '/' ? path.join(PUBLIC_PATH, 'index.html') : path.join(PUBLIC_PATH, filePath);

  if (!safePath.startsWith(PUBLIC_PATH)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (error, data) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    response.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    response.end(data);
  });
}

async function handleLookup(domain, type) {
  const safeDomain = normalizeDomain(domain);
  const rrtype = String(type || 'A').toUpperCase();
  const records = await lookupDns(safeDomain, rrtype);
  return { domain: safeDomain, type: rrtype, records };
}

function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (!checkRateLimit(request)) {
      response.writeHead(429, {
        'Content-Type': 'application/json; charset=utf-8',
        'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
        'Access-Control-Allow-Origin': '*'
      });
      response.end(JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.', status: 'rate_limited' }));
      return;
    }

    if (url.pathname === '/api/summary') {
      const domain = url.searchParams.get('domain') || 'example.com';
      try {
        const safeDomain = validateDomain(domain);
        const summary = await getPublicGeoSummary(safeDomain);
        sendJson(response, 200, summary);
      } catch (error) {
        const isValidationError = error && error.message && /Domain|label|characters|invalid formatting/i.test(error.message);
        const code = isValidationError ? 400 : 500;
        const message = isValidationError ? error.message : 'Internal server error. Please try again later.';
        sendJson(response, code, { error: message, status: 'error', code: isValidationError ? 'INVALID_DOMAIN' : 'SERVER_ERROR' });
      }
      return;
    }

    if (url.pathname === '/api/lookup') {
      const domain = url.searchParams.get('domain') || 'example.com';
      const type = url.searchParams.get('type') || 'A';
      try {
        const safeDomain = validateDomain(domain);
        const result = await handleLookup(safeDomain, type);
        sendJson(response, 200, result);
      } catch (error) {
        const isValidationError = error && error.message && /Domain|label|characters|invalid formatting/i.test(error.message);
        const code = isValidationError ? 400 : 500;
        const message = isValidationError ? error.message : 'DNS lookup failed. Please verify the domain and try again.';
        sendJson(response, code, { error: message, status: 'error', code: isValidationError ? 'INVALID_DOMAIN' : 'LOOKUP_FAILED' });
      }
      return;
    }

    if (url.pathname === '/api/health') {
      const domain = url.searchParams.get('domain') || 'example.com';
      try {
        const safeDomain = validateDomain(domain);
        const summary = await getDomainInfo(safeDomain);
        sendJson(response, 200, summary);
      } catch (error) {
        const isValidationError = error && error.message && /Domain|label|characters|invalid formatting/i.test(error.message);
        const code = isValidationError ? 400 : 500;
        const message = isValidationError ? error.message : 'Health check failed. Please try again later.';
        sendJson(response, code, { error: message, status: 'error', code: isValidationError ? 'INVALID_DOMAIN' : 'HEALTH_CHECK_FAILED' });
      }
      return;
    }

    if (url.pathname === '/api/tls') {
      const domain = url.searchParams.get('domain') || 'example.com';
      try {
        const safeDomain = validateDomain(domain);
        const result = await getTlsDiagnostics(safeDomain);
        sendJson(response, 200, result);
      } catch (error) {
        const isValidationError = error && error.message && /Domain|label|characters|invalid formatting/i.test(error.message);
        const code = isValidationError ? 400 : 500;
        const message = isValidationError ? error.message : 'TLS diagnostics failed. The domain may not support HTTPS.';
        sendJson(response, code, { error: message, status: 'error', code: isValidationError ? 'INVALID_DOMAIN' : 'TLS_FAILED' });
      }
      return;
    }

    if (url.pathname === '/api/advanced') {
      const domain = url.searchParams.get('domain') || 'example.com';
      try {
        const safeDomain = validateDomain(domain);
        const result = await getAdvancedDnsAnalysis(safeDomain);
        sendJson(response, 200, result);
      } catch (error) {
        const isValidationError = error && error.message && /Domain|label|characters|invalid formatting/i.test(error.message);
        const code = isValidationError ? 400 : 500;
        const message = isValidationError ? error.message : 'Advanced analysis failed. Please try again later.';
        sendJson(response, code, { error: message, status: 'error', code: isValidationError ? 'INVALID_DOMAIN' : 'ANALYSIS_FAILED' });
      }
      return;
    }

    const requestPath = url.pathname === '/' ? '/' : url.pathname.replace(/^\//, '');
    serveStaticFile(response, requestPath || '/');
  });
}

function startServer(port) {
  return new Promise((resolve, reject) => {
    const candidate = port;
    const instance = createServer();

    instance.once('error', (error) => {
      if (error && error.code === 'EADDRINUSE') {
        if (candidate < DEFAULT_PORT + MAX_PORT_ATTEMPTS) {
          resolve(startServer(candidate + 1));
          return;
        }

        reject(new Error(`No free port found starting from ${DEFAULT_PORT}`));
        return;
      }

      reject(error);
    });

    instance.listen(candidate, () => {
      console.log(`DNS Tool running at http://localhost:${candidate}`);
      resolve(instance);
    });
  });
}

startServer(DEFAULT_PORT).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
