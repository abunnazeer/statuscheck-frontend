// src/app/(dashboard)/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/common/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState, { NoVerificationsIcon, NoTransactionsIcon } from '@/components/ui/EmptyState';
import { LoadingOverlay } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { dashboardService, pdfService, verificationService, walletService as walletApiService } from '@/lib/api/services';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const wallet = useWalletStore((state) => state.wallet);
  const fetchWallet = useWalletStore((state) => state.fetchWallet);
  const { error: showError } = useNotificationStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecentVerifications, setIsLoadingRecentVerifications] = useState(false);
  const [isLoadingRecentTransactions, setIsLoadingRecentTransactions] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [verificationPage, setVerificationPage] = useState(1);
  const [verificationTotal, setVerificationTotal] = useState(0);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [downloadingRequestRef, setDownloadingRequestRef] = useState<string | null>(null);

  const recentLimit = 5;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router]);

  const mapVerificationStatus = (status: string) => {
    if (status === 'SUCCESS' || status === 'COMPLETED') return 'COMPLETED';
    if (status === 'FAILED') return 'FAILED';
    return 'PROCESSING';
  };

  const loadRecentVerifications = async (page: number) => {
    try {
      setIsLoadingRecentVerifications(true);
      const { verifications, total } = await verificationService.getHistory(page, recentLimit);
      setRecentVerifications(
        verifications.map((item: any) => ({
          id: item.id,
          requestRef: item.requestRef,
          verificationType: item.searchType,
          identityNumber: item.searchParameter || item.requestRef,
          status: mapVerificationStatus(item.status),
          cost: Number(item.amountCharged || 0),
          createdAt: item.createdAt,
          pdfPath: item.pdfPath,
        }))
      );
      setVerificationTotal(total);
      setVerificationPage(page);
    } catch (error) {
      showError('Failed to load recent verifications');
      console.error(error);
    } finally {
      setIsLoadingRecentVerifications(false);
    }
  };

  const loadRecentTransactions = async (page: number) => {
    try {
      setIsLoadingRecentTransactions(true);
      const { transactions, total } = await walletApiService.getTransactions(page, recentLimit);
      setRecentTransactions(transactions);
      setTransactionTotal(total);
      setTransactionPage(page);
    } catch (error) {
      showError('Failed to load recent transactions');
      console.error(error);
    } finally {
      setIsLoadingRecentTransactions(false);
    }
  };

  const handleDownloadVerification = async (requestRef: string, identityNumber: string, type: string) => {
    try {
      setDownloadingRequestRef(requestRef);
      const blob = await pdfService.downloadVerificationPDF(requestRef);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${identityNumber || requestRef}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download verification PDF:', error);
      showError('Failed to download PDF');
    } finally {
      setDownloadingRequestRef(null);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData] = await Promise.all([
        dashboardService.getStats(),
        fetchWallet(),
        loadRecentVerifications(1),
        loadRecentTransactions(1),
      ]);
      setStats(statsData);
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingOverlay message="Loading dashboard..." />
      </DashboardLayout>
    );
  }

  const getVerificationBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PROCESSING':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getTransactionBadgeVariant = (type: string) => {
    return type === 'CREDIT' ? 'success' : 'error';
  };

  const maskIdentityNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7) {
      return value;
    }

    return `${digits.slice(0, 3)}*****${digits.slice(-3)}`;
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Welcome back, {user?.firstName}!
            </h1>
            <p className={styles.subtitle}>
              Here is what is happening with your account today
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/verification')}
            leftIcon={
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            New Verification
          </Button>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(wallet?.balance || 0)}
            variant="primary"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
          />

          <StatCard
            title="Total Verifications"
            value={stats?.totalVerifications || 0}
            variant="success"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            }
            trend={
              stats && stats.totalVerifications > 0
                ? {
                    value: 12.5,
                    isPositive: true,
                    label: 'vs last month',
                  }
                : undefined
            }
          />

          <StatCard
            title="Pending Verifications"
            value={stats?.pendingVerifications || 0}
            variant="warning"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />

          <StatCard
            title="Total Spent"
            value={formatCurrency(stats?.totalSpent || 0)}
            variant="default"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Recent Verifications */}
          <Card variant="elevated" padding="none">
            <CardHeader>
              <div className={styles.cardHeader}>
                <div>
                  <CardTitle>Recent Verifications</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/verification')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRecentVerifications ? (
                <div className={styles.cardLoading}>Loading recent verifications...</div>
              ) : recentVerifications.length > 0 ? (
                <>
                  <div className={styles.list}>
                    {recentVerifications.map((verification) => (
                      <div key={verification.id} className={styles.listItem}>
                        <div className={styles.listItemIcon}>
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className={styles.listItemContent}>
                          <div className={styles.listItemMain}>
                            <p className={styles.listItemTitle}>
                              {verification.verificationType} Verification
                            </p>
                            <p className={styles.listItemSubtitle}>
                              {maskIdentityNumber(verification.identityNumber || verification.requestRef)}
                            </p>
                          </div>
                          <div className={styles.listItemMeta}>
                            <Badge
                              variant={getVerificationBadgeVariant(verification.status)}
                              size="sm"
                            >
                              {verification.status}
                            </Badge>
                            <span className={styles.listItemDate}>
                              {formatRelativeTime(verification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.listItemAction}>
                          <p className={styles.listItemAmount}>
                            {formatCurrency(verification.cost)}
                          </p>
                          {verification.status === 'COMPLETED' && verification.requestRef ? (
                            <button
                              className={styles.downloadBtn}
                              onClick={() =>
                                handleDownloadVerification(
                                  verification.requestRef,
                                  verification.identityNumber || verification.requestRef,
                                  verification.verificationType
                                )
                              }
                              disabled={downloadingRequestRef === verification.requestRef}
                            >
                              {downloadingRequestRef === verification.requestRef ? 'Downloading...' : 'Download PDF'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.listFooter}>
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => loadRecentVerifications(verificationPage - 1)}
                        disabled={verificationPage <= 1}
                      >
                        Prev
                      </button>
                      <span className={styles.paginationInfo}>
                        Page {verificationPage} of {Math.max(1, Math.ceil(verificationTotal / recentLimit))}
                      </span>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => loadRecentVerifications(verificationPage + 1)}
                        disabled={verificationPage >= Math.max(1, Math.ceil(verificationTotal / recentLimit))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<NoVerificationsIcon />}
                  title="No verifications yet"
                  description="Start your first verification to see it here"
                  action={{
                    label: 'Start Verification',
                    onClick: () => router.push('/verification'),
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card variant="elevated" padding="none">
            <CardHeader>
              <div className={styles.cardHeader}>
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/transactions')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRecentTransactions ? (
                <div className={styles.cardLoading}>Loading recent transactions...</div>
              ) : recentTransactions.length > 0 ? (
                <>
                  <div className={styles.list}>
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className={styles.listItem}>
                        <div className={styles.listItemIcon}>
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            {transaction.type === 'CREDIT' ? (
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                clipRule="evenodd"
                              />
                            ) : (
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                clipRule="evenodd"
                              />
                            )}
                          </svg>
                        </div>
                        <div className={styles.listItemContent}>
                          <div className={styles.listItemMain}>
                            <p className={styles.listItemTitle}>
                              {transaction.description}
                            </p>
                            <p className={styles.listItemSubtitle}>
                              {transaction.reference}
                            </p>
                          </div>
                          <div className={styles.listItemMeta}>
                            <Badge
                              variant={getTransactionBadgeVariant(transaction.type)}
                              size="sm"
                            >
                              {transaction.type}
                            </Badge>
                            <span className={styles.listItemDate}>
                              {formatRelativeTime(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.listItemAction}>
                          <p
                            className={styles.listItemAmount}
                            style={{
                              color:
                                transaction.type === 'CREDIT'
                                  ? 'var(--color-success)'
                                  : 'var(--color-error)',
                            }}
                          >
                            {transaction.type === 'CREDIT' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.listFooter}>
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => loadRecentTransactions(transactionPage - 1)}
                        disabled={transactionPage <= 1}
                      >
                        Prev
                      </button>
                      <span className={styles.paginationInfo}>
                        Page {transactionPage} of {Math.max(1, Math.ceil(transactionTotal / recentLimit))}
                      </span>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => loadRecentTransactions(transactionPage + 1)}
                        disabled={transactionPage >= Math.max(1, Math.ceil(transactionTotal / recentLimit))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<NoTransactionsIcon />}
                  title="No transactions yet"
                  description="Your transaction history will appear here"
                  action={{
                    label: 'Fund Wallet',
                    onClick: () => router.push('/wallet'),
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.quickActions}>
              <button
                className={styles.quickAction}
                onClick={() => router.push('/verification')}
              >
                <div className={styles.quickActionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className={styles.quickActionLabel}>Verify NIN/BVN</span>
              </button>

              <button
                className={styles.quickAction}
                onClick={() => router.push('/wallet')}
              >
                <div className={styles.quickActionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <span className={styles.quickActionLabel}>Fund Wallet</span>
              </button>

              <button
                className={styles.quickAction}
                onClick={() => router.push('/transactions')}
              >
                <div className={styles.quickActionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className={styles.quickActionLabel}>View Transactions</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
