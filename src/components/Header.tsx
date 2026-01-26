'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './Header.module.css';
import { ThemeSwitcher } from './ThemeSwitcher';

const navigation = [
  { name: 'Events', href: '/' },
  { name: 'Results', href: '/results' },
  { name: 'Donate', href: '/donate' },
  // { name: 'Admin', href: '/admin' } // Hiding Admin for now, maybe show only if admin?
];

export default function Header() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`${styles.header} ${!isVisible ? styles.hidden : ''}`}>
      <nav className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <svg className={styles.logoIcon} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 20c2-4 6-8 12-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="20" cy="12" r="2" fill="currentColor"/>
            <circle cx="8" cy="20" r="4" stroke="currentColor" strokeWidth="2"/>
            <circle cx="24" cy="20" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className={styles.logoText}>JK Cycling</span>
        </Link>
        <div className={styles.navLinks}>
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={styles.link}>
              {item.name}
            </Link>
          ))}
          
          {/* Admin Link - Only visible if logged in (basic check for now) */}
          {session?.user && (
             <Link href="/admin" className={styles.link}>
              Admin
            </Link>
          )}

          <div className={styles.userContainer}>
            {status === 'loading' ? (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-secondary)' }} />
            ) : session?.user ? (
              <button 
                onClick={() => signOut()} 
                title={`Sign out (${session.user.name})`}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
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
                  <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold' }}>
                    {session.user.name?.[0] || 'U'}
                  </div>
                )}
              </button>
            ) : (
              <button onClick={() => signIn('google')} className={styles.signInBtn}>
                Sign In
              </button>
            )}
          </div>

          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}
