import styles from './Training.module.css';

export const metadata = { title: 'Training' };

const PLANS = [
  {
    badge: 'success' as const,
    level: 'Beginner',
    title: 'Your first 40 km',
    weeks: '8 weeks',
    hours: '4–5 h/week',
    items: ['Build a base you can ride on', 'One group ride a week', 'Learn to fuel and pace'],
  },
  {
    badge: 'warning' as const,
    level: 'Intermediate',
    title: 'Gran fondo ready',
    weeks: '12 weeks',
    hours: '6–8 h/week',
    items: ['Threshold & tempo work', 'Back-to-back weekend rides', 'Climbing repeats on Nishat'],
  },
  {
    badge: 'danger' as const,
    level: 'Advanced',
    title: 'Zoji La & podiums',
    weeks: '16 weeks',
    hours: '10–12 h/week',
    items: ['Polarised training blocks', 'Altitude simulation rides', 'Race-pace climbing efforts'],
  },
];

const TIPS = [
  {
    icon: '⛰️',
    title: 'Acclimatise before you climb high',
    body: 'Above 2,500 m your power drops and effort rises. Arrive a few days early, ride easy, sleep well and hydrate more than you think.',
  },
  {
    icon: '🌡️',
    title: 'Dress for four seasons',
    body: 'A summit can be 15°C colder than the valley. Carry a packable shell and full-finger gloves — the descent off Zoji La is long and cold.',
  },
  {
    icon: '🥤',
    title: 'Fuel every 30–40 minutes',
    body: 'Long climbs burn through glycogen. Aim for 60–90 g of carbs an hour and drink to thirst; feed stations are far apart.',
  },
  {
    icon: '⚙️',
    title: 'Gear low for the walls',
    body: 'A compact chainset and a 32t+ cassette turn a survival grind into a rhythm. Practise steep pitches before race day.',
  },
  {
    icon: '🛞',
    title: 'Check brakes before the descent',
    body: 'Fast alpine descents punish worn pads and cables. Inspect everything the night before and again at the summit feed.',
  },
  {
    icon: '🌅',
    title: 'Start early, beat the weather',
    body: "Mountain weather turns by afternoon. Most rides roll out at dawn so you're over the top before the clouds build.",
  },
];

const FAQS = [
  {
    question: 'Do I need a road bike?',
    answer:
      'A road bike is ideal for the paved sportives, but the gravel and social rides welcome any well-maintained bike with low enough gearing for the climbs.',
    open: true,
  },
  {
    question: 'How fit do I need to be for the Zoji La Challenge?',
    answer:
      "It's the hardest event on the calendar. Build to comfortably riding 4–5 hours with sustained climbing before entering — the 16-week advanced plan is written for exactly this.",
  },
  {
    question: 'Is altitude sickness a risk?',
    answer:
      'Mild symptoms can appear above 3,000 m. Ascend gradually, stay hydrated, and stop if you feel unwell. The summit feed has first-aid.',
  },
];

export default function TrainingPage() {
  return (
    <>
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container">
          <p className="eyebrow">Ride stronger</p>
          <h1 className={styles.title}>Train for the mountains.</h1>
          <p className={`muted ${styles.lede}`}>
            Riding in the Kashmir Himalaya means long climbs, thin air and big descents. Here&apos;s how to get
            ready — whether it&apos;s your first sportive or your fifth Zoji La.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Structured plans</p>
              <h2 className={styles.secTitle}>Pick a training plan</h2>
            </div>
          </div>
          <div className={styles.plansGrid}>
            {PLANS.map((plan) => (
              <article className={`card ${styles.plan}`} key={plan.title}>
                <span className={`badge badge--${plan.badge}`}>{plan.level}</span>
                <h3 className={styles.planTitle}>{plan.title}</h3>
                <div className={styles.planMeta}>
                  <span className="mono">{plan.weeks}</span>
                  <span className="muted">·</span>
                  <span className="mono">{plan.hours}</span>
                </div>
                <ul className={styles.planList}>
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="btn btn--secondary btn--block" href="#">
                  View the plan
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Altitude &amp; climbing</p>
              <h2 className={styles.secTitle}>Riding the high passes</h2>
            </div>
          </div>
          <div className={styles.tips}>
            {TIPS.map((tip) => (
              <div className={styles.tip} key={tip.title}>
                <div className={styles.tipIcon}>{tip.icon}</div>
                <div>
                  <strong>{tip.title}</strong>
                  <p>{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`card ${styles.faq}`}>
            <h2 className={styles.secTitle} style={{ margin: '0 0 var(--space-4)' }}>
              Common questions
            </h2>
            {FAQS.map((faq) => (
              <details key={faq.question} open={faq.open}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
