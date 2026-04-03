const axios = require('axios');

async function scanURL(url) {
  let score = 0;
  const reasons = [];
  const suspiciousKeywordsFound = [];
  let tldRiskLevel = 'Low';
  let isIPAddress = false;
  const virusTotalStats = {
    maliciousCount: 0,
    suspiciousCount: 0,
    harmlessCount: 0,
    totalEngines: 0,
    threatNames: []
  };

  let protocol = '';
  let domain = '';
  const urlLength = url.length;

  try {
    const parsedUrl = new URL(url);
    protocol = parsedUrl.protocol.replace(':', '');
    domain = parsedUrl.hostname;

    // 1. HTTPS Check
    if (protocol === 'http') {
      reasons.push('URL uses HTTP — not secure');
      score += 15;
    }

    // 2. Suspicious Keyword Detection
    const keywords = ['login', 'signin', 'verify', 'secure', 'update', 'account', 'banking', 'confirm', 'password', 'free', 'winner', 'prize', 'click', 'lucky', 'paypal', 'amazon', 'google', 'apple', 'microsoft'];
    const urlLower = url.toLowerCase();
    keywords.forEach(keyword => {
      if (urlLower.includes(keyword)) {
        score += 10;
        suspiciousKeywordsFound.push(keyword);
        reasons.push(`Suspicious keyword found: ${keyword}`);
      }
    });

    // 3. Domain Spoofing Detection
    const spoofingPattern = /paypa1|arnazon|g00gle/;
    let hasSpoofing = false;
    if (domain.includes('-')) {
        hasSpoofing = true;
    } else if (spoofingPattern.test(domain.toLowerCase())) {
        hasSpoofing = true;
    } else {
        const brands = ['paypal', 'amazon', 'google', 'apple', 'microsoft'];
        brands.forEach(brand => {
           if (domain.includes(brand) && domain !== `${brand}.com` && domain !== `www.${brand}.com`) {
               hasSpoofing = true;
           }
        });
    }

    if (hasSpoofing) {
      reasons.push('Domain spoofing pattern detected');
      score += 30;
    }

    // 4. Suspicious TLD Detection
    const parts = domain.split('.');
    const tld = parts.length > 1 ? `.${parts[parts.length - 1]}`.toLowerCase() : '';
    const veryHighRiskTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
    const highRiskTLDs = ['.xyz', '.top', '.click', '.loan', '.win'];
    const moderateRiskTLDs = ['.info', '.biz'];

    if (veryHighRiskTLDs.includes(tld)) {
      score += 25;
      reasons.push(`High risk TLD detected: ${tld}`);
      tldRiskLevel = 'High';
    } else if (highRiskTLDs.includes(tld)) {
      score += 20;
      reasons.push(`High risk TLD detected: ${tld}`);
      tldRiskLevel = 'High';
    } else if (moderateRiskTLDs.includes(tld)) {
      score += 10;
      reasons.push(`High risk TLD detected: ${tld}`);
      tldRiskLevel = 'Medium';
    }

    // 5. URL Length Check
    if (urlLength > 100) {
      score += 10;
      reasons.push('Unusually long URL detected');
    }

    // 6. IP Address as Domain
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(domain)) {
      score += 30;
      reasons.push('IP address used instead of domain');
      isIPAddress = true;
    }

    // 7. Excessive Subdomains
    if (parts.length > 4) {
      score += 20;
      reasons.push('Excessive subdomains detected');
    }

    // 8. Redirect Parameters
    if (urlLower.includes('url=') || urlLower.includes('redirect=') || urlLower.includes('next=') || urlLower.includes('return=')) {
      reasons.push('Redirect parameter found in URL');
      score += 15;
    }
  } catch (err) {
      // Invalid URL provided, proceeding to VirusTotal still
  }

  // VirusTotal API Check
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (apiKey) {
    try {
      const encodedUrl = Buffer.from(url).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      const vtPostForm = new URLSearchParams();
      vtPostForm.append('url', url);

      const postResponse = await axios.post('https://www.virustotal.com/api/v3/urls', vtPostForm, {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const analysisId = postResponse.data.data.id;

      await new Promise(res => setTimeout(res, 3000));

      const getResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: {
          'x-apikey': apiKey
        }
      });

      const attributes = getResponse.data.data.attributes;
      const stats = attributes.stats;
      const results = attributes.results;

      virusTotalStats.maliciousCount = stats.malicious || 0;
      virusTotalStats.suspiciousCount = stats.suspicious || 0;
      virusTotalStats.harmlessCount = stats.harmless || 0;
      virusTotalStats.totalEngines = Object.values(stats).reduce((a, b) => a + b, 0);

      for (const engine in results) {
        const result = results[engine];
        if (result.category === 'malicious' || result.category === 'suspicious') {
          virusTotalStats.threatNames.push(result.result);
        }
      }

      if (virusTotalStats.maliciousCount > 5) {
        reasons.push(`VirusTotal: ${virusTotalStats.maliciousCount} engines flagged this URL as malicious`);
        score += 70;
      } else if (virusTotalStats.maliciousCount > 0) {
        reasons.push(`VirusTotal: ${virusTotalStats.maliciousCount} engines flagged this URL as malicious`);
        score += 50;
      }
      
      if (virusTotalStats.suspiciousCount > 0) {
        reasons.push(`VirusTotal: ${virusTotalStats.suspiciousCount} engines flagged this URL as suspicious`);
        score += 20;
      }

      if (virusTotalStats.threatNames.length > 0) {
        reasons.push(`Known threats detected: ${virusTotalStats.threatNames.join(', ')}`);
      }

    } catch (error) {
      reasons.push('VirusTotal scan unavailable');
    }
  } else {
    reasons.push('VirusTotal scan unavailable');
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons,
    metadata: {
      protocol,
      domain,
      suspiciousKeywordsFound,
      tldRiskLevel,
      isIPAddress,
      urlLength,
      virusTotal: virusTotalStats
    }
  };
}

module.exports = { scanURL };
