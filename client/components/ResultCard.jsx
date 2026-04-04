'use client';

import { useEffect, useState } from 'react';
import RiskBadge from './RiskBadge';
import ReasonsList from './ReasonsList';
import RecommendationsList from './RecommendationsList';

export default function ResultCard({ result }) {
  const [scoreWidth, setScoreWidth] = useState(0);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => {
      setScoreWidth(result?.riskScore || 0);
    }, 100);
  }, [result]);

  if (!result) return null;

  const scoreColor = 
    result.riskLevel === 'Low' ? '#3fb950' :
    result.riskLevel === 'Medium' ? '#d29922' : '#f85149';

  const gradientColor = 
    result.riskLevel === 'Low' ? 'linear-gradient(90deg, #2ea043, #3fb950)' :
    result.riskLevel === 'Medium' ? 'linear-gradient(90deg, #bb8009, #d29922)' : 
    'linear-gradient(90deg, #da3633, #f85149)';

  return (
    <div className="bg-[#0f1923] rounded-xl shadow-2xl border border-[#21262d] mt-10 overflow-hidden animate-fade-up">
      {/* Header Section */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#21262d]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#21262d] text-[#f0f6fc] text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">{result.inputType}</span>
          </div>
          <p className="font-jetbrains text-lg text-[#f0f6fc] truncate" title={result.inputValue}>{result.inputValue}</p>
        </div>
        
        <div className="flex flex-col items-end md:items-center min-w-[120px]">
          <div className="font-jetbrains text-6xl md:text-7xl font-bold tracking-tighter" style={{ color: scoreColor }}>
            {result.riskScore}
          </div>
        </div>
      </div>
      
      {/* Visual Progress Bar */}
      <div className="w-full h-1.5 bg-[#0d1117]">
        <div className="h-full transition-all duration-1000 ease-out" 
             style={{ width: `${scoreWidth}%`, background: gradientColor }}></div>
      </div>

      <div className="p-6 md:p-8 border-b border-[#21262d] flex justify-between items-center bg-[#0d1117]/50">
        <RiskBadge riskLevel={result.riskLevel} />
      </div>

      {/* Explanation Box */}
      <div className="p-6 md:p-8 bg-[#0d1117] border-l-4" style={{ borderLeftColor: scoreColor }}>
        <p className="text-[#8b949e] font-inter uppercase tracking-widest text-xs font-bold mb-3">AI Analysis</p>
        <p className="text-[#f0f6fc] text-base md:text-lg leading-relaxed font-inter">{result.explanation}</p>
      </div>
      
      {/* Details Grid */}
      <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 lg:gap-12 bg-[#0f1923]">
        <ReasonsList reasons={result.reasons || []} />
        <RecommendationsList recommendations={result.recommendations || []} />
      </div>
    </div>
  );
}
