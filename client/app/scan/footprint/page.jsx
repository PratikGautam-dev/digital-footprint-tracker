'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { scanFootprint } from '../../../lib/api';
import RiskBadge from '../../../components/RiskBadge';
import ReasonsList from '../../../components/ReasonsList';
import RecommendationsList from '../../../components/RecommendationsList';

// Static map of deactivation/account-management URLs per platform
const DEACTIVATION_URLS = {
  github: 'https://github.com/settings/admin',
  instagram: 'https://www.instagram.com/accounts/remove/request/permanent/',
  twitter: 'https://twitter.com/settings/account',
  facebook: 'https://www.facebook.com/help/224562897555674',
  reddit: 'https://www.reddit.com/settings/',
  linkedin: 'https://www.linkedin.com/psettings/member-data',
  snapchat: 'https://accounts.snapchat.com/accounts/delete_account',
  tiktok: 'https://www.tiktok.com/setting/',
  pinterest: 'https://www.pinterest.com/settings/',
  tumblr: 'https://www.tumblr.com/settings/account',
  steam: 'https://help.steampowered.com/en/faqs/view/1141-6372-A35D-A3DE',
  twitch: 'https://www.twitch.tv/settings/profile',
  gitlab: 'https://gitlab.com/-/profile/account',
  npm: 'https://www.npmjs.com/settings/~/profile',
  stackoverflow: 'https://stackoverflow.com/users/delete/current',
  medium: 'https://medium.com/me/settings',
  quora: 'https://www.quora.com/account',
  producthunt: 'https://www.producthunt.com/settings',
};

export default function ScanFootprintPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [stageHistory, setStageHistory] = useState([]);
  // Cleanup checklist: { [resultId_platform]: boolean }
  const [checklist, setChecklist] = useState({});

  const stages = [
    "[*] Initializing Sherlock OSINT engine...",
    "[*] Scanning social media platforms...",
    "[*] Checking professional networks...",
    "[*] Scanning gaming platforms...",
    "[*] Checking developer communities...",
    "[*] Analyzing results..."
  ];

  useEffect(() => {
    let progressInterval;
    let stageInterval;
    
    if (loading) {
      const duration = 90000;
      const tick = 100;
      const steps = duration / tick;
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return 98;
          return prev + (100 / steps);
        });
      }, tick);
      
      let currentStageIdx = 0;
      setScanStage(stages[0]);
      setStageHistory([stages[0]]);
      
      stageInterval = setInterval(() => {
        currentStageIdx++;
        if (currentStageIdx < stages.length) {
          setScanStage(stages[currentStageIdx]);
          setStageHistory(prev => [...prev, stages[currentStageIdx]]);
        }
      }, 3000);
      
    } else {
      setProgress(0);
      setStageHistory([]);
    }
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
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
      const data = await scanFootprint(input);
      setResult(data);
      // Load checklist from localStorage when result arrives
      if (data?._id) {
        const stored = {};
        const platforms = data.metadata?.sherlockRaw || [];
        platforms.forEach(({ platform }) => {
          const key = `${data._id}_${platform.toLowerCase()}`;
          stored[key] = localStorage.getItem(key) === 'true';
        });
        setChecklist(stored);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during scanning');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const toggleChecklist = (resultId, platform) => {
    const key = `${resultId}_${platform.toLowerCase()}`;
    const newVal = !checklist[key];
    localStorage.setItem(key, String(newVal));
    setChecklist((prev) => ({ ...prev, [key]: newVal }));
  };

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
    switch (category) {
      case 'Social': return '#0ea5e9';
      case 'Professional': return '#8b5cf6';
      case 'Gaming': return '#3fb950';
      case 'Developer': return '#06b6d4';
      case 'Forum': return '#f97316';
      case 'Shopping': return '#d29922';
      default: return '#8b949e';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Social': return '👥';
      case 'Professional': return '💼';
      case 'Gaming': return '🎮';
      case 'Developer': return '💻';
      case 'Forum': return '💬';
      case 'Shopping': return '🛒';
      default: return '🌐';
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-[800px]">
        {/* Section 1 — Hero Input Area */}
        {!loading && !result && (
          <div className="max-w-[600px] mx-auto bg-[#0f1923] border border-[#21262d] rounded-2xl p-8 shadow-2xl text-center">
            <h1 className="font-syne text-3xl md:text-4xl font-bold mb-4 text-[#f0f6fc]">Digital Footprint Scanner</h1>
            <p className="text-[#8b949e] font-inter mb-6">Discover your real presence across 300+ platforms using live OSINT analysis</p>
            
            <div className="border border-[#d29922]/50 bg-[#d29922]/10 rounded-lg p-3 mb-8 inline-block">
              <p className="text-[#d29922] text-sm font-inter">⚠ This tool performs real platform lookups. Scan may take 60-90 seconds to complete.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter username or email address" 
                  spellCheck="false"
                  className="w-full bg-[rgba(13,17,23,0.8)] border border-[#21262d] text-[#f0f6fc] px-5 py-4 rounded-xl outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all font-jetbrains placeholder:text-[#8b949e]/50"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="w-full bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white px-8 py-4 rounded-xl font-syne font-bold text-lg tracking-wide transition-all shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] flex justify-center items-center gap-2"
                >
                  🔍 Launch Footprint Scan
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] p-4 rounded-lg font-inter animate-fade-up text-left">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="w-full max-w-[600px] mx-auto animate-fade-up">
            <div className="bg-[#0d1117] border border-[rgba(139,92,246,0.3)] rounded-xl p-6 font-jetbrains shadow-2xl mb-4 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#21262d]">
                <div className="w-3 h-3 rounded-full bg-[#f85149]"></div>
                <div className="w-3 h-3 rounded-full bg-[#d29922]"></div>
                <div className="w-3 h-3 rounded-full bg-[#3fb950]"></div>
              </div>
              <p className="text-[#8b949e] mb-2">$ sherlock {input} --print-found</p>
              
              <div className="space-y-2 mb-2">
                {stageHistory.map((stage, i) => (
                  <p key={i} className="text-[#3fb950] animate-fade-up">{stage}</p>
                ))}
              </div>
              
              <p className="text-[#3fb950] animate-pulse">_</p>
            </div>
            
            <div className="w-full h-1.5 bg-[#0d1117] rounded-full overflow-hidden mb-2">
              <div className="h-full transition-all duration-300 ease-out bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]" 
                   style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-xs font-inter text-[#8b949e]">
              <span>Scanning 300+ platforms...</span>
              <span>This is a live scan. Please do not close this page.</span>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && !loading && (
          <div className="w-full animate-fade-up space-y-8">
            
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setResult(null)} className="text-[#8b949e] hover:text-[#f0f6fc] text-sm font-inter">← New Scan</button>
              <span className="text-[#21262d]">|</span>
              <Link href="/scan/footprint/history" className="text-[#8b5cf6] hover:text-[#a78bfa] text-sm font-inter transition-colors">
                📈 View Exposure Trend
              </Link>
            </div>

            {/* Header Card */}
            <div className="bg-[#0f1923] rounded-xl shadow-2xl border border-[#21262d] border-l-4 overflow-hidden"
                 style={{ borderLeftColor: getExposureColor(result.metadata.exposureLevel) }}>
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#21262d] text-[#f0f6fc] text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">{result.metadata.inputType}</span>
                    <span className="text-[#8b949e] text-xs font-inter">{new Date().toLocaleString()}</span>
                  </div>
                  <p className="font-jetbrains text-2xl md:text-3xl text-[#f0f6fc] truncate font-bold">{result.metadata.username}</p>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-2 p-4 bg-[#0d1117] rounded-lg border border-[#21262d]">
                  <p className="text-[#8b949e] text-xs uppercase tracking-widest font-bold font-inter">Platforms Detected</p>
                  <div className="font-jetbrains text-4xl md:text-5xl font-bold tracking-tighter" style={{ color: '#8b5cf6' }}>
                    {result.metadata.totalPlatformsFound}
                  </div>
                  <div 
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${result.metadata.exposureLevel === 'Critical' ? 'animate-pulse' : ''}`}
                    style={{ 
                      color: getExposureColor(result.metadata.exposureLevel), 
                      backgroundColor: `${getExposureColor(result.metadata.exposureLevel)}20`,
                      borderColor: `${getExposureColor(result.metadata.exposureLevel)}50` 
                    }}
                  >
                    ● {result.metadata.exposureLevel} Exposure
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Score Gauge */}
            <div className="bg-[#0f1923] rounded-xl border border-[#21262d] p-8 flex flex-col md:flex-row justify-around items-center gap-8">
              {/* Exposure Score */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#0d1117" strokeWidth="8" />
                    <circle cx="80" cy="80" r="70" fill="transparent" 
                            stroke={result.score > 70 ? '#f85149' : result.score > 30 ? '#d29922' : '#3fb950'} 
                            strokeWidth="8" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * result.score) / 100} 
                            strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-jetbrains text-4xl font-bold text-[#f0f6fc]">{result.score}</span>
                    <span className="text-[#8b949e] text-xs uppercase text-center mt-1">/ 100</span>
                  </div>
                </div>
                <span className="text-[#f0f6fc] font-syne font-bold uppercase tracking-wider">Exposure Score</span>
              </div>

              <div className="h-[100px] w-px bg-[#21262d] hidden md:block"></div>

              {/* Privacy Score */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#0d1117" strokeWidth="8" />
                    <circle cx="80" cy="80" r="70" fill="transparent" 
                            stroke={result.metadata.privacyScore > 70 ? '#3fb950' : result.metadata.privacyScore > 30 ? '#d29922' : '#f85149'} 
                            strokeWidth="8" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * result.metadata.privacyScore) / 100} 
                            strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-jetbrains text-4xl font-bold text-[#f0f6fc]">{result.metadata.privacyScore}</span>
                    <span className="text-[#8b949e] text-xs uppercase text-center mt-1">/ 100</span>
                  </div>
                </div>
                <span className="text-[#f0f6fc] font-syne font-bold uppercase tracking-wider">Privacy Score</span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
              {Object.entries(result.metadata.categorySummary).map(([cat, count]) => {
                const accent = count >= 3 ? 'text-[#8b5cf6]' : count > 0 ? 'text-[#0ea5e9]' : 'text-[#8b949e]';
                return (
                  <div key={cat} className="flex-shrink-0 bg-[#0f1923] border border-[#21262d] rounded-xl p-4 min-w-[120px] flex flex-col items-center justify-center gap-2">
                    <div className="text-2xl">{getCategoryIcon(cat)}</div>
                    <div className="text-[#f0f6fc] font-syne font-bold text-sm tracking-wide">{cat}</div>
                    <div className={`font-jetbrains text-3xl font-bold ${accent}`}>{count}</div>
                  </div>
                );
              })}
            </div>

            {/* Detected Platforms List */}
            {result.metadata.platformsDetected && result.metadata.platformsDetected.length > 0 && (
              <div>
                <div className="mb-4 border-b border-[#21262d] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
                  <div>
                    <h2 className="font-syne text-2xl font-bold text-[#f0f6fc]">Confirmed Platform Detections</h2>
                    <p className="text-[#8b949e] font-inter">{result.metadata.totalPlatformsFound} real accounts found</p>
                  </div>
                  {/* Progress indicator */}
                  {result.metadata.sherlockRaw?.length > 0 && (() => {
                    const total = result.metadata.sherlockRaw.length;
                    const done = result.metadata.sherlockRaw.filter(({ platform }) =>
                      checklist[`${result._id}_${platform.toLowerCase()}`]
                    ).length;
                    const pct = Math.round((done / total) * 100);
                    return (
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-sm font-inter text-[#8b949e]">
                          <span className="text-[#3fb950] font-bold">{done}</span> of {total} platforms addressed
                        </p>
                        <div className="w-40 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#3fb950] transition-all duration-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.metadata.sherlockRaw?.map((item, idx) => {
                    let category = 'Other';
                    const p = item.platform.toLowerCase();
                    if (['instagram', 'twitter', 'facebook', 'tiktok', 'snapchat', 'pinterest', 'tumblr', 'mastodon', 'vk', 'weibo'].includes(p)) category = 'Social';
                    else if (['linkedin', 'behance', 'dribbble', 'angellist', 'xing', 'freelancer', 'upwork', 'fiverr'].includes(p)) category = 'Professional';
                    else if (['steam', 'xbox', 'playstation', 'twitch', 'roblox', 'minecraft', 'speedrun', 'kongregate', 'newgrounds'].includes(p)) category = 'Gaming';
                    else if (['github', 'gitlab', 'npm', 'stackoverflow', 'hackernews', 'replit', 'codepen', 'dev.to', 'hackmd', 'bugcrowd'].includes(p)) category = 'Developer';
                    else if (['reddit', 'quora', 'medium', 'producthunt', 'boardgamegeek', 'dailykos'].includes(p)) category = 'Forum';
                    else if (['amazon', 'etsy', 'flipkart', 'ebay'].includes(p)) category = 'Shopping';
                    else category = 'Other';

                    const catColor = getCategoryColor(category);
                    const checkKey = `${result._id}_${p}`;
                    const isChecked = !!checklist[checkKey];
                    const manageUrl = DEACTIVATION_URLS[p] || item.url;

                    return (
                      <div key={idx}
                        className={`bg-[#0f1923] border rounded-lg p-5 flex items-start gap-4 transition-all duration-200 ${
                          isChecked
                            ? 'border-[#3fb950]/40 bg-[#3fb950]/5 opacity-70'
                            : 'border-[#21262d] hover:border-[color:var(--hover-color)] hover:shadow-[0_0_15px_var(--hover-shadow)]'
                        } group`}
                        style={{ '--hover-color': catColor, '--hover-shadow': `${catColor}30` }}>
                        {/* Category dot */}
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: catColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold font-inter truncate pr-2 ${isChecked ? 'line-through text-[#8b949e]' : 'text-[#f0f6fc]'}`}>
                              {item.platform}
                            </h3>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border flex-shrink-0"
                              style={{ color: catColor, borderColor: `${catColor}40`, backgroundColor: `${catColor}10` }}>
                              {category}
                            </span>
                          </div>
                          <p className="text-[#8b949e] font-jetbrains text-xs truncate mb-3">{item.url}</p>
                          <div className="flex items-center justify-between gap-3">
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                              className="text-[#0ea5e9] text-sm hover:underline font-medium inline-flex items-center gap-1 group-hover:text-[#06b6d4]">
                              View Profile ↗
                            </a>
                            <a href={manageUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors font-inter whitespace-nowrap">
                              Manage →
                            </a>
                          </div>
                          {/* Cleanup checkbox */}
                          <label className="flex items-center gap-2 mt-3 pt-3 border-t border-[#21262d] cursor-pointer group/check select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChecklist(result._id, item.platform)}
                              className="w-4 h-4 rounded border-[#21262d] accent-[#3fb950] cursor-pointer"
                            />
                            <span className={`text-xs font-inter transition-colors ${
                              isChecked ? 'text-[#3fb950]' : 'text-[#8b949e] group-hover/check:text-[#f0f6fc]'
                            }`}>
                              {isChecked ? '✓ Secured / Removed' : "I've removed / secured this account"}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reasons and Recommendations */}
            <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 lg:gap-12 bg-[#0f1923] border border-[#21262d] rounded-xl mt-8">
              <ReasonsList reasons={result.reasons || []} />
              <RecommendationsList recommendations={result.recommendations || []} />
            </div>

          </div>
        )}
      </div>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
