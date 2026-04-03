# Backend + AI Engine + Database — Pratik

## Your Role
You are the integration owner of this project. Every module connects 
through you. Your job is to build the server, the AI engine, the 
database, and wire everything together.

---

## Your Assigned Folders
- /server
- /ai-engine

---

## Your Branch
feature/backend-ai

---

## What You Are Building

### 1. Express Server
The main Node.js + Express server that receives all API requests
from the frontend and coordinates the response.

### 2. Four API Endpoints
You must create these four routes:

POST /api/scan-url       → receives a URL, scans it, returns risk result
POST /api/scan-email     → receives email text, scans it, returns risk result
POST /api/scan-file      → receives filename, scans it, returns risk result
POST /api/scan-identity  → receives username/email, returns exposure result

### 3. AI Engine
The brain of the system. Takes raw scanner output and produces
a final risk score, risk level, explanation, and recommendations.

### 4. MongoDB Database
Stores every scan result using a Mongoose schema.

---

## Folder Structure You Must Create

server/
├── routes/
│   └── scanRoutes.js
├── controllers/
│   └── scanController.js
├── services/
│   └── scanService.js
├── models/
│   └── ScanResult.js
├── config/
│   └── db.js
└── index.js

ai-engine/
└── riskModel.js

---

## File by File — What Each File Does

### server/index.js
- Initialize Express app
- Connect to MongoDB
- Register all routes
- Start server on port 5000

### server/config/db.js
- Connect to MongoDB Atlas using mongoose
- Read connection string from .env file
- Export the connection function

### server/models/ScanResult.js
- Mongoose schema with these fields:
  - inputType   (String) → "url", "email", "file", "identity"
  - inputValue  (String) → the actual input from user
  - riskScore   (Number) → 0 to 100
  - riskLevel   (String) → "Low", "Medium", "High"
  - reasons     (Array)  → array of strings
  - recommendations (Array) → array of strings
  - timestamp   (Date)   → defaults to current date

### server/routes/scanRoutes.js
- Define all four POST routes
- Each route calls the corresponding controller function
- No logic here, only route definitions

### server/controllers/scanController.js
- One controller function per route
- Receives request, extracts input
- Calls the service layer
- Sends back the response
- No business logic here

### server/services/scanService.js
- The actual logic layer
- Imports security modules from /security
- Imports AI engine from /ai-engine
- Calls scanner → calls AI engine → saves to DB → returns result

### ai-engine/riskModel.js
- Single function: getRiskScore(scannerOutput)
- Takes the output from any scanner
- Applies weighted scoring
- Returns:
  {
    riskScore: 0-100,
    riskLevel: "Low" / "Medium" / "High",
    explanation: "string explaining the risk",
    recommendations: ["array", "of", "strings"]
  }

---

## The Output Contract (What You Expect From Security Teammates)

Every scanner module must return:
{
  score: 0-100,
  reasons: [],
  metadata: {}
}

Your AI engine receives this and produces the final result.
Share this contract with Siddhant and Impana on day one.

---

## Environment Variables (.env)

Create a .env file in /server with:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
NODE_ENV=development

Never commit this file to GitHub.
Add .env to your .gitignore immediately.

---

## MongoDB Atlas Setup

1. Go to mongodb.com/atlas and create a free account
2. Create a new cluster (free tier is fine)
3. Create a database user with a username and password
4. Whitelist IP address 0.0.0.0/0 (allow all, for development)
5. Get the connection string and paste it into your .env as MONGO_URI
6. Only you need Atlas access — teammates do not connect to the DB

---

## Your Dependencies to Install

In /server run:
npm init -y
npm install express mongoose dotenv cors

---

## Risk Scoring Logic (For Your AI Engine)

Use this weighting system:

- Score 0-30   → Low Risk
- Score 31-60  → Medium Risk  
- Score 61-100 → High Risk

Weight the scanner score and number of reasons together.
More reasons = higher confidence = push score upward slightly.

---

## Your Testing Approach

Use Postman or Thunder Client to test each API endpoint.
Test each route with a sample input before integrating
teammate modules.

---

## Integration Checklist (Do This Last)

- [ ] Server runs without errors
- [ ] MongoDB connects successfully  
- [ ] All four routes respond to POST requests
- [ ] AI engine returns correct structure
- [ ] Scanner outputs from Siddhant plug in without errors
- [ ] Scanner outputs from Impana plug in without errors
- [ ] Results save to MongoDB correctly
- [ ] Full flow works end to end

---

## Questions From Teammates

All teammates will come to you with integration questions.
You are the final decision maker on output formats and API structure.
Define the contract early, share it, and do not change it midway.