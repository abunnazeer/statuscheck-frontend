// frontend/src/app/(dashboard)/wallet/callback/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { walletService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/lib/utils';
import styles from './page.module.css';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'cancelled';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { fetchWallet, wallet } = useWalletStore();
  const { success, error: showError } = useNotificationStore();

  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<{
    amount?: string;
    reference?: string;
    message?: string;
  }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    verifyPayment();
  }, [isAuthenticated]);

  const verifyPayment = async () => {
    const paymentReference = searchParams.get('paymentReference') || searchParams.get('reference');
    const transactionStatus = searchParams.get('status') || searchParams.get('transactionStatus');

    if (!paymentReference) {
      setStatus('failed');
      setPaymentDetails({
        message: 'No payment reference found',
      });
      return;
    }

    // Check if payment was cancelled
    if (transactionStatus?.toLowerCase() === 'cancelled' || transactionStatus?.toLowerCase() === 'failed') {
      setStatus('cancelled');
      setPaymentDetails({
        reference: paymentReference,
        message: 'Payment was cancelled or failed',
      });
      return;
    }

    try {
      const result = await walletService.verifyPayment(paymentReference);

      if (result.status === 'SUCCESS') {
        setStatus('success');
        setPaymentDetails({
          reference: paymentReference,
          amount: searchParams.get('amount') || undefined,
          message: result.message || 'Payment verified successfully',
        });
        success('Payment successful! Your wallet has been credited.');
        await fetchWallet();
      } else {
        setStatus('failed');
        setPaymentDetails({
          reference: paymentReference,
          message: result.message || 'Payment verification failed',
        });
        showError(result.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setStatus('failed');
      setPaymentDetails({
        reference: paymentReference,
        message: err instanceof Error ? err.message : 'Payment verification failed',
      });
      showError('Failed to verify payment');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className={styles.statusContent}>
              <div className={styles.spinnerWrapper}>
                <div className={styles.spinner}></div>
              </div>
              <h1 className={styles.title}>Verifying Payment</h1>
              <p className={styles.description}>
                Please wait while we verify your payment...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h1 className={styles.title}>Payment Successful!</h1>
              <p className={styles.description}>
                Your wallet has been credited successfully.
              </p>

              {wallet && (
                <div className={styles.balanceCard}>
                  <span className={styles.balanceLabel}>New Wallet Balance</span>
                  <span className={styles.balanceValue}>
                    {formatCurrency(Number(wallet.balance))}
                  </span>
                </div>
              )}

              {paymentDetails.reference && (
                <div className={styles.detailsCard}>
                  <div className={styles.detailRow}>
                    <span>Reference</span>
                    <span className={styles.mono}>{paymentDetails.reference}</span>
                  </div>
                  {paymentDetails.amount && (
                    <div className={styles.detailRow}>
                      <span>Amount</span>
                      <span>{formatCurrency(parseFloat(paymentDetails.amount))}</span>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.actions}>
                <Link href="/wallet" className={styles.primaryBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  Go to Wallet
                </Link>
                <Link href="/verification" className={styles.secondaryBtn}>
                  Start Verification
                </Link>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.failedIcon}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
              <h1 className={styles.title}>Payment Failed</h1>
              <p className={styles.description}>
                {paymentDetails.message || 'We could not verify your payment. Please try again.'}
              </p>

              {paymentDetails.reference && (
                <div className={styles.detailsCard}>
                  <div className={styles.detailRow}>
                    <span>Reference</span>
                    <span className={styles.mono}>{paymentDetails.reference}</span>
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <Link href="/wallet" className={styles.primaryBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Try Again
                </Link>
                <Link href="/dashboard" className={styles.secondaryBtn}>
                  Go to Dashboard
                </Link>
              </div>

              <p className={styles.supportText}>
                If you believe this is an error, please contact{' '}
                <a href="mailto:support@statuscheck.com">support@statuscheck.com</a>
              </p>
            </div>
          )}

          {/* Cancelled State */}
          {status === 'cancelled' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.cancelledIcon}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <h1 className={styles.title}>Payment Cancelled</h1>
              <p className={styles.description}>
                Your payment was cancelled. No charges were made to your account.
              </p>

              <div className={styles.actions}>
                <Link href="/wallet" className={styles.primaryBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Fund Wallet
                </Link>
                <Link href="/dashboard" className={styles.secondaryBtn}>
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
