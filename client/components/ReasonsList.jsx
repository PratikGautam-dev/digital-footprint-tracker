'use client';

export default function ReasonsList({ reasons = [] }) {
  return (
    <div className="w-full">
      <h3 className="font-syne font-bold text-xl text-[#f0f6fc] mb-4">Detected Indicators</h3>
      {reasons.length === 0 ? (
        <p className="text-[#8b949e] font-inter italic text-sm">No indicators detected</p>
      ) : (
        <ul className="space-y-3">
          {reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-3 text-[#f0f6fc] text-sm p-3.5 rounded-lg border border-[#21262d]" 
                style={{ background: 'rgba(210, 153, 34, 0.05)', borderLeft: '2px solid #d29922' }}>
              <span className="text-[#d29922] mt-0.5 text-base">⚠</span>
              <span className="font-inter leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
