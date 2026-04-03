function getRiskScore(scannerOutput) {
  const baseScore = scannerOutput.score || 0;
  const reasons = scannerOutput.reasons || [];
  
  // Step 1 - Calculate Final Risk Score
  let extraPoints = 0;
  if (reasons.length > 1) {
    extraPoints = (reasons.length - 1) * 2;
  }
  
  const riskScore = Math.min(baseScore + extraPoints, 100);
  
  // Step 2 - Classify Risk Level
  let riskLevel = "Low";
  if (riskScore >= 61) {
    riskLevel = "High";
  } else if (riskScore >= 31) {
    riskLevel = "Medium";
  } else {
    riskLevel = "Low";
  }

  // Step 3 - Generate Explanation
  let explanation = "";
  if (riskLevel === "Low") {
    let firstReason = reasons.length > 0 ? reasons[0] : "No suspicious patterns were detected.";
    if (!firstReason.endsWith('.')) {
      firstReason += '.';
    }
    explanation = `Our analysis found no significant threats. ${firstReason} Your risk exposure appears to be minimal at this time.`;
  } else if (riskLevel === "Medium") {
    const joinedReasons = reasons.length > 0 ? `${reasons.slice(0, 2).join(' and ')}. ` : "";
    explanation = `Our analysis detected some suspicious indicators that require attention. ${joinedReasons}We recommend reviewing the details carefully and taking precautionary steps.`;
  } else if (riskLevel === "High") {
    const joinedReasons = reasons.length > 0 ? `${reasons.slice(0, 3).join(', ')}. ` : "";
    explanation = `Our analysis detected serious threats that require immediate action. ${joinedReasons}This input shows multiple high-risk indicators and should be treated with extreme caution.`;
  }

  // Step 4 - Generate Recommendations
  let rawRecommendations = [
    "Keep your software and antivirus up to date",
    "Enable two-factor authentication on all accounts"
  ];

  if (riskLevel === "Low") {
    rawRecommendations.push(
      "No immediate action required",
      "Continue practicing safe browsing habits",
      "Monitor your accounts periodically for unusual activity"
    );
  } else if (riskLevel === "Medium") {
    rawRecommendations.push(
      "Review the flagged indicators carefully",
      "Change passwords for any related accounts",
      "Avoid interacting with this input until verified",
      "Run a full antivirus scan on your device"
    );
  } else if (riskLevel === "High") {
    rawRecommendations.push(
      "Do not interact with this input under any circumstances",
      "Report this to your IT security team immediately",
      "Change all passwords associated with this account",
      "Check your accounts for unauthorized activity",
      "Consider freezing your credit if personal data was exposed"
    );
  }

  // Context specific recommendations
  const combinedReasonsStr = reasons.join(' ').toLowerCase();

  if (combinedReasonsStr.includes('breach') || combinedReasonsStr.includes('leak')) {
    rawRecommendations.push(
      "Your credentials may be compromised — change your passwords immediately",
      "Check haveibeenpwned.com for full breach details"
    );
  }
  if (combinedReasonsStr.includes('phishing') || combinedReasonsStr.includes('suspicious link')) {
    rawRecommendations.push(
      "Do not click any links in this content",
      "Report this email to your email provider as phishing"
    );
  }
  if (combinedReasonsStr.includes('double extension')) {
    rawRecommendations.push(
      "Never open files with double extensions",
      "Delete this file immediately without opening it"
    );
  }
  if (combinedReasonsStr.includes('virustotal')) {
    rawRecommendations.push(
      "This URL or file has been flagged by multiple security engines",
      "Avoid downloading or visiting this resource"
    );
  }
  if (combinedReasonsStr.includes('urgency')) {
    rawRecommendations.push(
      "Legitimate organizations never pressure you to act immediately",
      "Take time to verify before responding to any urgent requests"
    );
  }

  // Step 5 - Remove Duplicate Recommendations
  const recommendations = [...new Set(rawRecommendations)];

  return {
    riskScore,
    riskLevel,
    explanation,
    recommendations
  };
}

module.exports = { getRiskScore };
