'use client';

export default function RecommendationsList({ recommendations = [] }) {
  return (
    <div className="w-full">
      <h3 className="font-syne font-bold text-xl text-[#f0f6fc] mb-4">Security Recommendations</h3>
      {recommendations.length === 0 ? (
        <p className="text-[#8b949e] font-inter italic text-sm">No recommendations at this time</p>
      ) : (
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 text-[#f0f6fc] text-sm p-3.5 rounded-lg border border-[#21262d]" 
                style={{ background: 'rgba(63, 185, 80, 0.05)', borderLeft: '2px solid #3fb950' }}>
              <span className="text-[#3fb950] mt-0.5 text-base font-bold">✓</span>
              <span className="font-inter leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
