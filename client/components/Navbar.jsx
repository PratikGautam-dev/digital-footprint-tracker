'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed top-0 w-full z-[100]" style={{ background: 'rgba(5, 8, 16, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(14, 165, 233, 0.15)' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-[#06b6d4] text-white font-syne font-bold px-2 py-1 rounded text-sm group-hover:bg-[#0ea5e9] transition-colors">DFT</div>
          <span className="font-syne font-bold text-xl tracking-tight hidden md:block">Digital Footprint Tracker</span>
        </Link>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/dashboard" className={`relative transition-colors hover:text-[#0ea5e9] ${pathname === '/dashboard' ? 'text-[#0ea5e9]' : 'text-[#8b949e]'}`}>
              Dashboard
            </Link>
            <Link href="/scan/url" className={`relative transition-colors hover:text-[#0ea5e9] ${pathname === '/scan/url' ? 'text-[#0ea5e9]' : 'text-[#8b949e]'}`}>
              URL
            </Link>
            <Link href="/scan/email" className={`relative transition-colors hover:text-[#0ea5e9] ${pathname === '/scan/email' ? 'text-[#0ea5e9]' : 'text-[#8b949e]'}`}>
              Email
            </Link>
            <Link href="/scan/file" className={`relative transition-colors hover:text-[#0ea5e9] ${pathname === '/scan/file' ? 'text-[#0ea5e9]' : 'text-[#8b949e]'}`}>
              File
            </Link>
            <Link href="/scan/identity" className={`relative transition-colors hover:text-[#0ea5e9] ${pathname === '/scan/identity' ? 'text-[#0ea5e9]' : 'text-[#8b949e]'}`}>
              Identity
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8b949e] bg-[#0d1117] px-3 py-1.5 rounded-full border border-[#21262d]">
            <span className="w-2 h-2 rounded-full bg-[#3fb950] block" style={{ animation: 'pulse-glow 2s infinite' }}></span>
            <span className="hidden sm:inline font-mono">System Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
