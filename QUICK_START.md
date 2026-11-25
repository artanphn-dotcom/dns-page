# DNS Tool - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ (download from https://nodejs.org)
- npm (comes with Node.js)
- A terminal/command prompt

### Installation

```bash
# Navigate to the DNS Tool directory
cd "C:\Users\ArtanV\Desktop\DNS Tool"

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

The server will start on **http://localhost:3002**

### Stopping the Server
Press `Ctrl + C` in the terminal to stop.

---

## 📋 Features

### Quick Commands (MXToolbox-style)
Select from 13 DNS record types organized by category:

**Most Common:**
- **A** - IPv4 address lookup
- **AAAA** - IPv6 address lookup
- **MX** - Mail server lookup
- **TXT** - Text record lookup

**DNS Records:**
- **CNAME** - Canonical name lookup
- **NS** - Nameserver lookup
- **PTR** - Reverse DNS lookup
- **SOA** - Start of Authority lookup
- **SRV** - Service record lookup
- **CAA** - Certificate Authority lookup

**Email & Security:**
- **SPF** - Sender Policy Framework lookup
- **DKIM** - DomainKeys Identified Mail lookup
- **DMARC** - Domain-based Message Authentication lookup

### How to Use

1. **Enter a domain** in the search box at the top
2. **Select a record type** from the Quick Commands dropdown
3. **View results** immediately in the Quick Lookup Results panel
4. **Explore more** data in the Summary, Diagnostic Detail, and Full Report panels

---

## ✅ Verification

Run the test suite to verify everything works:

```bash
npm test
```

You should see:
```
Tests passed: 19/19
✓ All tests passed!
```

---

## 🎨 Dashboard Layout

The dashboard contains 9 full-width panels:

1. **Search Panel** - Domain input and lookup
2. **Quick Commands** - MXToolbox-style command selector
3. **Quick Lookup Results** - Selected record type results
4. **Summary** - IP address and basic info
5. **Diagnostic Detail** - Detailed DNS information
6. **Full Report** - Complete DNS records report
7. **TLS Certificate** - HTTPS certificate info
8. **DNS Health Check** - Nameserver validation
9. **Geolocation** - IP geolocation data

---

## 🔍 Example Lookups

### Lookup A Record for google.com
1. Type `google.com` in the search box
2. Select **A Record Lookup** from Quick Commands
3. See the IPv4 address(es) for google.com

### Lookup MX Records for gmail.com
1. Type `gmail.com` in the search box
2. Select **MX Record Lookup (Email)** from Quick Commands
3. See all mail servers for gmail.com

### Lookup TXT Records for github.com
1. Type `github.com` in the search box
2. Select **TXT Record Lookup** from Quick Commands
3. See all TXT records including SPF, DMARC, etc.

---

## 📊 Understanding the Results

### Status Colors
- **Blue Info** - Request in progress or general information
- **Green Success** - Valid records found
- **Yellow Warning** - Records found with issues
- **Red Error** - Lookup failed or records not found

### Record Format
Each record displays:
- **Record Type** - Type of DNS record (A, MX, TXT, etc.)
- **Value** - The record value or IP address
- **TTL** - Time to Live in seconds (if available)

### TXT Records
TXT records (SPF, DKIM, DMARC) are displayed one-per-line for readability.

---

## 🛠️ Technical Details

### Stack
- **Backend**: Node.js HTTP server
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **DNS**: Node.js built-in `dns` module
- **TLS**: Node.js built-in `tls` module

### API Endpoints

#### Lookup DNS Records
```
GET /api/lookup?domain=example.com&recordType=A
```

**Parameters:**
- `domain` - Domain to lookup (required)
- `recordType` - DNS record type (required)

**Response:**
```json
{
  "success": true,
  "data": ["93.184.216.34"],
  "recordType": "A",
  "domain": "example.com"
}
```

#### Validate Domain
```
GET /api/validate?domain=example.com
```

**Response:**
```json
{
  "valid": true,
  "domain": "example.com",
  "errors": []
}
```

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
Solution: Run `npm install` to install dependencies.

### "Port 3002 is already in use"
Solution: The server automatically tries ports 3002-3009. Check which port was used in the console output.

### "Lookup failed: ENOTFOUND"
Solution: The domain doesn't exist or isn't resolvable. Check the domain name and try again.

### Tests failing
Solution: Run `npm test` to identify which validation tests are failing.

---

## 📚 Documentation

- **README.md** - Full project documentation
- **IMPROVEMENTS_LOG.md** - Latest improvements and changes
- **LATEST_CHANGES.md** - Implementation details
- **SESSION_SUMMARY.md** - Previous session summary
- **FULLWIDTH_PANEL_FIX.md** - Panel styling details

---

## 💡 Tips

1. **Keyboard Shortcuts**: Tab through the form and press Enter to submit
2. **Copy Results**: Select and copy any record value from the results
3. **Multiple Lookups**: Switch record types quickly with the dropdown
4. **Full Report**: Check the Full Report panel for all DNS records at once
5. **TLS Info**: The TLS Certificate panel shows HTTPS security details

---

## 🚨 Need Help?

1. Check the README.md for comprehensive documentation
2. Run `npm test` to verify your setup
3. Check browser console (F12) for any errors
4. Review server output in the terminal for API errors

---

## 📝 License & Attribution

This DNS Tool was built with Node.js and enhanced for better UX and reliability.

**Last Updated**: Session 2 - Full-Width Panel Fix
**Status**: ✅ Production Ready
