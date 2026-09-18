'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RiskBadge from '../../components/RiskBadge';
import { getResults, getStats } from '../../lib/api';

export default function DashboardPage() {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getResults(20), getStats()])
      .then(([resultsData, statsData]) => {
        if (cancelled) return;
        setResults(resultsData || []);
        setStats(statsData || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getCardBorder = (level) => {
     if(level === 'High') return 'hover:border-[#f85149] hover:shadow-[0_0_15px_rgba(248,81,73,0.1)]';
     if(level === 'Medium') return 'hover:border-[#d29922] hover:shadow-[0_0_15px_rgba(210,153,34,0.1)]';
     return 'hover:border-[#3fb950] hover:shadow-[0_0_15px_rgba(63,185,80,0.1)]';
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h1 className="font-syne text-4xl font-bold mb-2 text-[#f0f6fc]">Security Dashboard</h1>
        <p className="text-[#8b949e] mb-10 font-inter">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0f1923] p-6 rounded-xl border border-[#21262d]">
            <div className="text-[#0ea5e9] text-xl mb-4">●</div>
            <div className="font-jetbrains text-4xl font-bold text-[#f0f6fc] mb-1">{stats?.totalScans ?? results.length}</div>
            <div className="text-[#8b949e] text-sm uppercase tracking-widest font-bold">Total Scans</div>
          </div>
          <div className="bg-[#0f1923] p-6 rounded-xl border border-[#21262d]">
            <div className="text-[#f85149] text-xl mb-4">▲</div>
            <div className="font-jetbrains text-4xl font-bold text-[#f0f6fc] mb-1">
              {stats?.highRisk ?? results.filter(r => r.riskLevel === 'High').length}
            </div>
            <div className="text-[#8b949e] text-sm uppercase tracking-widest font-bold">High Risk Detections</div>
          </div>
          <div className="bg-[#0f1923] p-6 rounded-xl border border-[#21262d]">
            <div className="text-[#3fb950] text-xl mb-4">■</div>
            <div className="font-jetbrains text-4xl font-bold text-[#f0f6fc] mb-1">
              {stats?.lowRisk ?? results.filter(r => r.riskLevel === 'Low').length}
            </div>
            <div className="text-[#8b949e] text-sm uppercase tracking-widest font-bold">Low Risk Scans</div>
          </div>
        </div>

        <h2 className="font-syne text-2xl font-bold mb-6 text-[#f0f6fc]">Recent History</h2>

        {loading ? (
          <div className="flex justify-center mt-12 mb-8 loading-dots gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
          </div>
        ) : error ? (
          <div className="bg-[#0f1923] border border-[#f85149]/40 rounded-xl p-12 text-center text-[#f85149] font-inter">
            Could not reach the backend: {error}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-[#0f1923] border border-[#21262d] rounded-xl p-12 text-center text-[#8b949e] font-inter">
            No scans performed yet. Initialize a scan to populate intelligence.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result) => (
              <Link key={result._id} href={`/dashboard/${result._id}`}
                className={`block bg-[#0d1117] border border-[#21262d] rounded-xl p-6 transition-all duration-200 cursor-pointer ${getCardBorder(result.riskLevel)}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#21262d] text-[#f0f6fc] text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">{result.inputType}</span>
                  <span className="text-[#8b949e] text-xs font-inter">{getRelativeTime(result.createdAt)}</span>
                </div>
                <div className="font-jetbrains text-[#f0f6fc] text-lg truncate mb-6" title={result.inputValue}>
                  {result.inputValue}
                </div>
                <div className="flex justify-between items-end border-t border-[#21262d] pt-4 mt-auto">
                  <RiskBadge riskLevel={result.riskLevel} />
                  <span className="font-jetbrains text-3xl font-bold tracking-tighter" style={{
                    color: result.riskLevel === 'Low' ? '#3fb950' : result.riskLevel === 'Medium' ? '#d29922' : '#f85149'
                  }}>{result.riskScore}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
