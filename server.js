const http = require('http');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const os = require('os');

const DEFAULT_PORT = Number(process.env.PORT) || 3001;
const MAX_PORT_ATTEMPTS = 20;
const PUBLIC_PATH = path.join(__dirname, 'public');

function normalizeDomain(value) {
  if (!value) return 'example.com';
  const cleaned = String(value).trim().replace(/^https?:\/\//i, '').replace(/\/$/, '').replace(/\s+/g, '').toLowerCase();
  return cleaned || 'example.com';
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
    const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
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
    const response = await fetch(url, { headers: { Accept: 'text/plain' }, signal: controller.signal });
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
  const safeDomain = normalizeDomain(domain);
  const type = String(rrtype || 'A').toUpperCase();

  if (type === 'PTR') {
    const targetIp = safeDomain.trim();
    const reverse = await dns.promises.reverse(targetIp).catch(() => []);
    return flattenRecords(reverse);
  }

  if (type === 'MX') {
    const records = await dns.promises.resolveMx(safeDomain).catch(() => []);
    return flattenRecords(records);
  }

  if (type === 'TXT') {
    const records = await dns.promises.resolveTxt(safeDomain).catch(() => []);
    return flattenRecords(records);
  }

  const records = await dns.promises.resolve(safeDomain, type).catch(() => []);
  return flattenRecords(records);
}

async function getDmarc(domain) {
  const safeDomain = normalizeDomain(domain);
  const records = await dns.promises.resolveTxt(`_dmarc.${safeDomain}`).catch(() => []);
  return flattenRecords(records);
}

async function getReverseDns(domain) {
  const safeDomain = normalizeDomain(domain);
  const aRecords = await lookupDns(safeDomain, 'A');
  const targetIp = aRecords[0] || null;

  if (!targetIp) {
    return ['N/A'];
  }

  try {
    const reverse = await dns.promises.reverse(targetIp);
    return reverse.length ? reverse : ['N/A'];
  } catch (error) {
    return ['N/A'];
  }
}

async function getHttpHealth(domain) {
  const safeDomain = normalizeDomain(domain);
  const urls = [`https://${safeDomain}`, `http://${safeDomain}`];
  const results = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(8000) });
      results.push({
        url,
        status: response.status,
        ok: response.ok || (response.status >= 300 && response.status < 400),
        scheme: new URL(url).protocol.replace(':', '')
      });
    } catch (error) {
      results.push({
        url,
        status: 'ERR',
        ok: false,
        error: error.message,
        scheme: new URL(url).protocol.replace(':', '')
      });
    }
  }

  return results;
}

async function getDomainInfo(domain) {
  const safeDomain = normalizeDomain(domain);

  const [a, aaaa, ns, mx, txt, dmarc, reverse] = await Promise.all([
    lookupDns(safeDomain, 'A'),
    lookupDns(safeDomain, 'AAAA'),
    lookupDns(safeDomain, 'NS'),
    lookupDns(safeDomain, 'MX'),
    lookupDns(safeDomain, 'TXT'),
    getDmarc(safeDomain),
    getReverseDns(safeDomain)
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

    if (url.pathname === '/api/summary') {
      const domain = url.searchParams.get('domain') || 'example.com';
      try {
        const summary = await getPublicGeoSummary(domain);
        sendJson(response, 200, summary);
      } catch (error) {
        sendJson(response, 500, { error: error.message, status: 'error' });
      }
      return;
    }

    if (url.pathname === '/api/lookup') {
      const domain = url.searchParams.get('domain') || 'example.com';
      const type = url.searchParams.get('type') || 'A';
      try {
        const result = await handleLookup(domain, type);
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 500, { error: error.message, status: 'error' });
      }
      return;
    }

    if (url.pathname === '/api/health') {
      const domain = url.searchParams.get('domain') || 'example.com';
      try {
        const summary = await getDomainInfo(domain);
        sendJson(response, 200, summary);
      } catch (error) {
        sendJson(response, 500, { error: error.message, status: 'error' });
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
