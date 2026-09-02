import urlScanner from '../../threat-detection/urlScanner.js';
const { scanURL } = urlScanner;

import fileScanner from '../../threat-detection/fileScanner.js';
const { scanFile } = fileScanner;

import emailScanner from '../../identity-privacy/emailScanner.js';
const { scanEmail } = emailScanner;

import identityScanner from '../../identity-privacy/identityScanner.js';
const { scanIdentity } = identityScanner;

import riskModel from '../../ai-engine/riskModel.js';
const { getRiskScore } = riskModel;

import footprintScanner from '../../footprint/footprintScanner.js';
const { scanFootprint } = footprintScanner;

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

export const getAllResultsService = async (limit = 20) => {
  return ScanResult.find().sort({ createdAt: -1 }).limit(Number(limit));
};

export const getResultByIdService = async (id) => {
  return ScanResult.findById(id);
};

export const getStatsService = async () => {
  const [totalScans, highRisk, mediumRisk, lowRisk] = await Promise.all([
    ScanResult.countDocuments(),
    ScanResult.countDocuments({ riskLevel: "High" }),
    ScanResult.countDocuments({ riskLevel: "Medium" }),
    ScanResult.countDocuments({ riskLevel: "Low" }),
  ]);

  return { totalScans, highRisk, mediumRisk, lowRisk };
};

export const scanFootprintService = async (input) => {
  const scannerOutput = await scanFootprint(input);
  const aiResult = await getRiskScore(scannerOutput);
  
  const scanResult = new ScanResult({
    inputType: "footprint",
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
