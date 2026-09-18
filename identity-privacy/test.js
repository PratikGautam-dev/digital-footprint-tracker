/**
 * test.js — Local test harness for emailScanner and identityScanner
 * Run with:  node test.js
 *
 * This file is NOT part of the main application — it is for local validation
 * only. All tests print PASS / FAIL to the console.
 */

'use strict';

const { scanEmail }    = require('./emailScanner');
const { scanIdentity } = require('./identityScanner');

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, extra = '') {
  if (condition) {
    console.log(`  ✅  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL  ${label}${extra ? ' — ' + extra : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

// ─── scanEmail tests ───────────────────────────────────────────────────────────

async function testScanEmail() {

  // ── Output contract ─────────────────────────────────────────────────────────
  section('scanEmail — Output contract (benign email)');

  const base = await scanEmail('Hello, this is a normal email.');
  assert('returns an object',               typeof base === 'object' && base !== null);
  assert('score is a number',               typeof base.score === 'number');
  assert('score is between 0-100',          base.score >= 0 && base.score <= 100);
  assert('reasons is an array',             Array.isArray(base.reasons));
  assert('metadata is an object',           typeof base.metadata === 'object');
  assert('metadata.urgencyWordsFound',      Array.isArray(base.metadata.urgencyWordsFound));
  assert('metadata.phishingLinksFound',     Array.isArray(base.metadata.phishingLinksFound));
  assert('metadata.sensitiveKeywordsFound', Array.isArray(base.metadata.sensitiveKeywordsFound));
  assert('metadata.totalIndicators',        typeof base.metadata.totalIndicators === 'number');
  assert('metadata.leakCheck is object',    typeof base.metadata.leakCheck === 'object');

  // ── Normal/benign email — should score LOW ───────────────────────────────────
  section('scanEmail — Low-risk normal email');
  const normal = await scanEmail(
    'Hi Sarah, just following up on the project timeline we discussed yesterday. ' +
    'Let me know your availability for a call next week. Best regards, James.'
  );
  console.log('  score:', normal.score, '| reasons:', normal.reasons.length);
  assert('low risk score <= 30', normal.score <= 30, `got ${normal.score}`);

  // ── High-risk phishing email ─────────────────────────────────────────────────
  section('scanEmail — High-risk phishing email');
  const phishing = await scanEmail(
    'URGENT: Your account will be suspended immediately! ' +
    'Click here to verify your password and OTP right now: http://paypa1-secure.login.xyz/update ' +
    'Final notice — act now or lose access within 24 hours. ' +
    'From: apple-support12345@gmail.com'
  );
  console.log('  score:', phishing.score, '| reasons:', phishing.reasons.length);
  assert('high risk score > 60',        phishing.score > 60,  `got ${phishing.score}`);
  assert('reasons array not empty',     phishing.reasons.length > 0);
  assert('urgency words detected',      phishing.metadata.urgencyWordsFound.length > 0);
  assert('phishing links detected',     phishing.metadata.phishingLinksFound.length > 0);
  assert('sensitive keywords detected', phishing.metadata.sensitiveKeywordsFound.length > 0);

  // ── Suspicious URL analysis ─────────────────────────────────────────────────
  section('scanEmail — Suspicious URLs (shortener + IP host)');

  const shortenerEmail = await scanEmail(
    'Please review the document here: http://bit.ly/3xK9mAb and confirm receipt.'
  );
  console.log('  shortener score:', shortenerEmail.score);
  assert('URL analysis populated', shortenerEmail.metadata.urlAnalysis.length > 0);
  // bit.ly alone is 1 signal (url_shortener) + http (uses_http) = 2 signals → high-risk
  assert('bit.ly flagged as phishing link', shortenerEmail.metadata.phishingLinksFound.length > 0);

  const ipEmail = await scanEmail(
    'Reset your password here: http://192.168.1.1/login/verify'
  );
  console.log('  IP host score:', ipEmail.score);
  assert('IP address URL flagged', ipEmail.metadata.phishingLinksFound.length > 0);

  // ── Credential / OTP / payment requests ─────────────────────────────────────
  section('scanEmail — Credential, OTP, and payment requests');

  const credEmail = await scanEmail(
    'Please enter your password and OTP to restore access to your account. ' +
    'Also provide your CVV for identity verification.'
  );
  console.log('  credential score:', credEmail.score);
  assert('sensitive keywords found', credEmail.metadata.sensitiveKeywordsFound.length > 0);
  assert('score reflects credential risk (>20)', credEmail.score > 20, `got ${credEmail.score}`);

  const paymentEmail = await scanEmail(
    'Hi, this is the CEO. Please process a wire transfer of $50,000 to our new vendor ' +
    'immediately. Keep this confidential and do not tell the finance team yet.'
  );
  console.log('  BEC/payment score:', paymentEmail.score);
  assert('BEC indicators in metadata', paymentEmail.metadata.socialEngineeringIndicators.length > 0);
  assert('score reflects BEC risk (>30)', paymentEmail.score > 30, `got ${paymentEmail.score}`);

  // ── Impersonation / typosquatting ────────────────────────────────────────────
  section('scanEmail — Sender impersonation and typosquatting');

  const impersonationEmail = await scanEmail(
    'Dear Customer, your PayPal account has been limited. ' +
    'Please verify at https://paypa1-secure.com/login/verify to restore access. ' +
    'From: support@paypa1-secure.com'
  );
  console.log('  impersonation score:', impersonationEmail.score);
  assert('impersonation detected (score>30)', impersonationEmail.score > 30, `got ${impersonationEmail.score}`);

  const freeDomainBrand = await scanEmail(
    'From: amazon-support@gmail.com\n' +
    'Your Amazon order has been flagged. Reply with your account password to verify.'
  );
  console.log('  free-domain brand score:', freeDomainBrand.score);
  assert('brand-on-free-domain flagged', freeDomainBrand.metadata.senderFlags.includes('brand_on_free_domain'));

  // ── Poor formatting / ALL CAPS ───────────────────────────────────────────────
  section('scanEmail — Poor formatting signals');
  const allCaps = await scanEmail('CLICK HERE NOW!!! YOUR ACCOUNT IS EXPIRED!!! ACT NOW!!!');
  console.log('  all-caps score:', allCaps.score);
  assert('poor formatting detected (score>0)', allCaps.score > 0);

  // ── Empty / invalid input — should NOT throw ─────────────────────────────────
  section('scanEmail — Edge cases (empty and invalid input)');

  const empty = await scanEmail('');
  assert('empty string returns object',   typeof empty === 'object');
  assert('empty string score is 0',       empty.score === 0);
  assert('empty reasons is array',        Array.isArray(empty.reasons));

  const nullInput = await scanEmail(null);
  assert('null input returns object',     typeof nullInput === 'object');
  assert('null input score is 0',         nullInput.score === 0);

  const undefinedInput = await scanEmail(undefined);
  assert('undefined input returns object', typeof undefinedInput === 'object');

  // ── LeakCheck failure handling ───────────────────────────────────────────────
  section('scanEmail — LeakCheck failure handling');
  // This test verifies the scanner does NOT throw even if LeakCheck is unreachable.
  // We inject an obviously invalid email address that won't match real breach data.
  const fakeEmail = await scanEmail('test@definitely-not-a-real-domain-xyz.invalid');
  assert('scan completes despite breach lookup result', typeof fakeEmail === 'object');
  assert('leakCheck metadata always present',
    typeof fakeEmail.metadata.leakCheck === 'object');
  assert('leakCheck.breachFound is boolean',
    typeof fakeEmail.metadata.leakCheck.breachFound === 'boolean');
}

// ─── scanIdentity tests ────────────────────────────────────────────────────────

async function testScanIdentity() {
  section('scanIdentity — Output contract');

  const base = await scanIdentity('randomxyz99z');
  assert('returns an object',                typeof base === 'object' && base !== null);
  assert('score is a number',                typeof base.score === 'number');
  assert('score is between 0-100',           base.score >= 0 && base.score <= 100);
  assert('reasons is an array',              Array.isArray(base.reasons));
  assert('metadata is an object',            typeof base.metadata === 'object');
  assert('metadata.exposedPlatforms array',  Array.isArray(base.metadata.exposedPlatforms));
  assert('metadata.exposureLevel string',    typeof base.metadata.exposureLevel === 'string');
  assert('metadata.breachDetected boolean',  typeof base.metadata.breachDetected === 'boolean');
  assert('metadata.usernameRiskFlags array', Array.isArray(base.metadata.usernameRiskFlags));

  // ─── High-risk username ─────────────────────────────────────────────────────
  section('scanIdentity — High-risk username "admin"');
  const admin = await scanIdentity('admin');
  console.log('  score:', admin.score, '| reasons:', admin.reasons.length);
  assert('admin score > 30',          admin.score > 30, `got ${admin.score}`);
  assert('high_risk_pattern flagged', admin.metadata.usernameRiskFlags.includes('high_risk_pattern'));

  // ─── Birth year detection ───────────────────────────────────────────────────
  section('scanIdentity — Username with birth year "john1999"');
  const birthYear = await scanIdentity('john1999');
  console.log('  score:', birthYear.score, '| reasons:', birthYear.reasons.length);
  assert('birth_year flagged',        birthYear.metadata.usernameRiskFlags.includes('birth_year'));
  assert('common_first_name flagged', birthYear.metadata.usernameRiskFlags.includes('common_first_name'));
  assert('score > 20',                birthYear.score > 20, `got ${birthYear.score}`);

  // ─── Email input ─────────────────────────────────────────────────────────────
  section('scanIdentity — Email input "john@gmail.com"');
  const email = await scanIdentity('john@gmail.com');
  console.log('  score:', email.score, '| inputType:', email.metadata.inputType);
  assert('inputType is "email"',     email.metadata.inputType === 'email');
  assert('free domain reason added', email.reasons.some(r => r.toLowerCase().includes('free email')));

  // ─── Disposable email ───────────────────────────────────────────────────────
  section('scanIdentity — Disposable email "test@mailinator.com"');
  const disposable = await scanIdentity('test@mailinator.com');
  console.log('  score:', disposable.score);
  assert('disposable domain reason added', disposable.reasons.some(r => r.toLowerCase().includes('disposable')));
  assert('score higher than normal',       disposable.score > 20);

  // ─── Random low-risk username ───────────────────────────────────────────────
  section('scanIdentity — Low-risk username "zq8m3r"');
  const lowRisk = await scanIdentity('zq8m3r');
  console.log('  score:', lowRisk.score);
  assert('no high_risk_pattern flag', !lowRisk.metadata.usernameRiskFlags.includes('high_risk_pattern'));

  // ─── Edge cases ─────────────────────────────────────────────────────────────
  section('scanIdentity — Edge cases');
  const tooShort = await scanIdentity('ab');
  assert('short input returns object',      typeof tooShort === 'object');
  assert('short input score is a number',   typeof tooShort.score === 'number');

  const undef = await scanIdentity('');
  assert('empty input does not throw',      typeof undef === 'object');
  assert('empty input score >= 0',          undef.score >= 0);
}

// ─── Runner ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🔍  Identity & Privacy Scanner Test Suite\n');

  try {
    await testScanEmail();
  } catch (err) {
    console.error('\n💥 testScanEmail threw unexpectedly:', err.message);
    console.error(err.stack);
  }

  try {
    await testScanIdentity();
  } catch (err) {
    console.error('\n💥 testScanIdentity threw unexpectedly:', err.message);
    console.error(err.stack);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60));

  if (failed > 0) process.exit(1);
}

run();
