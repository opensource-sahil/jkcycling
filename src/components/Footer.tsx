import Link from 'next/link';
import SubscribeForm from './SubscribeForm';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.siteFooter}>
      <div className={`container ${styles.container}`}>
        <div className={styles.footGrid}>
          <div className={styles.footBrand}>
            <Link href="/" className={styles.brand}>
              <svg
                className={styles.mark}
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 20c2-4 6-8 12-8" />
                <circle cx="20" cy="12" r="2" fill="currentColor" stroke="none" />
                <circle cx="8" cy="20" r="4" />
                <circle cx="24" cy="20" r="4" />
              </svg>
              JK Cycling
            </Link>
            <p>Pedaling towards a fitter J&amp;K.</p>
          </div>

          <div>
            <h4>Explore</h4>
            <Link href="/">Home</Link>
            <Link href="/results">Results</Link>
            <Link href="/groups">Ride groups</Link>
            <Link href="/training">Training</Link>
            <Link href="/donate">Donate</Link>
          </div>

          <div>
            <h4>Community</h4>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="mailto:contact@jkcycling.com">Contact</a>
          </div>

          <div>
            <h4>Race announcements</h4>
            <p className={styles.footSubText}>New events, straight to your inbox.</p>
            <SubscribeForm variant="inline" />
          </div>
        </div>

        <div className={styles.footBottom}>
          <span>&copy; {year} JK Cycling</span>
          <span>Srinagar &middot; Jammu &amp; Kashmir</span>
        </div>
      </div>
    </footer>
  );
}
