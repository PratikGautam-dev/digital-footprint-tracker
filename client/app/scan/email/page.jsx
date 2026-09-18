'use client';

import { useState, useEffect } from 'react';
import { scanEmail } from '../../../lib/api';
import ResultCard from '../../../components/ResultCard';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const ADDRESS_STAGES = [
  '[*] Resolving email address...',
  '[*] Querying breach databases...',
  '[*] Analysing username patterns...',
  '[*] Scanning platform footprint...',
  '[*] Computing risk score...',
];

const BODY_STAGES = [
  '[*] Parsing email content...',
  '[*] Detecting urgency patterns...',
  '[*] Scanning embedded URLs...',
  '[*] Checking sender reputation...',
  '[*] Running social-engineering detection...',
  '[*] Computing risk score...',
];

export default function ScanEmailPage() {
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [stageHistory, setStageHistory] = useState([]);
  const [progress, setProgress]   = useState(0);

  const isAddress = EMAIL_REGEX.test(input.trim());
  const stages    = isAddress ? ADDRESS_STAGES : BODY_STAGES;

  // Animate terminal stages while loading
  useEffect(() => {
    if (!loading) { setProgress(0); setStageHistory([]); return; }
    let idx = 0;
    setStageHistory([stages[0]]);
    const stageTimer = setInterval(() => {
      idx++;
      if (idx < stages.length) {
        setStageHistory(prev => [...prev, stages[idx]]);
      }
    }, 700);
    const progTimer = setInterval(() => {
      setProgress(prev => prev >= 97 ? 97 : prev + 1.4);
    }, 80);
    return () => { clearInterval(stageTimer); clearInterval(progTimer); };
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setProgress(0);
    setStageHistory([]);
    try {
      const data = await scanEmail(input);
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during scanning');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-32 left-16 w-80 h-80 bg-[#8b5cf6] rounded-full opacity-10 blur-[90px]" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-[#06b6d4] rounded-full opacity-10 blur-[90px]" />
      </div>

      <div className="w-full max-w-[700px]">

        {/* ── Header ─────────────────────────────────────────────── */}
        {!result && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
              <h1 className="font-syne text-3xl md:text-4xl font-bold">Email Scanner</h1>
            </div>
            <p className="text-[#8b949e] font-inter text-base ml-6">
              Analyse email addresses for breaches &amp; identity exposure, or paste a full email to detect phishing &amp; social-engineering.
            </p>
          </div>
        )}

        {/* ── Input form ─────────────────────────────────────────── */}
        {!loading && !result && (
          <form onSubmit={handleSubmit}>
            {/* Mode pill */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-jetbrains px-2 py-0.5 rounded border transition-all ${isAddress && input.trim() ? 'border-[#8b5cf6]/60 bg-[#8b5cf6]/10 text-[#8b5cf6]' : 'border-[#30363d] bg-transparent text-[#8b949e]'}`}>
                {isAddress && input.trim() ? '📧 Address Mode — Breach & Identity Scan' : '📨 Body Mode — Phishing & BEC Analysis'}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Type an email address for breach/identity scan\n\n— or —\n\nPaste a full email body to check for phishing, BEC, and social-engineering indicators`}
                  spellCheck="false"
                  rows={input.includes('\n') || input.length > 60 ? 8 : 3}
                  className="w-full bg-[#0d1117] border border-[#21262d] text-[#f0f6fc] px-5 py-4 rounded-xl outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all font-jetbrains text-sm resize-y placeholder:text-[#8b949e]/40 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full py-4 rounded-xl font-syne font-bold text-base tracking-wide transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
                }}
              >
                🔍 {isAddress && input.trim() ? 'Scan Email Address' : 'Scan Email Content'}
              </button>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
                <p className="text-[#8b5cf6] font-bold text-xs uppercase tracking-widest font-inter mb-1">📧 Address Scan</p>
                <p className="text-[#8b949e] text-xs font-inter leading-relaxed">Enter a single email address to check data breaches, username patterns &amp; platform exposure.</p>
              </div>
              <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
                <p className="text-[#06b6d4] font-bold text-xs uppercase tracking-widest font-inter mb-1">📨 Body Scan</p>
                <p className="text-[#8b949e] text-xs font-inter leading-relaxed">Paste a full email to detect phishing links, urgency tactics, BEC patterns &amp; credential harvesting.</p>
              </div>
            </div>

            {error && (
              <div className="mt-5 bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] p-4 rounded-xl font-jetbrains text-sm">
                ⚠ {error}
              </div>
            )}
          </form>
        )}

        {/* ── Loading terminal ────────────────────────────────────── */}
        {loading && (
          <div className="w-full animate-fade-up">
            <div className="bg-[#0d1117] border border-[#8b5cf6]/30 rounded-xl p-6 font-jetbrains shadow-2xl mb-4 min-h-[260px]">
              {/* Terminal bar */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#21262d]">
                <div className="w-3 h-3 rounded-full bg-[#f85149]" />
                <div className="w-3 h-3 rounded-full bg-[#d29922]" />
                <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
                <span className="ml-2 text-[#8b949e] text-xs">agy-scanner — email analysis</span>
              </div>

              <p className="text-[#8b949e] text-sm mb-3">
                $ scan-email <span className="text-[#8b5cf6]">{input.length > 50 ? input.slice(0, 47) + '...' : input}</span>
              </p>

              <div className="space-y-1.5">
                {stageHistory.map((s, i) => (
                  <p key={i} className="text-[#3fb950] text-sm animate-fade-up">{s}</p>
                ))}
              </div>

              <p className="text-[#3fb950] animate-pulse mt-2 text-lg">_</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-[#0d1117] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
              />
            </div>
            <div className="flex justify-between text-xs font-inter text-[#8b949e]">
              <span>{isAddress ? 'Querying breach databases & analysing identity...' : 'Analysing email content for threats...'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* ── Result ─────────────────────────────────────────────── */}
        {result && !loading && (
          <>
            <button
              onClick={() => { setResult(null); setError(''); }}
              className="mb-4 text-[#8b949e] hover:text-[#f0f6fc] text-sm font-inter transition-colors flex items-center gap-2"
            >
              ← New Scan
            </button>
            <ResultCard result={result} />
          </>
        )}

      </div>
    </main>
  );
}
