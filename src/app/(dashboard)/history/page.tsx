// frontend/src/app/(dashboard)/history/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { pdfService, verificationService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import styles from './page.module.css';

interface Verification {
  id: string;
  requestRef: string;
  searchType: string;
  searchParameter: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amountCharged: string;
  serviceName?: string;
  createdAt: string;
  apiResponse?: any;
}

export default function HistoryPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { error: showError } = useNotificationStore();

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [totalVerifications, setTotalVerifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingRequestRef, setDownloadingRequestRef] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Detail modal
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const limit = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadVerifications(1);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadVerifications(1);
    }
  }, [filterType, filterStatus]);

  const loadVerifications = async (page: number) => {
    try {
      setIsLoading(true);
      const { verifications: data, total } = await verificationService.getHistory(page, limit, {
        ...(filterType ? { searchType: filterType } : {}),
        ...(filterStatus ? { status: filterStatus } : {}),
      });

      setVerifications(data);
      setTotalVerifications(total);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load verifications:', err);
      showError('Failed to load verification history');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalVerifications / limit));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    loadVerifications(page);
  };

  const handleViewDetails = async (verification: Verification) => {
    setSelectedVerification(verification);
    
    if (!verification.apiResponse) {
      setIsLoadingDetail(true);
      try {
        const detail = await verificationService.getVerificationByRef(verification.requestRef);
        setSelectedVerification(detail as Verification);
      } catch (err) {
        console.error('Failed to load verification details:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleDownloadPdf = async (requestRef: string, searchType: string, searchParameter: string) => {
    try {
      setDownloadingRequestRef(requestRef);
      const blob = await pdfService.downloadVerificationPDF(requestRef);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${searchType}_${searchParameter || requestRef}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download verification PDF:', err);
      showError('Failed to download PDF');
    } finally {
      setDownloadingRequestRef(null);
    }
  };

  const getSearchTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      NIN: 'NIN Verification',
      BVN: 'BVN Verification',
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case 'FAILED':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        );
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
            <h1 className={styles.title}>Verification History</h1>
            <p className={styles.subtitle}>View all your past verification requests</p>
          </div>
          <button
            className={styles.newVerifyBtn}
            onClick={() => router.push('/verification')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Verification
          </button>
        </div>

        {/* Stats Summary */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{totalVerifications}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={`${styles.statNumber} ${styles.successText}`}>
              {verifications.filter((v) => v.status === 'SUCCESS').length}
            </span>
            <span className={styles.statLabel}>Successful</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={`${styles.statNumber} ${styles.failedText}`}>
              {verifications.filter((v) => v.status === 'FAILED').length}
            </span>
            <span className={styles.statLabel}>Failed</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={`${styles.statNumber} ${styles.pendingText}`}>
              {verifications.filter((v) => v.status === 'PENDING').length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="NIN">NIN Verification</option>
              <option value="BVN">BVN Verification</option>
            </select>
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <p className={styles.resultCount}>
            Page {currentPage} of {totalPages} • {totalVerifications} total
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading history...</p>
          </div>
        )}

        {/* Verifications List */}
        {!isLoading && verifications.length > 0 && (
          <>
            <div className={styles.verificationsList}>
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className={styles.verificationCard}
                  onClick={() => handleViewDetails(verification)}
                >
                  <div className={styles.cardLeft}>
                    <div className={`${styles.statusIcon} ${styles[`icon${verification.status}`]}`}>
                      {getStatusIcon(verification.status)}
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle}>
                        {getSearchTypeLabel(verification.searchType)}
                      </h3>
                      <p className={styles.cardMeta}>
                        <span className={styles.refCode}>{verification.requestRef}</span>
                        <span className={styles.separator}>•</span>
                        <span>{formatDate(verification.createdAt)}</span>
                      </p>
                      <p className={styles.searchParam}>
                        Search: {verification.searchParameter}
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={`${styles.statusBadge} ${styles[`badge${verification.status}`]}`}>
                      {verification.status}
                    </span>
                    <span className={styles.amount}>
                      {formatCurrency(parseFloat(verification.amountCharged))}
                    </span>
                    <button className={styles.viewBtn}>
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                    {verification.status === 'SUCCESS' && (
                      <button
                        className={styles.downloadBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(verification.requestRef, verification.searchType, verification.searchParameter);
                        }}
                        disabled={downloadingRequestRef === verification.requestRef}
                      >
                        {downloadingRequestRef === verification.requestRef ? 'Downloading...' : 'Download PDF'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.paginationWrapper}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                Prev
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && verifications.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>No verifications yet</h3>
            <p>Start verifying NIN or BVN to see your history here</p>
            <button
              className={styles.emptyBtn}
              onClick={() => router.push('/verification')}
            >
              Start Verification
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedVerification && (
          <div className={styles.modalOverlay} onClick={() => setSelectedVerification(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Verification Details</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setSelectedVerification(null)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                {isLoadingDetail ? (
                  <div className={styles.modalLoading}>
                    <div className={styles.spinner}></div>
                    <p>Loading details...</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.detailHeader}>
                      <div className={`${styles.detailIcon} ${styles[`icon${selectedVerification.status}`]}`}>
                        {getStatusIcon(selectedVerification.status)}
                      </div>
                      <div>
                        <h3 className={styles.detailTitle}>
                          {getSearchTypeLabel(selectedVerification.searchType)}
                        </h3>
                        <span className={`${styles.statusBadge} ${styles[`badge${selectedVerification.status}`]}`}>
                          {selectedVerification.status}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Reference</span>
                        <span className={styles.detailValue}>{selectedVerification.requestRef}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Search Parameter</span>
                        <span className={styles.detailValue}>{selectedVerification.searchParameter}</span>
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

                    {selectedVerification.status === 'SUCCESS' && selectedVerification.apiResponse && (
                      <div className={styles.responseData}>
                        <h4 className={styles.responseTitle}>Response Data</h4>
                        <div className={styles.responseGrid}>
                          {Object.entries(selectedVerification.apiResponse.data || {}).map(([key, value]) => (
                            <div key={key} className={styles.responseItem}>
                              <span className={styles.responseLabel}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                              </span>
                              <span className={styles.responseValue}>
                                {String(value) || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedVerification(null)}
                >
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
