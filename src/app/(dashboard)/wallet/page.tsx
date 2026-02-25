// frontend/src/app/(dashboard)/wallet/page.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { pdfService, walletService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import styles from './page.module.css';

interface Transaction {
  id: string;
  transactionRef: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  verificationRequestRef?: string;
  verificationPdfPath?: string;
  createdAt: string;
}

interface WalletStats {
  totalCredits: string;
  totalDebits: string;
  transactionCount: number;
  lastTransaction: string | null;
}

export default function WalletPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { wallet, fetchWallet } = useWalletStore();
  const { error: showError, success: showSuccess } = useNotificationStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [downloadingRequestRef, setDownloadingRequestRef] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [reservedAccount, setReservedAccount] = useState<{
    accountName: string;
    accountNumber: string;
    bankName: string;
    message: string;
  } | null>(null);
  const [isLoadingReservedAccount, setIsLoadingReservedAccount] = useState(false);
  const [isSyncingDeposits, setIsSyncingDeposits] = useState(false);
  const [syncSummary, setSyncSummary] = useState('');

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const pollingInFlightRef = useRef(false);

  const limit = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadWalletData();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions(1);
    }
  }, [filterType, filterStatus, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (document.hidden || pollingInFlightRef.current) {
        return;
      }

      pollingInFlightRef.current = true;
      try {
        await Promise.all([fetchWallet(), loadTransactions(currentPage, true)]);
      } catch {
        // Silent background refresh.
      } finally {
        pollingInFlightRef.current = false;
      }
    }, 45000);

    return () => {
      clearInterval(interval);
      pollingInFlightRef.current = false;
    };
  }, [isAuthenticated, currentPage, filterType, filterStatus]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingReservedAccount(true);
      const walletPromise = fetchWallet();
      const [walletStatsResult, accountResult] = await Promise.allSettled([
        walletService.getWalletStats(),
        walletService.getReservedAccount(),
      ]);
      await walletPromise;

      if (walletStatsResult.status === 'fulfilled') {
        setStats(walletStatsResult.value);
      } else {
        throw walletStatsResult.reason;
      }

      if (accountResult.status === 'fulfilled') {
        setReservedAccount(accountResult.value);
      } else {
        setReservedAccount(null);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      showError('Failed to load wallet data');
    } finally {
      setIsLoadingReservedAccount(false);
      setIsLoading(false);
    }
  };

  const loadTransactions = async (page: number, silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoadingTransactions(true);
      }

      const filters: { type?: string; status?: string } = {};
      if (filterType) filters.type = filterType;
      if (filterStatus) filters.status = filterStatus;

      const { transactions: txns, total } = await walletService.getTransactions(
        page,
        limit,
        filters
      );

      setTransactions(txns);
      setTotalTransactions(total);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      if (!silent) {
        showError('Failed to load transactions');
      }
    } finally {
      if (!silent) {
        setIsLoadingTransactions(false);
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalTransactions / limit));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    loadTransactions(page);
  };

  const handleDownloadPdf = async (requestRef: string, transactionRef: string) => {
    try {
      setDownloadingRequestRef(requestRef);
      const blob = await pdfService.downloadVerificationPDF(requestRef);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VERIFICATION_${transactionRef}.pdf`;
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

  const handleCopyAccountNumber = async () => {
    if (!reservedAccount?.accountNumber) return;

    try {
      await navigator.clipboard.writeText(reservedAccount.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 1600);
    } catch (error) {
      console.error('Failed to copy account number:', error);
      showError('Unable to copy account number');
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncingDeposits(true);
      const report = await walletService.syncDeposits();

      const summary = report.status === 'SKIPPED'
        ? report.reason || 'Sync skipped'
        : `Synced: ${report.creditedCount} credited, ${report.alreadyReconciledCount} already reconciled, ${report.failedCount} failed`;

      setSyncSummary(summary);

      if (report.creditedCount > 0) {
        showSuccess(`Wallet updated with ${report.creditedCount} credited payment(s).`);
      } else {
        showSuccess(summary);
      }

      await Promise.all([
        fetchWallet(),
        loadTransactions(currentPage, true),
      ]);

      const refreshedStats = await walletService.getWalletStats();
      setStats(refreshedStats);
    } catch (error) {
      console.error('Manual deposit sync failed:', error);
      showError(error instanceof Error ? error.message : 'Manual sync failed');
    } finally {
      setIsSyncingDeposits(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Wallet</h1>
            <p className={styles.subtitle}>Manage your wallet and transactions</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading wallet...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Wallet Cards */}
            <div className={styles.walletCards}>
              {/* Balance Card */}
              <div className={styles.balanceCard}>
                <div className={styles.balanceHeader}>
                  <span className={styles.balanceLabel}>Available Balance</span>
                  <span className={styles.currency}>{wallet?.currency || 'NGN'}</span>
                </div>
                <div className={styles.balanceContent}>
                  <h2 className={styles.balanceAmount}>
                    {wallet ? formatCurrency(Number(wallet.balance)) : '₦0.00'}
                  </h2>
                </div>
                <div className={styles.reservedAccount}>
                  <div className={styles.accountHeader}>
                    <button
                      type="button"
                      className={styles.syncBtn}
                      onClick={handleManualSync}
                      disabled={isSyncingDeposits}
                    >
                      {isSyncingDeposits ? 'Syncing...' : 'Sync Deposits'}
                    </button>
                    {reservedAccount && (
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={handleCopyAccountNumber}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        {copiedAccount ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  {isLoadingReservedAccount ? (
                    <p className={styles.reservedMeta}>Loading account details...</p>
                  ) : reservedAccount ? (
                    <>
                      <p className={styles.accountNumber}>{reservedAccount.accountNumber}</p>
                      <p className={styles.reservedMeta}>
                        {reservedAccount.bankName} • {reservedAccount.accountName}
                      </p>
                    </>
                  ) : (
                    <p className={styles.reservedMeta}>
                      Reserved account details are temporarily unavailable.
                    </p>
                  )}
                  {syncSummary ? (
                    <p className={styles.syncStatus}>{syncSummary}</p>
                  ) : null}
                </div>
              </div>

              {/* Stats Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIconGreen}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Total Credits</span>
                    <span className={styles.statValue}>
                      {stats ? formatCurrency(parseFloat(stats.totalCredits)) : '₦0.00'}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconRed}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Total Debits</span>
                    <span className={styles.statValue}>
                      {stats ? formatCurrency(parseFloat(stats.totalDebits)) : '₦0.00'}
                    </span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconBlue}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                    </svg>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Transactions</span>
                    <span className={styles.statValue}>
                      {stats?.transactionCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Section */}
            <div className={styles.transactionsSection}>
              <div className={styles.transactionsHeader}>
                <h2 className={styles.sectionTitle}>Transaction History</h2>
                <div className={styles.filters}>
                  <select
                    className={styles.filterSelect}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="CREDIT">Credits</option>
                    <option value="DEBIT">Debits</option>
                  </select>
                  <select
                    className={styles.filterSelect}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              {isLoadingTransactions ? (
                <div className={styles.transactionsLoading}>Loading transactions...</div>
              ) : transactions.length > 0 ? (
                <>
                  <div className={styles.transactionsList}>
                    {transactions.map((txn) => (
                      <div key={txn.id} className={styles.transactionItem}>
                        <div className={styles.txnLeft}>
                          <div className={`${styles.txnIcon} ${styles[`txn${txn.type}`]}`}>
                            {txn.type === 'CREDIT' ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12l7 7 7-7" />
                              </svg>
                            )}
                          </div>
                          <div className={styles.txnInfo}>
                            <p className={styles.txnDescription}>
                              {txn.description || (txn.type === 'CREDIT' ? 'Wallet Credit' : 'Wallet Debit')}
                            </p>
                            <p className={styles.txnMeta}>
                              <span>{txn.transactionRef}</span>
                              <span>•</span>
                              <span>{formatDate(txn.createdAt)}</span>
                            </p>
                          </div>
                        </div>
                        <div className={styles.txnRight}>
                          <p className={`${styles.txnAmount} ${styles[`amount${txn.type}`]}`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}
                            {formatCurrency(parseFloat(txn.amount))}
                          </p>
                          <span className={`${styles.txnStatus} ${styles[`status${txn.status}`]}`}>
                            {txn.status}
                          </span>
                          {txn.verificationRequestRef ? (
                            <button
                              className={styles.downloadBtn}
                              onClick={() => handleDownloadPdf(txn.verificationRequestRef!, txn.transactionRef)}
                              disabled={downloadingRequestRef === txn.verificationRequestRef}
                            >
                              {downloadingRequestRef === txn.verificationRequestRef ? 'Downloading...' : 'Download PDF'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.paginationWrapper}>
                    <button
                      className={styles.paginationBtn}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || isLoadingTransactions}
                    >
                      Prev
                    </button>
                    <span className={styles.paginationInfo}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className={styles.paginationBtn}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || isLoadingTransactions}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <h3>No transactions yet</h3>
                  <p>Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
