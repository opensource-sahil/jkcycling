import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div>
          <p className="eyebrow">Jammu &amp; Kashmir</p>
          <h1 className={styles.heroTitle}>Ride the high passes.</h1>
          <p className={styles.heroLede}>
            Races, group rides and results for the cycling community of the Kashmir
            Himalaya — from Dal Lake dawn loops to the climb over Zoji La.
          </p>
          <div className={styles.heroCta}>
            <Link href="#upcoming" className="btn btn--primary btn--lg">
              See upcoming races
            </Link>
            <Link href="/groups" className="btn btn--secondary btn--lg">
              Find a ride group
            </Link>
          </div>
          {/* TODO(content): replace with real figures */}
          <div className="stat-row" style={{ marginTop: 'var(--space-8)' }}>
            <div className="stat">
              <span className="n">14</span>
              <span className="l">races a year</span>
            </div>
            <div className="stat">
              <span className="n">600+</span>
              <span className="l">riders</span>
            </div>
            <div className="stat">
              <span className="n">3,528 m</span>
              <span className="l">highest finish</span>
            </div>
          </div>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <svg viewBox="0 0 400 300" width="100%">
            <defs>
              <clipPath id="hero-clip">
                <rect x="0" y="0" width="400" height="300" rx="24" />
              </clipPath>
            </defs>
            <g clipPath="url(#hero-clip)">
              <rect width="400" height="300" fill="var(--primary)" />
              <circle cx="130" cy="90" r="40" fill="var(--accent)" />
              <path
                d="M0 150 L70 100 L140 150 L210 90 L290 150 L400 110 V300 H0 Z"
                fill="var(--surface)"
                opacity=".18"
              />
              <path
                d="M0 210 L80 165 L150 205 L230 155 L320 200 L400 175 V300 H0 Z"
                fill="var(--primary-active)"
              />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
