'use client';

export default function RiskBadge({ riskLevel }) {
  let styles = {};
  let text = "";

  if (riskLevel === "Low") {
    styles = {
      background: 'rgba(63, 185, 80, 0.15)',
      color: '#3fb950',
      border: '1px solid rgba(63, 185, 80, 0.3)'
    };
    text = "● Low Risk";
  } else if (riskLevel === "Medium") {
    styles = {
      background: 'rgba(210, 153, 34, 0.15)',
      color: '#d29922',
      border: '1px solid rgba(210, 153, 34, 0.3)'
    };
    text = "● Medium Risk";
  } else if (riskLevel === "High") {
    styles = {
      background: 'rgba(248, 81, 73, 0.15)',
      color: '#f85149',
      border: '1px solid rgba(248, 81, 73, 0.3)',
      animation: 'pulse-glow 2s infinite'
    };
    text = "● High Risk";
  } else {
    styles = {
      background: 'rgba(139, 148, 158, 0.15)',
      color: '#8b949e',
      border: '1px solid rgba(139, 148, 158, 0.3)'
    };
    text = `● ${riskLevel}`;
  }

  return (
    <span className="rounded-full font-bold font-inter px-3 py-1 text-xs uppercase tracking-wider inline-block shadow-sm" style={styles}>
      {text}
    </span>
  );
}
