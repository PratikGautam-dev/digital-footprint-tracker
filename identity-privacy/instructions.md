# Identity & Privacy Security Module — Impana

## Your Role
You are responsible for two security scanners — the Email Scanner
and the Identity Scanner. Your job is to write pure logic functions
that analyze input and return a structured risk result.

You do NOT connect to any database.
You do NOT build any API.
You do NOT touch the frontend.
You just write smart, clean functions and export them.

---

## Your Assigned Folder
- /security/identity-privacy

---

## Your Branch
feature/identity-privacy

---

## Files You Must Create

security/identity-privacy/
├── emailScanner.js
├── identityScanner.js
└── test.js               → your local testing file

---

## Getting Started

Inside /security/identity-privacy run:
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

## FILE 1 — emailScanner.js

### What This File Does
Analyzes email text and detects signs of phishing or social
engineering attempts. Returns a risk score with reasons.

---

### Function to Export
scanEmail(emailText)

- Input  → a string containing the full email content
- Output → { score, reasons, metadata }

---

### Detection Logic You Must Implement

#### 1. Urgency Language Detection
Scan for words and phrases like:
- "urgent", "immediately", "act now", "limited time"
- "your account will be suspended", "verify now"
- "within 24 hours", "expire", "final notice"

If found → add to reasons, increase score

#### 2. Phishing Link Patterns
Scan for suspicious link patterns like:
- URLs containing "login", "verify", "secure", "update"
- URLs that look like they mimic real sites
  (example: paypa1.com, arnazon.com)
- HTTP links instead of HTTPS

If found → add to reasons, increase score

#### 3. Suspicious Sender Patterns
Scan for patterns like:
- Email addresses with random numbers
  (example: support12345@gmail.com)
- Mismatched sender names and domains
- Free email domains pretending to be companies
  (example: apple-support@gmail.com)

If found → add to reasons, increase score

#### 4. Sensitive Information Requests
Scan for requests asking for:
- Password, OTP, PIN, CVV
- Bank account, credit card details
- Social security, Aadhaar number
- "Click here to confirm your details"

If found → add to reasons, increase score significantly

#### 5. Poor Grammar and Formatting Signals
Scan for:
- Excessive capitalization (ALL CAPS words)
- Excessive exclamation marks (!!!)
- Misspellings of common words

If found → add to reasons, increase score slightly

---

### Scoring Guide for emailScanner

Start at 0 and add points per detection:
- Each urgency phrase found      → +10 points
- Each phishing link pattern     → +20 points
- Each suspicious sender pattern → +15 points
- Each sensitive info request    → +25 points
- Grammar/formatting signals     → +5 points
- Cap the final score at 100

---

### metadata for emailScanner
Return these fields in metadata:

{
  urgencyWordsFound: [],
  phishingLinksFound: [],
  sensitiveKeywordsFound: [],
  totalIndicators: 0
}

---

### Example Output from scanEmail

Input: "URGENT: Your account will be suspended. 
        Click here to verify your password immediately."

Output:
{
  score: 75,
  reasons: [
    "Urgency language detected: urgent, immediately",
    "Sensitive information requested: password",
    "Suspicious call to action: verify"
  ],
  metadata: {
    urgencyWordsFound: ["urgent", "immediately"],
    phishingLinksFound: [],
    sensitiveKeywordsFound: ["password", "verify"],
    totalIndicators: 3
  }
}

---

## FILE 2 — identityScanner.js

### What This File Does
Simulates a digital footprint scan for a given username or email.
Checks for platform exposure and estimates how much of the user's
identity is publicly visible online.

NOTE: This is a simulated scanner. You do not make real API calls
to external platforms. You simulate the logic intelligently using
pattern matching and a predefined platform list.

---

### Function to Export
scanIdentity(input)

- Input  → a string (username or email address)
- Output → { score, reasons, metadata }

---

### Detection Logic You Must Implement

#### 1. Username Pattern Analysis
Analyze the username for risk indicators:
- Very common usernames (john, admin, user, test) → higher exposure risk
- Usernames containing real names → moderate exposure risk
- Usernames with numbers that look like birth years
  (example: john1999, priya2001) → higher exposure risk
- Random character usernames → lower exposure risk

#### 2. Email Domain Analysis (if input is an email)
- Free domains (gmail, yahoo, hotmail) → moderate risk
- Custom domains → lower risk
- Disposable email domains
  (example: tempmail, mailinator) → flag as suspicious

#### 3. Simulated Platform Exposure
Simulate checking these platforms:
- Social: Instagram, Twitter/X, Facebook, LinkedIn, Reddit
- Gaming: Steam, Xbox, PlayStation
- Professional: GitHub, Behance, Dribbble
- Shopping: Amazon, Flipkart

Simulate exposure by checking if the username pattern
matches common account naming conventions on each platform.
Return which platforms the user is likely exposed on.

#### 4. Data Breach Simulation
Simulate whether the email or username appears in a known
data breach by checking against a small hardcoded list of
commonly breached usernames:
- admin, user, test, guest, john, password, 123456

If the input matches or is similar → flag as breached

#### 5. Exposure Level Classification
Based on number of platforms detected:
- 0-2 platforms  → Low exposure
- 3-5 platforms  → Medium exposure
- 6+ platforms   → High exposure

---

### Scoring Guide for identityScanner

Start at 0 and add points per detection:
- Common/risky username pattern  → +20 points
- Birth year in username         → +15 points
- Free email domain              → +10 points
- Each platform exposure found   → +8 points
- Simulated data breach match    → +30 points
- Cap the final score at 100

---

### metadata for identityScanner
Return these fields in metadata:

{
  exposedPlatforms: [],
  exposureLevel: "Low / Medium / High",
  breachDetected: true/false,
  usernameRiskFlags: []
}

---

### Example Output from scanIdentity

Input: "john1999"

Output:
{
  score: 71,
  reasons: [
    "Common username pattern detected",
    "Birth year found in username — increases traceability",
    "Likely exposed on Instagram, GitHub, Reddit",
    "Username matches commonly breached credentials"
  ],
  metadata: {
    exposedPlatforms: ["Instagram", "GitHub", "Reddit"],
    exposureLevel: "Medium",
    breachDetected: true,
    usernameRiskFlags: ["common name", "birth year detected"]
  }
}

---

## FILE 3 — test.js (Your Local Testing File)

Create this file to test both your scanners before submitting.
This file is just for your own testing — it does not go into
the main application.

Write test cases like:
- scanEmail with a clearly phishing email → expect high score
- scanEmail with a normal email → expect low score
- scanIdentity with "admin" → expect high score
- scanIdentity with a random string → expect low score

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

import { scanEmail } from '../security/identity-privacy/emailScanner.js'
import { scanIdentity } from '../security/identity-privacy/identityScanner.js'

He will pass input to your function and expect the exact output
contract format. Make sure your exports are clean and correct.

---

## Checklist Before Raising Pull Request

- [ ] emailScanner.js exports scanEmail function correctly
- [ ] identityScanner.js exports scanIdentity function correctly
- [ ] Both functions return { score, reasons, metadata }
- [ ] score is always a number between 0 and 100
- [ ] reasons is always an array of strings
- [ ] metadata contains the correct fields
- [ ] test.js runs without errors
- [ ] Tested with multiple inputs including edge cases
- [ ] No hardcoded values that break with unexpected input

---

## Questions?

All questions go to Pratik.
Do not make assumptions about the output format.
If something is unclear, ask Pratik before writing code.