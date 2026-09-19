'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './Header.module.css';
import { ThemeSwitcher } from './ThemeSwitcher';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Results', href: '/results' },
  { name: 'Groups', href: '/groups' },
  { name: 'Training', href: '/training' },
  { name: 'Donate', href: '/donate' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className={styles.siteHeader}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand}>
          <svg
            className={styles.mark}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 20h18L14 6l-3.5 6L8 9 3 20z" />
          </svg>
          JK Cycling
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
            >
              {item.name}
            </Link>
          ))}
          {session?.user && (
            <Link
              href="/admin"
              className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className={styles.headerActions}>
          {status === 'loading' ? (
            <div className={styles.authLoading} aria-hidden="true" />
          ) : session?.user ? (
            <button
              type="button"
              onClick={() => signOut()}
              title={`Sign out (${session.user.name})`}
              className={styles.avatarBtn}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={36}
                  height={36}
                  className={styles.avatar}
                />
              ) : (
                <span className={styles.avatar}>{session.user.name?.[0] || 'U'}</span>
              )}
            </button>
          ) : (
            <button type="button" onClick={() => signIn('google')} className="btn btn--secondary btn--sm">
              Sign In
            </button>
          )}

          <ThemeSwitcher />

          <Link href="/donate" className={`btn btn--primary btn--sm ${styles.donateCta}`}>
            Donate
          </Link>

          <button
            type="button"
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            aria-label="Menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`${styles.backdrop} ${drawerOpen ? styles.backdropOpen : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-nav-drawer"
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal={drawerOpen}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.brand}>JK Cycling</span>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav className={styles.drawerNav} aria-label="Mobile primary">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {session?.user && (
            <Link
              href="/admin"
              className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
