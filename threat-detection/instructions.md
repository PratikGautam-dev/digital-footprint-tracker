# Threat Detection Security Module — Siddhant

## Your Role
You are responsible for two security scanners — the URL Scanner
and the File Scanner. Your job is to write pure logic functions
that analyze input and return a structured risk result.

You do NOT connect to any database.
You do NOT build any API.
You do NOT touch the frontend.
You just write smart, clean functions and export them.

---

## Your Assigned Folder
- /security/threat-detection

---

## Your Branch
feature/threat-detection

---

## Files You Must Create

security/threat-detection/
├── urlScanner.js
├── fileScanner.js
└── test.js               → your local testing file

---

## Getting Started

Inside /security/threat-detection run:
npm init -y

No external packages are needed.
Both scanners use only pure JavaScript logic.

---

## THE OUTPUT CONTRACT (Most Important Thing in This File)

Every function you write MUST return exactly this structure.
This is non-negotiable. Pratik's AI engine consumes this directly.
If your format is different, the entire integration breaks.

{
  score: 0-100,
  reasons: [],
  metadata: {}
}

- score    → a number between 0 and 100 representing risk level
- reasons  → an array of strings explaining what was detected
- metadata → an object with extra details specific to your scanner

---

## FILE 1 — urlScanner.js

### What This File Does
Analyzes a URL string and detects signs of malicious intent,
phishing attempts, or suspicious patterns.
Returns a risk score with reasons.

---

### Function to Export
scanURL(url)

- Input  → a string containing the URL to analyze
- Output → { score, reasons, metadata }

---

### Detection Logic You Must Implement

#### 1. HTTPS Check
Check whether the URL uses HTTPS or HTTP:
- HTTP (not secure) → add to reasons, increase score
- HTTPS → no penalty

#### 2. Suspicious Keyword Detection
Scan the URL for suspicious words commonly found in
phishing or malicious URLs:
- "login", "signin", "verify", "secure", "update"
- "account", "banking", "confirm", "password"
- "free", "winner", "prize", "click", "lucky"
- "paypal", "amazon", "google", "apple", "microsoft"
  (when used in suspicious context — not the real domain)

If found → add to reasons, increase score

#### 3. Domain Spoofing Detection
Check for domains that try to mimic real websites:
- Domains with extra words added
  (example: paypal-secure.com, amazon-login.net)
- Domains with character substitutions
  (example: paypa1.com, arnazon.com, g00gle.com)
- Domains using hyphens to fake legitimacy
  (example: apple-support-helpline.com)

If found → add to reasons, increase score significantly

#### 4. Suspicious TLD Detection
Flag URLs with high-risk top level domains:
- .tk, .ml, .ga, .cf, .gq → very high risk (free domains)
- .xyz, .top, .click, .loan, .win → high risk
- .info, .biz → moderate risk

If found → add to reasons, increase score

#### 5. URL Length and Complexity Check
Analyze the structure of the URL:
- Very long URLs (over 100 characters) → suspicious
- Excessive subdomains
  (example: login.verify.secure.paypal.com.tk) → very suspicious
- IP address used instead of domain name
  (example: http://192.168.1.1/login) → high risk
- Excessive special characters (@, %, =, &) → suspicious

If found → add to reasons, increase score

#### 6. Path and Parameter Analysis
Check the URL path and query parameters:
- Paths containing "admin", "wp-admin", "login", "passwd"
- Query parameters with encoded characters (%20, %2F)
- Redirect parameters (url=, redirect=, next=, return=)

If found → add to reasons, increase score

---

### Scoring Guide for urlScanner

Start at 0 and add points per detection:
- HTTP instead of HTTPS              → +15 points
- Each suspicious keyword found      → +10 points
- Domain spoofing detected           → +30 points
- Suspicious TLD (.tk, .ml etc)      → +25 points
- Very long URL (100+ chars)         → +10 points
- IP address used as domain          → +30 points
- Excessive subdomains               → +20 points
- Redirect parameter found           → +15 points
- Cap the final score at 100

---

### metadata for urlScanner
Return these fields in metadata:

{
  protocol: "http / https",
  domain: "extracted domain",
  suspiciousKeywordsFound: [],
  tldRiskLevel: "Low / Medium / High",
  isIPAddress: true/false,
  urlLength: 0
}

---

### Example Output from scanURL

Input: "http://paypa1-secure-login.tk/verify?redirect=account"

Output:
{
  score: 95,
  reasons: [
    "URL uses HTTP — not secure",
    "Domain appears to spoof PayPal",
    "High risk TLD detected: .tk",
    "Suspicious keywords found: secure, login, verify",
    "Redirect parameter detected in URL"
  ],
  metadata: {
    protocol: "http",
    domain: "paypa1-secure-login.tk",
    suspiciousKeywordsFound: ["secure", "login", "verify"],
    tldRiskLevel: "High",
    isIPAddress: false,
    urlLength: 52
  }
}

---

## FILE 2 — fileScanner.js

### What This File Does
Analyzes a filename and detects signs of malicious or
dangerous files based on extension patterns and naming
conventions used in malware.
Returns a risk score with reasons.

NOTE: You are analyzing the filename only — not the actual
file contents. This is intentional and sufficient for this
level of threat detection.

---

### Function to Export
scanFile(filename)

- Input  → a string containing the filename
  (example: "invoice.pdf.exe" or "report.docx")
- Output → { score, reasons, metadata }

---

### Detection Logic You Must Implement

#### 1. Dangerous Extension Detection
Check if the file has a high-risk extension:

Very High Risk (executables and scripts):
- .exe, .bat, .cmd, .com, .scr, .pif
- .vbs, .vbe, .js, .jse, .wsf, .wsh
- .ps1, .psm1 (PowerShell)
- .msi, .msp (installers)

High Risk:
- .jar, .py, .rb, .sh (scripts)
- .dll, .sys (system files)
- .reg (registry files)

Moderate Risk:
- .zip, .rar, .7z, .tar, .gz (archives — can hide malware)
- .iso, .img (disk images)

If found → add to reasons, increase score accordingly

#### 2. Double Extension Detection
This is one of the most common malware tricks.
Detect filenames with two extensions:
- invoice.pdf.exe
- image.jpg.bat
- document.docx.vbs
- report.txt.ps1

The real extension is the last one — the first is fake
and designed to trick the user into thinking it is safe.

If found → add to reasons, increase score significantly

#### 3. Misleading Filename Detection
Detect filenames designed to look innocent:
- Filenames pretending to be system files
  (example: svchost.exe, explorer.exe, winlogon.bat)
- Filenames with excessive spaces to hide extension
  (example: "invoice.pdf                    .exe")
- Filenames using Unicode lookalike characters

If found → add to reasons, increase score

#### 4. Social Engineering Name Detection
Detect filenames designed to trick users into opening them:
- Names suggesting urgency or importance:
  "urgent", "invoice", "payment", "salary", "offer"
  "final", "important", "confidential", "bank"
- Names pretending to be software:
  "setup", "install", "update", "crack", "keygen", "patch"
- Names pretending to be media:
  "video", "photo", "image" combined with executable extension

If found → add to reasons, increase score

#### 5. Extension and Name Mismatch
Detect cases where the name suggests one file type
but the extension says another:
- "photo.exe" → name says photo, extension is executable
- "video.bat" → name says video, extension is script
- "invoice.scr" → name says document, extension is screensaver

If found → add to reasons, increase score

---

### Scoring Guide for fileScanner

Start at 0 and add points per detection:
- Very high risk extension (.exe, .bat etc)  → +40 points
- High risk extension (.jar, .dll etc)       → +25 points
- Moderate risk extension (.zip, .iso)       → +10 points
- Double extension detected                  → +35 points
- Misleading system filename                 → +20 points
- Social engineering name detected           → +15 points
- Extension and name mismatch               → +20 points
- Cap the final score at 100

---

### metadata for fileScanner
Return these fields in metadata:

{
  originalFilename: "",
  detectedExtension: "",
  isDoubleExtension: true/false,
  fakeExtension: "",
  realExtension: "",
  extensionRiskLevel: "Low / Medium / High / Very High"
}

---

### Example Output from scanFile

Input: "invoice.pdf.exe"

Output:
{
  score: 90,
  reasons: [
    "Double extension detected — real extension is .exe",
    "Executable file disguised as PDF",
    "Very high risk extension: .exe",
    "Social engineering filename: invoice"
  ],
  metadata: {
    originalFilename: "invoice.pdf.exe",
    detectedExtension: ".exe",
    isDoubleExtension: true,
    fakeExtension: ".pdf",
    realExtension: ".exe",
    extensionRiskLevel: "Very High"
  }
}

---

## FILE 3 — test.js (Your Local Testing File)

Create this file to test both your scanners before submitting.
This file is just for your own testing — it does not go into
the main application.

Write test cases like:
- scanURL with an obvious phishing URL → expect high score
- scanURL with https://google.com → expect low score
- scanFile with "invoice.pdf.exe" → expect high score
- scanFile with "report.docx" → expect low score

Run it with:
node test.js

---

## What You Must NOT Do

- Do not connect to any database
- Do not write any Express routes or APIs
- Do not install unnecessary packages
- Do not touch /server, /client, /ai-engine folders
- Do not change the output format — it will break integration
- Do not push to main directly

---

## How Pratik Uses Your Code

Once you are done, Pratik will import your functions like this:

import { scanURL } from '../security/threat-detection/urlScanner.js'
import { scanFile } from '../security/threat-detection/fileScanner.js'

He will pass input to your function and expect the exact output
contract format. Make sure your exports are clean and correct.

---

## Checklist Before Raising Pull Request

- [ ] urlScanner.js exports scanURL function correctly
- [ ] fileScanner.js exports scanFile function correctly
- [ ] Both functions return { score, reasons, metadata }
- [ ] score is always a number between 0 and 100
- [ ] reasons is always an array of strings
- [ ] metadata contains the correct fields
- [ ] test.js runs without errors
- [ ] Tested with multiple inputs including edge cases
- [ ] Tested with clean inputs that should return low scores
- [ ] No hardcoded values that break with unexpected input

---

## Questions?

All questions go to Pratik.
Do not make assumptions about the output format.
If something is unclear, ask Pratik before writing code.