'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getResultById } from '../../../lib/api';
import RiskBadge from '../../../components/RiskBadge';
import ReasonsList from '../../../components/ReasonsList';
import RecommendationsList from '../../../components/RecommendationsList';

// ─── Metadata panels ────────────────────────────────────────────────────────

function IdentityMetaPanel({ metadata }) {
  if (!metadata) return null;
  const lc = metadata.leakCheck || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Input Classification */}
      <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-6">
        <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold mb-4 font-inter">Identity Analysis</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Input Type</span>
            <span className="font-jetbrains text-[#f0f6fc] text-sm uppercase">{metadata.inputType || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Exposure Level</span>
            <span className={`text-sm font-bold font-inter ${
              metadata.exposureLevel === 'High' ? 'text-[#f85149]' :
              metadata.exposureLevel === 'Medium' ? 'text-[#d29922]' : 'text-[#3fb950]'
            }`}>{metadata.exposureLevel || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Breach Detected</span>
            <span className={`text-sm font-bold ${metadata.breachDetected ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
              {metadata.breachDetected ? '⚠ Yes' : '✓ No'}
            </span>
          </div>
          {metadata.usernameRiskFlags && metadata.usernameRiskFlags.length > 0 && (
            <div className="pt-3 border-t border-[#21262d]">
              <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold mb-2 font-inter">Risk Flags</p>
              <div className="flex flex-wrap gap-2">
                {metadata.usernameRiskFlags.map((flag, i) => (
                  <span key={i} className="bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-xs font-mono px-2 py-0.5 rounded">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Exposure */}
      <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-6">
        <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold mb-4 font-inter">Platform Exposure</p>
        {metadata.exposedPlatforms && metadata.exposedPlatforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {metadata.exposedPlatforms.map((p, i) => (
              <span key={i} className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-xs font-mono px-2 py-1 rounded">
                {p}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[#8b949e] font-inter text-sm italic">No platforms detected</p>
        )}
      </div>

      {/* LeakCheck Breach Details */}
      {lc.breachFound && (
        <div className="md:col-span-2 bg-[#f85149]/5 border border-[#f85149]/30 rounded-xl p-6">
          <p className="text-[#f85149] text-xs uppercase tracking-widest font-bold mb-4 font-inter">⚠ Data Breach Details</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[#8b949e] text-xs uppercase font-bold mb-1 font-inter">Breaches Found</p>
              <p className="font-jetbrains text-2xl font-bold text-[#f85149]">{lc.breachCount}</p>
            </div>
            {lc.mostRecentBreach && (
              <div>
                <p className="text-[#8b949e] text-xs uppercase font-bold mb-1 font-inter">Most Recent</p>
                <p className="font-jetbrains text-sm text-[#f0f6fc]">{lc.mostRecentBreach}</p>
              </div>
            )}
            {lc.exposedFields && lc.exposedFields.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-[#8b949e] text-xs uppercase font-bold mb-2 font-inter">Exposed Fields</p>
                <div className="flex flex-wrap gap-1">
                  {lc.exposedFields.map((f, i) => (
                    <span key={i} className="bg-[#d29922]/10 border border-[#d29922]/30 text-[#d29922] text-xs px-2 py-0.5 rounded font-mono">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {lc.breachSources && lc.breachSources.length > 0 && (
            <>
              <p className="text-[#8b949e] text-xs uppercase font-bold mb-2 font-inter">Breach Sources</p>
              <div className="flex flex-wrap gap-2">
                {lc.breachSources.map((s, i) => (
                  <span key={i} className="bg-[#21262d] text-[#f0f6fc] text-xs px-2 py-1 rounded font-mono">
                    {s.name}{s.date ? ` (${s.date})` : ''}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmailMetaPanel({ metadata }) {
  if (!metadata) return null;
  const lc = metadata.leakCheck || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Email Analysis */}
      <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-6">
        <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold mb-4 font-inter">Email Analysis</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Total Indicators</span>
            <span className="font-jetbrains text-[#f0f6fc] text-sm">{metadata.totalIndicators ?? 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Urgency Words</span>
            <span className={`font-jetbrains text-sm ${metadata.urgencyWordsFound?.length > 0 ? 'text-[#d29922]' : 'text-[#3fb950]'}`}>
              {metadata.urgencyWordsFound?.length ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Phishing Links</span>
            <span className={`font-jetbrains text-sm ${metadata.phishingLinksFound?.length > 0 ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
              {metadata.phishingLinksFound?.length ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8b949e] text-sm font-inter">Sensitive Keywords</span>
            <span className={`font-jetbrains text-sm ${metadata.sensitiveKeywordsFound?.length > 0 ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
              {metadata.sensitiveKeywordsFound?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Flagged Content */}
      <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-6 space-y-4">
        <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold font-inter">Flagged Content</p>
        {metadata.urgencyWordsFound?.length > 0 && (
          <div>
            <p className="text-[#d29922] text-xs font-bold mb-1 font-inter">Urgency Words</p>
            <div className="flex flex-wrap gap-1">
              {metadata.urgencyWordsFound.map((w, i) => (
                <span key={i} className="bg-[#d29922]/10 border border-[#d29922]/30 text-[#d29922] text-xs px-2 py-0.5 rounded font-mono">{w}</span>
              ))}
            </div>
          </div>
        )}
        {metadata.sensitiveKeywordsFound?.length > 0 && (
          <div>
            <p className="text-[#f85149] text-xs font-bold mb-1 font-inter">Sensitive Keywords</p>
            <div className="flex flex-wrap gap-1">
              {metadata.sensitiveKeywordsFound.map((w, i) => (
                <span key={i} className="bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-xs px-2 py-0.5 rounded font-mono">{w}</span>
              ))}
            </div>
          </div>
        )}
        {metadata.phishingLinksFound?.length > 0 && (
          <div>
            <p className="text-[#f85149] text-xs font-bold mb-1 font-inter">Phishing Links</p>
            <div className="space-y-1">
              {metadata.phishingLinksFound.map((link, i) => (
                <p key={i} className="text-[#f0f6fc] font-mono text-xs truncate bg-[#f85149]/5 border border-[#f85149]/20 px-2 py-1 rounded" title={link}>
                  {link}
                </p>
              ))}
            </div>
          </div>
        )}
        {!metadata.urgencyWordsFound?.length && !metadata.sensitiveKeywordsFound?.length && !metadata.phishingLinksFound?.length && (
          <p className="text-[#8b949e] font-inter text-sm italic">No flagged content</p>
        )}
      </div>

      {/* LeakCheck for email scans */}
      {lc.breachFound && (
        <div className="md:col-span-2 bg-[#f85149]/5 border border-[#f85149]/30 rounded-xl p-6">
          <p className="text-[#f85149] text-xs uppercase tracking-widest font-bold mb-4 font-inter">⚠ Email Address Breach Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[#8b949e] text-xs uppercase font-bold mb-1 font-inter">Breaches Found</p>
              <p className="font-jetbrains text-2xl font-bold text-[#f85149]">{lc.breachCount}</p>
            </div>
            {lc.mostRecentBreach && (
              <div>
                <p className="text-[#8b949e] text-xs uppercase font-bold mb-1 font-inter">Most Recent</p>
                <p className="font-jetbrains text-sm text-[#f0f6fc]">{lc.mostRecentBreach}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FootprintMetaPanel({ result }) {
  const meta = result.metadata || {};

  const getExposureColor = (level) => {
    switch (level) {
      case 'Minimal': return '#8b949e';
      case 'Low': return '#3fb950';
      case 'Medium': return '#d29922';
      case 'High': return '#f97316';
      case 'Critical': return '#f85149';
      default: return '#8b949e';
    }
  };

  const getCategoryColor = (category) => {
    const map = { Social: '#0ea5e9', Professional: '#8b5cf6', Gaming: '#3fb950', Developer: '#06b6d4', Forum: '#f97316', Shopping: '#d29922' };
    return map[category] || '#8b949e';
  };

  const getCategoryIcon = (category) => {
    const map = { Social: '👥', Professional: '💼', Gaming: '🎮', Developer: '💻', Forum: '💬', Shopping: '🛒' };
    return map[category] || '🌐';
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Gauge Row */}
      <div className="bg-[#0f1923] rounded-xl border border-[#21262d] p-8 flex flex-col md:flex-row justify-around items-center gap-8">
        {[
          { label: 'Exposure Score', value: result.score, high: 70, low: 30, invert: false },
          { label: 'Privacy Score', value: meta.privacyScore, high: 70, low: 30, invert: true },
        ].map(({ label, value, high, low, invert }) => {
          const pct = value ?? 0;
          const color = invert
            ? (pct > high ? '#3fb950' : pct > low ? '#d29922' : '#f85149')
            : (pct > high ? '#f85149' : pct > low ? '#d29922' : '#3fb950');
          return (
            <div key={label} className="flex flex-col items-center gap-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" fill="transparent" stroke="#0d1117" strokeWidth="8" />
                  <circle cx="72" cy="72" r="62" fill="transparent"
                    stroke={color} strokeWidth="8"
                    strokeDasharray="389.6"
                    strokeDashoffset={389.6 - (389.6 * pct) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-jetbrains text-3xl font-bold text-[#f0f6fc]">{pct}</span>
                  <span className="text-[#8b949e] text-xs uppercase text-center mt-1">/ 100</span>
                </div>
              </div>
              <span className="text-[#f0f6fc] font-syne font-bold uppercase tracking-wider text-sm">{label}</span>
            </div>
          );
        })}
        <div className="flex flex-col items-center gap-4">
          <div
            className="px-5 py-4 rounded-xl border text-center"
            style={{
              color: getExposureColor(meta.exposureLevel),
              backgroundColor: `${getExposureColor(meta.exposureLevel)}15`,
              borderColor: `${getExposureColor(meta.exposureLevel)}40`,
            }}
          >
            <p className="font-jetbrains text-4xl font-bold">{meta.totalPlatformsFound ?? 0}</p>
            <p className="text-xs uppercase tracking-widest mt-1 font-inter font-bold">Platforms Found</p>
          </div>
          <div
            className="px-3 py-1 text-xs font-bold uppercase rounded-full border"
            style={{
              color: getExposureColor(meta.exposureLevel),
              backgroundColor: `${getExposureColor(meta.exposureLevel)}20`,
              borderColor: `${getExposureColor(meta.exposureLevel)}50`,
            }}
          >
            ● {meta.exposureLevel} Exposure
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {meta.categorySummary && (
        <div className="flex overflow-x-auto pb-2 gap-4 hide-scrollbar">
          {Object.entries(meta.categorySummary).map(([cat, count]) => {
            const color = getCategoryColor(cat);
            return (
              <div key={cat} className="flex-shrink-0 bg-[#0f1923] border border-[#21262d] rounded-xl p-4 min-w-[110px] flex flex-col items-center gap-2">
                <div className="text-2xl">{getCategoryIcon(cat)}</div>
                <div className="text-[#f0f6fc] font-syne font-bold text-xs tracking-wide text-center">{cat}</div>
                <div className="font-jetbrains text-3xl font-bold" style={{ color: count >= 3 ? '#8b5cf6' : count > 0 ? '#0ea5e9' : '#8b949e' }}>{count}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detected Platforms */}
      {meta.sherlockRaw && meta.sherlockRaw.length > 0 && (
        <div>
          <h2 className="font-syne text-xl font-bold text-[#f0f6fc] mb-4">Confirmed Platform Detections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meta.sherlockRaw.map((item, idx) => {
              const p = item.platform.toLowerCase();
              let category = 'Other';
              if (['instagram','twitter','facebook','tiktok','snapchat','pinterest','tumblr','mastodon','vk','weibo'].includes(p)) category = 'Social';
              else if (['linkedin','behance','dribbble','angellist','xing','freelancer','upwork','fiverr'].includes(p)) category = 'Professional';
              else if (['steam','xbox','playstation','twitch','roblox','minecraft','speedrun','kongregate','newgrounds'].includes(p)) category = 'Gaming';
              else if (['github','gitlab','npm','stackoverflow','hackernews','replit','codepen','dev.to','hackmd','bugcrowd'].includes(p)) category = 'Developer';
              else if (['reddit','quora','medium','producthunt'].includes(p)) category = 'Forum';
              else if (['amazon','etsy','flipkart','ebay'].includes(p)) category = 'Shopping';

              const catColor = getCategoryColor(category);
              return (
                <div key={idx} className="bg-[#0f1923] border border-[#21262d] rounded-lg p-5 flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: catColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[#f0f6fc] font-bold font-inter truncate pr-2">{item.platform}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border" style={{ color: catColor, borderColor: `${catColor}40`, backgroundColor: `${catColor}10` }}>{category}</span>
                    </div>
                    <p className="text-[#8b949e] font-jetbrains text-xs truncate mb-3">{item.url}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#0ea5e9] text-sm hover:underline font-medium inline-flex items-center gap-1">
                      View Profile ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ResultDetailPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [scoreWidth, setScoreWidth] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getResultById(id)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setTimeout(() => setScoreWidth(data?.riskScore || 0), 150);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex justify-center mt-20 loading-dots gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
          </div>
        </div>
      </main>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] text-sm font-inter mb-8 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-16 text-center animate-fade-up">
            <div className="text-5xl mb-6">🔍</div>
            <h1 className="font-syne text-2xl font-bold text-[#f0f6fc] mb-3">Scan Not Found</h1>
            <p className="text-[#8b949e] font-inter mb-8">This scan result doesn't exist or may have been deleted.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0ea5e9] hover:brightness-110 text-white font-syne font-bold rounded-lg transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] text-sm font-inter mb-8 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-xl p-8 text-center text-[#f85149] font-inter">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!result) return null;

  const scoreColor =
    result.riskLevel === 'Low' ? '#3fb950' :
    result.riskLevel === 'Medium' ? '#d29922' : '#f85149';

  const gradientColor =
    result.riskLevel === 'Low' ? 'linear-gradient(90deg, #2ea043, #3fb950)' :
    result.riskLevel === 'Medium' ? 'linear-gradient(90deg, #bb8009, #d29922)' :
    'linear-gradient(90deg, #da3633, #f85149)';

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl animate-fade-up">

        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] text-sm font-inter mb-8 transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Dashboard
        </Link>

        {/* Main Result Card */}
        <div className="bg-[#0f1923] rounded-xl shadow-2xl border border-[#21262d] overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#21262d]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#21262d] text-[#f0f6fc] text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">{result.inputType}</span>
                <span className="text-[#8b949e] text-xs font-inter">{new Date(result.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-jetbrains text-lg md:text-xl text-[#f0f6fc] break-all" title={result.inputValue}>{result.inputValue}</p>
            </div>
            <div className="flex flex-col items-end min-w-[120px]">
              <div className="font-jetbrains text-6xl md:text-7xl font-bold tracking-tighter" style={{ color: scoreColor }}>
                {result.riskScore}
              </div>
              <span className="text-[#8b949e] text-xs font-inter mt-1">Risk Score</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full h-1.5 bg-[#0d1117]">
            <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${scoreWidth}%`, background: gradientColor }} />
          </div>

          {/* Risk badge row */}
          <div className="p-6 md:p-8 border-b border-[#21262d] flex justify-between items-center bg-[#0d1117]/50">
            <RiskBadge riskLevel={result.riskLevel} />
          </div>

          {/* AI Explanation */}
          <div className="p-6 md:p-8 bg-[#0d1117] border-l-4" style={{ borderLeftColor: scoreColor }}>
            <p className="text-[#8b949e] font-inter uppercase tracking-widest text-xs font-bold mb-3">AI Analysis</p>
            <p className="text-[#f0f6fc] text-base md:text-lg leading-relaxed font-inter">{result.explanation}</p>
          </div>

          {/* Reasons + Recommendations */}
          <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 lg:gap-12 bg-[#0f1923]">
            <ReasonsList reasons={result.reasons || []} />
            <RecommendationsList recommendations={result.recommendations || []} />
          </div>
        </div>

        {/* Type-specific metadata panel */}
        {result.inputType === 'identity' && <IdentityMetaPanel metadata={result.metadata} />}
        {result.inputType === 'email' && <EmailMetaPanel metadata={result.metadata} />}
        {result.inputType === 'footprint' && <FootprintMetaPanel result={result} />}

      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
