# DNS Tool

DNS Tool is a lightweight DNS diagnostics dashboard built with Node.js. It helps users quickly inspect a domain's DNS health, public network context, and record configuration from a single browser interface.

The project combines a small HTTP server with a responsive frontend. The backend resolves DNS records, performs safety checks, and exposes a few JSON API endpoints. The frontend consumes those endpoints and renders summary, detail, geo, and full-report views.

## Why this project exists

This tool is designed for quick domain troubleshooting and visibility. It answers questions like:

- Does the domain resolve correctly?
- What record types are published?
- Is the website reachable over HTTP/HTTPS?
- What IP and geo context is associated with the domain?
- Is the domain's health likely good, warning, or critical?

It is intentionally simple and lightweight, making it useful for local diagnostics, demos, and early-stage DNS analysis without needing a large monitoring platform.

## Features

### Core DNS checks

- A, AAAA, NS, MX, TXT, and PTR lookups
- Reverse DNS (PTR) checks
- DMARC record inspection
- Mail-exchange record review
- Domain health evaluation based on key indicators

### Health and reachability

- HTTP/HTTPS reachability checks
- Browser-friendly health summaries
- Overall grade: Healthy, Warning, or Critical
- Quick checks for route and endpoint availability

### Network and geo context

- Public IPv4 and IPv6 detection
- Local interface detection
- Geo metadata for the current public IP
- Geo metadata for the active domain's IP when available
- Summary cards for network visibility

### Dashboard experience

- Domain input and record-type selector
- DNS toolkit tabs for overview, lookup, reverse DNS, MX, NS, DMARC, health, and full report
- Detailed diagnostic panel
- Responsive layout for desktop and smaller screens
- Full-report table that consolidates the main findings

## Architecture

The project has a very small, direct architecture:

- Server: `server.js`
- Frontend: `public/index.html`, `public/app.js`, `public/styles.css`
- Runtime: Node.js
- Core modules: `http`, `https`, `dns`, `fs`, `path`, `os`, `tls`

The backend serves static files and JSON API endpoints. The frontend performs fetch calls to those endpoints and re-renders specific sections of the dashboard based on the selected tool.

## Project structure

```text
DNS Tool/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── package.json
├── server.js
├── README.md
└── .gitignore
```

## Key files

### `server.js`

Responsible for:

- starting the HTTP server
- serving static files from `public/`
- validating domain input
- resolving DNS records
- running HTTP health checks
- collecting public IP and geo metadata
- providing JSON endpoints for the frontend
- enforcing basic request limits and safer handling of malformed input

### `public/index.html`

Contains the dashboard shell and all major sections, including:

- top navigation and header
- domain search block
- DNS toolkit tabs
- summary cards
- diagnostic detail area
- geo panels
- full report sections

### `public/app.js`

Handles:

- form interaction and search behavior
- API requests
- state updates
- rendering health badges
- rendering lookup results and details
- generating the full report view

### `public/styles.css`

Defines the styling for:

- cards and panels
- dashboard layout
- report grid formatting
- status pills and empty states
- mobile responsiveness

## Requirements

- Node.js 18+ recommended
- Internet access for public IP/geo lookups
- A local browser to access the dashboard

## Installation

From the project root:

```bash
npm install
```

The project uses built-in Node.js modules, so installation is generally lightweight. If there are no external dependencies, the command should complete quickly and simply confirm the environment is ready.

## Running the app

Start the server:

```bash
npm start
```

Then open:

```text
http://localhost:3001
```

If port `3001` is busy, the server will try the next available port automatically.

## Configuration

The app supports a custom port via the `PORT` environment variable:

```bash
PORT=3002 npm start
```

This starts the dashboard on `http://localhost:3002`.

## API endpoints

The backend exposes a small set of diagnostic endpoints.

### `GET /api/summary`

Returns a combined summary for the target domain, including:

- public IP data
- local IP data
- geo context
- active domain metadata
- DNS health information

Example:

```bash
curl "http://localhost:3001/api/summary?domain=example.com"
```

### `GET /api/lookup`

Returns DNS records for a requested record type.

Query parameters:

- `domain`: domain to inspect
- `type`: DNS record type such as `A`, `AAAA`, `NS`, `MX`, `TXT`, or `PTR`

Example:

```bash
curl "http://localhost:3001/api/lookup?domain=example.com&type=A"
```

### `GET /api/health`

Returns the domain health model, including:

- record presence checks
- website reachability
- reverse DNS status
- overall grade and score

Example:

```bash
curl "http://localhost:3001/api/health?domain=example.com"
```

## Security and hardening notes

The project includes several safety improvements to reduce abuse and weak input handling:

- domain validation before lookup
- normalized hostname handling
- blocked unsupported or malformed inputs
- request rate limiting
- timeout handling for outbound DNS operations
- guarded HTTP health checks to reject unsafe URLs and credentials
- structured error responses instead of leaking raw failures in an uncontrolled way

These protections are important because the tool makes outbound requests and works with user-provided domains.

## External services used

The app collects some information from public services:

- `https://api.ipify.org?format=json` for IPv4
- `https://api64.ipify.org?format=json` for IPv6
- `https://ipapi.co/{ip}/json/` for geo metadata

These services enrich the dashboard with public IP and geographic context.

## Current roadmap

The project is already usable as a DNS diagnostics dashboard, and it is structured for continued growth.

### Phase 1: backend foundation and security

Completed in the current build:

- input validation and safe domain handling
- DNS caching and query timeouts
- API error handling
- rate limiting
- secure HTTP health checks

### Phase 2: advanced DNS intelligence

Planned next milestones:

- DNS propagation checker
- DNSSEC analysis
- SPF, DKIM, and DMARC analyzer improvements
- richer DNS record inspection

### Phase 3: SSL/TLS diagnostics

Planned future work:

- certificate issuer and expiration checks
- hostname validation
- TLS connection diagnostics
- HTTPS status verification

## Development workflow

The app is intentionally simple to work on:

1. Modify server logic in `server.js`
2. Update UI markup in `public/index.html`
3. Adjust styles in `public/styles.css`
4. Update rendering and client logic in `public/app.js`
5. Run the app locally and validate the endpoints from a browser or `curl`

## Troubleshooting

### The page is blank or the UI does not load

Make sure the server is running:

```bash
npm start
```

Then verify the app is responding on the expected port:

```bash
curl -I http://localhost:3001
```

### DNS records return empty

Possible causes:

- the domain is not valid
- the record type is not published for that domain
- the domain does not exist
- the network environment blocks or filters DNS requests

### Geo data looks missing

This usually means one of the upstream geo or IP services is unavailable or blocked. The app gracefully falls back to `N/A` values where possible.

## Future improvements

Potential enhancements include:

- export to JSON or CSV
- more record types and advanced parsing
- historical domain checks
- richer health scoring model
- improved report export and filtering
- broader SSL and DNSSEC support
- more polished UI states and accessibility enhancements

## Summary

DNS Tool is a practical, lightweight domain diagnostics dashboard for learning, troubleshooting, and quick validation. It offers a simple workflow: enter a domain, inspect records, review health signals, and analyze public network context from one place.

It is well suited to local diagnostics, early-stage monitoring, and future expansion into more advanced DNS and TLS analysis.

