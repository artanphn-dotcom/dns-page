# 🌐 DNS Tool

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JavaScript">
  <img src="https://img.shields.io/badge/Protocol-DNS-2563EB?style=for-the-badge&logo=cloudflare&logoColor=white" alt="DNS">
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>A Professional DNS Diagnostics & Domain Intelligence Dashboard</strong>
  <br>
  Investigate DNS records, monitor domain health, inspect TLS certificates, and generate comprehensive diagnostic reports — all from one lightweight dashboard.
</p>

---

## 📌 Overview

**DNS Tool** is a lightweight, local-first Node.js application designed for DNS diagnostics, domain investigations, and network health monitoring.

It provides a modern browser-based dashboard that allows users to:

- 🔍 Inspect and analyze DNS records.
- 🌐 Verify domain availability and connectivity.
- 🛡️ Review TLS/SSL certificates and security information.
- 📡 Investigate DNS health and propagation.
- 📧 Analyze SPF, DKIM, and DMARC configurations.
- 📊 Generate consolidated diagnostic reports.
- 📄 Export reports as downloadable PDF documents.

Built with simplicity, performance, and maintainability in mind, DNS Tool combines a lightweight Node.js backend with a responsive frontend — without requiring a heavy framework or external monitoring stack.

## ✨ Core Features

### 🔎 DNS Record Lookup

Perform DNS investigations across multiple record types:

| Record Type | Description |
|---|---|
| `A` | IPv4 address records |
| `AAAA` | IPv6 address records |
| `MX` | Mail exchange records |
| `TXT` | Text records |
| `CNAME` | Canonical name records |
| `NS` | Name server records |
| `PTR` | Reverse DNS records |
| `SOA` | Start of Authority records |
| `SRV` | Service records |
| `CAA` | Certificate Authority Authorization |
| `SPF` | Sender Policy Framework |
| `DKIM` | DomainKeys Identified Mail |
| `DMARC` | Domain-based Message Authentication |

### 🌍 Domain Monitoring & Health Checks

- Domain validation and normalization.
- HTTP/HTTPS reachability checks.
- DNS health status overview.
- Reverse DNS investigation.
- Basic DNS propagation visibility.
- DNSSEC visibility.
- Email authentication and security analysis.
- Domain configuration diagnostics.

### 📊 Reporting & Dashboard

- MXToolbox-inspired Quick Commands workflow.
- Immediate DNS lookup results.
- Consolidated diagnostic summaries.
- Readable, one-per-line TXT output.
- Improved empty states and error messages.
- Full Report section with consolidated findings.
- PDF export with light and dark themes.

### 🔐 Network & TLS Diagnostics

- Public IPv4 and IPv6 detection.
- Local network interface awareness.
- IP geolocation information.
- ISP and network metadata.
- HTTPS/TLS certificate diagnostics.
- Certificate issuer information.
- Certificate validity checks.
- Hostname verification.

## 🏗️ Project Structure

```text
DNS Tool/
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
│
├── server.js
├── test.js
├── package.json
│
├── README.md
├── README1.md
├── QUICK_START.md
├── IMPROVEMENTS_LOG.md
├── LATEST_CHANGES.md
├── VERIFICATION_CHECKLIST.md
├── FULLWIDTH_PANEL_FIX.md
├── SESSION_SUMMARY.md
│
└── .gitignore
```

## ⚙️ Architecture

### Backend

Powered by **Node.js**, the backend uses built-in modules for:

- HTTP server and static file serving.
- DNS record resolution.
- TLS/SSL diagnostics.
- Network and IP metadata collection.
- Request validation and rate limiting.
- Controlled error handling.

### Frontend

The dashboard uses:

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch-based API communication
- Responsive dashboard panels and grids

This architecture keeps the application lightweight, fast, and easy to maintain without unnecessary dependency overhead.

## 🖥️ Dashboard Layout

The interface is organized into functional diagnostic panels:

| # | Dashboard Component | Purpose |
|---|---|---|
| 01 | 🔍 Search & Domain Input | Enter and validate domains |
| 02 | ⚡ Quick Commands | Select DNS lookup types |
| 03 | 📡 Quick Lookup Results | Display DNS query results |
| 04 | 📊 Summary Metrics | Show key diagnostic information |
| 05 | 🧰 DNS Toolkit | Access diagnostic tools |
| 06 | 🔎 Diagnostic Detail | Review detailed findings |
| 07 | 🌍 Geo Stats | Display geographic network data |
| 08 | 📄 Full Report | Consolidated domain analysis |
| 09 | 🛰️ IP Geo Info | Inspect IP-related information |

The workflow is designed so that selecting a record type immediately displays the corresponding results beneath the Quick Commands selector.

## ⚡ Quick Commands Workflow

DNS Tool includes a compact, MXToolbox-inspired command workflow for fast DNS investigations.

Simply enter a domain, select a lookup type, and review the returned information.

**Available lookup categories:**

- **Common Records:** `A`, `AAAA`, `MX`, `TXT`
- **DNS Records:** `CNAME`, `NS`, `PTR`, `SOA`, `SRV`, `CAA`
- **Email & Security:** `SPF`, `DKIM`, `DMARC`

Results are displayed directly in the dashboard for a streamlined investigation experience.

## 🚀 Installation & Setup

### Requirements

Make sure the following are installed:

- [Node.js 18+](https://nodejs.org/)
- npm
- A modern web browser
- Internet access for external IP and geolocation lookups

### 1. Clone or Download

Download the project or clone its repository.

### 2. Open the Project Directory

```bash
cd "C:\Users\ArtanV\Desktop\DNS Tool"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

### 5. Open the Dashboard

Once the server starts, access the application at:

**http://localhost:3002**

> 💡 If port `3002` is unavailable, the server may automatically select the next available port.

## 🎯 Quick Start Guide

Getting started is simple:

1. Start the Node.js server.
2. Open the dashboard in your browser.
3. Enter a domain, for example `example.com`.
4. Select a DNS record type from Quick Commands.
5. Review the lookup results.
6. Explore additional diagnostics using the DNS Toolkit.
7. Generate a Full Report when needed.
8. Export the report as a PDF.

### Example Lookups

| Diagnostic | Example Domain |
|---|---|
| A Record | `example.com` |
| MX Record | `gmail.com` |
| TXT Record | `github.com` |
| SPF Record | `microsoft.com` |
| DMARC Record | `google.com` |

## 🔌 API Endpoints

DNS Tool exposes lightweight JSON endpoints for diagnostic operations.

### 📊 Summary Endpoint

```http
GET /api/summary?domain=example.com
```

Provides a combined overview of:

- Public IP information.
- Local IP context.
- Geolocation and ISP details.
- Basic domain health information.

### 🔍 DNS Lookup Endpoint

```http
GET /api/lookup?domain=example.com&type=A
```

Retrieves DNS records for the specified domain and record type.

### ❤️ Health Endpoint

```http
GET /api/health?domain=example.com
```

Returns domain health checks and connectivity information.

### 🧪 Advanced Diagnostics

Additional backend functionality includes:

- DNSSEC analysis.
- DNS propagation snapshots.
- TTL information and insights.
- SPF, DKIM, and DMARC discovery.
- TLS certificate details.
- Certificate validity and hostname checks.

## 🛡️ Validation & Domain Security

The application implements defensive input validation to prevent malformed domains and unsafe requests.

Validation checks include:

- Empty or missing domain names.
- Protocol prefixes and trailing slashes.
- Double dots and malformed labels.
- Leading or trailing dots.
- Illegal characters.
- Invalid IP address input.
- Excessively long DNS names.
- Label length restrictions.
- Invalid hyphen placement.

These safeguards help reduce invalid lookups and improve backend request reliability.

## ⚡ Rate Limiting & Reliability

The backend includes basic reliability and security protections:

- Request rate limiting.
- DNS lookup timeouts.
- Structured error responses.
- Controlled request processing.
- Fallback states for unavailable upstream services.
- Safer handling of invalid requests.

The application returns structured validation and runtime errors rather than exposing unnecessary low-level implementation details.

## 🧪 Testing

Run the project's test suite using:

```bash
npm test
```

The validation suite checks valid and invalid domain inputs and verifies that the core validation logic remains stable.

**Example test output:**

```text
Tests passed: 19/19

✓ All tests passed!
```

## 📄 PDF Report Export

DNS Tool includes PDF export functionality for the Full Report section.

Users can generate downloadable reports using two visual themes:

- ☀️ **White Theme** — Clean, light report layout.
- 🌙 **Dark Theme** — Dark report layout.

PDF export provides a convenient way to save diagnostic findings for offline review and documentation.

## 🔄 Recent Improvements

The project has undergone several practical UI, backend, and documentation improvements:

- 🎨 Improved dashboard layout and visual hierarchy.
- 📐 Full-width Quick Commands panel styling.
- ⚡ Streamlined DNS lookup workflow.
- 📡 Faster visibility of lookup results.
- 📝 Improved empty-state messaging.
- 📄 Better TXT record readability.
- 🛡️ Safer domain validation.
- ⚙️ Improved backend error handling.
- 📊 Consolidated diagnostic reporting.
- 📥 PDF export with light and dark themes.
- 📚 Professional documentation structure.

## 🔧 Troubleshooting

### Server Not Starting

Try the following:

1. Verify that Node.js is installed.
2. Run `npm install`.
3. Check whether port `3002` is already in use.
4. Review the terminal output for startup errors.

### Domain Validation Errors

Make sure the entered domain:

- Does not contain spaces.
- Does not include `http://` or `https://`.
- Does not contain malformed labels.
- Uses a valid hostname format.

Example:

```text
example.com
www.example.com
```

### No DNS Records Returned

Possible causes include:

- The requested record type is not published.
- The domain has DNS configuration issues.
- DNS propagation is incomplete.
- The network cannot resolve the domain.
- An upstream DNS resolver is unavailable.

### Browser or Dashboard Issues

- Open the browser developer console.
- Check for JavaScript errors.
- Confirm that the Node.js server is running.
- Verify that the application is using the correct local port.

## 📚 Documentation

The repository includes additional project documentation:

| File | Description |
|---|---|
| `QUICK_START.md` | Quick installation and usage guide |
| `IMPROVEMENTS_LOG.md` | Development improvement history |
| `LATEST_CHANGES.md` | Recent project changes |
| `VERIFICATION_CHECKLIST.md` | Verification and testing checklist |
| `FULLWIDTH_PANEL_FIX.md` | Dashboard layout improvements |
| `SESSION_SUMMARY.md` | Development session summary |

This README serves as the consolidated project overview and primary reference for installation, architecture, features, and maintenance.

## 🧭 Recommended Maintenance

To keep DNS Tool reliable and maintainable:

- Keep the backend lightweight and straightforward.
- Avoid unnecessary architectural complexity.
- Preserve the local-first application design.
- Improve the dashboard through targeted UX enhancements.
- Maintain consistent validation and error handling.
- Test DNS lookup behavior before releasing changes.
- Keep documentation synchronized with new features.

## 📌 Project Summary

**DNS Tool** is a lightweight yet capable DNS diagnostics and domain intelligence dashboard designed for practical network investigations.

By combining DNS record inspection, domain health monitoring, TLS diagnostics, network information, and PDF reporting in one interface, it provides a convenient toolkit for everyday domain analysis.

Its minimal Node.js architecture, vanilla frontend, and local-first approach make it easy to run, inspect, and maintain.

---

<p align="center">
  <strong>🌐 DNS Tool</strong>
  <br>
  <sub>DNS Diagnostics • Domain Intelligence • Network Visibility</sub>
  <br><br>
  <strong>Developed by Artan V.</strong>
  <br>
  <sub>© 2026 Artan V. All Rights Reserved.</sub>
</p>