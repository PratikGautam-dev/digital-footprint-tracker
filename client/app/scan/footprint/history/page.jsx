'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getResults } from '../../../../lib/api';

// ─── Pure SVG line chart ──────────────────────────────────────────────────────

function TrendChart({ scans }) {
  const W = 600;
  const H = 220;
  const PAD = { top: 20, right: 24, bottom: 48, left: 48 };

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const scores = scans.map((s) => s.riskScore);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const scoreRange = maxScore - minScore || 1;

  const toX = (i) => PAD.left + (i / Math.max(scans.length - 1, 1)) * innerW;
  const toY = (score) => PAD.top + innerH - ((score - minScore) / scoreRange) * innerH;

  // Build polyline points
  const points = scans.map((s, i) => `${toX(i)},${toY(s.riskScore)}`).join(' ');

  // Area fill path
  const areaPath =
    `M ${toX(0)},${toY(scans[0].riskScore)} ` +
    scans.slice(1).map((s, i) => `L ${toX(i + 1)},${toY(s.riskScore)}`).join(' ') +
    ` L ${toX(scans.length - 1)},${PAD.top + innerH} L ${toX(0)},${PAD.top + innerH} Z`;

  // Score colour helper
  const scoreColor = (s) => s > 70 ? '#f85149' : s > 30 ? '#d29922' : '#3fb950';

  // Y-axis labels (0, 25, 50, 75, 100)
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: '320px', maxWidth: '100%' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = toY(tick);
          if (y < PAD.top - 5 || y > PAD.top + innerH + 5) return null;
          return (
            <g key={tick}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
                stroke="#21262d" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                fontSize="10" fill="#8b949e" fontFamily="JetBrains Mono, monospace">
                {tick}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH}
          stroke="#21262d" strokeWidth="1" />

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        {scans.length > 1 && (
          <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Data points + x-axis dates */}
        {scans.map((s, i) => {
          const x = toX(i);
          const y = toY(s.riskScore);
          const color = scoreColor(s.riskScore);
          const dateLabel = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <g key={s._id || i}>
              {/* Glow ring */}
              <circle cx={x} cy={y} r="7" fill={color} opacity="0.2" />
              {/* Point */}
              <circle cx={x} cy={y} r="4" fill={color} stroke="#0d1117" strokeWidth="2" />
              {/* Score label above point */}
              <text x={x} y={y - 11} textAnchor="middle"
                fontSize="10" fontWeight="700" fill={color}
                fontFamily="JetBrains Mono, monospace">
                {s.riskScore}
              </text>
              {/* Date label below x-axis */}
              <text x={x} y={PAD.top + innerH + 16} textAnchor="middle"
                fontSize="9" fill="#8b949e" fontFamily="Inter, sans-serif">
                {dateLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Trend stats bar ──────────────────────────────────────────────────────────

function TrendStats({ scans }) {
  const scores = scans.map((s) => s.riskScore);
  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const peak = Math.max(...scores);
  const low = Math.min(...scores);

  const deltaColor = delta > 0 ? '#f85149' : delta < 0 ? '#3fb950' : '#8b949e';
  const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Change', value: delta === 0 ? 'Stable' : deltaLabel, color: deltaColor },
        { label: 'Average Score', value: avg, color: avg > 70 ? '#f85149' : avg > 30 ? '#d29922' : '#3fb950' },
        { label: 'Peak Risk', value: peak, color: peak > 70 ? '#f85149' : peak > 30 ? '#d29922' : '#3fb950' },
        { label: 'Lowest Risk', value: low, color: low > 70 ? '#f85149' : low > 30 ? '#d29922' : '#3fb950' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-[#0f1923] border border-[#21262d] rounded-xl p-5 text-center">
          <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold mb-2 font-inter">{label}</p>
          <p className="font-jetbrains text-3xl font-bold" style={{ color }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Scan history list ────────────────────────────────────────────────────────

function ScanHistoryList({ scans }) {
  return (
    <div className="space-y-3">
      {[...scans].reverse().map((s, i) => {
        const color = s.riskScore > 70 ? '#f85149' : s.riskScore > 30 ? '#d29922' : '#3fb950';
        return (
          <Link key={s._id || i} href={`/dashboard/${s._id}`}
            className="flex items-center justify-between bg-[#0f1923] border border-[#21262d] rounded-xl p-4 hover:border-[#8b5cf6]/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.1)] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <div>
                <p className="text-[#f0f6fc] text-sm font-inter font-medium">
                  {new Date(s.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[#8b949e] text-xs font-inter mt-0.5">Scan #{scans.length - i}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-jetbrains text-2xl font-bold" style={{ color }}>{s.riskScore}</span>
              <span className="text-[#8b949e] text-xs font-inter group-hover:text-[#f0f6fc] transition-colors">View →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FootprintHistoryPage() {
  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setScans([]);
    setSearched(false);

    try {
      const all = await getResults(100);
      const filtered = (all || [])
        .filter((r) => r.inputType === 'footprint' && (r.inputValue || '').toLowerCase().trim() === q)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setScans(filtered);
      setCommittedQuery(q);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <Link href="/scan/footprint" className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#f0f6fc] text-sm font-inter mb-8 transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Footprint Scanner
        </Link>

        <h1 className="font-syne text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          Exposure Trend
        </h1>
        <p className="text-[#8b949e] mb-10 font-inter text-lg">
          Track how your digital exposure score has changed over time across repeated footprint scans.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter username or email to look up history"
            spellCheck="false"
            className="flex-1 bg-[rgba(13,17,23,0.8)] border border-[#21262d] text-[#f0f6fc] px-5 py-4 rounded-xl outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all font-inter placeholder:text-[#8b949e]/50"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-4 bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white font-syne font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] whitespace-nowrap"
          >
            {loading ? 'Searching…' : 'View Trend'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-8 bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] p-4 rounded-lg font-inter animate-fade-up">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center my-16 loading-dots gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <>
            {scans.length === 0 ? (
              /* ── No history found ── */
              <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-16 text-center animate-fade-up">
                <div className="text-5xl mb-6">📊</div>
                <h2 className="font-syne text-xl font-bold text-[#f0f6fc] mb-3">No footprint scans found</h2>
                <p className="text-[#8b949e] font-inter mb-8">
                  No footprint scans recorded for <span className="font-jetbrains text-[#f0f6fc]">"{committedQuery}"</span>.
                </p>
                <Link href="/scan/footprint"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] text-white font-syne font-bold rounded-lg transition-all hover:brightness-110">
                  Run a Footprint Scan →
                </Link>
              </div>
            ) : scans.length === 1 ? (
              /* ── Only 1 scan ── */
              <div className="space-y-8 animate-fade-up">
                <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-8 text-center">
                  <div className="text-4xl mb-5">📈</div>
                  <h2 className="font-syne text-xl font-bold text-[#f0f6fc] mb-3">Only one scan found</h2>
                  <p className="text-[#8b949e] font-inter mb-2">
                    One scan recorded for <span className="font-jetbrains text-[#f0f6fc]">"{committedQuery}"</span>.
                  </p>
                  <p className="text-[#8b949e] font-inter mb-8">
                    Scan again later to start tracking your exposure trend.
                  </p>
                  <Link href="/scan/footprint"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] text-white font-syne font-bold rounded-lg transition-all hover:brightness-110">
                    Run Another Scan →
                  </Link>
                </div>
                <ScanHistoryList scans={scans} />
              </div>
            ) : (
              /* ── Multiple scans: full trend view ── */
              <div className="space-y-8 animate-fade-up">
                {/* Identity header */}
                <div className="flex items-center gap-4 p-5 bg-[#0f1923] border border-[#21262d] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-xl">👤</div>
                  <div>
                    <p className="font-jetbrains text-[#f0f6fc] font-bold text-lg">{committedQuery}</p>
                    <p className="text-[#8b949e] font-inter text-sm">{scans.length} scans tracked</p>
                  </div>
                </div>

                {/* Stats */}
                <TrendStats scans={scans} />

                {/* Chart */}
                <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-6">
                  <h2 className="font-syne text-lg font-bold text-[#f0f6fc] mb-1">Exposure Score Over Time</h2>
                  <p className="text-[#8b949e] text-xs font-inter mb-6">Risk score per scan, chronological order</p>
                  <TrendChart scans={scans} />
                </div>

                {/* Scan list */}
                <div>
                  <h2 className="font-syne text-lg font-bold text-[#f0f6fc] mb-4">Scan History</h2>
                  <ScanHistoryList scans={scans} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Initial prompt (before any search) */}
        {!searched && !loading && (
          <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-10 text-center">
            <div className="text-5xl mb-5">📈</div>
            <h2 className="font-syne text-xl font-bold text-[#f0f6fc] mb-3">Track your exposure over time</h2>
            <p className="text-[#8b949e] font-inter">
              Enter a username or email above to view how their exposure score has changed across repeated footprint scans.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
