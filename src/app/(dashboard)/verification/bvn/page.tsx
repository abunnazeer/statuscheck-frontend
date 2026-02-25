'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { verificationService, pdfService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/lib/utils';
import styles from './page.module.css';

export default function BVNVerificationPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { wallet, fetchWallet } = useWalletStore();
  const { success, error: showError } = useNotificationStore();

  const [bvn, setBvn] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [servicePrice, setServicePrice] = useState<number>(0);
  const [priceReady, setPriceReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const loadPageData = async () => {
      try {
        const [pricingMap] = await Promise.all([
          verificationService.getVerificationCosts(),
          fetchWallet(),
        ]);

        const configuredPrice = Number(pricingMap.BVN_VERIFICATION || 0);
        setServicePrice(Number.isFinite(configuredPrice) ? configuredPrice : 0);
        setPriceReady(true);
      } catch (err) {
        setPriceReady(false);
        showError(err instanceof Error ? err.message : 'Unable to load BVN pricing');
      }
    };

    loadPageData();
  }, [isAuthenticated, router, fetchWallet, showError]);

  const resultData = useMemo(() => verificationResult?.data || {}, [verificationResult]);

  const resolveField = (...values: Array<unknown>) => {
    const value = values.find((item) => item !== null && item !== undefined && String(item).trim() !== '');
    return value ? String(value) : '';
  };

  const buildUniquePdfName = (prefix: string, identityValue: string): string => {
    const safeIdentity = identityValue.replace(/[^a-zA-Z0-9]/g, '') || 'UNKNOWN';
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}_${safeIdentity}_${timestamp}_${suffix}.pdf`;
  };

  const viewModel = {
    bvn: resolveField(resultData.bvn, resultData.number),
    firstName: resolveField(resultData.firstName, resultData.firstname),
    middleName: resolveField(resultData.middleName, resultData.middlename),
    lastName: resolveField(resultData.lastName, resultData.surname),
    dateOfBirth: resolveField(resultData.dateOfBirth, resultData.birthdate),
    gender: resolveField(resultData.gender),
    phone: resolveField(resultData.phone, resultData.phoneNumber, resultData.phoneNumber1),
    email: resolveField(resultData.email),
    nin: resolveField(resultData.nin),
  };

  const handleVerify = async () => {
    if (!priceReady || servicePrice <= 0) {
      showError('BVN service price is currently unavailable. Please refresh and try again.');
      return;
    }

    const balance = wallet ? Number(wallet.balance) : 0;

    if (balance < servicePrice) {
      showError(`Insufficient balance. You need ${formatCurrency(servicePrice)} but have ${formatCurrency(balance)}`);
      return;
    }

    if (!bvn || bvn.length !== 11) {
      showError('Please enter a valid 11-digit BVN');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verificationService.verifyBVN(bvn);
      setVerificationResult(result);

      if (result.status === 'SUCCESS') {
        success('Premium BVN verification completed successfully!');
      } else {
        showError(result.message || 'Verification failed');
      }

      await fetchWallet();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPdf = async () => {
    const requestRef = resolveField(
      verificationResult?.requestRef,
      verificationResult?.request_ref,
      verificationResult?.reference,
      verificationResult?.ref
    );

    if (!requestRef) {
      showError('No verification reference available for download');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const blob = await pdfService.downloadVerificationPDF(requestRef);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = buildUniquePdfName('BVN', viewModel.bvn || requestRef);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Premium BVN PDF downloaded successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to download premium BVN PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/verification" className={styles.breadcrumbLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Verification
          </Link>
        </div>

        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <path d="M6 15h4M14 15h4" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Premium BVN Verification</h1>
            <p className={styles.subtitle}>Verify BVN and get a downloadable premium PDF</p>
          </div>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>Balance</span>
            <span className={styles.balanceValue}>{wallet ? formatCurrency(Number(wallet.balance)) : '₦0.00'}</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>1</span>
              <h2 className={styles.sectionTitle}>Service Type</h2>
            </div>
            <div className={styles.servicesGrid}>
              <button className={`${styles.serviceCard} ${styles.selected}`}>
                <span className={styles.popularBadge}>Premium</span>
                <div className={styles.serviceIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className={styles.serviceName}>Premium BVN Verification</h3>
                <p className={styles.serviceDesc}>Verification + official styled PDF output</p>
                <div className={styles.servicePrice}>{formatCurrency(servicePrice)}</div>
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>2</span>
              <h2 className={styles.sectionTitle}>Enter BVN</h2>
            </div>
            <div className={styles.formCard}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Bank Verification Number (BVN)</label>
                <input
                  type="text"
                  className={styles.inputFull}
                  placeholder="Enter 11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                />
                <p className={styles.hint}>Only 11-digit BVN is accepted</p>
              </div>

              <div className={styles.formFooter}>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Service Fee</span>
                    <span>{formatCurrency(servicePrice)}</span>
                  </div>
                  <div className={styles.priceTotal}>
                    <span>Total</span>
                    <strong>{formatCurrency(servicePrice)}</strong>
                  </div>
                </div>
                <button className={styles.verifyBtn} onClick={handleVerify} disabled={isVerifying || !priceReady}>
                  {isVerifying ? (
                    <>
                      <div className={styles.spinner}></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Verify BVN
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {verificationResult && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepNumber}>3</span>
                <h2 className={styles.sectionTitle}>Verification Result</h2>
              </div>
              <div className={`${styles.resultCard} ${styles[`result${verificationResult.status}`]}`}>
                <div className={styles.resultHeader}>
                  <div className={`${styles.resultIcon} ${styles[`icon${verificationResult.status}`]}`}>
                    {verificationResult.status === 'SUCCESS' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.resultInfo}>
                    <h3 className={styles.resultTitle}>
                      {verificationResult.status === 'SUCCESS' ? 'Verification Successful' : 'Verification Failed'}
                    </h3>
                    <p className={styles.resultRef}>Reference: {verificationResult.requestRef}</p>
                  </div>
                </div>

                {verificationResult.status === 'SUCCESS' && (
                  <>
                    <div className={styles.resultData}>
                      <div className={styles.dataGrid}>
                        {viewModel.bvn && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>BVN</span>
                            <span className={styles.dataValue}>{viewModel.bvn}</span>
                          </div>
                        )}
                        {viewModel.firstName && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>First Name</span>
                            <span className={styles.dataValue}>{viewModel.firstName}</span>
                          </div>
                        )}
                        {viewModel.middleName && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Middle Name</span>
                            <span className={styles.dataValue}>{viewModel.middleName}</span>
                          </div>
                        )}
                        {viewModel.lastName && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Last Name</span>
                            <span className={styles.dataValue}>{viewModel.lastName}</span>
                          </div>
                        )}
                        {viewModel.dateOfBirth && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Date of Birth</span>
                            <span className={styles.dataValue}>{viewModel.dateOfBirth}</span>
                          </div>
                        )}
                        {viewModel.gender && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Gender</span>
                            <span className={styles.dataValue}>{viewModel.gender}</span>
                          </div>
                        )}
                        {viewModel.phone && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Phone</span>
                            <span className={styles.dataValue}>{viewModel.phone}</span>
                          </div>
                        )}
                        {viewModel.email && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Email</span>
                            <span className={styles.dataValue}>{viewModel.email}</span>
                          </div>
                        )}
                        {viewModel.nin && (
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>NIN</span>
                            <span className={styles.dataValue}>{viewModel.nin}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.resultActions}>
                      <button
                        type="button"
                        className={styles.downloadBtn}
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {isDownloadingPdf ? 'Downloading...' : 'Download Premium BVN PDF'}
                      </button>
                    </div>
                  </>
                )}

                {verificationResult.status === 'FAILED' && (
                  <div className={styles.resultError}>
                    <p>{verificationResult.message || 'Verification failed. Please check the details and try again.'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
