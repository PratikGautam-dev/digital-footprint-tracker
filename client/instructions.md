# Frontend — Aaryan

## Your Role
You are responsible for everything the user sees and interacts with.
Your job is to build a clean, functional dashboard that takes user 
input, sends it to the backend, and displays the results clearly.

---

## Your Assigned Folder
- /client

---

## Your Branch
feature/frontend

---

## Important Rule
You do NOT write any scanning logic, risk scoring, or AI logic.
Your only job is:
- Collect input from the user
- Send it to the backend API
- Display whatever the backend sends back

---

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- Axios (for API calls)

---

## Getting Started

Inside /client run:
npx create-next-app@latest .
(select App Router when asked, select Tailwind CSS when asked)

Then install Axios:
npm install axios

---

## Folder Structure You Must Create

client/
├── app/
│   ├── page.jsx                  → Home / Landing page
│   ├── dashboard/
│   │   └── page.jsx              → Main dashboard
│   ├── scan/
│   │   ├── url/
│   │   │   └── page.jsx          → URL scanner page
│   │   ├── email/
│   │   │   └── page.jsx          → Email scanner page
│   │   ├── file/
│   │   │   └── page.jsx          → File scanner page
│   │   └── identity/
│   │       └── page.jsx          → Identity scanner page
├── components/
│   ├── Navbar.jsx                → Top navigation bar
│   ├── RiskBadge.jsx             → Shows Low / Medium / High badge
│   ├── ResultCard.jsx            → Displays scan result
│   ├── ReasonsList.jsx           → Lists reasons from scan
│   └── RecommendationsList.jsx   → Lists recommendations
├── lib/
│   └── api.js                    → All Axios API call functions
└── public/

---

## File by File — What Each File Does

### app/page.jsx (Landing Page)
- Welcome message with project name
- Brief description of what the tool does
- Four buttons linking to each scanner
- Clean, minimal design

### app/dashboard/page.jsx (Dashboard)
- Shows the most recent scan result
- Displays risk score as a number
- Shows risk level badge (Low / Medium / High)
- Lists all reasons
- Lists all recommendations
- If no scan has been done yet, show a message

### app/scan/url/page.jsx
- Text input field for entering a URL
- Submit button labeled "Scan URL"
- On submit, call the scan URL API
- Show loading state while waiting
- On response, display ResultCard component

### app/scan/email/page.jsx
- Large textarea for pasting email content
- Submit button labeled "Scan Email"
- On submit, call the scan email API
- Show loading state while waiting
- On response, display ResultCard component

### app/scan/file/page.jsx
- Text input for entering a filename
- (example: invoice.pdf.exe or report.docx)
- Submit button labeled "Scan File"
- On submit, call the scan file API
- Show loading state while waiting
- On response, display ResultCard component

### app/scan/identity/page.jsx
- Text input for entering a username or email
- Submit button labeled "Scan Identity"
- On submit, call the scan identity API
- Show loading state while waiting
- On response, display ResultCard component

### components/RiskBadge.jsx
- Takes riskLevel as a prop
- Shows green badge for Low
- Shows yellow badge for Medium
- Shows red badge for High

### components/ResultCard.jsx
- Takes the full API response as a prop
- Shows input value
- Shows risk score as a number out of 100
- Shows RiskBadge component
- Shows ReasonsList component
- Shows RecommendationsList component

### components/ReasonsList.jsx
- Takes reasons array as a prop
- Renders each reason as a list item
- Each item has a warning icon

### components/RecommendationsList.jsx
- Takes recommendations array as a prop
- Renders each recommendation as a list item
- Each item has a checkmark icon

### lib/api.js
- Contains all four API call functions
- scanURL(url)
- scanEmail(emailText)
- scanFile(filename)
- scanIdentity(username)
- All functions use Axios to POST to the backend
- Base URL should come from an environment variable

---

## Environment Variables

Create a .env.local file inside /client with:

NEXT_PUBLIC_API_URL=http://localhost:5000

Never hardcode the backend URL anywhere in your components.
Always use process.env.NEXT_PUBLIC_API_URL

---

## The API Contract (What the Backend Returns)

Pratik's backend will return this structure for every scan:

{
  inputType: "url",
  inputValue: "http://example.com",
  riskScore: 75,
  riskLevel: "High",
  reasons: [
    "Contains suspicious keywords",
    "No HTTPS detected"
  ],
  recommendations: [
    "Do not visit this URL",
    "Report to your IT team"
  ]
}

Build all your components around this structure.
Do not assume any other format.

---

## How to Work Before Backend is Ready

Pratik may not finish the backend immediately.
Do NOT wait for him. Use this mock response object in your
components while developing:

const mockResponse = {
  inputType: "url",
  inputValue: "http://suspicious-site.com",
  riskScore: 82,
  riskLevel: "High",
  reasons: [
    "Contains suspicious keywords",
    "No HTTPS detected",
    "Known phishing pattern found"
  ],
  recommendations: [
    "Do not visit this URL",
    "Clear your browser cache",
    "Report to your IT team"
  ]
}

Once Pratik's backend is live, replace the mock with the real API call.

---

## Design Guidelines

- Use Tailwind CSS only, no external UI libraries
- Keep the design clean and minimal
- Use these colors for risk levels:
  - Low    → green  (text-green-500, bg-green-100)
  - Medium → yellow (text-yellow-500, bg-yellow-100)
  - High   → red    (text-red-500, bg-red-100)
- Mobile responsive is a bonus but not required
- Focus on functionality first, polish second

---

## Your Testing Approach

1. Build all pages using the mock response first
2. Make sure every component renders correctly
3. When Pratik says the backend is ready, swap mock for real API
4. Test each scan page end to end

---

## What You Must NOT Do

- Do not write any scanning logic
- Do not connect to MongoDB
- Do not create any backend files
- Do not touch /server, /ai-engine, or /security folders
- Do not push to main directly

---

## Checklist Before Raising Pull Request

- [ ] All four scan pages work with mock data
- [ ] ResultCard displays all fields correctly
- [ ] RiskBadge shows correct color per risk level
- [ ] API calls in lib/api.js are correctly structured
- [ ] Environment variable is used for base URL
- [ ] No hardcoded backend URLs anywhere
- [ ] Tested with real backend once Pratik is ready

---

## Questions?

All questions go to Pratik — he owns the backend and API contract.
If the API response changes, Pratik will inform you directly.