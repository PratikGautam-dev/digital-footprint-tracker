function getRiskScore(scannerOutput) {
  const baseScore = scannerOutput.score || 0;
  const reasons   = scannerOutput.reasons || [];
  const scanMode  = scannerOutput.metadata?.scanMode || '';
  const inputType = scannerOutput.metadata?.inputType || '';

  // Step 1 — Final score (small bump per additional reason, capped at 100)
  let extraPoints = reasons.length > 1 ? (reasons.length - 1) * 2 : 0;
  const riskScore = Math.min(baseScore + extraPoints, 100);

  // Step 2 — Risk level
  let riskLevel = 'Low';
  if      (riskScore >= 61) riskLevel = 'High';
  else if (riskScore >= 31) riskLevel = 'Medium';

  // Step 3 — Context-aware explanation
  const isEmailAddress = (inputType === 'email' && scanMode === 'address') ||
                         (inputType === 'identity');
  const isEmailBody    = inputType === 'email' && scanMode === 'body';

  let explanation = '';
  if (riskLevel === 'Low') {
    if (isEmailAddress) {
      const firstReason = reasons.length > 0 ? reasons[0] : 'No suspicious patterns were detected in this address.';
      explanation = `The scan found no significant concerns. ${firstReason} Keep monitoring your accounts and review the recommendations below.`;
    } else if (isEmailBody) {
      const firstReason = reasons.length > 0 ? reasons[0] : 'No phishing or social-engineering patterns were detected.';
      explanation = `The email does not show significant phishing or social-engineering signals. ${firstReason}`;
    } else {
      const firstReason = reasons.length > 0 ? reasons[0] : 'No suspicious patterns were detected.';
      explanation = `The scan found no significant threats. ${firstReason}`;
    }
  } else if (riskLevel === 'Medium') {
    const joinedReasons = reasons.length > 0 ? `${reasons.slice(0, 2).join(' ')} ` : '';
    if (isEmailAddress) {
      explanation = `Some exposure was detected for this email address. ${joinedReasons}Review the indicators below and take the recommended precautions.`;
    } else if (isEmailBody) {
      explanation = `Suspicious email indicators detected. ${joinedReasons}Proceed with caution — verify the sender through independent channels before taking any action.`;
    } else {
      explanation = `Some indicators require attention. ${joinedReasons}Review the details carefully and take the recommended precautions.`;
    }
  } else {
    const joinedReasons = reasons.length > 0 ? `${reasons.slice(0, 3).join(' ')} ` : '';
    if (isEmailAddress) {
      explanation = `Several serious indicators were found for this email address. ${joinedReasons}Take action using the recommendations below.`;
    } else if (isEmailBody) {
      explanation = `HIGH RISK: This email shows multiple serious phishing and social-engineering indicators. ${joinedReasons}Do NOT interact with this email, click any links, or provide any information to the sender.`;
    } else {
      explanation = `Several serious indicators require immediate attention. ${joinedReasons}Treat this input with caution and follow the recommendations below.`;
    }
  }

  // Step 4 — Base recommendations
  let rawRecommendations = [
    'Enable two-factor authentication (2FA) on all important accounts',
    'Use a password manager and unique passwords for every service',
  ];

  if (riskLevel === 'Low') {
    rawRecommendations.push(
      'No immediate action required',
      'Continue practicing safe browsing and email hygiene',
      'Monitor your accounts periodically for unusual activity',
      'Consider checking your exposure on haveibeenpwned.com'
    );
  } else if (riskLevel === 'Medium') {
    rawRecommendations.push(
      'Review the flagged indicators carefully before taking any action',
      'Change passwords for any accounts associated with this input',
      'Avoid interacting with this content until you have verified its legitimacy',
      'Run a full security audit on your primary accounts',
    );
  } else {
    rawRecommendations.push(
      'Change all passwords associated with this account immediately',
      'Check all linked accounts for unauthorised access or activity',
      'Report this to your IT/security team if this is a work account',
      'Consider freezing your credit if personal or financial data was exposed',
    );
  }

  // Step 5 — Context-specific recommendations
  const combinedReasonsStr = reasons.join(' ').toLowerCase();

  if (combinedReasonsStr.includes('breach') || combinedReasonsStr.includes('leak') || combinedReasonsStr.includes('found in')) {
    rawRecommendations.push(
      'Your credentials are confirmed compromised — change passwords immediately',
      'Check haveibeenpwned.com for a full list of breach exposures',
      'Revoke any active sessions on affected services',
    );
  }
  if (combinedReasonsStr.includes('phishing') || combinedReasonsStr.includes('suspicious link') || combinedReasonsStr.includes('link detected')) {
    rawRecommendations.push(
      'Do not click any links in this email — navigate directly to the website instead',
      'Report this email as phishing to your email provider',
    );
  }
  if (combinedReasonsStr.includes('birth year') || combinedReasonsStr.includes('traceab')) {
    rawRecommendations.push(
      'Consider creating a new alias or username that does not include personal identifiers',
      'Avoid using birth years or real names in usernames on public platforms',
    );
  }
  if (combinedReasonsStr.includes('platform') || combinedReasonsStr.includes('exposed on')) {
    rawRecommendations.push(
      'Audit your accounts across all detected platforms and remove any unused accounts',
      'Set profiles to private where possible to reduce your public footprint',
    );
  }
  if (combinedReasonsStr.includes('urgency') || combinedReasonsStr.includes('pressure')) {
    rawRecommendations.push(
      'Legitimate organisations never pressure you to act immediately — take time to verify',
      'Contact the alleged sender directly through official channels to confirm',
    );
  }
  if (combinedReasonsStr.includes('double extension') || combinedReasonsStr.includes('virustotal')) {
    rawRecommendations.push(
      'Never open files with double extensions (e.g. .pdf.exe)',
      'Delete this file immediately without opening it',
    );
  }

  // Step 6 — Deduplicate
  const recommendations = [...new Set(rawRecommendations)];

  return { riskScore, riskLevel, explanation, recommendations };
}

module.exports = { getRiskScore };
