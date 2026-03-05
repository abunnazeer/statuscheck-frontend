'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { verificationService } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import styles from './page.module.css';

type ServiceCard = {
  id: 'nin' | 'bvn';
  title: string;
  description: string;
  highlights: string[];
  price: number | null;
  buttonLabel: string;
  route: string;
};

export default function VerificationPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { wallet, fetchWallet } = useWalletStore();
  const [ninPrice, setNinPrice] = useState<number | null>(null);
  const [bvnPrice, setBvnPrice] = useState<number | null>(null);
  const [pricesReady, setPricesReady] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadPageData = async () => {
      try {
        setIsLoadingPrices(true);
        const [pricingMap] = await Promise.all([
          verificationService.getVerificationCosts(),
          fetchWallet(),
        ]);

        const getLowestConfiguredPrice = (codes: string[]): number | null => {
          const values = codes
            .map((code) => Number(pricingMap[code]))
            .filter((value) => Number.isFinite(value) && value > 0);

          if (values.length === 0) {
            return null;
          }

          return Math.min(...values);
        };

        const lowestNinPrice = getLowestConfiguredPrice([
          'NIN_TEMPLATE_NORMAL',
          'NIN_TEMPLATE_PREMIUM',
          'NIN_TEMPLATE_VERIFIED',
          'NIN_TEMPLATE_VERIFICATION',
          'NIN_TEMPLATE_IMPROVED',
          'NIN_VERIFICATION',
          'NIN_PHONE_VERIFICATION',
          'NIN_DEMOGRAPHIC_SEARCH',
        ]);

        const lowestBvnPrice = getLowestConfiguredPrice([
          'BVN_TEMPLATE_BASIC',
          'BVN_TEMPLATE_ADVANCE',
          'BVN_TEMPLATE_CARD',
          'BVN_VERIFICATION',
          'BVN_PHONE_RETRIEVAL',
          'BVN_NIN_RETRIEVAL',
        ]);

        setNinPrice(lowestNinPrice);
        setBvnPrice(lowestBvnPrice);
        setPricesReady(true);
      } catch {
        setPricesReady(false);
        setNinPrice(null);
        setBvnPrice(null);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadPageData();
  }, [isAuthenticated, router, fetchWallet]);

  const cards = useMemo<ServiceCard[]>(
    () => [
      {
        id: 'nin',
        title: 'NIN Verification',
        description:
          'Run NIN checks and generate your approved slip formats instantly.',
        highlights: ['Normal, verified, premium and improved templates', 'Fast PDF output'],
        price: ninPrice,
        buttonLabel: 'Open NIN Verifications',
        route: '/verification/nin',
      },
      {
        id: 'bvn',
        title: 'BVN Verification',
        description:
          'Verify BVN details and generate Basic, Advance or Card templates.',
        highlights: ['Template-specific outputs', 'Identity fields + photo rendering'],
        price: bvnPrice,
        buttonLabel: 'Open BVN Verifications',
        route: '/verification/bvn',
      },
    ],
    [ninPrice, bvnPrice],
  );

  if (!isAuthenticated) {
    return null;
  }

  const renderPrice = (price: number | null) => {
    if (isLoadingPrices) return 'Loading...';
    if (!pricesReady || price === null) return 'Unavailable';
    return formatCurrency(price);
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Verification Center</span>
            <h1 className={styles.title}>Simple, fast identity checks</h1>
            <p className={styles.subtitle}>
              Choose a verification flow, submit details, and download your ready-to-use PDF.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>Quick Processing</span>
              <span className={styles.metaPill}>Template-Based Output</span>
              <span className={styles.metaPill}>Secure Verification</span>
            </div>
          </div>

          <div className={styles.walletCard}>
            <span className={styles.balanceLabel}>Wallet Balance</span>
            <span className={styles.balanceValue}>
              {wallet ? formatCurrency(Number(wallet.balance)) : '₦0.00'}
            </span>
            <button
              type="button"
              className={styles.walletButton}
              onClick={() => router.push('/wallet/fund')}
            >
              Fund Wallet
            </button>
          </div>
        </section>

        <section className={styles.cardsGrid}>
          {cards.map((card) => (
            <article key={card.id} className={styles.serviceCard}>
              <div className={styles.serviceHeader}>
                <div
                  className={`${styles.serviceIcon} ${
                    card.id === 'nin' ? styles.iconNin : styles.iconBvn
                  }`}
                >
                  {card.id === 'nin' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="2" />
                      <path d="M15 8h2M15 12h2M7 16h10" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 15h4M14 15h4" />
                    </svg>
                  )}
                </div>

                <div className={styles.priceBadge}>
                  <span>Starts from</span>
                  <strong>{renderPrice(card.price)}</strong>
                </div>
              </div>

              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDescription}>{card.description}</p>

              <ul className={styles.cardHighlights}>
                {card.highlights.map((highlight) => (
                  <li key={highlight}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`${styles.actionButton} ${
                  card.id === 'nin' ? styles.actionButtonNin : styles.actionButtonBvn
                }`}
                onClick={() => router.push(card.route)}
              >
                {card.buttonLabel}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </article>
          ))}
        </section>

        <section className={styles.flowSection}>
          <h3 className={styles.flowTitle}>How It Works</h3>
          <div className={styles.flowGrid}>
            <div className={styles.flowItem}>
              <span className={styles.flowNumber}>1</span>
              <h4>Select Service</h4>
              <p>Choose NIN or BVN and pick your template.</p>
            </div>
            <div className={styles.flowItem}>
              <span className={styles.flowNumber}>2</span>
              <h4>Submit Details</h4>
              <p>Enter verification details and run the check.</p>
            </div>
            <div className={styles.flowItem}>
              <span className={styles.flowNumber}>3</span>
              <h4>Download PDF</h4>
              <p>Preview the output and download immediately.</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
