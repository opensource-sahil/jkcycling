import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        
        {/* Top Section */}
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 20c2-4 6-8 12-8" />
                <circle cx="20" cy="12" r="2" fill="currentColor" stroke="none" />
                <circle cx="8" cy="20" r="4" />
                <circle cx="24" cy="20" r="4" />
              </svg>
              <span className={styles.logoText}>JK Cycling</span>
            </div>
            <p className={styles.tagline}>Pedaling towards a fitter J&K.</p>
          </div>

          <div className={styles.navColumn}>
            <h4 className={styles.colTitle}>Explore</h4>
            <Link href="/" className={styles.link}>Upcoming Events</Link>
            <Link href="/results" className={styles.link}>Race Results</Link>
            <Link href="/donate" className={styles.link}>Support Us</Link>
          </div>

          <div className={styles.navColumn}>
            <h4 className={styles.colTitle}>Connect</h4>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Facebook</a>
            <a href="mailto:contact@jkcycling.com" className={styles.link}>Contact</a>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} JK Cycling Association. All rights reserved.
          </p>
          <p className={styles.madeWith}>
            Made with <span className={styles.heart}>&hearts;</span> in Jammu
          </p>
        </div>
      </div>
    </footer>
  );
}
