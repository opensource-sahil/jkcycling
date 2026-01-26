import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundImage}>
        {/* Using a placeholder that looks like mountains/cycling or a dark pattern */}
        <Image 
          src="/images/events/placeholder.jpg" 
          alt="Cycling in Kashmir" 
          fill 
          priority
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.title}>
          Ride the <span style={{ color: 'var(--color-primary)' }}>Unexplored</span>
        </h1>
        <p className={styles.subtitle}>
          Join the premier cycling community of Jammu & Kashmir. 
          Discover grueling MTB trails, scenic road races, and a passionate community.
        </p>
        <div className={styles.actions}>
          <Link href="#events" className="btn btn-primary">
            Find an Event
          </Link>
          <Link href="/results" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
            View Results
          </Link>
        </div>
      </div>
    </section>
  );
}
