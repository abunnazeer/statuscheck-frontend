// frontend/src/app/(dashboard)/admin/verifications/page.tsx

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

interface Verification {
  id: string;
  requestRef: string;
  serviceCode: string;
  searchParameter: string;
  searchType: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amountCharged: string;
  errorMessage?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { error: showError } = useNotificationStore();

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTypeFilter, setSearchTypeFilter] = useState<string>('');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
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

    fetchVerifications();
  }, [isAuthenticated, user, router, currentPage, statusFilter, searchTypeFilter]);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const filters: { status?: string; searchType?: string } = {};
      if (statusFilter) filters.status = statusFilter;
      if (searchTypeFilter) filters.searchType = searchTypeFilter;

      const response = await adminService.getVerifications(currentPage, limit, filters);
      setVerifications(response.data || []);
      setTotalPages(Math.ceil((response.pagination?.total || 0) / limit));
      setTotalVerifications(response.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
      showError('Failed to load verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const openModal = (verification: Verification) => {
    setSelectedVerification(verification);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVerification(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return styles.statusSuccess;
      case 'FAILED':
        return styles.statusFailed;
      case 'PENDING':
        return styles.statusPending;
      default:
        return '';
    }
  };

  const getServiceIcon = (serviceCode: string) => {
    if (serviceCode.includes('NIN')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M15 8h2M15 12h2M7 16h10" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4M14 15h4" />
      </svg>
    );
  };

  const maskParameter = (param: string) => {
    if (!param || param.length < 4) return param;
    return param.slice(0, 3) + '****' + param.slice(-3);
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
            <h1 className={styles.title}>Verifications</h1>
            <p className={styles.subtitle}>View all verification requests across the platform</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.totalCount}>{totalVerifications} verifications total</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Type</label>
            <select
              value={searchTypeFilter}
              onChange={(e) => {
                setSearchTypeFilter(e.target.value);
                handleFilterChange();
              }}
              className={styles.select}
            >
              <option value="">All Types</option>
              <option value="NIN">NIN</option>
              <option value="NIN_PHONE">NIN Phone</option>
              <option value="BVN">BVN</option>
              <option value="BVN_PHONE">BVN Phone</option>
            </select>
          </div>

          <button
            className={styles.resetBtn}
            onClick={() => {
              setStatusFilter('');
              setSearchTypeFilter('');
              handleFilterChange();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Reset
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading verifications...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3>No verifications found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Service</th>
                  <th>Parameter</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((verification) => (
                  <tr key={verification.id}>
                    <td>
                      <span className={styles.refCode}>{verification.requestRef}</span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>{verification.user?.fullName || 'Unknown'}</span>
                        <span className={styles.userEmail}>{verification.user?.email || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.serviceCell}>
                        <div className={styles.serviceIcon}>
                          {getServiceIcon(verification.serviceCode)}
                        </div>
                        <span>{verification.serviceCode.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.parameter}>{maskParameter(verification.searchParameter)}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadge(verification.status)}`}>
                        {verification.status}
                      </span>
                    </td>
                    <td className={styles.amountCell}>
                      {formatCurrency(parseFloat(verification.amountCharged))}
                    </td>
                    <td>{formatDate(verification.createdAt)}</td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => openModal(verification)}
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
        {showModal && selectedVerification && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Verification Details</h2>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.detailSection}>
                  <div className={`${styles.statusHeader} ${getStatusBadge(selectedVerification.status)}`}>
                    <div className={styles.statusIcon}>
                      {selectedVerification.status === 'SUCCESS' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      ) : selectedVerification.status === 'FAILED' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                    </div>
                    <span>{selectedVerification.status}</span>
                  </div>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Reference</span>
                    <span className={styles.detailValue}>{selectedVerification.requestRef}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Service</span>
                    <span className={styles.detailValue}>
                      {selectedVerification.serviceCode.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Search Type</span>
                    <span className={styles.detailValue}>{selectedVerification.searchType}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Parameter</span>
                    <span className={styles.detailValue}>
                      {maskParameter(selectedVerification.searchParameter)}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Amount Charged</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(parseFloat(selectedVerification.amountCharged))}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedVerification.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.userSection}>
                  <h4>User Information</h4>
                  <div className={styles.userDetail}>
                    <div className={styles.userAvatar}>
                      {selectedVerification.user?.fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <strong>{selectedVerification.user?.fullName || 'Unknown'}</strong>
                      <span>{selectedVerification.user?.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {selectedVerification.errorMessage && (
                  <div className={styles.errorSection}>
                    <h4>Error Message</h4>
                    <p>{selectedVerification.errorMessage}</p>
                  </div>
                )}
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