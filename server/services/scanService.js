import scanURL from '../../threat-detection/urlScanner.js';
import scanFile from '../../threat-detection/fileScanner.js';
import scanEmail from '../../identity-privacy/emailScanner.js';
import scanIdentity from '../../identity-privacy/identityScanner.js';
import getRiskScore from '../../ai-engine/riskModel.js';
import ScanResult from '../models/ScanResult.js';

export const scanURLService = async (url) => {
  const scannerOutput = await scanURL(url);
  const aiResult = await getRiskScore(scannerOutput);
  
  const scanResult = new ScanResult({
    inputType: "url",
    inputValue: url,
    riskScore: aiResult.riskScore,
    riskLevel: aiResult.riskLevel,
    reasons: scannerOutput.reasons,
    recommendations: aiResult.recommendations,
    explanation: aiResult.explanation,
    metadata: scannerOutput.metadata
  });
  
  await scanResult.save();
  return scanResult;
};

export const scanEmailService = async (emailText) => {
  const scannerOutput = await scanEmail(emailText);
  const aiResult = await getRiskScore(scannerOutput);
  
  const scanResult = new ScanResult({
    inputType: "email",
    inputValue: emailText,
    riskScore: aiResult.riskScore,
    riskLevel: aiResult.riskLevel,
    reasons: scannerOutput.reasons,
    recommendations: aiResult.recommendations,
    explanation: aiResult.explanation,
    metadata: scannerOutput.metadata
  });
  
  await scanResult.save();
  return scanResult;
};

export const scanFileService = async (filename) => {
  const scannerOutput = await scanFile(filename);
  const aiResult = await getRiskScore(scannerOutput);
  
  const scanResult = new ScanResult({
    inputType: "file",
    inputValue: filename,
    riskScore: aiResult.riskScore,
    riskLevel: aiResult.riskLevel,
    reasons: scannerOutput.reasons,
    recommendations: aiResult.recommendations,
    explanation: aiResult.explanation,
    metadata: scannerOutput.metadata
  });
  
  await scanResult.save();
  return scanResult;
};

export const scanIdentityService = async (input) => {
  const scannerOutput = await scanIdentity(input);
  const aiResult = await getRiskScore(scannerOutput);
  
  const scanResult = new ScanResult({
    inputType: "identity",
    inputValue: input,
    riskScore: aiResult.riskScore,
    riskLevel: aiResult.riskLevel,
    reasons: scannerOutput.reasons,
    recommendations: aiResult.recommendations,
    explanation: aiResult.explanation,
    metadata: scannerOutput.metadata
  });
  
  await scanResult.save();
  return scanResult;
};
