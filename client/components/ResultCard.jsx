'use client';

import { useEffect, useMemo, useState } from 'react';

function levelForScore(score) {
  if (score >= 61) return 'High';
  if (score >= 31) return 'Medium';
  return 'Low';
}

function riskColor(level) {
  if (level === 'High') return { primary: '#f85149', glow: 'rgba(248,81,73,.22)' };
  if (level === 'Medium') return { primary: '#d29922', glow: 'rgba(210,153,34,.20)' };
  return { primary: '#3fb950', glow: 'rgba(63,153,80,.18)' };
}

function scanLabel(result) {
  const mode = result.metadata?.scanMode;
  if (result.inputType === 'identity') return 'IDENTITY SCAN';
  if (result.inputType === 'email' && mode === 'address') return 'EMAIL ADDRESS SCAN';
  if (result.inputType === 'email') return 'EMAIL BODY SCAN';
  return `${String(result.inputType || 'security').toUpperCase()} SCAN`;
}

function SectionTitle({ children, count, color = '#8b949e' }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8b949e]">
      <span style={{ color }}>■</span><span>{children}</span>
      {typeof count === 'number' && <span className="ml-auto font-jetbrains text-[#f0f6fc]">{count}</span>}
    </div>
  );
}

function ScoreGauge({ score, level }) {
  const [visibleScore, setVisibleScore] = useState(0);
  const { primary } = riskColor(level);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setVisibleScore(score), 120);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" aria-label={`Risk score ${score} out of 100`}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#0d1117" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={primary} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * visibleScore) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${primary})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-jetbrains text-4xl font-bold" style={{ color: primary }}>{score}</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-widest text-[#8b949e]">/ 100</span>
      </div>
    </div>
  );
}

export default function ResultCard({ result }) {
  const [mounted, setMounted] = useState(false);
  const score = Math.max(0, Math.min(100, Number(result?.riskScore ?? result?.score) || 0));
  const level = result?.riskLevel || levelForScore(score);
  const { primary, glow } = riskColor(level);
  const reasons = Array.isArray(result?.reasons) ? result.reasons : [];
  const recommendations = Array.isArray(result?.recommendations) ? result.recommendations : [];
  const platforms = Array.isArray(result?.metadata?.exposedPlatforms) ? result.metadata.exposedPlatforms : [];

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, [result]);

  const explanation = useMemo(() => {
    if (result?.explanation) return result.explanation;
    if (level === 'High') return 'Several indicators require attention. Review the findings below before continuing.';
    if (level === 'Medium') return 'Some indicators were found. Review the findings and apply the recommended safeguards.';
    return 'No significant indicators were found in this scan.';
  }, [level, result?.explanation]);

  if (!result) return null;

  return (
    <article className={`mt-10 overflow-hidden rounded-2xl border transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`} style={{ borderColor: `${primary}55`, background: 'linear-gradient(180deg,#0d1117 0%,#0a0f16 100%)', boxShadow: `0 0 36px ${glow}` }}>
      <div className="h-0.5 w-full" style={{ background: primary }} />
      <header className="flex flex-col items-start gap-6 border-b border-[#21262d] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded border border-[#30363d] bg-[#161b22] px-2 py-1 font-jetbrains text-xs uppercase tracking-widest text-[#8b949e]">{scanLabel(result)}</span>
            {level === 'High' && <span className="rounded border border-[#f85149]/40 bg-[#f85149]/10 px-2 py-1 font-jetbrains text-[10px] uppercase tracking-widest text-[#f85149]">HIGH PRIORITY</span>}
          </div>
          <p className="break-all font-jetbrains text-base leading-snug text-[#f0f6fc] md:text-lg">{result.inputValue || 'Scan result'}</p>
        </div>
        <div className="flex w-full shrink-0 items-center justify-between gap-4 sm:w-auto sm:flex-col">
          <ScoreGauge score={score} level={level} />
          <span className="rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: primary, borderColor: `${primary}70`, background: `${primary}15` }}>{level} Risk</span>
        </div>
      </header>
      <section className="border-b border-[#21262d] p-6 md:p-8" style={{ borderLeft: `3px solid ${primary}` }}>
        <SectionTitle color={primary}>Analysis</SectionTitle>
        <p className="text-sm leading-relaxed text-[#c9d1d9] md:text-base">{explanation}</p>
      </section>
      {platforms.length > 0 && <section className="border-b border-[#21262d] p-6 md:p-8">
        <SectionTitle count={platforms.length} color="#d29922">Estimated Platform Exposure</SectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{platforms.map(platform => <div key={platform} className="flex min-h-10 items-center rounded-lg border border-[#30363d] bg-[#161b22] px-3 text-sm text-[#c9d1d9]">{platform}</div>)}</div>
        <p className="mt-3 text-xs leading-relaxed text-[#8b949e]">This is an estimate based on username patterns, not a confirmation of active accounts.</p>
      </section>}
      <section className="grid gap-8 p-6 md:p-8 lg:grid-cols-2 lg:gap-12">
        <div><SectionTitle count={reasons.length} color={reasons.length ? '#d29922' : '#3fb950'}>Detected Indicators</SectionTitle>{reasons.length ? <ul className="space-y-3">{reasons.map((reason, index) => <li key={`${reason}-${index}`} className="flex items-start gap-3 rounded-lg border border-[#21262d] bg-[#d29922]/5 p-3.5 text-sm leading-relaxed text-[#c9d1d9]"><span className="shrink-0 text-[#d29922]">⚠</span><span>{reason}</span></li>)}</ul> : <p className="text-sm text-[#8b949e]">No indicators were found in this scan.</p>}</div>
        {recommendations.length > 0 && <div><SectionTitle color={primary}>Recommended Actions</SectionTitle><ul className="space-y-3">{recommendations.map((recommendation, index) => <li key={`${recommendation}-${index}`} className="flex items-start gap-3 text-sm leading-relaxed text-[#c9d1d9]"><span className="shrink-0" style={{ color: primary }}>✓</span><span>{recommendation}</span></li>)}</ul></div>}
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#21262d] bg-[#0a0f16] px-6 py-4 font-jetbrains text-xs text-[#3b424d] md:px-8"><span>SCAN_ID: {result._id?.slice(-8) || 'N/A'}</span><span>{result.createdAt ? new Date(result.createdAt).toISOString().slice(0, 19).replace('T', ' ') : 'Completed'} UTC</span></footer>
    </article>
  );
}
