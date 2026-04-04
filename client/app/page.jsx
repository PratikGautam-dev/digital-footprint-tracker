'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden pt-24 px-4 flex flex-col items-center">
      {/* Animated Orbs Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#0ea5e9] rounded-full opacity-15 blur-[80px]" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b5cf6] rounded-full opacity-15 blur-[80px]" style={{ animation: 'float 10s ease-in-out infinite reverse' }}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#06b6d4] rounded-full opacity-15 blur-[80px]" style={{ animation: 'float 9s ease-in-out infinite 1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-4xl mx-auto z-10 w-full mt-10">
        <h1 className="font-syne text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-tight">
          Track. Detect.<br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>Protect.</span>
        </h1>
        <p className="text-[#8b949e] text-lg md:text-xl max-w-[500px] mb-10 leading-relaxed font-inter">
          Analyze your digital exposure, detect cyber threats, and get AI-driven security recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/scan/url" className="px-8 py-4 bg-[#0ea5e9] hover:brightness-110 active:scale-95 text-white font-syne font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            Start Scanning
          </Link>
          <Link href="/dashboard" className="px-8 py-4 bg-transparent border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[rgba(14,165,233,0.1)] active:scale-95 font-syne font-bold rounded-lg transition-all">
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="w-full max-w-5xl border-y border-[#21262d] py-6 my-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[#8b949e] text-sm tracking-widest uppercase font-medium">
        <span className="flex items-center gap-2"><span className="text-[#0ea5e9]">•</span> 4 Scan Types</span>
        <span className="flex items-center gap-2"><span className="text-[#0ea5e9]">•</span> Real-Time Analysis</span>
        <span className="flex items-center gap-2"><span className="text-[#0ea5e9]">•</span> AI Risk Scoring</span>
        <span className="flex items-center gap-2"><span className="text-[#0ea5e9]">•</span> Breach Detection</span>
      </div>

      {/* Scanners Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 z-10">
        <Link href="/scan/url" className="group bg-[#0f1923] border border-[#21262d] rounded-xl p-8 hover:border-[#0ea5e9] hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/20 flex items-center justify-center text-2xl mb-6 text-[#0ea5e9]">🔗</div>
          <h2 className="font-syne text-2xl font-bold text-white mb-3">URL Scanner</h2>
          <p className="text-[#8b949e] mb-8 font-inter">Detect malicious URLs, phishing links, and deceptive domain strategies instantly.</p>
          <div className="text-[#0ea5e9] font-medium group-hover:translate-x-1 transition-transform inline-block font-inter">Scan Now →</div>
        </Link>
        
        <Link href="/scan/email" className="group bg-[#0f1923] border border-[#21262d] rounded-xl p-8 hover:border-[#8b5cf6] hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-2xl mb-6 text-[#8b5cf6]">📧</div>
          <h2 className="font-syne text-2xl font-bold text-white mb-3">Email Scanner</h2>
          <p className="text-[#8b949e] mb-8 font-inter">Identify phishing emails, social engineering language, and exposed credentials.</p>
          <div className="text-[#8b5cf6] font-medium group-hover:translate-x-1 transition-transform inline-block font-inter">Scan Now →</div>
        </Link>

        <Link href="/scan/file" className="group bg-[#0f1923] border border-[#21262d] rounded-xl p-8 hover:border-[#06b6d4] hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center text-2xl mb-6 text-[#06b6d4]">📁</div>
          <h2 className="font-syne text-2xl font-bold text-white mb-3">File Scanner</h2>
          <p className="text-[#8b949e] mb-8 font-inter">Detect dangerous files, double extensions, and hidden malware patterns without opening.</p>
          <div className="text-[#06b6d4] font-medium group-hover:translate-x-1 transition-transform inline-block font-inter">Scan Now →</div>
        </Link>

        <Link href="/scan/identity" className="group bg-[#0f1923] border border-[#21262d] rounded-xl p-8 hover:border-[#3fb950] hover:shadow-[0_0_20px_rgba(63,185,80,0.1)] transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#3fb950]/20 flex items-center justify-center text-2xl mb-6 text-[#3fb950]">👤</div>
          <h2 className="font-syne text-2xl font-bold text-white mb-3">Identity Scanner</h2>
          <p className="text-[#8b949e] mb-8 font-inter">Check your digital footprint, usernames, and data breaches across the web.</p>
          <div className="text-[#3fb950] font-medium group-hover:translate-x-1 transition-transform inline-block font-inter">Scan Now →</div>
        </Link>
      </div>
    </main>
  );
}
