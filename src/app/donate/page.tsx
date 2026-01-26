'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Donate.module.css';

// CONFIGURATION
const UPI_VPA = "jkcycling@upi"; 
const UPI_NAME = "JK Cycling Association";

export default function DonatePage() {
  const [amount, setAmount] = useState<string>('500');
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi');

  const presets = ['100', '200', '500', '1000', '2000'];
  const qrValue = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount || '0'}&cu=INR`;

  return (
    <div className={styles.pageContainer}>
      
      {/* ⚠️ Disclaimer Banner */}
      <div className={styles.disclaimer}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>DEV MODE: Please DO NOT make any real payments. The website is currently in progress.</span>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Support J&K Cycling
        </h1>
        <p className={styles.subtitle}>
          Help us organize safer races, groom local talent, and build a thriving cycling ecosystem in the valley.
        </p>
      </section>

      {/* Impact Section */}
      <section className={styles.impactGrid}>
        <FeatureCard 
          icon="🏆" 
          title="Athlete Prizes" 
          desc="100% of funds go directly to race purses and athlete scholarships." 
        />
        <FeatureCard 
          icon="⛑️" 
          title="Safety First" 
          desc="Funding ambulances, medical staff, and route marshals." 
        />
        <FeatureCard 
          icon="🌱" 
          title="Grassroots" 
          desc="Free workshops and equipment for under-18 riders." 
        />
      </section>

      {/* Donation Widget Section */}
      <section className={styles.widget}>
        <div className={styles.tabs}>
          <button 
            onClick={() => setActiveTab('upi')}
            className={`${styles.tab} ${activeTab === 'upi' ? styles.tabActive : ''}`}
          >
            Instant UPI
          </button>
          <button 
            onClick={() => setActiveTab('bank')}
            className={`${styles.tab} ${activeTab === 'bank' ? styles.tabActive : ''}`}
          >
            Bank Transfer
          </button>
        </div>

        <div className={styles.widgetContent}>
          {activeTab === 'upi' ? (
            <div className={styles.upiContent}>
              
              {/* QR Code */}
              <div className={styles.qrWrapper}>
                 <QRCodeSVG value={qrValue} size={200} level="M" />
              </div>
              <p style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600}}>
                Scan with any UPI App
              </p>

              {/* Amount Selection */}
              <div style={{width: '100%', textAlign: 'center'}}>
                <div className={styles.presets}>
                  {presets.map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`${styles.presetBtn} ${amount === val ? styles.presetBtnActive : ''}`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                
                <div className={styles.amountInputWrapper} style={{marginTop: '1rem', marginInline: 'auto'}}>
                  <span className={styles.currencySymbol}>₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.amountInput}
                    placeholder="Custom"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.bankDetails}>
              <div style={{textAlign: 'center', marginBottom: '1rem'}}>
                <h3 style={{fontSize: '1.1rem', fontWeight: 700}}>Bank Account Details</h3>
                <p style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)'}}>For NEFT, RTGS, or IMPS</p>
              </div>

              <div style={{backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.5rem'}}>
                <DetailRow label="Beneficiary Name" value="JK Cycling Association" />
                <DetailRow label="Account Number" value="123456789012" fontMono />
                <DetailRow label="IFSC Code" value="JAKA0ESTATE" fontMono />
                <DetailRow label="Bank Branch" value="J&K Bank, Town Hall" />
              </div>

              <div style={{textAlign: 'center', padding: '0.75rem', background: '#fffbeb', color: '#92400e', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem'}}>
                Please verify details before transfer.
              </div>
            </div>
          )}

          <div className={styles.secureNote}>
             🔒 Safe & Secure. No platform fees charged.
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className={styles.featureCard}>
      <span className={styles.icon}>{icon}</span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{desc}</p>
    </div>
  );
}

function DetailRow({ label, value, fontMono }: { label: string, value: string, fontMono?: boolean }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${fontMono ? styles.mono : ''}`}>{value}</span>
    </div>
  );
}