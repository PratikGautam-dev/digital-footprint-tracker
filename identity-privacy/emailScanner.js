const axios = require('axios');

async function scanEmail(emailText) {
  let score = 0;
  const reasons = [];
  const urgencyWordsFound = [];
  const phishingLinksFound = [];
  const sensitiveKeywordsFound = [];

  const leakCheckStats = {
    breachFound: false,
    breachCount: 0,
    breachSources: [],
    exposedFields: [],
    mostRecentBreach: ""
  };

  const emailTextLower = (emailText || "").toLowerCase();

  // Step 1: Extract email address
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = emailText.match(emailRegex);
  let extractedEmail = null;
  if (emailMatch) {
    extractedEmail = emailMatch[0];
  }

  // Step 3: Local Pattern Detection

  // 3.1. Urgency Language Detection
  const urgencyPhrases = [
    'urgent', 'immediately', 'act now', 'limited time',
    'account will be suspended', 'verify now',
    'within 24 hours', 'expire', 'final notice',
    'last chance', 'action required', 'immediate action'
  ];

  urgencyPhrases.forEach(phrase => {
    if (emailTextLower.includes(phrase)) {
      urgencyWordsFound.push(phrase);
      reasons.push(`Urgency language detected: ${phrase}`);
      score += 10;
    }
  });

  // 3.2. Phishing Link Pattern Detection
  const urlRegex = /(https?:\/\/[^\s>]+)/gi;
  const links = emailText.match(urlRegex) || [];

  links.forEach(rawLink => {
    const link = rawLink.replace(/['"]$/, ''); // cleanup trailing quotes
    let isPhishing = false;
    let linkObj;
    try {
      linkObj = new URL(link);
      const urlString = linkObj.href.toLowerCase();
      
      const suspiciousPathWords = ['login', 'verify', 'secure', 'update', 'confirm'];
      if (suspiciousPathWords.some(w => urlString.includes(w))) {
        isPhishing = true;
      }
      
      if (linkObj.protocol === 'http:') {
        isPhishing = true;
      }

      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipPattern.test(linkObj.hostname)) {
        isPhishing = true;
      }

      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.xyz'];
      if (suspiciousTLDs.some(tld => linkObj.hostname.endsWith(tld))) {
        isPhishing = true;
      }
    } catch(err) {
      // ignore
    }

    if (isPhishing) {
      phishingLinksFound.push(link);
      reasons.push('Phishing link pattern detected');
      score += 20;
    }
  });

  // 3.3. Suspicious Sender Pattern Detection
  if (extractedEmail) {
    let senderSuspicious = false;
    const parts = extractedEmail.toLowerCase().split('@');
    if (parts.length === 2) {
      const userPart = parts[0];
      const domainPart = parts[1];

      const trailingNumbers = /\d{3,}$/;
      if (trailingNumbers.test(userPart)) {
         senderSuspicious = true;
      }

      const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com'];
      const companyBrands = ['apple', 'paypal', 'amazon', 'google', 'microsoft'];
      
      if (freeDomains.includes(domainPart)) {
         if (companyBrands.some(b => userPart.includes(b))) {
            senderSuspicious = true;
         }
      }

      if (companyBrands.some(b => userPart.includes(b)) && !companyBrands.some(b => domainPart.includes(b))) {
         senderSuspicious = true;
      }

      if (senderSuspicious) {
        reasons.push("Suspicious sender pattern detected");
        score += 15;
      }
    }
  }

  // 3.4. Sensitive Information Requests
  const sensitiveReqWords = [
    'password', 'otp', 'pin', 'cvv', 'bank account',
    'credit card', 'debit card', 'social security',
    'aadhaar', 'pan card', 'verify your identity',
    'confirm your details', 'click here to update'
  ];

  sensitiveReqWords.forEach(word => {
    if (emailTextLower.includes(word)) {
      sensitiveKeywordsFound.push(word);
      reasons.push(`Sensitive information requested: ${word}`);
      score += 25;
    }
  });

  // 3.5. Poor Formatting Signals
  let poorFormatting = false;
  
  const words = emailText.split(/\s+/);
  let allCapsCount = 0;
  words.forEach(w => {
     const alphaOnly = w.replace(/[^a-zA-Z]/g, '');
     if (alphaOnly.length > 2 && alphaOnly === alphaOnly.toUpperCase()) {
         allCapsCount++;
     }
  });
  if (allCapsCount > 3) {
     poorFormatting = true;
  }

  const exclamationMatches = emailText.match(/!/g);
  if (exclamationMatches && exclamationMatches.length > 2) {
     poorFormatting = true;
  }

  const misspellings = ['recieve', 'accout', 'verfiy', 'securty'];
  if (misspellings.some(m => emailTextLower.includes(m))) {
     poorFormatting = true;
  }

  if (poorFormatting) {
      reasons.push("Poor formatting signals detected");
      score += 5;
  }

  // Step 2: LeakCheck API Integration
  if (extractedEmail) {
    try {
      const response = await axios.get(`https://leakcheck.io/api/public?check=${encodeURIComponent(extractedEmail)}`, {
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.data && response.data.success) {
        const foundCount = response.data.found || 0;
        if (foundCount > 0) {
          leakCheckStats.breachFound = true;
          leakCheckStats.breachCount = foundCount;
          leakCheckStats.breachSources = response.data.sources || [];
          leakCheckStats.exposedFields = response.data.fields || [];

          if (leakCheckStats.breachSources.length > 0) {
            const sortedSources = [...leakCheckStats.breachSources].sort((a, b) => {
              if (!a.date) return 1;
              if (!b.date) return -1;
               return b.date.localeCompare(a.date);
            });
            leakCheckStats.mostRecentBreach = sortedSources[0].name || "";
          }

          if (leakCheckStats.breachCount === 1) {
             reasons.push(`Email found in 1 data breach: ${leakCheckStats.breachSources[0]?.name || 'Unknown'}`);
             score += 30;
          } else if (leakCheckStats.breachCount >= 2 && leakCheckStats.breachCount <= 4) {
             reasons.push(`Email found in ${leakCheckStats.breachCount} data breaches`);
             score += 50;
          } else if (leakCheckStats.breachCount >= 5) {
             reasons.push(`Email found in ${leakCheckStats.breachCount} data breaches — high exposure`);
             score += 70;
          }

          const sensitiveFields = ['password', 'credit_card', 'ssn', 'address', 'phone'];
          const exposedFound = [];
          
          sensitiveFields.forEach(f => {
             if (leakCheckStats.exposedFields.some(ef => (ef || '').toLowerCase().includes(f))) {
                 exposedFound.push(f);
             }
          });
          
          if (exposedFound.length > 0) {
              reasons.push(`Sensitive data exposed: ${exposedFound.join(', ')}`);
              score += 20;
          }
        } else {
           leakCheckStats.breachFound = false;
        }
      } else {
         leakCheckStats.breachFound = false;
      }
    } catch (error) {
       reasons.push('LeakCheck breach scan unavailable');
    }
  } else {
    // If no email found in input, set properties correctly
    leakCheckStats.breachFound = false;
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons,
    metadata: {
      urgencyWordsFound,
      phishingLinksFound,
      sensitiveKeywordsFound,
      totalIndicators: reasons.length,
      leakCheck: leakCheckStats
    }
  };
}

module.exports = { scanEmail };
