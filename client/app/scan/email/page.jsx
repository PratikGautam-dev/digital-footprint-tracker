'use client';

import { useState } from 'react';
import { scanEmail } from '../../../lib/api';
import ResultCard from '../../../components/ResultCard';

export default function ScanEmailPage() {
  const [emailText, setEmailText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailText.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const data = await scanEmail(emailText);
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
          <span className="w-3 h-3 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
          Email Scanner
        </h1>
        <p className="text-[#8b949e] mb-10 font-inter text-lg">Identify phishing emails, social engineering language, and exposed credentials.</p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col gap-5">
            <textarea 
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste the full email content or enter an email address to check for breaches" 
              spellCheck="false"
              className="w-full bg-[rgba(13,17,23,0.8)] border border-[#21262d] text-[#f0f6fc] px-5 py-4 rounded-xl outline-none focus:border-[#8b5cf6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all font-inter min-h-[200px] resize-y placeholder:text-[#8b949e]/50"
            />
            <button 
              type="submit" 
              disabled={loading || !emailText.trim()}
              className="w-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white px-8 py-4 rounded-xl font-syne font-bold text-lg tracking-wide transition-all flex items-center justify-center gap-3 shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)]"
            >
              {loading ? (
                 <>
                   <span className="border-3 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin"></span>
                   Analyzing...
                 </>
              ) : "Scan Email"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center mt-12 mb-8 loading-dots gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></div>
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
