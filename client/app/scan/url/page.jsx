'use client';

import { useState } from 'react';
import { scanURL } from '../../../lib/api';
import ResultCard from '../../../components/ResultCard';

export default function ScanUrlPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const data = await scanURL(url);
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during scanning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-[680px]">
        <h1 className="font-syne text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.5)]"></span>
          URL Scanner
        </h1>
        <p className="text-[#8b949e] mb-10 font-inter text-lg">Analyze links for phishing, malware, and domain spoofing.</p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col gap-5">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL to scan e.g. http://example.com" 
              spellCheck="false"
              className="w-full bg-[rgba(13,17,23,0.8)] border border-[#21262d] text-[#f0f6fc] px-5 py-4 rounded-xl outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)] transition-all font-jetbrains placeholder:text-[#8b949e]/50"
            />
            <button 
              type="submit" 
              disabled={loading || !url.trim()}
              className="w-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white px-8 py-4 rounded-xl font-syne font-bold text-lg tracking-wide transition-all flex items-center justify-center gap-3 shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)]"
            >
              {loading ? (
                 <>
                   <span className="border-3 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin"></span>
                   Analyzing...
                 </>
              ) : "Scan URL"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center mt-12 mb-8 loading-dots gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] p-4 rounded-lg font-inter animate-fade-up">
            {error}
          </div>
        )}

        {result && !loading && <ResultCard result={result} />}
      </div>
    </main>
  );
}
