'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { pdfService, walletService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import styles from './page.module.css';

interface Transaction {
  id: string;
  transactionRef: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number | string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'SUCCESS';
  verificationRequestRef?: string;
  createdAt: string;
}

interface WalletStats {
  totalCredits: string;
  totalDebits: string;
  transactionCount: number;
  lastTransaction: string | null;
}

export default function TransactionsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { error: showError } = useNotificationStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingRequestRef, setDownloadingRequestRef] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const hasInitializedFiltersRef = useRef(false);

  const limit = 12;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadPageData(1);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      if (!hasInitializedFiltersRef.current) {
        hasInitializedFiltersRef.current = true;
        return;
      }
      loadTransactions(1);
    }
  }, [filterType, filterStatus, isAuthenticated]);

  const loadPageData = async (page: number) => {
    try {
      setIsLoading(true);
      const [walletStats] = await Promise.all([
        walletService.getWalletStats(),
        loadTransactions(page),
      ]);
      setStats(walletStats);
    } catch (error) {
      console.error('Failed to load transactions page:', error);
      showError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async (page: number) => {
    const filters: { type?: string; status?: string } = {};
    if (filterType) filters.type = filterType;
    if (filterStatus) filters.status = filterStatus;

    const { transactions: data, total } = await walletService.getTransactions(page, limit, filters);
    setTransactions(data);
    setTotalTransactions(total);
    setCurrentPage(page);
  };

  const totalPages = Math.max(1, Math.ceil(totalTransactions / limit));

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    try {
      setIsLoading(true);
      await loadTransactions(page);
    } catch (error) {
      console.error('Failed to change transaction page:', error);
      showError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Transaction History</h1>
            <p className={styles.subtitle}>All wallet debits and credits in one place</p>
          </div>
          <button
            className={styles.walletBtn}
            onClick={() => router.push('/wallet')}
          >
            Go to Wallet
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Transactions</span>
            <span className={styles.statValue}>{stats?.transactionCount || 0}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Credits</span>
            <span className={`${styles.statValue} ${styles.creditValue}`}>
              {stats ? formatCurrency(parseFloat(stats.totalCredits)) : '₦0.00'}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Debits</span>
            <span className={`${styles.statValue} ${styles.debitValue}`}>
              {stats ? formatCurrency(parseFloat(stats.totalDebits)) : '₦0.00'}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Last Transaction</span>
            <span className={styles.statValueSmall}>
              {stats?.lastTransaction ? formatDate(stats.lastTransaction) : 'N/A'}
            </span>
          </div>
        </div>

        <div className={styles.filtersBar}>
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
          <p className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className={styles.transactionsList}>
              {transactions.map((txn) => {
                const status = txn.status === 'SUCCESS' ? 'COMPLETED' : txn.status;
                const amountValue = typeof txn.amount === 'number' ? txn.amount : parseFloat(txn.amount || '0');

                return (
                  <div key={txn.id} className={styles.transactionItem}>
                    <div className={styles.leftBlock}>
                      <div className={`${styles.typeIcon} ${styles[`type${txn.type}`]}`}>
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
                      <div className={styles.transactionInfo}>
                        <p className={styles.description}>
                          {txn.description || (txn.type === 'CREDIT' ? 'Wallet Credit' : 'Wallet Debit')}
                        </p>
                        <p className={styles.meta}>
                          <span>{txn.transactionRef}</span>
                          <span>•</span>
                          <span>{formatDate(txn.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className={styles.rightBlock}>
                      <p className={`${styles.amount} ${styles[`amount${txn.type}`]}`}>
                        {txn.type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(amountValue)}
                      </p>
                      <span className={`${styles.status} ${styles[`status${status}`]}`}>
                        {status}
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
                );
              })}
            </div>

            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Prev
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>No transactions yet</h3>
            <p>Your wallet transactions will appear here.</p>
            <button
              className={styles.walletBtn}
              onClick={() => router.push('/wallet')}
            >
              Go to Wallet
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
