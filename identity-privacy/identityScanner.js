const axios = require('axios');

async function scanIdentity(input) {
  let score = 0;
  const reasons = [];
  const exposedPlatforms = [];
  let exposureLevel = "Low";
  let breachDetected = false;
  const usernameRiskFlags = [];
  let inputType = "username";

  const leakCheckStats = {
    breachFound: false,
    breachCount: 0,
    breachSources: [],
    exposedFields: [],
    mostRecentBreach: ""
  };

  const inputLower = (input || "").toLowerCase().trim();

  // Step 1: Detect Input Type
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(inputLower)) {
    inputType = "email";
  }

  // Step 3: Local Identity Analysis
  
  // 3.1. Username Pattern Analysis
  let usernamePart = inputLower;
  if (inputType === "email") {
     usernamePart = inputLower.split('@')[0];
  }

  const veryHighRiskUsernames = [
    'admin', 'administrator', 'root', 'user', 'test', 'guest',
    'password', '123456', 'default', 'superuser'
  ];

  if (veryHighRiskUsernames.some(u => usernamePart.includes(u))) {
     reasons.push("High risk username pattern detected");
     usernameRiskFlags.push("high_risk_pattern");
     score += 25;
  }

  // Birth year detection (4 digits between 1970-2010)
  const birthYearMatch = usernamePart.match(/\d{4}/);
  if (birthYearMatch) {
     const year = parseInt(birthYearMatch[0], 10);
     if (year >= 1970 && year <= 2010) {
        reasons.push("Birth year detected in username — increases traceability");
        usernameRiskFlags.push("birth_year");
        score += 15;
     }
  }

  // Common first name detection
  const commonNames = [
    'john', 'jane', 'mike', 'david', 'chris', 'alex', 'sarah',
    'priya', 'rahul', 'amit', 'raj', 'anjali', 'neha', 'rohit'
  ];
  if (commonNames.some(n => usernamePart.includes(n))) {
     reasons.push("Common real name used as username");
     usernameRiskFlags.push("common_first_name");
     score += 10;
  }

  // 3.2. Email Domain Analysis
  let domainPart = "";
  if (inputType === "email") {
     domainPart = inputLower.split('@')[1] || "";
     const freeDomains = ['gmail', 'yahoo', 'hotmail', 'outlook', 'rediffmail'];
     const disposableDomains = ['tempmail', 'mailinator', 'guerrillamail', 'throwam', 'yopmail', 'sharklasers', 'trashmail'];

     if (freeDomains.some(d => domainPart.includes(d))) {
        reasons.push("Free email domain detected");
        score += 10;
     }

     if (disposableDomains.some(d => domainPart.includes(d))) {
        reasons.push("Disposable email domain detected");
        score += 25;
     }
  }

  // 3.3. Simulated Platform Exposure
  const socialPlatforms = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'Reddit'];
  const gamingPlatforms = ['Steam', 'Xbox', 'PlayStation'];
  const professionalPlatforms = ['GitHub', 'Behance', 'Dribbble'];

  const usernameLength = usernamePart.length;
  let simulatedPlatformsFound = [];

  const onlyLettersAndNumbers = /^[a-z0-9]+$/i.test(usernamePart);
  const containsNumbers = /\d/.test(usernamePart);
  
  if (usernameLength >= 4 && usernameLength <= 20 && onlyLettersAndNumbers) {
      simulatedPlatformsFound.push(...socialPlatforms);
  }
  
  if (containsNumbers) {
      simulatedPlatformsFound.push(...gamingPlatforms);
  }
  
  if (!containsNumbers && usernameLength >= 4 && usernameLength <= 20) {
      simulatedPlatformsFound.push(...professionalPlatforms);
  }

  if (simulatedPlatformsFound.length > 0) {
     const uniquePlatforms = [...new Set(simulatedPlatformsFound)];
     exposedPlatforms.push(...uniquePlatforms);
     reasons.push(`Likely exposed on: ${uniquePlatforms.join(', ')}`);
     score += (8 * uniquePlatforms.length);
  }

  // 3.4. Exposure Level Classification
  const exposureCount = exposedPlatforms.length;
  if (exposureCount <= 2) {
     exposureLevel = "Low";
  } else if (exposureCount <= 5) {
     exposureLevel = "Medium";
  } else {
     exposureLevel = "High";
  }

  // Step 2: LeakCheck API Integration
  if (inputLower.length < 3) {
      reasons.push('Input too short for breach lookup');
  } else {
      try {
          const response = await axios.get(`https://leakcheck.io/api/public?check=${encodeURIComponent(inputLower)}`, {
             validateStatus: function (status) { return status >= 200 && status < 500; }
          });

          if (response.data && response.data.success) {
              const foundCount = response.data.found || 0;
              if (foundCount > 0) {
                  breachDetected = true;
                  leakCheckStats.breachFound = true;
                  leakCheckStats.breachCount = foundCount;
                  leakCheckStats.breachSources = response.data.sources || [];
                  leakCheckStats.exposedFields = response.data.fields || [];

                  if (leakCheckStats.breachSources.length > 0) {
                     const sortedSources = [...leakCheckStats.breachSources].sort((a,b) => {
                         if (!a.date) return 1;
                         if (!b.date) return -1;
                         return b.date.localeCompare(a.date);
                     });
                     leakCheckStats.mostRecentBreach = sortedSources[0]?.name || "";
                  }

                  if (foundCount === 1) {
                     reasons.push(`Identity found in 1 data breach: ${leakCheckStats.breachSources[0]?.name || 'Unknown'}`);
                     score += 30;
                  } else if (foundCount >= 2 && foundCount <= 4) {
                     reasons.push(`Identity found in ${foundCount} data breaches`);
                     score += 50;
                  } else if (foundCount >= 5) {
                     reasons.push(`Identity found in ${foundCount} data breaches — high exposure`);
                     score += 70;
                  }

                  const sensitiveDataKeywords = ['password', 'credit_card', 'ssn', 'address', 'phone', 'email'];
                  const exposedFields = leakCheckStats.exposedFields || [];
                  const foundSensitive = [];
                  sensitiveDataKeywords.forEach(k => {
                     if (exposedFields.some(ef => (ef||'').toLowerCase().includes(k))) {
                        foundSensitive.push(k);
                     }
                  });

                  if (foundSensitive.length > 0) {
                     reasons.push(`Sensitive data exposed in breach: ${foundSensitive.join(', ')}`);
                     score += 20;
                  }
              }
          }
      } catch (err) {
         reasons.push('LeakCheck breach scan unavailable');
      }
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons,
    metadata: {
      inputType,
      exposedPlatforms,
      exposureLevel,
      breachDetected,
      usernameRiskFlags,
      leakCheck: leakCheckStats
    }
  };
}

module.exports = { scanIdentity };
