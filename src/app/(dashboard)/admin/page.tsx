// frontend/src/app/(dashboard)/admin/page.tsx

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

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  totalRevenue: number;
  todayRevenue: number;
  totalWalletBalance: number;
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
  }>;
  recentVerifications: Array<{
    id: string;
    requestRef: string;
    serviceCode: string;
    status: string;
    createdAt: string;
    user: {
      fullName: string;
    };
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useNotificationStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpDescription, setTopUpDescription] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardStats();
    fetchMaintenanceMode();
  }, [isAuthenticated, user, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      showError('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenanceMode = async () => {
    try {
      const maintenance = await adminService.getMaintenanceMode();
      setMaintenanceEnabled(maintenance.enabled);
      setMaintenanceMessage(maintenance.message || '');
    } catch (err) {
      console.error('Failed to fetch maintenance mode:', err);
      showError('Failed to load maintenance mode');
    }
  };

  const handleMaintenanceUpdate = async () => {
    setIsMaintenanceLoading(true);
    try {
      const result = await adminService.updateMaintenanceMode(
        maintenanceEnabled,
        maintenanceMessage || undefined
      );
      setMaintenanceEnabled(result.enabled);
      setMaintenanceMessage(result.message || '');
      success(result.enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    } catch (err) {
      console.error('Failed to update maintenance mode:', err);
      showError('Failed to update maintenance mode');
    } finally {
      setIsMaintenanceLoading(false);
    }
  };

  const handleTopUpWallet = async () => {
    const amount = parseFloat(topUpAmount);

    if (isNaN(amount) || amount <= 0) {
      showError('Enter a valid top-up amount');
      return;
    }

    setIsActionLoading(true);
    try {
      await adminService.topUpOwnWallet(amount, topUpDescription || undefined);
      success('Admin wallet topped up successfully');
      setTopUpAmount('');
      setTopUpDescription('');
      fetchDashboardStats();
    } catch (err) {
      console.error('Failed to top up admin wallet:', err);
      showError(err instanceof Error ? err.message : 'Failed to top up wallet');
    } finally {
      setIsActionLoading(false);
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
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>Overview of platform activities and metrics</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.refreshBtn}
              onClick={fetchDashboardStats}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              {/* Users Card */}
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Total Users</span>
                  <span className={styles.statValue}>{stats?.totalUsers || 0}</span>
                  <span className={styles.statMeta}>
                    {stats?.activeUsers || 0} active
                  </span>
                </div>
              </div>

              {/* Verifications Card */}
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.iconVerify}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Total Verifications</span>
                  <span className={styles.statValue}>{stats?.totalVerifications || 0}</span>
                  <span className={styles.statMeta}>
                    {stats?.successfulVerifications || 0} successful
                  </span>
                </div>
              </div>

              {/* Revenue Card */}
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.iconRevenue}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Total Revenue</span>
                  <span className={styles.statValue}>
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </span>
                  <span className={styles.statMeta}>
                    {formatCurrency(stats?.todayRevenue || 0)} today
                  </span>
                </div>
              </div>

              {/* Wallet Balance Card */}
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.iconWallet}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Total Wallet Balance</span>
                  <span className={styles.statValue}>
                    {formatCurrency(stats?.totalWalletBalance || 0)}
                  </span>
                  <span className={styles.statMeta}>All users combined</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                <Link href="/admin/users" className={styles.actionCard}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span>Manage Users</span>
                </Link>

                <Link href="/admin/verifications" className={styles.actionCard}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span>Verifications</span>
                </Link>

                <Link href="/admin/transactions" className={styles.actionCard}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span>Transactions</span>
                </Link>

                <Link href="/admin/services" className={styles.actionCard}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                    </svg>
                  </div>
                  <span>Service Pricing</span>
                </Link>

                <Link href="/verification/nin" className={styles.actionCard}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="2" />
                      <path d="M15 8h2M15 12h2M7 16h10" />
                    </svg>
                  </div>
                  <span>Verify NIN</span>
                </Link>

                <Link href="/verification/bvn" className={styles.actionCard}>
                  <div className={styles.actionIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 15h4M14 15h4" />
                    </svg>
                  </div>
                  <span>Verify BVN</span>
                </Link>
              </div>
            </div>

            <div className={styles.adminControlSection}>
              <div className={styles.controlCard}>
                <h2 className={styles.sectionTitle}>Maintenance Mode</h2>
                <p className={styles.controlHint}>When enabled, only admin access is allowed.</p>
                <label className={styles.toggleRow}>
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                  />
                  <span>{maintenanceEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
                <input
                  className={styles.controlInput}
                  type="text"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Maintenance message (optional)"
                />
                <button
                  className={styles.controlButton}
                  onClick={handleMaintenanceUpdate}
                  disabled={isMaintenanceLoading}
                >
                  {isMaintenanceLoading ? 'Saving...' : 'Save Maintenance Setting'}
                </button>
              </div>

              <div className={styles.controlCard}>
                <h2 className={styles.sectionTitle}>Admin Wallet Top-up</h2>
                <p className={styles.controlHint}>Manual top-up is restricted to admin wallet only.</p>
                <input
                  className={styles.controlInput}
                  type="number"
                  min="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Amount (NGN)"
                />
                <input
                  className={styles.controlInput}
                  type="text"
                  value={topUpDescription}
                  onChange={(e) => setTopUpDescription(e.target.value)}
                  placeholder="Description (optional)"
                />
                <button
                  className={styles.controlButton}
                  onClick={handleTopUpWallet}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? 'Processing...' : 'Top Up My Wallet'}
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentSection}>
              {/* Recent Users */}
              <div className={styles.recentCard}>
                <div className={styles.recentHeader}>
                  <h2 className={styles.sectionTitle}>Recent Users</h2>
                  <Link href="/admin/users" className={styles.viewAllLink}>
                    View All
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className={styles.recentList}>
                  {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                    stats.recentUsers.map((recentUser) => (
                      <div key={recentUser.id} className={styles.recentItem}>
                        <div className={styles.recentAvatar}>
                          {recentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.recentInfo}>
                          <span className={styles.recentName}>{recentUser.fullName}</span>
                          <span className={styles.recentEmail}>{recentUser.email}</span>
                        </div>
                        <span className={styles.recentDate}>
                          {formatDate(recentUser.createdAt)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyText}>No recent users</p>
                  )}
                </div>
              </div>

              {/* Recent Verifications */}
              <div className={styles.recentCard}>
                <div className={styles.recentHeader}>
                  <h2 className={styles.sectionTitle}>Recent Verifications</h2>
                  <Link href="/admin/verifications" className={styles.viewAllLink}>
                    View All
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className={styles.recentList}>
                  {stats?.recentVerifications && stats.recentVerifications.length > 0 ? (
                    stats.recentVerifications.map((verification) => (
                      <div key={verification.id} className={styles.recentItem}>
                        <div className={`${styles.statusDot} ${styles[`status${verification.status}`]}`}></div>
                        <div className={styles.recentInfo}>
                          <span className={styles.recentName}>
                            {verification.serviceCode.replace(/_/g, ' ')}
                          </span>
                          <span className={styles.recentEmail}>
                            {verification.user?.fullName || 'Unknown'}
                          </span>
                        </div>
                        <span className={`${styles.statusBadge} ${styles[`badge${verification.status}`]}`}>
                          {verification.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyText}>No recent verifications</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
