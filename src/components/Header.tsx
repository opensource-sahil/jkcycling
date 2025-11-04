'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ background: 'var(--surface)' }} className="shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold" style={{ color: 'var(--brand)' }}>JK Cycling</span>
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link
              href="/"
              className="inline-flex items-center px-1 pt-1 text-[var(--text)] hover:text-[var(--brand-600)]"
            >
              Events
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center px-1 pt-1 text-[var(--text)] hover:text-[var(--brand-600)]"
            >
              Results
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center px-1 pt-1 text-[var(--text)] hover:text-[var(--brand-600)]"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}