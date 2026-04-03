const axios = require('axios');
const crypto = require('crypto');

async function scanFile(filename) {
  let score = 0;
  const reasons = [];

  let detectedExtension = "";
  let isDoubleExtension = false;
  let fakeExtension = "";
  let realExtension = "";
  let extensionRiskLevel = "Low";

  const virusTotalStats = {
    maliciousCount: 0,
    suspiciousCount: 0,
    harmlessCount: 0,
    totalEngines: 0,
    threatNames: []
  };

  try {
    const filenameLower = filename.toLowerCase();

    // 2. Double Extension Detection
    const parts = filenameLower.split('.');

    if (parts.length > 2) {
      isDoubleExtension = true;
      realExtension = `.${parts[parts.length - 1]}`;
      fakeExtension = `.${parts[parts.length - 2]}`;
      detectedExtension = realExtension;
      reasons.push(`Double extension detected — real extension is ${realExtension}`);
      score += 35;
    } else if (parts.length === 2) {
      detectedExtension = `.${parts[parts.length - 1]}`;
      realExtension = detectedExtension;
    }

    // 1. Dangerous Extension Detection
    const veryHighRiskExts = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.psm1', '.msi', '.msp'];
    const highRiskExts = ['.jar', '.py', '.rb', '.sh', '.dll', '.sys', '.reg'];
    const moderateRiskExts = ['.zip', '.rar', '.7z', '.tar', '.gz', '.iso', '.img'];

    if (veryHighRiskExts.includes(detectedExtension)) {
      score += 40;
      reasons.push(`Very high risk extension detected: ${detectedExtension}`);
      extensionRiskLevel = "Very High";
    } else if (highRiskExts.includes(detectedExtension)) {
      score += 25;
      reasons.push(`High risk extension detected: ${detectedExtension}`);
      extensionRiskLevel = "High";
    } else if (moderateRiskExts.includes(detectedExtension)) {
      score += 10;
      reasons.push(`Moderate risk extension detected: ${detectedExtension}`); // Assuming similar formatting to high risk
      extensionRiskLevel = "Medium";
    }

    // 3. Misleading System Filename Detection
    const systemNames = ['svchost', 'explorer', 'winlogon', 'csrss', 'lsass', 'services'];
    const nameOnly = parts[0]; 
    if (systemNames.includes(nameOnly)) {
      reasons.push("Filename mimics a system file");
      score += 20;
    }

    // 4. Social Engineering Name Detection
    const socialEngWords = [
      'urgent', 'invoice', 'payment', 'salary', 'offer', 'final',
      'important', 'confidential', 'bank', 'setup', 'install',
      'update', 'crack', 'keygen', 'patch', 'video', 'photo', 'image'
    ];

    for (const word of socialEngWords) {
      if (filenameLower.includes(word)) {
        reasons.push(`Social engineering filename detected: ${word}`);
        score += 15;
      }
    }

    // 5. Extension and Filename Mismatch
    const refersToMedia = filenameLower.includes('photo') || filenameLower.includes('image') || filenameLower.includes('video');
    const refersToDoc = filenameLower.includes('invoice') || filenameLower.includes('document');
    const refersToSetup = filenameLower.includes('setup') || filenameLower.includes('install');

    const executables = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif'];
    const scripts = ['.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.ps1', '.psm1', '.py', '.rb', '.sh'];

    let mismatch = false;

    if (refersToMedia && executables.includes(detectedExtension)) {
      mismatch = true;
    }
    
    if (refersToDoc && scripts.includes(detectedExtension)) {
      mismatch = true;
    }
    
    if (refersToSetup && detectedExtension) {
      mismatch = true;
    }

    if (mismatch) {
      reasons.push("Filename and extension mismatch detected");
      score += 20;
    }

  } catch (error) {
    // Ignore string processing errors, proceed to VT
  }

  // VirusTotal API Check
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (apiKey) {
    try {
      // Step 1: Generate SHA-256 hash
      const hash = crypto.createHash('sha256').update(filename).digest('hex');

      // Step 2: Query VirusTotal with the hash
      const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
        headers: {
          'x-apikey': apiKey
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Allow 404 to not throw
        }
      });

      // Step 3: Extract results
      if (vtResponse.status === 404) {
        reasons.push('File not found in VirusTotal database');
      } else if (vtResponse.status === 200) {
        const attributes = vtResponse.data.data.attributes;
        const stats = attributes.stats;
        const results = attributes.last_analysis_results;

        virusTotalStats.maliciousCount = stats.malicious || 0;
        virusTotalStats.suspiciousCount = stats.suspicious || 0;
        virusTotalStats.harmlessCount = stats.harmless || 0;
        
        let totalEnginesCount = 0;
        for (const key in stats) {
           totalEnginesCount += Number(stats[key]);
        }
        virusTotalStats.totalEngines = totalEnginesCount;

        for (const engine in results) {
          const result = results[engine];
          if (result.category === 'malicious' || result.category === 'suspicious') {
            if (result.result) {
              virusTotalStats.threatNames.push(result.result);
            }
          }
        }

        // VirusTotal Scoring logic
        if (virusTotalStats.maliciousCount > 5) {
          score += 70;
          reasons.push(`VirusTotal: ${virusTotalStats.maliciousCount} engines flagged this file as malicious`);
        } else if (virusTotalStats.maliciousCount > 0) {
          score += 50;
          reasons.push(`VirusTotal: ${virusTotalStats.maliciousCount} engines flagged this file as malicious`);
        }

        if (virusTotalStats.suspiciousCount > 0) {
          score += 20;
          reasons.push(`VirusTotal: ${virusTotalStats.suspiciousCount} engines flagged this file as suspicious`);
        }
      } else {
         reasons.push('VirusTotal scan unavailable');
      }
    } catch (err) {
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
      originalFilename: filename,
      detectedExtension,
      isDoubleExtension,
      fakeExtension,
      realExtension,
      extensionRiskLevel,
      virusTotal: virusTotalStats
    }
  };
}

module.exports = { scanFile };
