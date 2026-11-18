# Identity & Privacy Module

## 1. Overview

The `identity-privacy` directory implements the Identity & Privacy analysis feature of the Digital Footprint Tracker. It contains two CommonJS scanners:

- **Email scanner** — detects phishing, spoofing, social engineering, suspicious URLs, sender-domain impersonation, and known breaches.
- **Identity scanner** — analyses usernames or email addresses for potentially identifying patterns, estimated platform reuse, and known breaches.

Both scanners expose an asynchronous, application-level API and return a common output contract:

```js
{
  score: 0,
  reasons: [],
  metadata: {}
}
```

The Express backend passes the `score`, `reasons`, and `metadata` through the shared risk engine before persisting the result in MongoDB.

## 2. Directory contents

| File | Purpose |
|---|---|
| `emailScanner.js` | Analyses email addresses and email body text for privacy, phishing, spoofing, and social-engineering risks. |
| `identityScanner.js` | Analyses usernames and email addresses for traceability, disposable/free domains, simulated platform reuse, and breach exposure. |
| `test.js` | Local assertion-based test harness for both scanners. |
| `package.json` | Defines the module name, CommonJS runtime, Axios dependency, and test script. |
| `package-lock.json` | Locks the npm dependency versions for the module. |
| `instructions.md` | Module-specific implementation notes and source-level guidance. |
| `RUNNING.md` | Short setup and application startup guide. |
| `node_modules/` | Locally installed npm dependencies. This directory should not normally be committed. |

## 3. Package configuration

The module is configured as CommonJS:

```json
{
  "type": "commonjs",
  "main": "emailScanner.js",
  "scripts": {
    "test": "node test.js"
  },
  "dependencies": {
    "axios": "^1.20.0"
  }
}
```

Run it independently with:

```bash
cd identity-privacy
npm install
npm test
```

The module is also imported by `server/services/scanService.js`; it is not started as a separate HTTP service.

## 4. Request flow

```text
Next.js scan page
  -> client/lib/api.js
  -> POST /api/scan-email or POST /api/scan-identity
  -> Express controller validation
  -> server/services/scanService.js
  -> emailScanner.js or identityScanner.js
  -> ai-engine/riskModel.js
  -> MongoDB ScanResult
  -> Next.js ResultCard
```

### Email request

The email page sends:

```json
{
  "emailText": "email address or email body text"
}
```

The route is:

```text
POST /api/scan-email
```

### Identity request

The identity page sends:

```json
{
  "input": "username or email address"
}
```

The route is:

```text
POST /api/scan-identity
```

## 5. Email scanner

The exported API is:

```js
const { scanEmail } = require('./emailScanner');
const result = await scanEmail(input);
```

`scanEmail` returns a normalised object for all valid, empty, invalid, null, and truncated inputs.

### 5.1 Supported modes

#### Bare email-address mode

A single address such as `person@gmail.com` is matched by an email regex and sent to the address-analysis function.

It detects:

- High-risk username patterns such as `admin`, `root`, `test`, and `password`
- Four-digit birth years in usernames
- Common real names
- Free and disposable email domains
- Likely reuse across social and gaming platforms
- LeakCheck breach matches

#### Email-body mode

Longer text or a full email body is analysed for:

- Urgency and pressure language
- Suspicious and malformed URLs
- Sender-domain impersonation
- Brand typosquatting
- Requests for passwords, OTPs, PINs, CVVs, or sensitive personal data
- Business Email Compromise (BEC) and social-engineering language
- Excessive capitals, exclamation marks, or misspellings
- LeakCheck matches for an email address found in the body

### 5.2 Address-analysis scoring

| Signal | Approximate score impact |
|---|---:|
| High-risk username pattern | +25 |
| Birth year in username | +15 |
| Common real name | +10 |
| Free email domain | +10 |
| Disposable email domain | +25 |
| Estimated platform reuse | Up to +30 |
| One breach | +30 |
| 2–4 breaches | +50 |
| 5 or more breaches | +70 |
| Sensitive fields in breach data | +15 |

The final address score is capped at 100.

### 5.3 Email-body scoring

| Signal | Approximate score impact |
|---|---:|
| Urgency phrases | Up to +24 |
| High-risk URL | +20 per detected suspicious link |
| Brand/domain sender impersonation | +15–20 |
| Sensitive-keyword request | Up to +25 |
| Payment/transfer language | +25 |
| Credential request | +20 |
| Secrecy/bypass request | +20 |
| Authority impersonation | +15 |
| Prize/lottery language | +15 |
| Poor formatting | +5 |
| One sender breach | +25 |
| 2–4 sender breaches | +40 |
| 5 or more sender breaches | +55 |
| Sensitive fields in breach data | +15 |

The final body score is capped at 100.

### 5.4 URL-analysis signals

A URL may receive the following signals:

- `uses_http`
- `ip_address_host`
- `url_shortener`
- `suspicious_tld`
- `suspicious_path`
- `excessive_subdomains`
- `brand_impersonation:<brand>`
- `encoded_hostname`
- `unusual_port`
- `malformed_url`

A link is marked high-risk when it has at least two signals. Brand impersonation is detected using known brands, common phishing suffixes, leetspeak normalisation, and a small Levenshtein-distance check.

### 5.5 Sender-analysis signals

The sender analyser checks:

- Brand names on free email domains
- Brand names in suspicious domains
- Domain typosquatting
- Hyphenated brand-style domains
- Digits in the sender username

## 6. Identity scanner

The exported API is:

```js
const { scanIdentity } = require('./identityScanner');
const result = await scanIdentity(input);
```

### 6.1 Input classification

The scanner treats the input as:

- **Email** when it matches an email-address regular expression
- **Username** otherwise

For email input, the username portion before `@` is used for identity-pattern checks.

### 6.2 Username and domain checks

The identity scanner detects:

- Reserved or high-risk usernames
- Birth years from 1970 through 2010
- Common real names
- Free public email domains
- Disposable or throwaway email domains

### 6.3 Platform-estimation limitations

Platform exposure is **simulated**, not verified. It does not confirm that an account exists on a named platform.

- Valid usernames of 4–30 characters contribute Instagram, Twitter, Facebook, LinkedIn, and Reddit.
- Usernames containing digits additionally contribute Steam, Xbox, and PlayStation.
- Usernames are considered valid if they contain only letters, numbers, `.`, `_`, or `-`.

Exposure level is estimated from the number of platform entries:

| Estimated platform count | Exposure level |
|---:|---|
| 0–2 | Low |
| 3–5 | Medium |
| 6+ | High |

This module is meant to illustrate reuse risk, not to perform an authenticated OSINT account search.

### 6.4 Identity scanner scoring

| Signal | Score impact |
|---|---:|
| High-risk username | +25 |
| Birth year | +15 |
| Common real name | +10 |
| Free email domain | +10 |
| Disposable email domain | +25 |
| Platform reuse estimate | Up to +14 |
| One breach | +30 |
| 2–4 breaches | +50 |
| 5 or more breaches | +70 |
| Sensitive breach fields | +20 |

The final score is capped at 100. Inputs shorter than three characters skip the LeakCheck lookup.

## 7. LeakCheck integration

Both scanners use the public LeakCheck API unless `LEAK_CHECK_API_KEY` is set.

### Public lookup

```text
https://leakcheck.io/api/public?check=<encoded-input>
```

### Authenticated lookup

```text
https://leakcheck.io/api?key=<encoded-key>&check=<encoded-input>
```

The email scanner:

- Uses a 7-second Axios timeout
- Accepts HTTP responses from 200–499
- Marks the lookup as unavailable if the service throws or is unreachable
- Stores `breachFound`, `breachCount`, sources, fields, and the most recent breach in metadata

The identity scanner currently performs a public LeakCheck request without a timeout or API-key selection.

## 8. Output metadata

### Identity metadata

```js
{
  inputType: 'username' | 'email',
  exposedPlatforms: [],
  exposureLevel: 'Low' | 'Medium' | 'High',
  breachDetected: true,
  usernameRiskFlags: [],
  leakCheck: {
    breachFound: false,
    breachCount: 0,
    breachSources: [],
    exposedFields: [],
    mostRecentBreach: ''
  }
}
```

### Email-address metadata

```js
{
  scanMode: 'address',
  inputType: 'email',
  extractedEmail: 'person@example.com',
  usernameRiskFlags: [],
  exposedPlatforms: [],
  exposureLevel: 'Low' | 'Medium' | 'High',
  totalIndicators: 0,
  leakCheck: {},
  urgencyWordsFound: [],
  phishingLinksFound: [],
  sensitiveKeywordsFound: [],
  socialEngineeringIndicators: [],
  urlAnalysis: [],
  poorFormattingSignals: []
}
```

### Email-body metadata

```js
{
  scanMode: 'body',
  inputType: 'email',
  extractedEmail: null,
  urgencyWordsFound: [],
  phishingLinksFound: [],
  sensitiveKeywordsFound: [],
  socialEngineeringIndicators: [],
  senderFlags: [],
  urlAnalysis: [],
  poorFormattingSignals: [],
  usernameRiskFlags: [],
  exposedPlatforms: [],
  exposureLevel: 'Unknown',
  totalIndicators: 0,
  leakCheck: {}
}
```

## 9. Shared risk engine

`ai-engine/riskModel.js` converts scanner output into the final application risk:

| Scanner/final risk score | Risk level |
|---:|---|
| 0–30 | Low |
| 31–60 | Medium |
| 61–100 | High |

The risk engine adds two points for every reason after the first, but caps the result at 100.

It also creates:

- A context-aware explanation
- Generic security recommendations
- Context-specific recommendations for breaches, phishing, usernames, platform reuse, and urgency
- A de-duplicated recommendation list

## 10. Tests

Run:

```bash
cd identity-privacy
npm test
```

The harness validates:

- Scanner output contracts
- Numeric score boundaries
- Array/object metadata fields
- Normal versus phishing email behaviour
- URL shorteners and IP-address hosts
- Credential, OTP, and payment requests
- Sender impersonation and typosquatting
- ALL-CAPS and poor-formatting signals
- Empty, null, and undefined inputs
- LeakCheck failure handling
- High-risk usernames
- Birth-year and real-name patterns
- Free and disposable email domains
- Low-risk usernames

The test script exits with a non-zero status if any assertion fails.

## 11. Running with the application

Start the backend:

```bash
cd server
npm install
npm start
```

The API listens on `http://localhost:5000` by default. Verify it with:

```bash
curl http://localhost:5000/health
```

Start the frontend in another terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`, then use:

- `/scan/email`
- `/scan/identity`

## 12. Environment variables

The email and identity integration can use:

```dotenv
LEAK_CHECK_API_KEY=your_api_key
```

Set this in the server environment because that is where the scanners execute. If it is absent, email `checkLeakCheck` falls back to LeakCheck's public API.

Do not commit API keys or `.env` files.

## 13. Security and privacy considerations

- Breach lookups send the entered identifier to a third-party service.
- The public API may be rate-limited or unavailable.
- Platform matches are estimates and may generate false positives.
- Detection is heuristic rather than definitive threat classification.
- Scores do not prove that an account is breached or that an email is malicious.
- Results should be reviewed alongside independent verification.
- Only send an identifier if the user has consented to that external lookup.
- Never log or persist API keys.
- Consider shortening or truncating large email bodies; body input is limited to 50,000 characters by the scanner.

## 14. Known implementation notes

- `identityScanner.js` does not currently use `LEAK_CHECK_API_KEY`; it always uses the public endpoint.
- `identityScanner.js` has no explicit Axios timeout.
- Platform estimates are not live account checks.
- The disposable and free-domain lists are static and may become incomplete.
- The scanner relies on keyword and pattern heuristics, so false positives and false negatives are expected.
- The server's existing MongoDB validation and environment configuration are required for persisted scan results.
- The test suite depends partly on external LeakCheck responses and therefore may vary with network or service availability.

## 15. Maintenance guide

When extending this module:

1. Preserve the `{ score, reasons, metadata }` return contract.
2. Keep scanner scores within `0–100`.
3. Keep new metadata fields serialisable with JSON.
4. Add targeted assertions to `test.js`.
5. Avoid including the raw API key in URLs or logs.
6. Handle network failures as normal scan metadata, not uncaught exceptions.
7. Keep static lists documented and review them periodically.
8. Add server-side validation for any new input type.
9. Add or update UI metadata handling if the frontend consumes new fields.
