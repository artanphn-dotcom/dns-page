# DNS Tool

A lightweight Node.js DNS diagnostics dashboard that checks domain health, resolves DNS records, exposes reverse DNS results, and presents public IP and geo intelligence for the current user and active domain.

The project combines a small HTTP server with a browser-based dashboard. It serves static assets from the `public/` folder and returns JSON from a few REST-style endpoints used by the frontend.

## Overview

DNS Tool is designed to help users quickly inspect:

- A, AAAA, NS, MX, TXT, and PTR DNS records
- Domain health and connection reachability
- Reverse DNS / PTR lookups
- Public IP and IPv6 information
- Geo metadata for the user and the active domain
- A summary and full diagnostic report for the resolved domain

The app is intentionally lightweight and uses native Node.js modules plus public HTTP APIs for IP and geo lookups.

## Features

### DNS intelligence

- Query DNS information for a domain using the selected record type
- Resolve common record types including:
  - A
  - AAAA
  - NS
  - MX
  - TXT
  - PTR
- Inspect mail routing and DMARC policy records
- Check reverse DNS for IP-based target lookups

### Health checks

- Run HTTP reachability checks against both `http://` and `https://` endpoints
- Evaluate whether the website responds successfully
- Mark domain health as Healthy, Warning, or Critical based on available checks

### User and domain geo data

- Detect the machine's public IPv4 address
- Detect the machine's public IPv6 address when available
- Identify the local network IPv4 interface address
- Fetch IP geo metadata (city, region, country, latitude, longitude, ISP, ASN)
- Apply geo information to the active domain IP when available

### Dashboard UI

- Search a domain and switch DNS record types from the UI
- Toggle between tool views such as Overview, DNS Lookup, Reverse DNS, MX records, NS records, DMARC, Health Check, and Full Report
- Visualize summary metrics and domain detail panels
- Show DNS results and report data with responsive layout styling

## Technology Stack

- Node.js runtime
- Built-in HTTP server (`http` module)
- Built-in DNS module (`dns`)
- Built-in filesystem and OS utilities
- Vanilla JavaScript frontend in `public/app.js`
- Static HTML and CSS in `public/index.html` and `public/styles.css`

## Project Structure

```text
DNS Tool/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── package.json
├── server.js
├── README.md
└── .gitignore (if present in your environment)
```

### Key files

#### `server.js`

The backend entry point. It:

- starts a local HTTP server on port 3001 by default
- serves the static files from the `public/` directory
- exposes API routes for summary, lookup, and health data
- resolves DNS records using Node's `dns.promises`
- connects to public APIs for IP and geo metadata

#### `public/index.html`

The browser dashboard shell, including:

- domain search box
- record type selector
- summary panel
- DNS toolkit tab buttons
- diagnostic detail panel
- geo stats panel
- DNS record panel
- full report panel

#### `public/app.js`

The frontend logic that:

- reads values from the form
- calls the backend endpoints
- updates summary cards and record lists
- renders detail views for each dashboard tab
- builds the full report table

#### `public/styles.css`

Dashboard styling for the app layout, cards, status pills, report grids, responsive design, and detail panels.

## Installation

This project does not require a package install step for dependencies because it relies on Node.js built-in modules.

Prerequisites:

- Node.js 18 or newer recommended
- Internet access for public IP and geo lookup APIs

Install dependencies:

```bash
npm install
```

If the project has no external dependencies, this step is usually a no-op, but it is safe to run.

## Running the Application

From the project root:

```bash
npm start
```

The server starts on:

```text
http://localhost:3001
```

If port 3001 is already occupied, the server attempts to increment the port until it finds an available one.

## Configuration

The application reads the port from the environment variable `PORT`:

```bash
PORT=3002 npm start
```

This will start the server on port 3002 instead of the default 3001.

## Backend API Endpoints

The server serves three main JSON endpoints.

### 1. GET `/api/summary`

Returns a complete summary object for a domain, including:

- public IP and IPv6 data
- local IP information
- geo results for the user's public IP
- domain information and health checks
- domain primary IP and reverse DNS

Example:

```bash
curl "http://localhost:3001/api/summary?domain=example.com"
```

### 2. GET `/api/lookup`

Returns records for the provided DNS type.

Query parameters:

- `domain` — the target domain
- `type` — record type, such as `A`, `AAAA`, `NS`, `MX`, `TXT`, or `PTR`

Example:

```bash
curl "http://localhost:3001/api/lookup?domain=example.com&type=A"
```

### 3. GET `/api/health`

Returns domain health analysis including:

- A record presence
- AAAA record presence
- NS record presence
- MX record presence
- DMARC record presence
- website reachability
- reverse DNS presence
- overall grade

Example:

```bash
curl "http://localhost:3001/api/health?domain=example.com"
```

## External Services Used

The project relies on a few public APIs for IP and geo data:

- `https://api.ipify.org?format=json` for public IPv4
- `https://api64.ipify.org?format=json` for public IPv6
- `https://ipapi.co/{ip}/json/` for IP geo metadata

These calls are used to populate the dashboard's summary and geo panels.

## Internal Logic Overview

### DNS lookups

Resolver logic is handled in `server.js` using `dns.promises`:

- `resolveMx()` for MX records
- `resolveTxt()` for TXT and DMARC lookups
- `resolve()` for A/AAAA/NS records
- `reverse()` for PTR / reverse DNS

### Domain health scoring

The server aggregates several checks into an overall grade:

- A record exists
- AAAA record exists
- NS records exist
- MX records exist
- DMARC record exists
- website is reachable via HTTP or HTTPS
- reverse DNS is available

The grade is determined as:

- Healthy: 5 or more checks passed
- Warning: 3–4 checks passed
- Critical: fewer than 3 checks passed

### UI rendering behavior

The frontend uses the selected tool tab to render the corresponding detail section:

- Overview
- DNS Lookup
- Reverse DNS
- Mail Records
- Nameservers
- DMARC
- Health Check
- Full Report

This is managed in `public/app.js` with dynamic `innerHTML` generation and helper functions for formatting values.

## How the Frontend Works

The app performs a startup request on load:

1. It reads the domain from the input field
2. It calls `/api/summary`
3. It calls `/api/lookup?type=A` or the selected record type
4. It updates the summary cards, geo sections, record list, and health status
5. It re-renders the relevant detail panel when the user switches tabs

The browser keeps the current state in a small `state` object:

- active tool
- summary
- lookup data
- fetch error

## UI Sections

### Search and input

Users can:

- enter a hostname such as `example.com`
- choose a record type from the selector
- click Search to fetch data
- click Use current domain to load the current hostname

### Summary panel

Displays the following stats:

- Your IP Address
- IPv6
- Country
- Local IP

### DNS Toolkit panel

This section contains tool cards for each diagnostic category. Selecting a tab updates the diagnostics detail area.

### Diagnostic Detail

This panel shows the content relevant to the selected tool: overview, health checks, record lists, reverse DNS, MX records, DMARC details, or a report snapshot.

### Geo panels

The project shows:

- Geo Stats of Active Domain
- IP Geo Info

These panels provide city, state, postal code, country, latitude, longitude, ISP, and ASN information.

### Full Report

The full report consolidates all the important findings in one table-like layout, including:

- domain
- primary IP
- public IP
- IPv6
- local IP
- geo metadata
- DNS records
- health grade
- HTTP checks

## Production Notes and Limitations

This is a lightweight demo-style utility with a few practical constraints:

- It depends on public online services for IP and geo lookup data
- Some external services may be rate-limited or unavailable
- DNS resolution can vary by network environment
- The app is not designed for enterprise-scale background polling or multi-user management

## Troubleshooting

### The page does not load

Check that the server is running:

```bash
npm start
```

If it still does not load, verify that the port is available or use a custom `PORT` value.

### DNS lookup returns no records

This may be because:

- the domain does not exist
- the domain is mis-typed
- the selected record type is not present
- network restrictions prevent DNS queries from resolving properly

### Geo or public IP data is unavailable

The application may fail to get IP or geo details if:

- the upstream service is unreachable
- outbound connectivity is blocked
- the machine is behind a firewall or proxy

### The app is not accessible from a browser

Ensure the server is listening on the expected local address and port:

```text
http://localhost:3001
```

## Future Improvements

Possible enhancements for a future version:

- export results as JSON or CSV
- support additional DNS record types
- add caching for repeated lookups
- add a history panel of previous domains
- add a dark/light theme toggle
- improve error handling and fallback states
- add a more advanced health scoring model
- secure the server with rate limits and validation improvements

## How It Works

The dashboard follows a simple flow:

```text
User enters a domain
        ↓
Frontend sends request to /api/summary and /api/lookup
        ↓
Node server resolves DNS with dns.promises
        ↓
Public IP and geo APIs enrich the result set
        ↓
Dashboard renders summary, health checks, and report panels
```

This gives a single, easy-to-follow workflow from domain input to diagnostic interpretation.

## Example Usage

### Check a domain's A records

```bash
curl "http://localhost:3001/api/lookup?domain=example.com&type=A"
```

### Inspect domain health

```bash
curl "http://localhost:3001/api/health?domain=example.com"
```

### View the full summary

```bash
curl "http://localhost:3001/api/summary?domain=example.com"
```

### Open the dashboard

Visit:

```text
http://localhost:3001
```

Then enter a domain such as `example.com` and choose a DNS record type.

## Screenshots

The dashboard includes:

- a search panel for the domain and record type
- a summary card section for IP and country details
- a DNS toolkit with category tabs
- a diagnostic detail panel for focused results
- a geo section for active-domain information
- a full report for a consolidated view

## Summary

DNS Tool is a compact but useful DNS troubleshooting and domain analysis dashboard. It applies simple, direct diagnostics to help users understand the live state of a domain, public network identity, and DNS metadata from a single browser interface.

It is ideal for local troubleshooting, quick verification, teaching DNS concepts, or performing lightweight domain-health checks without a full enterprise monitoring stack.

