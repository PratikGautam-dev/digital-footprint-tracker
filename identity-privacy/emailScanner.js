'use strict';

/**
 * emailScanner.js
 * Identity & Privacy module — Email Phishing & Social-Engineering Analyser
 *
 * TWO MODES:
 *  1. BARE EMAIL ADDRESS  — input is just "user@domain.com"
 *     → runs identity/breach analysis (birth year, platform exposure, LeakCheck)
 *       for consistency with identityScanner.js
 *
 *  2. EMAIL BODY  — input contains full/partial email body text
 *     → runs phishing / BEC / social-engineering analysis
 *
 * Output contract (non-negotiable, consumed by backend):
 *   { score: Number, reasons: String[], metadata: Object }
 */

const axios = require('axios');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_INPUT_LENGTH = 50000;

const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'short.link',
  'tiny.cc', 'rb.gy', 'is.gd', 'buff.ly', 'dlvr.it', 'su.pr', 'ift.tt',
]);

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'mail.com', 'protonmail.com', 'icloud.com',
  'yandex.com', 'rediffmail.com', 'zoho.com',
]);

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'mailinator.com', 'guerrillamail.com', 'throwam.com',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', '10minutemail.com',
  'dispostable.com', 'fakeinbox.com', 'maildrop.cc',
]);

const KNOWN_BRANDS = [
  'apple', 'paypal', 'amazon', 'google', 'microsoft', 'netflix',
  'facebook', 'instagram', 'twitter', 'linkedin', 'dropbox', 'adobe',
  'chase', 'wellsfargo', 'citibank', 'hsbc', 'barclays', 'hdfc', 'sbi',
  'icici', 'irctc', 'uidai', 'nsdl',
];

const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click',
  '.loan', '.online', '.site', '.work', '.party', '.stream',
]);

const SUSPICIOUS_PATH_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'verification',
  'secure', 'update', 'confirm', 'account', 'password',
  'reset', 'recover', 'unlock', 'auth', 'banking', 'wallet',
];

const URGENCY_PHRASES = [
  'urgent:', 'this is urgent', 'act now', 'act immediately', 'limited time offer',
  'account will be suspended', 'account has been suspended', 'account suspended',
  'verify now', 'within 24 hours', 'within 48 hours',
  'your account will expire', 'account expir', 'final notice', 'last chance',
  'action required', 'immediate action required', 'response required immediately',
  'failure to comply', 'legal action will be taken',
  'your account has been locked', 'your account has been compromised',
  'we have detected unusual', 'we have detected suspicious',
];

const SOCIAL_ENGINEERING_PATTERNS = [
  'wire transfer', 'bank transfer', 'transfer funds', 'send money',
  'make a payment', 'payment required', 'invoice attached',
  'process the payment', 'kindly transfer',
  'enter your password', 'provide your password', 'share your otp',
  'enter your otp', 'provide your pin', 'enter your pin',
  'enter your cvv', 'your one-time password',
  'keep this confidential', 'do not tell anyone', 'do not share',
  'between us', 'this is confidential', 'ignore the usual',
  'bypass the process', 'skip the verification',
  'on behalf of the ceo', 'message from the ceo', 'cfo has requested',
  'managing director', 'your it department', 'our security team',
  'help desk', 'technical support team',
  'you have been selected', 'you have won', 'congratulations you',
  'claim your prize', 'claim your reward',
];

const SENSITIVE_KEYWORDS = [
  'password', 'otp', ' pin ', 'cvv', 'bank account', 'account number',
  'credit card', 'debit card', 'card number', 'card details',
  'social security', 'ssn', 'aadhaar', 'aadhar', 'pan card', 'pan number',
  'verify your identity', 'confirm your details', 'click here to update',
  'click here to verify', 'submit your details',
];

const KNOWN_MISSPELLINGS = [
  'recieve', 'recieved', 'accout', 'verfiy', 'securty',
  'deactiveted', 'suspen', 'unusuall', 'attemp',
];

// Platforms for exposure simulation (shared with identityScanner logic)
const SOCIAL_PLATFORMS    = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'Reddit'];
const GAMING_PLATFORMS    = ['Steam', 'Xbox', 'PlayStation'];
const DEVELOPER_PLATFORMS = ['GitHub', 'GitLab', 'npm', 'Stack Overflow'];

const COMMON_NAMES = [
  'john', 'jane', 'mike', 'david', 'chris', 'alex', 'sarah',
  'priya', 'rahul', 'amit', 'raj', 'anjali', 'neha', 'rohit',
  'imp', 'sam', 'tom', 'james', 'emma', 'olivia',
];

const HIGH_RISK_USERNAMES = [
  'admin', 'administrator', 'root', 'user', 'test', 'guest',
  'password', '123456', 'default', 'superuser',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isBareEmailAddress(text) {
  const trimmed = text.trim();
  // Bare email: matches email regex AND has no whitespace / newlines in it
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

function extractURLs(text) {
  const urlRegex = /https?:\/\/[^\s<>"']+/gi;
  return (text.match(urlRegex) || []).map(u => u.replace(/['\".,;)\]>]+$/, ''));
}

function extractEmailAddress(text) {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

function getLikelyExposedPlatforms(username) {
  const normalized = username.replace(/[._-]/g, '');
  if (!/^[a-z0-9._-]+$/i.test(username) || normalized.length < 4 || normalized.length > 30) {
    return [];
  }

  const platforms = [...SOCIAL_PLATFORMS];
  if (/\d/.test(username)) platforms.push(...GAMING_PLATFORMS);
  return [...new Set(platforms)];
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const PHISHING_SUFFIXES = [
  '-secure', '-login', '-signin', '-verify', '-account', '-support',
  '-help', '-service', '-online', '-update', '-access', '-banking',
];

function normaliseLeetSpeak(s) {
  return s
    .replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/6/g, 'g')
    .replace(/8/g, 'b').replace(/rn/g, 'm').replace(/vv/g, 'w');
}

function isTyposquatOfBrand(hostname) {
  const labels = hostname.replace(/^www\./, '').split('.');
  for (const rawLabel of labels) {
    if (rawLabel.length < 3) continue;
    let label = rawLabel;
    for (const suffix of PHISHING_SUFFIXES) {
      if (label.endsWith(suffix)) { label = label.slice(0, label.length - suffix.length); break; }
    }
    const hyphenIdx = label.indexOf('-');
    const labelBeforeHyphen = hyphenIdx > 0 ? label.slice(0, hyphenIdx) : label;
    const normLabel = normaliseLeetSpeak(label);
    const normLabelNoHyphen = normaliseLeetSpeak(labelBeforeHyphen);
    for (const brand of KNOWN_BRANDS) {
      if (rawLabel === brand) return null;
      if (label.includes(brand) || brand.includes(label)) return brand;
      if (labelBeforeHyphen === brand) return null;
      if (normLabel === brand || normLabelNoHyphen === brand) return brand;
      if (Math.abs(normLabel.length - brand.length) <= 2 && levenshtein(normLabel, brand) <= 1) return brand;
    }
  }
  return null;
}

function analyseURL(rawURL) {
  const signals = [];
  let urlObj;
  try { urlObj = new URL(rawURL); } catch (_) {
    signals.push('malformed_url');
    return { signals, isHighRisk: false };
  }
  const hostname = urlObj.hostname.toLowerCase();
  if (urlObj.protocol === 'http:') signals.push('uses_http');
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) signals.push('ip_address_host');
  if (URL_SHORTENERS.has(hostname)) signals.push('url_shortener');
  if ([...SUSPICIOUS_TLDS].some(tld => hostname.endsWith(tld))) signals.push('suspicious_tld');
  const pathAndQuery = (urlObj.pathname + urlObj.search).toLowerCase();
  if (SUSPICIOUS_PATH_KEYWORDS.some(kw => pathAndQuery.includes(kw))) signals.push('suspicious_path');
  if (hostname.split('.').length >= 5) signals.push('excessive_subdomains');
  const squattedBrand = isTyposquatOfBrand(hostname);
  if (squattedBrand) signals.push(`brand_impersonation:${squattedBrand}`);
  if (/%[0-9a-f]{2}/i.test(urlObj.hostname)) signals.push('encoded_hostname');
  if (urlObj.port && urlObj.port !== '80' && urlObj.port !== '443') signals.push('unusual_port');
  return { signals, isHighRisk: signals.length >= 2 };
}

function analyseSender(emailAddress) {
  const flags = [], reasons = [];
  let score = 0;
  const [userPart, domainPart] = emailAddress.split('@');
  if (!userPart || !domainPart) return { flags, reasons, score };
  const hasDigitsInUsername = /\d{3,}/.test(userPart);
  if (hasDigitsInUsername) flags.push('digits_in_username');
  if (FREE_EMAIL_DOMAINS.has(domainPart)) {
    const brandMatch = KNOWN_BRANDS.find(b => userPart.includes(b));
    if (brandMatch) {
      flags.push('brand_on_free_domain');
      reasons.push(`Sender references "${brandMatch}" in the address but uses a free provider (@${domainPart}). Legitimate organisations do not send official emails from Gmail/Yahoo.`);
      score += 20;
    } else {
      flags.push('free_email_domain');
    }
  } else {
    const brandInDomain = KNOWN_BRANDS.find(b => domainPart.includes(b));
    if (brandInDomain) {
      const domainRoot = domainPart.split('.').slice(-2).join('.');
      if (!domainRoot.startsWith(brandInDomain + '.')) {
        flags.push('brand_in_suspicious_domain');
        reasons.push(`Sender domain "@${domainPart}" contains "${brandInDomain}" but is not the official domain — common phishing trick.`);
        score += 20;
      }
    }
    const typosquatBrand = isTyposquatOfBrand(domainPart);
    if (typosquatBrand) {
      flags.push('domain_typosquat');
      reasons.push(`Sender domain "@${domainPart}" closely resembles "${typosquatBrand}.com" — possible typosquatting attempt.`);
      score += 20;
    }
  }
  const hyphenBrandMatch = KNOWN_BRANDS.find(b => {
    const firstLabel = domainPart.split('.')[0];
    return firstLabel.includes('-') && firstLabel.includes(b);
  });
  if (hyphenBrandMatch && !FREE_EMAIL_DOMAINS.has(domainPart)) {
    flags.push('hyphenated_brand_domain');
    reasons.push(`Sender domain "@${domainPart}" uses a hyphenated variation of "${hyphenBrandMatch}" — common fake-domain technique.`);
    score += 15;
  }
  return { flags, reasons, score };
}

function detectSocialEngineering(textLower) {
  const indicators = [], reasons = [];
  let score = 0;
  for (const pattern of SOCIAL_ENGINEERING_PATTERNS) {
    if (textLower.includes(pattern)) indicators.push(pattern);
  }
  if (indicators.length === 0) return { indicators, reasons, score };
  const paymentTerms  = indicators.filter(i => ['wire transfer','bank transfer','transfer funds','send money','make a payment','payment required','process the payment','kindly transfer','invoice attached'].includes(i));
  const credTerms     = indicators.filter(i => ['enter your password','provide your password','share your otp','enter your otp','provide your pin','enter your pin','enter your cvv','your one-time password'].includes(i));
  const secrecyTerms  = indicators.filter(i => ['keep this confidential','do not tell anyone','do not share','between us','this is confidential','ignore the usual','bypass the process','skip the verification'].includes(i));
  const authorityTerms= indicators.filter(i => ['on behalf of the ceo','message from the ceo','cfo has requested','managing director','your it department','our security team','help desk','technical support team'].includes(i));
  const prizeTerms    = indicators.filter(i => ['you have been selected','you have won','congratulations you','claim your prize','claim your reward'].includes(i));
  if (paymentTerms.length   > 0) { score += 25; reasons.push(`Payment/transfer language found ("${paymentTerms[0]}") — hallmark of Business Email Compromise (BEC). Verify through a separate trusted channel.`); }
  if (credTerms.length      > 0) { score += 20; reasons.push(`Email requests authentication credentials (password/OTP/PIN/CVV). Legitimate services never ask for these via email — possible credential harvest.`); }
  if (secrecyTerms.length   > 0) { score += 20; reasons.push(`Secrecy/bypass instructions found ("${secrecyTerms[0]}"). Requests for confidentiality are classic social-engineering red flags.`); }
  if (authorityTerms.length > 0) { score += 15; reasons.push(`Authority impersonation detected ("${authorityTerms[0]}"). Attackers frequently pose as executives or IT staff.`); }
  if (prizeTerms.length     > 0) { score += 15; reasons.push(`Prize/lottery language found. Unsolicited reward notifications are typically scams to harvest personal data.`); }
  return { indicators, reasons, score };
}

async function checkLeakCheck(emailAddress) {
  const result = { checked: false, breachFound: false, breachCount: 0, breachSources: [], exposedFields: [], mostRecentBreach: '', error: null };
  if (!emailAddress) return result;
  const apiKey = process.env.LEAK_CHECK_API_KEY;
  try {
    const url = apiKey
      ? `https://leakcheck.io/api?key=${encodeURIComponent(apiKey)}&check=${encodeURIComponent(emailAddress)}`
      : `https://leakcheck.io/api/public?check=${encodeURIComponent(emailAddress)}`;
    const response = await axios.get(url, { timeout: 7000, validateStatus: s => s >= 200 && s < 500 });
    result.checked = true;
    if (!response.data || !response.data.success) {
      result.error = response.data?.error || 'Inconclusive response from breach database';
      return result;
    }
    const foundCount = response.data.found || 0;
    if (foundCount > 0) {
      result.breachFound = true;
      result.breachCount = foundCount;
      result.breachSources = Array.isArray(response.data.sources) ? response.data.sources : [];
      result.exposedFields = Array.isArray(response.data.fields) ? response.data.fields : [];
      if (result.breachSources.length > 0) {
        const sorted = [...result.breachSources].sort((a, b) => (!a.date ? 1 : !b.date ? -1 : b.date.localeCompare(a.date)));
        result.mostRecentBreach = sorted[0].name || '';
      }
    }
  } catch (err) {
    result.error = 'LeakCheck service unreachable';
  }
  return result;
}

// ---------------------------------------------------------------------------
// MODE 1: Identity/breach analysis for a bare email address
// ---------------------------------------------------------------------------
async function scanEmailAddress(emailAddress) {
  let score = 0;
  const reasons = [];
  const usernameRiskFlags = [];
  const exposedPlatforms = [];

  const [userPart, domainPart] = emailAddress.toLowerCase().split('@');

  // 1. High-risk username patterns
  if (HIGH_RISK_USERNAMES.some(u => userPart.includes(u))) {
    reasons.push('High-risk username pattern detected (e.g. admin/root/test) — commonly targeted by credential-stuffing attacks');
    usernameRiskFlags.push('high_risk_pattern');
    score += 25;
  }

  // 2. Birth year in username (1960–2015)
  const birthYearMatch = userPart.match(/\d{4}/);
  if (birthYearMatch) {
    const year = parseInt(birthYearMatch[0], 10);
    if (year >= 1960 && year <= 2015) {
      reasons.push(`Birth year detected in username (${year}) — makes account more traceable and easier to target in targeted phishing`);
      usernameRiskFlags.push('birth_year');
      score += 15;
    }
  }

  // 3. Common real name in username
  if (COMMON_NAMES.some(n => userPart.includes(n))) {
    reasons.push('Common real name detected in username — increases personal identifiability and social engineering risk');
    usernameRiskFlags.push('common_name');
    score += 10;
  }

  // 4. Disposable domain
  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    reasons.push(`Disposable/throwaway email domain detected (@${domainPart}) — associated with anonymous abuse and evading accountability`);
    usernameRiskFlags.push('disposable_domain');
    score += 25;
  } else if (FREE_EMAIL_DOMAINS.has(domainPart)) {
    // Free domain is low signal on its own but worth noting
    reasons.push(`Free public email domain detected (@${domainPart}) — these are frequently harvested in data breaches and targeted in credential-stuffing attacks`);
    usernameRiskFlags.push('free_domain');
    score += 10;
  }

  // 5. Simulated platform exposure
  const uniquePlatforms = getLikelyExposedPlatforms(userPart);

  if (uniquePlatforms.length > 0) {
    exposedPlatforms.push(...uniquePlatforms);
    reasons.push(
      `Username appears likely to be reused on: ${uniquePlatforms.join(', ')}`
    );
    score += Math.min(uniquePlatforms.length * 4, 30);
  }

  // 6. Exposure level
  let exposureLevel = 'Low';
  if (exposedPlatforms.length <= 2) exposureLevel = 'Low';
  else if (exposedPlatforms.length <= 5) exposureLevel = 'Medium';
  else exposureLevel = 'High';

  // 7. LeakCheck breach lookup
  const leakCheck = await checkLeakCheck(emailAddress);
  const leakCheckStats = {
    checked: leakCheck.checked, breachFound: leakCheck.breachFound,
    breachCount: leakCheck.breachCount, breachSources: leakCheck.breachSources,
    exposedFields: leakCheck.exposedFields, mostRecentBreach: leakCheck.mostRecentBreach,
    error: leakCheck.error,
  };

  if (leakCheck.breachFound) {
    const count = leakCheck.breachCount;
    const sourceNames = leakCheck.breachSources.slice(0, 3).map(s => s.name || 'Unknown').join(', ');
    if (count === 1) {
      score += 30;
      reasons.push(`Email address found in 1 known data breach${sourceNames ? ` (${sourceNames})` : ''} — credentials from that breach may already be in attacker hands`);
    } else if (count <= 4) {
      score += 50;
      reasons.push(`Email address found in ${count} known data breaches${sourceNames ? ` (including ${sourceNames})` : ''} — significantly increases risk of active exploitation`);
    } else {
      score += 70;
      reasons.push(`Email address found in ${count} known data breaches — very high exposure. Credentials have almost certainly been accessed by third parties`);
    }

    const sensitiveFields = ['password', 'credit_card', 'ssn', 'address', 'phone'];
    const exposedSensitive = sensitiveFields.filter(f =>
      leakCheck.exposedFields.some(ef => (ef || '').toLowerCase().includes(f))
    );
    if (exposedSensitive.length > 0) {
      score += 15;
      reasons.push(`Sensitive data fields exposed in breach: ${exposedSensitive.join(', ')} — can be used for identity theft and targeted phishing`);
    }
  } else if (leakCheck.checked && !leakCheck.error) {
    leakCheckStats.note = 'No breaches found for this address';
  } else if (leakCheck.error) {
    leakCheckStats.note = `Breach check could not be completed (${leakCheck.error}). Verify manually at haveibeenpwned.com`;
  }

  score = Math.min(Math.round(score), 100);

  return {
    score,
    reasons,
    metadata: {
      scanMode: 'address',
      inputType: 'email',
      extractedEmail: emailAddress,
      usernameRiskFlags,
      exposedPlatforms,
      exposureLevel,
      totalIndicators: reasons.length,
      leakCheck: leakCheckStats,
      // Empty phishing fields for schema compatibility
      urgencyWordsFound: [],
      phishingLinksFound: [],
      sensitiveKeywordsFound: [],
      socialEngineeringIndicators: [],
      urlAnalysis: [],
      poorFormattingSignals: [],
    },
  };
}

// ---------------------------------------------------------------------------
// MODE 2: Full phishing / BEC analysis for email body text
// ---------------------------------------------------------------------------
async function scanEmailBody(emailText) {
  let score = 0;
  const reasons = [];
  const urgencyWordsFound = [];
  const phishingLinksFound = [];
  const sensitiveKeywordsFound = [];
  const urlAnalysisResults = [];

  const textLower = emailText.toLowerCase();

  // 1. Extract sender email
  const extractedEmail = extractEmailAddress(emailText);

  // 2. Urgency / manipulation language
  for (const phrase of URGENCY_PHRASES) {
    if (textLower.includes(phrase)) urgencyWordsFound.push(phrase);
  }
  if (urgencyWordsFound.length > 0) {
    score += Math.min(urgencyWordsFound.length * 8, 24);
    const urgencyExamples = urgencyWordsFound.slice(0, 3).join(', ');
    reasons.push(`Urgency/pressure language detected (e.g. ${urgencyExamples}). Classic social-engineering to prevent careful thought.`);
  }

  // 3. URL / phishing link analysis
  for (const rawURL of extractURLs(emailText)) {
    const { signals, isHighRisk } = analyseURL(rawURL);
    urlAnalysisResults.push({ url: rawURL, signals });
    if (isHighRisk) {
      phishingLinksFound.push(rawURL);
      const signalDescriptions = {
        uses_http: 'transmits data over insecure HTTP',
        ip_address_host: 'uses a raw IP address instead of a real domain',
        url_shortener: 'uses a URL shortener to hide the true destination',
        suspicious_tld: 'uses an abused top-level domain',
        suspicious_path: 'path mimics a login/verification page',
        excessive_subdomains: 'buries the real domain under excessive subdomains',
        encoded_hostname: 'uses percent-encoding to obscure the hostname',
        unusual_port: 'connects to an unusual network port',
      };
      const brandSignal = signals.find(s => s.startsWith('brand_impersonation:'));
      const readableSignals = signals
        .filter(s => !s.startsWith('brand_impersonation:'))
        .map(s => signalDescriptions[s] || s)
        .filter(Boolean);
      if (brandSignal) readableSignals.push(`impersonates "${brandSignal.split(':')[1]}" (typosquatted domain)`);
      reasons.push(`Suspicious link detected: it ${readableSignals.join(', ')}. Do not click — verify through official channels.`);
      score += 20;
    }
  }

  // 4. Sender analysis
  let senderFlags = [];
  if (extractedEmail) {
    const senderResult = analyseSender(extractedEmail);
    senderFlags = senderResult.flags;
    reasons.push(...senderResult.reasons);
    score += senderResult.score;
  }

  // 5. Sensitive keyword requests
  for (const kw of SENSITIVE_KEYWORDS) {
    if (textLower.includes(kw)) sensitiveKeywordsFound.push(kw);
  }
  if (sensitiveKeywordsFound.length > 0) {
    score += Math.min(sensitiveKeywordsFound.length * 12, 25);
    reasons.push(`Email references sensitive data (${sensitiveKeywordsFound.slice(0, 3).join(', ')}). Legitimate services never request passwords, OTPs, or CVVs via email.`);
  }

  // 6. Social engineering / BEC
  const seResult = detectSocialEngineering(textLower);
  reasons.push(...seResult.reasons);
  score += seResult.score;

  // 7. Poor formatting signals
  const poorFormattingSignals = [];
  const words = emailText.split(/\s+/);
  let allCapsCount = 0;
  for (const w of words) {
    const alpha = w.replace(/[^a-zA-Z]/g, '');
    if (alpha.length > 2 && alpha === alpha.toUpperCase()) allCapsCount++;
  }
  if (allCapsCount > 3) poorFormattingSignals.push('excessive_caps');
  if ((emailText.match(/!/g) || []).length > 2) poorFormattingSignals.push('excessive_exclamation');
  const foundMisspellings = KNOWN_MISSPELLINGS.filter(m => textLower.includes(m));
  if (foundMisspellings.length > 0) poorFormattingSignals.push('misspellings');
  if (poorFormattingSignals.length > 0) {
    score += 5;
    reasons.push(`Poor writing quality detected (${poorFormattingSignals.join(', ')}) — phishing emails are often mass-produced or machine-translated.`);
  }

  // 8. LeakCheck if an email address was found in the body
  const leakCheck = await checkLeakCheck(extractedEmail);
  const leakCheckStats = {
    checked: leakCheck.checked, breachFound: leakCheck.breachFound,
    breachCount: leakCheck.breachCount, breachSources: leakCheck.breachSources,
    exposedFields: leakCheck.exposedFields, mostRecentBreach: leakCheck.mostRecentBreach,
    error: leakCheck.error,
  };

  if (leakCheck.breachFound) {
    const count = leakCheck.breachCount;
    const sourceNames = leakCheck.breachSources.slice(0, 3).map(s => s.name || 'Unknown').join(', ');
    if (count === 1) {
      score += 25;
      reasons.push(`Email address "${extractedEmail}" found in 1 known data breach${sourceNames ? ` (${sourceNames})` : ''}.`);
    } else if (count <= 4) {
      score += 40;
      reasons.push(`Email address "${extractedEmail}" found in ${count} known data breaches${sourceNames ? ` (including ${sourceNames})` : ''}.`);
    } else {
      score += 55;
      reasons.push(`Email address "${extractedEmail}" found in ${count} known data breaches — very high exposure.`);
    }
    const sensitiveFields = ['password', 'credit_card', 'ssn', 'address', 'phone'];
    const exposedSensitive = sensitiveFields.filter(f =>
      leakCheck.exposedFields.some(ef => (ef || '').toLowerCase().includes(f))
    );
    if (exposedSensitive.length > 0) {
      score += 15;
      reasons.push(`Breach exposed sensitive fields: ${exposedSensitive.join(', ')} — usable for identity theft.`);
    }
  } else if (leakCheck.checked && !leakCheck.error) {
    leakCheckStats.note = 'No breaches found for this address';
  } else if (leakCheck.error) {
    leakCheckStats.note = `Breach check failed (${leakCheck.error}). Verify at haveibeenpwned.com`;
  }

  score = Math.min(Math.round(score), 100);

  return {
    score,
    reasons,
    metadata: {
      scanMode: 'body',
      inputType: 'email',
      extractedEmail,
      urgencyWordsFound,
      phishingLinksFound,
      sensitiveKeywordsFound,
      socialEngineeringIndicators: seResult.indicators,
      senderFlags,
      urlAnalysis: urlAnalysisResults,
      poorFormattingSignals,
      totalIndicators: reasons.length,
      leakCheck: leakCheckStats,
      // Empty address fields for schema compatibility
      usernameRiskFlags: [],
      exposedPlatforms: [],
      exposureLevel: 'Unknown',
    },
  };
}

// ---------------------------------------------------------------------------
// Main exported function — routes to the correct mode
// ---------------------------------------------------------------------------
async function scanEmail(emailText) {
  if (!emailText || typeof emailText !== 'string') {
    return {
      score: 0, reasons: [],
      metadata: {
        scanMode: 'unknown', inputType: 'email', extractedEmail: null,
        urgencyWordsFound: [], phishingLinksFound: [], sensitiveKeywordsFound: [],
        socialEngineeringIndicators: [], senderFlags: [], urlAnalysis: [],
        poorFormattingSignals: [], usernameRiskFlags: [], exposedPlatforms: [],
        exposureLevel: 'Unknown', totalIndicators: 0,
        leakCheck: { checked: false, breachFound: false, breachCount: 0, breachSources: [], exposedFields: [], mostRecentBreach: '', error: null },
        validationError: 'No input provided',
      },
    };
  }

  const trimmed = emailText.trim();
  if (trimmed.length > MAX_INPUT_LENGTH) emailText = emailText.slice(0, MAX_INPUT_LENGTH);

  // Route to appropriate mode
  if (isBareEmailAddress(trimmed)) {
    return scanEmailAddress(trimmed);
  } else {
    return scanEmailBody(trimmed);
  }
}

module.exports = { scanEmail };
