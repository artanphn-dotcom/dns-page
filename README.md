# 🌐 DNS Tool — Advanced DNS Diagnostics Dashboard

<p align="center">
  <strong>Complete DNS, Domain Health, Network & SSL/TLS Intelligence in One Dashboard</strong>
  <br />
  A lightweight, responsive and security-focused domain diagnostics platform powered by Node.js.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Architecture-Lightweight-blue?style=for-the-badge" alt="Lightweight Architecture" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Active Development" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DNS-Analysis-2563EB?style=flat-square" alt="DNS Analysis" />
  <img src="https://img.shields.io/badge/DNSSEC-Detection-7C3AED?style=flat-square" alt="DNSSEC" />
  <img src="https://img.shields.io/badge/SPF%20%7C%20DKIM%20%7C%20DMARC-Email%20Security-0891B2?style=flat-square" alt="Email Security" />
  <img src="https://img.shields.io/badge/SSL%2FTLS-Diagnostics-16A34A?style=flat-square" alt="SSL TLS" />
</p>

---

## 📖 Overview

**DNS Tool** is a lightweight DNS diagnostics and domain intelligence dashboard built with **Node.js**.

It provides a centralized interface for inspecting DNS records, evaluating domain health, analyzing advanced DNS configurations, checking SSL/TLS certificates, and exploring public network information.

The application combines a lightweight HTTP backend with a responsive frontend to deliver detailed diagnostic information through a clean, browser-based interface.

From basic DNS lookups to advanced DNS security analysis, DNS Tool brings essential domain troubleshooting capabilities together in one convenient platform.

### 🎯 Why This Project Exists

Domain troubleshooting often requires switching between multiple command-line utilities and online diagnostic services.

DNS Tool simplifies this workflow by bringing important diagnostic capabilities into a single dashboard.

It helps answer questions such as:

- 🔎 Does the domain resolve correctly?
- 🌐 Which DNS records are published?
- ⏱️ What are the DNS TTL values and propagation results?
- 🛡️ Is DNSSEC detected?
- 📧 Are SPF, DKIM, and DMARC configured?
- 🔐 Is the website reachable over HTTPS?
- 🌍 Which public IP and geolocation information are associated with the domain?
- ❤️ Is the domain's overall health Healthy, Warning, or Critical?

The application is intentionally lightweight, making it suitable for developers, system administrators, network enthusiasts, and anyone who needs quick domain visibility without deploying a large monitoring platform.

---

## ✨ Features

### 🔎 1. Core DNS Diagnostics

Inspect essential DNS records and domain configuration.

- A record lookups
- AAAA record lookups
- NS (Name Server) inspection
- MX (Mail Exchange) analysis
- TXT record inspection
- PTR (Reverse DNS) lookups
- DMARC record detection
- Domain DNS configuration overview
- DNS record availability checks

### 🚀 2. Advanced DNS Intelligence

Go beyond basic DNS lookups with additional domain intelligence.

- 🌍 DNS propagation snapshot and TTL review
- 🔐 DNSSEC detection summary
- 📧 SPF record analysis
- 🔑 DKIM record checks
- 🛡️ DMARC evaluation
- 📊 Advanced DNS configuration reporting
- ⏱️ DNS TTL information
- 📋 Consolidated advanced DNS findings

### ❤️ 3. Domain Health & Reachability

Evaluate the availability and general health of a domain.

- HTTP and HTTPS reachability checks
- DNS record presence validation
- Reverse DNS status checks
- Website availability verification
- Domain health scoring
- Browser-friendly health summaries

**Health classifications:**

| Status | Description |
|---|---|
| 🟢 Healthy | Key diagnostic indicators are satisfactory |
| 🟡 Warning | Some configuration or availability concerns exist |
| 🔴 Critical | Important diagnostic checks have failed |

### 🔐 4. SSL/TLS Diagnostics

Inspect HTTPS connectivity and certificate information.

- HTTPS response status
- TLS protocol detection
- Cipher information
- SSL certificate issuer
- Certificate expiration dates
- Hostname validation
- Certificate subject details
- TLS connection diagnostics

### 🌍 5. Network & Geolocation Intelligence

Explore public network information associated with the system and domain.

- Public IPv4 detection
- Public IPv6 detection
- Local network interface detection
- Public IP geolocation
- Domain IP geolocation when available
- Network information summaries
- IP and geographic context

### 📊 6. Interactive Dashboard

A responsive interface designed to make diagnostics easier to navigate.

- Domain search and input validation
- DNS record type selector
- Dedicated DNS toolkit tabs
- Overview and summary cards
- Advanced DNS analysis panels
- SSL/TLS diagnostic panels
- Health status indicators
- Network and geolocation cards
- Detailed diagnostic information
- Consolidated full-report table
- Responsive desktop and mobile layout

---

## 🖥️ Dashboard Modules

| Module | Functionality |
|---|---|
| 📊 Overview | Domain and network summary |
| 🔎 DNS Lookup | A, AAAA, NS, MX, TXT and PTR records |
| 🔄 Reverse DNS | PTR record inspection |
| 📧 MX Lookup | Mail exchange analysis |
| 🌐 NS Lookup | Name server inspection |
| 🛡️ DMARC | DMARC record detection and evaluation |
| 🚀 Advanced DNS | Propagation, TTL, DNSSEC, SPF and DKIM |
| ❤️ Health | Domain health and reachability |
| 🔐 SSL/TLS | Certificate and connection diagnostics |
| 📋 Full Report | Consolidated diagnostic findings |

---

## 🏗️ Architecture

DNS Tool follows a simple, lightweight architecture that separates backend processing from frontend presentation.

### Backend

Built with Node.js and native modules.

- HTTP server
- DNS resolution
- Advanced DNS inspection
- HTTP/HTTPS health checks
- TLS certificate inspection
- Network information collection
- API request validation
- Request rate limiting
- JSON API responses

### Frontend

Built with standard web technologies.

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Responsive dashboard components
- Dynamic diagnostic rendering

### Core Node.js Modules

| Module | Purpose |
|---|---|
| `http` | HTTP server and requests |
| `https` | Secure HTTP connections |
| `dns` | DNS resolution |
| `tls` | TLS diagnostics |
| `fs` | File system operations |
| `path` | File path handling |
| `os` | Network interface information |

---

## 📂 Project Structure

```text
DNS-Tool/
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
│
├── package.json
├── server.js
├── README.md
└── .gitignore
```

### 📄 Key Files

| File | Description |
|---|---|
| `server.js` | HTTP server, DNS resolution, diagnostics, security and API endpoints |
| `public/index.html` | Dashboard layout and HTML structure |
| `public/app.js` | Frontend interactions, API communication and dynamic rendering |
| `public/styles.css` | Dashboard styling, cards, panels and responsive layout |
| `package.json` | Project metadata and npm scripts |
| `.gitignore` | Files and directories excluded from Git |

### 🔧 Backend — `server.js`

Responsible for:

- Starting the HTTP server
- Serving static frontend files
- Validating and normalizing domain input
- Resolving DNS records
- Performing advanced DNS analysis
- Checking DNSSEC, SPF, DKIM and DMARC
- Reviewing DNS propagation snapshots and TTL data
- Performing HTTP/HTTPS health checks
- Collecting public IP and geolocation metadata
- Inspecting SSL/TLS certificates
- Exposing JSON API endpoints
- Enforcing request limits and safer input handling

### 🎨 Frontend — `public/index.html`

Contains:

- Dashboard header and navigation
- Domain search interface
- DNS toolkit navigation
- Summary cards
- Diagnostic detail panels
- Advanced DNS sections
- SSL/TLS panels
- Network and geolocation information
- Full-report sections

### ⚡ Frontend Logic — `public/app.js`

Handles:

- Domain search and form interactions
- API requests
- Frontend state management
- Health status rendering
- DNS lookup results
- Advanced DNS information
- Diagnostic details
- Full-report generation

### 🎨 Styling — `public/styles.css`

Defines:

- Dashboard layout
- Cards and diagnostic panels
- Report grid formatting
- Status badges and indicators
- Responsive design
- Empty states and interface styling

---

## ⚙️ Requirements

Before running DNS Tool, make sure you have:

- **Node.js 18 or newer**
- npm package manager
- Internet connectivity for public IP and geolocation lookups
- A modern web browser

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/DNS-Tool.git
```

### 2. Navigate to the Project

```bash
cd DNS-Tool
```

### 3. Install Dependencies

```bash
npm install
```

The application primarily uses built-in Node.js modules, keeping the installation lightweight.

---

## ▶️ Running the Application

Start the server:

```bash
npm start
```

Open your browser and navigate to:

**http://localhost:3001**

> 💡 If port `3001` is already in use, the server automatically attempts to use the next available port.

### 🔧 Custom Port Configuration

DNS Tool supports custom port configuration through the `PORT` environment variable.

**Linux / macOS**

```bash
PORT=3002 npm start
```

**Windows PowerShell**

```powershell
$env:PORT=3002
npm start
```

The application will then use:

```text
http://localhost:3002
```

---

## 🔌 API Documentation

DNS Tool exposes JSON-based diagnostic endpoints through its lightweight HTTP backend.

All documented endpoints use the HTTP `GET` method.

### 🚀 1. Advanced DNS Intelligence

`GET /api/advanced`

Returns advanced DNS intelligence for the requested domain.

**Supported diagnostic information:**

- DNS propagation snapshot
- DNS TTL information
- DNSSEC detection summary
- SPF record analysis
- DKIM record checks
- DMARC detection and evaluation
- Advanced DNS configuration findings

**Query Parameters**

| Parameter | Description |
|---|---|
| `domain` | Target domain name |

**Example Request**

```bash
curl "http://localhost:3001/api/advanced?domain=example.com"
```

### 🔐 2. SSL/TLS Diagnostics

`GET /api/tls`

Returns SSL/TLS diagnostic information for the requested domain.

**Information returned:**

- HTTPS response status
- TLS protocol and cipher
- Certificate issuer
- Certificate expiration dates
- Hostname validation result
- Certificate subject details

**Example Request**

```bash
curl "http://localhost:3001/api/tls?domain=example.com"
```

### 📊 3. Domain Summary

`GET /api/summary`

Returns a combined overview of domain and network information.

**Information returned:**

- Public IP data
- Local IP information
- Geolocation context
- Active domain metadata
- DNS health information

**Example Request**

```bash
curl "http://localhost:3001/api/summary?domain=example.com"
```

### 🔎 4. DNS Record Lookup

`GET /api/lookup`

Retrieves DNS records for a specified domain and record type.

**Query Parameters**

| Parameter | Description |
|---|---|
| `domain` | Domain to inspect |
| `type` | Requested DNS record type |

**Supported record types:**

`A` · `AAAA` · `NS` · `MX` · `TXT` · `PTR`

**Example Request**

```bash
curl "http://localhost:3001/api/lookup?domain=example.com&type=A"
```

### ❤️ 5. Domain Health Check

`GET /api/health`

Returns the domain health model and diagnostic results.

**Information returned:**

- DNS record presence checks
- Website reachability
- Reverse DNS status
- Overall health grade
- Health score

**Example Request**

```bash
curl "http://localhost:3001/api/health?domain=example.com"
```

---

## 🛡️ Security & Hardening

Security is an important consideration because DNS Tool processes user-provided domains and performs outbound network requests.

The current implementation includes several protective measures:

- ✅ Domain validation before DNS operations
- ✅ Normalized hostname handling
- ✅ Rejection of unsupported and malformed inputs
- ✅ Request rate limiting
- ✅ Timeout handling for outbound DNS operations
- ✅ Guarded HTTP health checks
- ✅ Rejection of unsafe URLs and embedded credentials
- ✅ Structured API error responses
- ✅ Controlled handling of outbound requests

These measures help reduce misuse, improve reliability, and provide safer handling of user input.

---

## 🌐 External Services

DNS Tool uses public services to enrich network and geolocation information.

| Service | Purpose |
|---|---|
| [ipify IPv4 API](https://api.ipify.org?format=json) | Public IPv4 detection |
| [ipify IPv6 API](https://api64.ipify.org?format=json) | Public IPv6 detection |
| [ipapi](https://ipapi.co/) | IP geolocation metadata |

> **Note:** These services are external dependencies. Their availability and accuracy depend on the respective providers.

---

## 🗺️ Development Roadmap

The project is structured for continued development and expansion into a more comprehensive DNS diagnostics platform.

### ✅ Phase 1 — Backend Foundation & Security

**Implemented**

- [x] Domain input validation
- [x] Safe hostname handling
- [x] DNS caching and query timeouts
- [x] API error handling
- [x] Request rate limiting
- [x] Secure HTTP health checks

### ✅ Phase 2 — Advanced DNS Intelligence

**Implemented**

- [x] DNS propagation snapshot
- [x] DNS TTL review
- [x] DNSSEC detection summary
- [x] SPF record analysis
- [x] DKIM record checks
- [x] DMARC evaluation
- [x] Advanced DNS report data

### ✅ Phase 3 — SSL/TLS Diagnostics

**Implemented**

- [x] Certificate issuer inspection
- [x] Certificate expiration checks
- [x] Hostname validation
- [x] TLS connection diagnostics
- [x] HTTPS status verification

### 🚀 Phase 4 — Future Enhancements

**Planned**

- [ ] JSON and CSV report export
- [ ] Historical domain diagnostics
- [ ] Advanced DNS monitoring
- [ ] Enhanced health scoring
- [ ] Advanced report filtering
- [ ] Additional DNS record types
- [ ] Extended DNSSEC analysis
- [ ] Improved accessibility and UI experience

---

## 🧑‍💻 Development Workflow

DNS Tool is intentionally straightforward to maintain and extend.

1. Modify backend logic in `server.js`.
2. Update dashboard markup in `public/index.html`.
3. Customize interface styles in `public/styles.css`.
4. Update frontend functionality in `public/app.js`.
5. Start the application using `npm start`.
6. Validate the dashboard and API endpoints using a browser or `curl`.

---

## 🧰 Troubleshooting

<details>
<summary><strong>❌ The dashboard is blank or does not load</strong></summary>

Make sure the server is running:

```bash
npm start
```

Check whether the server responds:

```bash
curl -I http://localhost:3001
```

Also verify that the expected port is available.

</details>

<details>
<summary><strong>🔎 DNS records return empty results</strong></summary>

Possible causes:

- The domain is invalid or does not exist.
- The requested record type is not published.
- DNS propagation is incomplete.
- Your network blocks or filters DNS requests.

</details>

<details>
<summary><strong>🌍 Geolocation information is missing</strong></summary>

Geolocation information depends on external IP lookup services.

Missing information may indicate:

- An upstream service is unavailable.
- The network blocks external requests.
- The provider cannot identify the requested IP.

The application falls back to `N/A` values where possible.

</details>

<details>
<summary><strong>⚙️ Port 3001 is already in use</strong></summary>

Start the application using another port:

```bash
PORT=3002 npm start
```

</details>

---

## 🤝 Contributing

Contributions, bug reports, feature suggestions, and improvements are welcome!

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Implement your changes.
4. Test your modifications.
5. Submit a Pull Request.

For major changes, consider opening an issue first to discuss your proposal.

---

## 📜 License

This project is distributed under the **MIT License**.

See the `LICENSE` file for additional details.

---

## ⭐ Support the Project

If you find DNS Tool useful, consider supporting its development:

- ⭐ Star the repository.
- 🐛 Report bugs and issues.
- 💡 Suggest new features.
- 🔀 Submit improvements.
- 📢 Share the project with other developers.

Every contribution and suggestion is appreciated!

---

## 📌 Project Summary

**DNS Tool** is a practical, lightweight, and extensible domain diagnostics dashboard designed to simplify DNS and network troubleshooting.

It combines:

- 🔎 Core DNS record analysis
- 🚀 Advanced DNS intelligence
- 🛡️ DNSSEC and email security inspection
- ❤️ Domain health evaluation
- 🔐 SSL/TLS diagnostics
- 🌍 Public IP and geolocation information
- 📊 Interactive diagnostic reporting

Whether you're a developer, system administrator, or network enthusiast, DNS Tool provides a convenient way to inspect domains and understand their DNS configuration.

<p align="center">
  <strong>🌐 One Dashboard. Complete DNS Visibility. Smarter Diagnostics.</strong>
  <br /><br />
  <strong>Built with ❤️ using Node.js</strong>
  <br />
  <sub>DNS Tool — Advanced DNS & Network Diagnostics</sub>
  <br />
  <sub>Copy rights Artan V.</sub>
</p>