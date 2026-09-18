# Identity & Privacy Module

## Project flow

```text
Client form
  -> client/lib/api.js
  -> Express route (/api/scan-identity or /api/scan-email)
  -> controller validation
  -> scanService
  -> identity-privacy scanner
  -> risk model
  -> MongoDB result
  -> ResultCard UI
```

## Start the application

### 1. Start the API server

```bash
cd /Users/impana/Documents/projects/major/server
npm install
npm start
```

The API runs on `http://localhost:5000`. Check it with:

```bash
curl http://localhost:5000/health
```

### 2. Start the client

In another terminal:

```bash
cd /Users/impana/Documents/projects/major/client
npm install
npm run dev
```

Open `http://localhost:3000`. If that port is occupied:

```bash
npm run dev -- -p 3001
```

Then open `http://localhost:3001`.

## Run scanner tests

```bash
cd /Users/impana/Documents/projects/major/identity-privacy
npm test
```

The tests validate the output contract, phishing detection, breach handling, username patterns, platform estimates, and edge cases.

## Output contract

Both scanners return:

```js
{
  score: 0,
  reasons: [],
  metadata: {}
}
```

The server risk model converts this into the persisted result used by the client:

```js
{
  riskScore: 0,
  riskLevel: 'Low',
  explanation: '',
  recommendations: []
}
```

## Important notes

- Platform exposure is an estimate based on username reuse patterns; it does not confirm that accounts exist.
- Usernames may contain letters, numbers, `.`, `_`, and `-`.
- `impanaks_02` is expected to show Instagram, Twitter, Facebook, LinkedIn, Reddit, Steam, Xbox, and PlayStation.
- MongoDB and external breach lookups require valid server environment variables and network access.
- Never commit `.env` files or expose API keys. Rotate any credentials that have been shared or committed previously.
