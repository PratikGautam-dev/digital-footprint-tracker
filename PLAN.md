# 🛡️ Digital Footprint Tracker — Full Project Plan

> **This document is written for Impana** — it explains the entire project, what's already done, what your job is, and where your code fits.

---

## 🧠 What Is This Project?

This is a **cybersecurity web application** that lets a user:

1. Paste a **URL** → it checks if the URL is malicious
2. Paste an **Email** → it checks if the email text is a phishing attempt
3. Upload a **File name** → it checks if the file looks like malware
4. Enter a **Username/Email** → it checks how exposed your identity is online
5. Enter a **Footprint** → it checks your overall online presence

The app gives back a **risk score (0–100)**, a **risk level (Low / Medium / High)**, a list of **reasons**, and **recommendations** on what to do.

---

## 👥 Team — Who Does What

| Person   | Role                                        | Folder                   |
|----------|---------------------------------------------|--------------------------|
| Pratik   | Backend + AI Engine + DB                    | /server + /ai-engine     |
| Aaryan   | Frontend (UI)                               | /client                  |
| Siddhant | Threat Detection (URL + File)               | /threat-detection        |
| Impana   | Identity & Privacy (Email + Identity)       | /identity-privacy        |

> You are Impana. Your folder is /identity-privacy.

---

## 🔧 Tech Stack — What Technologies Are Used

### Frontend (/client)
| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework for the web pages |
| React 18 | UI components |
| TailwindCSS | Styling |
| Axios | Makes HTTP requests to the backend |

### Backend (/server)
| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web server / API framework |
| Mongoose | MongoDB database connector |
| dotenv | Reads .env files (secret keys) |
| CORS | Allows frontend to talk to backend |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud database (stores all scan results) |

### AI Engine (/ai-engine)
| Technology | Purpose |
|-----------|---------|
| Pure JavaScript | No ML library — calculates risk scores from patterns |

### Your Module (/identity-privacy)
| Technology | Purpose |
|-----------|---------|
| Node.js + CommonJS | Pure JS logic, no framework |
| Axios | To call the LeakCheck API (data breach lookup) |
| LeakCheck API | External service to check if email/username is in a data breach |

---

## 🌊 How The Whole App Flows (Step by Step)

User types something (URL / email / username / file) into the website
         |
[FRONTEND — Aaryan] sends it to the backend via HTTP POST request
         |
[BACKEND API — Pratik] receives the request in scanRoutes.js -> scanController.js
         |
[BACKEND SERVICE — Pratik] calls the right scanner function based on input type
         |
         |--- If URL      -> calls scanURL()      from /threat-detection/urlScanner.js
         |--- If File     -> calls scanFile()     from /threat-detection/fileScanner.js
         |--- If Email    -> calls scanEmail()    from /identity-privacy/emailScanner.js   <- YOUR CODE
         |--- If Identity -> calls scanIdentity() from /identity-privacy/identityScanner.js <- YOUR CODE
         |
[AI ENGINE — Pratik] takes your output -> calculates final risk score, level, recommendations
         |
[DATABASE — Pratik] saves the result to MongoDB Atlas
         |
[BACKEND] sends JSON response back to frontend
         |
[FRONTEND — Aaryan] displays the result card to the user

---

## 📁 Full Folder Structure (What Each File Does)

major/
|
|-- client/                        <- Aaryan's frontend (Next.js)
|   |-- app/
|   |   |-- page.jsx               <- Home page
|   |   |-- scan/
|   |   |   |-- email/             <- Email scan page
|   |   |   |-- url/               <- URL scan page
|   |   |   |-- file/              <- File scan page
|   |   |   |-- identity/          <- Identity scan page
|   |   |   |-- footprint/         <- Footprint scan page
|   |   |-- dashboard/             <- Results dashboard
|   |-- components/
|   |   |-- Navbar.jsx
|   |   |-- ResultCard.jsx
|   |   |-- RiskBadge.jsx
|   |   |-- ReasonsList.jsx
|   |   |-- RecommendationsList.jsx
|   |-- .env                       <- Frontend env file (currently EMPTY - leave it)
|
|-- server/                        <- Pratik's backend (Express.js)
|   |-- index.js                   <- Server entry point, starts on PORT 5000
|   |-- config/
|   |   |-- db.js                  <- Connects to MongoDB using MONGO_URI
|   |-- routes/
|   |   |-- scanRoutes.js          <- Defines API endpoints
|   |-- controllers/
|   |   |-- scanController.js      <- Handles incoming requests
|   |-- services/
|   |   |-- scanService.js         <- Calls scanner functions, saves to DB
|   |-- models/
|   |   |-- ScanResult.js          <- MongoDB schema for storing results
|   |-- .env                       <- THIS IS WHERE ALL THE KEYS GO (see below)
|
|-- ai-engine/                     <- Pratik's AI scoring logic
|   |-- riskModel.js               <- Takes scanner output -> returns risk score + recommendations
|
|-- threat-detection/              <- Siddhant's module (URL + File scanners)
|   |-- urlScanner.js
|   |-- fileScanner.js
|
|-- identity-privacy/              <- ⭐ YOUR MODULE (Impana)
|   |-- emailScanner.js            <- DONE — detects phishing emails
|   |-- identityScanner.js         <- DONE — checks username/email exposure
|   |-- test.js                    <- Your local testing file
|
|-- footprint/
|   |-- footprintScanner.js        <- Overall footprint scanner
|
|-- general_instructions.md        <- Team rules and guidelines

---

## 🔑 Environment Variables — Where Does What Go?

This is the KEY answer to your question. Here's the clear breakdown:

### The keys you shared:
```
VIRUSTOTAL_API_KEY=f1bf8743fcb6d17eb44ad7f128f39f901a0504146b2a74f98b193b3e34b0ed25
LEAK_CHECK_API_KEY=d27b1e68fdcfd74a75255319fca88839a02d7a4f
PORT=5000
MONGO_URI=mongodb+srv://PratikGautam:Pratik76318@cluster0.kqw6zqn.mongodb.net/
```

### Where each one goes:

| Variable | Goes In | Why |
|----------|---------|-----|
| VIRUSTOTAL_API_KEY | /server/.env | Used by Siddhant's URL/file scanner, called from backend |
| LEAK_CHECK_API_KEY | /server/.env | Used when calling LeakCheck API from backend |
| PORT | /server/.env | Tells the Express server which port to run on |
| MONGO_URI | /server/.env | Connects the backend to MongoDB Atlas database |

### IMPORTANT:
The .env file you currently have open is client/.env — that one stays EMPTY.
All the keys above go into /server/.env — that is Pratik's file, not yours.

### What Pratik needs to create at /server/.env:
```
VIRUSTOTAL_API_KEY=f1bf8743fcb6d17eb44ad7f128f39f901a0504146b2a74f98b193b3e34b0ed25
LEAK_CHECK_API_KEY=d27b1e68fdcfd74a75255319fca88839a02d7a4f
PORT=5000
MONGO_URI=mongodb+srv://PratikGautam:Pratik76318@cluster0.kqw6zqn.mongodb.net/
```
Note: Remove all spaces from the key values (they were just line breaks from copy-pasting).

---

## ✅ What Is DONE vs ❌ What Is NOT Done

### Overall Progress: ~65% Done

### Pratik's Work (Backend + AI) — ~80% Done
| What | Status |
|------|--------|
| Express server setup | Done |
| MongoDB connection (db.js) | Done |
| ScanResult database model | Done |
| All API routes defined | Done |
| All controllers written | Done |
| scanService.js (orchestration) | Done |
| AI risk model (riskModel.js) | Done |
| Server .env file | NOT CREATED YET (needs to be created with the keys above) |

### Aaryan's Work (Frontend) — ~70% Done
| What | Status |
|------|--------|
| Next.js project setup | Done |
| Page routes created | Done (scan/email, scan/url, scan/file, etc.) |
| UI Components | Done (Navbar, ResultCard, RiskBadge, etc.) |
| API calls to backend | Likely done but untested end-to-end |

### YOUR Work — Impana (Identity & Privacy) — ~90% Done
| What | Status |
|------|--------|
| emailScanner.js — Urgency detection | Done |
| emailScanner.js — Phishing link detection | Done |
| emailScanner.js — Suspicious sender detection | Done |
| emailScanner.js — Sensitive info detection | Done |
| emailScanner.js — Poor formatting detection | Done |
| emailScanner.js — LeakCheck API integration | Done |
| identityScanner.js — Username pattern analysis | Done |
| identityScanner.js — Email domain analysis | Done |
| identityScanner.js — Simulated platform exposure | Done |
| identityScanner.js — Breach detection (LeakCheck) | Done |
| test.js — Local testing | Exists (run it to verify) |
| Output format matches contract | CHECK NEEDED (see issue below) |

### Siddhant's Work (Threat Detection) — ~90% Done
| What | Status |
|------|--------|
| urlScanner.js | Exists |
| fileScanner.js | Exists |
| VirusTotal API integration | Likely done |

---

## 🚨 One Issue In Your Code You Need To Fix

Your files use CommonJS exports:
```js
// Your current code (CommonJS):
module.exports = { scanEmail }
```

But Pratik's server imports using ES Module style:
```js
// How the server imports your code:
import emailScanner from '../../identity-privacy/emailScanner.js';
const { scanEmail } = emailScanner;
```

This mismatch WILL cause an import error when Pratik's server tries to use your code.

Fix Option: Add a default export at the bottom of your files:
```js
// Add this at the end of emailScanner.js
module.exports = { scanEmail };
module.exports.default = { scanEmail };
```

Or talk to Pratik — he may adjust how he imports your code. Either way, you both need to agree.

---

## 🏃 How To Run Everything Locally

### Start the Backend (Pratik runs this — needs the .env first):
```bash
cd /Users/impana/Documents/projects/major/server
npm start
# Server runs at http://localhost:5000
```

### Start the Frontend (Aaryan runs this):
```bash
cd /Users/impana/Documents/projects/major/client
npm run dev
# Frontend runs at http://localhost:3000
```

### Test Your Code (You run this):
```bash
cd /Users/impana/Documents/projects/major/identity-privacy
node test.js
```

---

## 📡 API Endpoints (For Reference)

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | /api/scan/url | Scans a URL |
| POST | /api/scan/email | Scans email text → calls YOUR scanEmail() |
| POST | /api/scan/file | Scans a file name |
| POST | /api/scan/identity | Scans a username/email → calls YOUR scanIdentity() |
| POST | /api/scan/footprint | Scans digital footprint |
| GET | /api/results | Gets all past scan results |
| GET | /api/stats | Gets risk statistics |

---

## 📋 YOUR Checklist (Impana) — What You Still Need To Do

- [x] emailScanner.js — phishing detection logic written
- [x] identityScanner.js — identity exposure logic written
- [x] LeakCheck API integration in both files
- [ ] Run `node test.js` and verify all test cases pass
- [ ] Verify output format — both functions must return EXACTLY:
      { score: number, reasons: [], metadata: {} }
- [ ] Talk to Pratik about the CommonJS vs ES Module import issue
- [ ] Do NOT put the .env keys in your folder — those go in /server/.env (Pratik's job)
- [ ] Push your final code to branch: feature/identity-privacy

---

## 🔗 Quick Summary For Impana

1. You are Impana — your job is /identity-privacy folder only
2. Your code is ~90% done — emailScanner.js and identityScanner.js are written and look solid
3. The .env keys (LEAK_CHECK_API_KEY etc.) go in /server/.env — NOT in your folder
4. Your output format must match { score, reasons, metadata } exactly
5. One small thing to fix — CommonJS vs ES Module export format (talk to Pratik)
6. Test your code with node test.js before pushing

> Questions? Per team rules, all integration questions go to Pratik.
