// frontend/src/app/not-found.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5-2 4-2 4 2 4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
          <Link href="/" className={styles.homeBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </Link>
        </div>
        <div className={styles.links}>
          <p>Or try these pages:</p>
          <div className={styles.linkGrid}>
            <Link href="/dashboard" className={styles.link}>Dashboard</Link>
            <Link href="/verification" className={styles.link}>Verification</Link>
            <Link href="/wallet" className={styles.link}>Wallet</Link>
            <Link href="/settings" className={styles.link}>Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
