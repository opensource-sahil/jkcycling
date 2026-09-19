'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Donate.module.css';

// CONFIGURATION — real donation details. Do not alter, remove, or invent.
const UPI_VPA = 'jkcycling@upi';
const UPI_NAME = 'JK Cycling Association';
const PRESET_AMOUNTS = ['100', '200', '500', '1000', '2000'];

const IMPACT_ITEMS = [
  {
    icon: '🏆',
    title: 'Athlete Prizes',
    desc: '100% of funds go directly to race purses and athlete scholarships.',
  },
  {
    icon: '⛑️',
    title: 'Safety First',
    desc: 'Funding ambulances, medical staff, and route marshals.',
  },
  {
    icon: '🌱',
    title: 'Grassroots',
    desc: 'Free workshops and equipment for under-18 riders.',
  },
];

export default function DonatePage() {
  const [amount, setAmount] = useState<string>('500');
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi');

  const qrValue = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount || '0'}&cu=INR`;

  // The root layout already provides <main> and the page container.
  return (
    <>
      <div className={styles.disclaimer}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>DEV MODE: Please DO NOT make any real payments. The website is currently in progress.</span>
      </div>

      <p className="eyebrow">Support the community</p>
      <h1 className={styles.title}>Support J&amp;K Cycling</h1>
      <p className={`muted ${styles.subtitle}`}>
        Help us organize safer races, groom local talent, and build a thriving cycling ecosystem in the valley.
      </p>

      <div className={styles.layout}>
        <ul className={styles.funds}>
          {IMPACT_ITEMS.map((item) => (
            <li key={item.title}>
              <span className={styles.fundsIcon} aria-hidden="true">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        <aside className={`card ${styles.box}`}>
          <div className={styles.tabs}>
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`${styles.tab} ${activeTab === 'upi' ? styles.tabActive : ''}`}
            >
              Instant UPI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`${styles.tab} ${activeTab === 'bank' ? styles.tabActive : ''}`}
            >
              Bank Transfer
            </button>
          </div>

          {activeTab === 'upi' ? (
            <div className={styles.upiContent}>
              <div className="chips">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`chip ${amount === val ? 'chip--active' : ''}`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <div className={`field ${styles.field}`}>
                <label htmlFor="donate-amount">Or enter an amount</label>
                <input
                  id="donate-amount"
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹ Custom amount"
                />
              </div>

              <div className={styles.qr}>
                <div className={styles.qrBox}>
                  <QRCodeSVG value={qrValue} size={160} level="M" />
                </div>
                <p className="hint">Scan with any UPI app to pay.</p>
              </div>
            </div>
          ) : (
            <div className={styles.bankContent}>
              <h3 className={styles.bankHeading}>Bank Account Details</h3>
              <p className="muted">For NEFT, RTGS, or IMPS</p>

              <div className={styles.bankBox}>
                <DetailRow label="Beneficiary Name" value="JK Cycling Association" />
                <DetailRow label="Account Number" value="123456789012" fontMono />
                <DetailRow label="IFSC Code" value="JAKA0ESTATE" fontMono />
                <DetailRow label="Bank Branch" value="J&K Bank, Town Hall" />
              </div>

              <p className={styles.bankNotice}>Please verify details before transfer.</p>
            </div>
          )}

          <p className={styles.secureNote}>🔒 Safe &amp; Secure. No platform fees charged.</p>
        </aside>
      </div>
    </>
  );
}

function DetailRow({ label, value, fontMono }: { label: string; value: string; fontMono?: boolean }) {
  return (
    <div className={styles.detailRow}>
      <span className="muted">{label}</span>
      <span className={`${styles.detailValue} ${fontMono ? styles.mono : ''}`}>{value}</span>
    </div>
  );
}
