# DNS Tool

Professional DNS diagnostics dashboard for quick domain investigations, health checks, and record inspection.

## Overview

DNS Tool is a lightweight Node.js application for monitoring and diagnosing DNS configuration issues. It provides a browser-based dashboard that helps users inspect DNS records, verify domain health, review TLS/SSL status, and generate a concise full report without needing a large monitoring stack or external framework.

The project is intentionally simple and local-first. It combines:

- a lightweight Node.js backend
- a vanilla HTML/CSS/JavaScript frontend
- built-in Node.js DNS and TLS modules
- quick domain validation and safer outbound handling
- a compact, MXToolbox-style command workflow for common DNS queries

This project is designed for practical use, fast local setup, and maintainable code without over-engineering.

## Core Features

### DNS record lookups

The dashboard supports the following DNS record types:

- A
- AAAA
- MX
- TXT
- CNAME
- NS
- PTR
- SOA
- SRV
- CAA
- SPF
- DKIM
- DMARC

### Domain monitoring and health checks

- domain validation and normalization
- HTTP/HTTPS reachability checks
- DNS health status summary
- reverse DNS investigation
- basic propagation and DNSSEC visibility
- mail security and SPF/DKIM/DMARC review

### Reporting and usability

- compact quick-command selector inspired by MXToolbox-style workflows
- immediate record results beneath the command selector
- readable, one-per-line TXT output
- cleaner empty states for missing data
- full report section with consolidated findings
- PDF export buttons for white and dark layouts

### Network and TLS context

- public IP and IPv6 detection
- local interface awareness
- geolocation display for IPs
- HTTPS/TLS certificate diagnostics
- certificate issuer, validity, and hostname checks

## Project Structure

```text
DNS Tool/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.js
├── test.js
├── package.json
├── README.md
├── README1.md
├── QUICK_START.md
├── IMPROVEMENTS_LOG.md
├── LATEST_CHANGES.md
├── VERIFICATION_CHECKLIST.md
├── FULLWIDTH_PANEL_FIX.md
├── SESSION_SUMMARY.md
└── .gitignore
```

## Architecture

### Backend

The backend is powered by Node.js and uses built-in modules for:

- HTTP server and static file serving
- DNS lookups
- TLS diagnostics
- network and IP metadata gathering
- request validation and rate limiting

### Frontend

The frontend uses:

- HTML5
- CSS3
- vanilla JavaScript
- fetch-based API calls
- responsive dashboard panels and grids

This keeps the app lightweight and easy to inspect without additional dependency overhead.

## Dashboard Layout

The interface is organized into clear functional panels:

1. Search and domain input
2. Quick Commands selector
3. Quick Lookup Results
4. Summary metrics
5. DNS Toolkit navigation
6. Diagnostic Detail panel
7. Geo Stats panel
8. Full Report panel
9. IP Geo Info panel

The user flow is intentionally optimized so that selecting a record type shows the relevant output directly beneath the command selector.

## Quick Commands Workflow

Users can enter a domain and choose a record type from the Quick Commands menu. The application then immediately retrieves and displays the matching DNS results.

Example record categories:

- Most common: A, AAAA, MX, TXT
- DNS records: CNAME, NS, PTR, SOA, SRV, CAA
- Email & security: SPF, DKIM, DMARC

This provides a straightforward, MXToolbox-like lookup experience for local diagnostics.

## Installation

### Prerequisites

- Node.js 18+
- npm
- a modern browser
- optional internet access for public IP and geo lookups

### Install and run

```bash
cd "C:\Users\ArtanV\Desktop\DNS Tool"
npm install
npm start
```

The application runs locally on:

```text
http://localhost:3002
```

If port 3002 is unavailable, the server may use the next available port automatically.

## Quick Start

1. Open the dashboard in the browser.
2. Enter a domain such as `example.com`.
3. Select a DNS record type from Quick Commands.
4. Review the results in the lookup panel.
5. Use the toolkit and full report for additional context.

### Example lookups

- A record: `example.com`
- MX record: `gmail.com`
- TXT record: `github.com`
- SPF record: `microsoft.com`

## API Endpoints

The app exposes lightweight JSON endpoints for diagnostics.

### Summary

```http
GET /api/summary?domain=example.com
```

Returns a combined overview of:

- public IP data
- local IP context
- geolocation and ISP details
- basic domain health information

### Lookup

```http
GET /api/lookup?domain=example.com&type=A
```

Returns DNS records for the specified domain and record type.

### Health

```http
GET /api/health?domain=example.com
```

Returns domain health checks and reachability data.

### Advanced data

The backend also provides advanced analysis for:

- DNSSEC
- propagation snapshots
- TTL insights
- SPF, DKIM, and DMARC discovery
- TLS details and certificate status

## Validation and Domain Safety

The project includes defensive validation to prevent malformed domain input and unsafe requests.

Validation checks cover:

- missing or empty domains
- protocols and trailing slashes
- double dots and malformed labels
- leading or trailing dots
- illegal characters
- invalid IP input
- very long DNS names
- label length and hyphen rules

This helps keep the backend safe and avoids noisy or invalid lookups.

## Rate Limiting and Reliability

The app includes basic protections for:

- request rate limiting
- DNS lookup timeouts
- safer error responses
- controlled request handling
- fallback states for unavailable upstream data

The server returns structured validation and runtime error messages instead of exposing low-level internals.

## Testing

Run the project tests with:

```bash
npm test
```

The current validation suite checks a broad set of valid and invalid domain inputs and ensures core validation logic remains stable.

Example current result:

```text
Tests passed: 19/19
✓ All tests passed!
```

## PDF Export

The project includes a PDF export function for the full report. Users can generate a downloadable PDF in either:

- white theme
- black theme

This is designed for quick offline documentation and reporting without introducing heavy export infrastructure.

## Recent Improvements

The project documentation and UI have been refined around practical improvements:

- panel layout cleanup and information hierarchy
- full-width command panel styling
- better quick-command workflow
- faster result visibility after command selection
- clearer empty-state messaging
- improved TXT record readability
- safer validation and backend error handling
- PDF export for reports
- professional documentation consolidation

## Troubleshooting

### Server not starting

- confirm Node.js is installed
- run `npm install`
- check whether the port is already in use

### Domain validation errors

- avoid spaces, protocols, malformed labels, or trailing dots
- use a valid hostname like `example.com` or `www.example.com`

### No records returned

This may happen when:

- the record type is not published for that domain
- the domain is misconfigured
- DNS propagation is incomplete
- the network cannot resolve the domain

### Browser issues

Use the browser console to inspect errors, and confirm the server is running on the expected local port.

## Documentation Notes

This consolidated document merges the project’s previous markdown references into a single professional guide. It focuses on the most relevant details for setup, usage, architecture, validation, and maintenance.

## Recommended Maintenance

- keep the backend minimal and straightforward
- avoid overbuilding the architecture
- preserve a local-first design
- continue improving UX in small, targeted changes
- validate domain rules and lookup behavior before shipping adjustments

## Summary

DNS Tool is a simple, effective, and maintainable DNS diagnostics dashboard for local domain inspection and quick operational checks. It keeps the project lightweight while covering the common needs of DNS investigation, domain health review, TLS awareness, and report generation.
