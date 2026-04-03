# Digital Footprint Tracker — Team Instructions

## What We Are Building
An AI-powered cybersecurity platform that helps users analyze their digital 
footprint, detect cyber threats, and receive AI-driven security recommendations.

---

## Team Structure

| Person | Module | Folder |
|--------|--------|--------|
| Pratik | Backend + AI Engine + Database | /server + /ai-engine |
| Aaryan | Frontend | /client |
| Siddhant | Threat Detection | /threat-detection |
| Impana | Identity & Privacy | /identity-privacy |

---

## Golden Rules (Everyone Must Follow)

1. Never push directly to main
2. Work only inside your assigned folder
3. Never touch another person's folder
4. Always pull latest main before starting your day
5. Your branch name must match your module exactly

---

## Branch Names

| Person | Branch |
|--------|--------|
| Pratik | feature/backend-ai |
| Aaryan | feature/frontend |
| Siddhant | feature/threat-detection |
| Impana | feature/identity-privacy |

---

## How to Get Started

1. Accept the GitHub collaborator invite
2. Clone the repository
   git clone [repo-url]
3. Move into the project folder
   cd digital-footprint-tracker
4. Create your feature branch
   git checkout -b feature/your-module-name
5. Open your assigned folder and read your personal INSTRUCTIONS.md
6. Start coding only inside your folder

---

## How to Push Your Work

1. Save your changes
2. Stage your files
   git add .
3. Commit with a clear message
   git commit -m "feat: added URL scanner logic"
4. Push to your branch
   git push origin feature/your-module-name
5. Never run git push origin main

---

## The Output Contract (Security Module People Must Read This)

Both Siddhant and Impana are writing security scanner functions.
Every scanner function you write MUST return this exact format:

{
  score: 0-100,        // risk score as a number
  reasons: [],         // array of strings explaining what was detected
  metadata: {}         // object with any extra details from your scanner
}

This is non-negotiable. The AI engine consumes your output directly.
If your format is different, integration will break.

---

## Project Flow (Understand This Before Coding)

User Input
   ↓
Frontend — Aaryan
   ↓
Backend API — Pratik
   ↓
Security Module — Siddhant or Impana
   ↓
AI Engine — Pratik
   ↓
Database — Pratik
   ↓
Response back to Frontend — Aaryan

---

## Folder Structure

digital-footprint-tracker/
├── client/                        → Aaryan (Frontend)
├── server/                        → Pratik (Backend)
│   ├── routes/
│   ├── controllers/
│   └── services/
├── ai-engine/                     → Pratik (AI Engine)
├── threat-detection/              → Siddhant (URL + File)
├── identity-privacy/              → Impana (Email + Identity)
└── INSTRUCTIONS.md                → This file

---

## Questions?

All questions go to Pratik — the integration owner.
Do not make assumptions. Ask first, code second.