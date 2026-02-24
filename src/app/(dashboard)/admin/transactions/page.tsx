// frontend/src/app/(dashboard)/admin/transactions/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { adminService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import styles from './page.module.css';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { error: showError } = useNotificationStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  const limit = 15;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchTransactions();
  }, [isAuthenticated, user, router, currentPage, typeFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const filters: { type?: string } = {};
      if (typeFilter) filters.type = typeFilter;

      const response = await adminService.getTransactions(currentPage, limit, filters);
      setTransactions(response.data || []);
      setTotalPages(Math.ceil((response.pagination?.total || 0) / limit));
      setTotalTransactions(response.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      showError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const openModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const getTypeBadge = (type: string) => {
    return type === 'CREDIT' ? styles.typeCredit : styles.typeDebit;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'FAILED':
        return styles.statusFailed;
      case 'PENDING':
        return styles.statusPending;
      default:
        return '';
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/admin" className={styles.backLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </Link>
            <h1 className={styles.title}>Transactions</h1>
            <p className={styles.subtitle}>View all wallet transactions across the platform</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.totalCount}>{totalTransactions} transactions total</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange();
              }}
              className={styles.select}
            >
              <option value="">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>

          <button
            className={styles.resetBtn}
            onClick={() => {
              setTypeFilter('');
              handleFilterChange();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Reset
          </button>

          <div className={styles.filterStats}>
            <div className={styles.statItem}>
              <span className={styles.statDot + ' ' + styles.creditDot}></span>
              <span>Credits</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statDot + ' ' + styles.debitDot}></span>
              <span>Debits</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <h3>No transactions found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance Before</th>
                  <th>Balance After</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className={styles.refCode}>{transaction.reference}</span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{transaction.user?.fullName || 'Unknown'}</span>
                        <span className={styles.userEmail}>{transaction.user?.email || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${getTypeBadge(transaction.type)}`}>
                        {transaction.type === 'CREDIT' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                          </svg>
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`${styles.amountCell} ${transaction.type === 'CREDIT' ? styles.creditAmount : styles.debitAmount}`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(parseFloat(transaction.amount))}
                    </td>
                    <td>{formatCurrency(parseFloat(transaction.balanceBefore))}</td>
                    <td>{formatCurrency(parseFloat(transaction.balanceAfter))}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{formatDate(transaction.createdAt)}</td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => openModal(transaction)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedTransaction && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Transaction Details</h2>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Transaction Amount Header */}
                <div className={`${styles.amountHeader} ${selectedTransaction.type === 'CREDIT' ? styles.creditHeader : styles.debitHeader}`}>
                  <div className={styles.amountIcon}>
                    {selectedTransaction.type === 'CREDIT' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.amountInfo}>
                    <span className={styles.amountLabel}>{selectedTransaction.type}</span>
                    <span className={styles.amountValue}>
                      {selectedTransaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(parseFloat(selectedTransaction.amount))}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Reference</span>
                    <span className={styles.detailValue}>{selectedTransaction.reference}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={`${styles.statusBadge} ${getStatusBadge(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Balance Before</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(parseFloat(selectedTransaction.balanceBefore))}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Balance After</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(parseFloat(selectedTransaction.balanceAfter))}
                    </span>
                  </div>

                  <div className={styles.detailItem + ' ' + styles.fullWidth}>
                    <span className={styles.detailLabel}>Description</span>
                    <span className={styles.detailValue}>{selectedTransaction.description || 'N/A'}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedTransaction.createdAt)}
                    </span>
                  </div>
                </div>

                {/* User Section */}
                <div className={styles.userSection}>
                  <h4>User Information</h4>
                  <div className={styles.userDetail}>
                    <div className={styles.userAvatar}>
                      {selectedTransaction.user?.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <strong>{selectedTransaction.user?.fullName || 'Unknown'}</strong>
                      <span>{selectedTransaction.user?.email || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.closeModalBtn} onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}