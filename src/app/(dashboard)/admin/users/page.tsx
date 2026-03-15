// frontend/src/app/(dashboard)/admin/users/page.tsx

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

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role: 'USER' | 'ADMIN';
  createdAt: string;
  wallet?: {
    balance: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { success, error: showError } = useNotificationStore();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'status' | 'delete' | 'topup' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpDescription, setTopUpDescription] = useState('');

  const limit = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user, router, currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers(currentPage, limit, searchQuery || undefined);
      setUsers(response.data || []);
      setTotalPages(Math.ceil((response.pagination?.total || 0) / limit));
      setTotalUsers(response.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const openModal = (userItem: User, action: 'status' | 'delete' | 'topup') => {
    setSelectedUser(userItem);
    setModalAction(action);
    setShowModal(true);
    setNewStatus(userItem.status);
    setTopUpAmount('');
    setTopUpDescription('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalAction(null);
    setTopUpAmount('');
    setTopUpDescription('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !newStatus) return;

    setActionLoading(true);
    try {
      await adminService.updateUserStatus(selectedUser.id, newStatus);
      success(`User status updated to ${newStatus}`);
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
      showError('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.deleteUser(selectedUser.id);
      success(`Deleted ${selectedUser.fullName} successfully`);
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
      showError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTopUpUser = async () => {
    if (!selectedUser) return;

    const amount = parseFloat(topUpAmount);

    if (isNaN(amount) || amount <= 0) {
      showError('Enter a valid top-up amount');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.topUpUserWallet(selectedUser.id, amount, topUpDescription || undefined);
      success(`${selectedUser.fullName}'s wallet was topped up successfully`);
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error('User top-up failed:', err);
      showError(err instanceof Error ? err.message : 'Failed to top up user wallet');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return styles.statusActive;
      case 'INACTIVE':
        return styles.statusInactive;
      case 'SUSPENDED':
        return styles.statusSuspended;
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
            <h1 className={styles.title}>Manage Users</h1>
            <p className={styles.subtitle}>View and manage all registered users</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.totalCount}>{totalUsers} users total</span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <div className={styles.searchInput}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>No users found</h3>
              <p>Try adjusting your search query</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Wallet</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {userItem.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{userItem.fullName}</span>
                          <span className={styles.userEmail}>{userItem.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{userItem.phone}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusColor(userItem.status)}`}>
                        {userItem.status}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${userItem.role === 'ADMIN' ? styles.roleAdmin : ''}`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className={styles.walletCell}>
                      {formatCurrency(parseFloat(userItem.wallet?.balance || '0'))}
                    </td>
                    <td>{formatDate(userItem.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionBtn} ${styles.creditBtn}`}
                          onClick={() => openModal(userItem, 'topup')}
                          title="Top Up Wallet"
                          disabled={userItem.role === 'ADMIN'}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                          </svg>
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openModal(userItem, 'status')}
                          title="Change Status"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.debitBtn}`}
                          onClick={() => openModal(userItem, 'delete')}
                          title="Delete User"
                          disabled={userItem.role === 'ADMIN'}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
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

        {/* Modal */}
        {showModal && selectedUser && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>
                  {modalAction === 'topup' && 'Top Up User Wallet'}
                  {modalAction === 'status' && 'Change User Status'}
                  {modalAction === 'delete' && 'Delete User'}
                </h2>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.selectedUserInfo}>
                  <div className={styles.userAvatar}>
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{selectedUser.fullName}</strong>
                    <span>{selectedUser.email}</span>
                  </div>
                </div>

                {modalAction === 'topup' && (
                  <>
                    <div className={styles.currentBalance}>
                      Current balance: {formatCurrency(parseFloat(selectedUser.wallet?.balance || '0'))}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Amount</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className={styles.input}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Description</label>
                      <input
                        type="text"
                        value={topUpDescription}
                        onChange={(e) => setTopUpDescription(e.target.value)}
                        className={styles.input}
                        placeholder="Optional reason for this manual top-up"
                      />
                    </div>
                  </>
                )}

                {modalAction === 'status' && (
                  <div className={styles.formGroup}>
                    <label>Select New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className={styles.select}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                )}

                {modalAction === 'delete' && (
                  <div className={styles.currentBalance}>
                    This will permanently remove this user and related records.
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className={`${styles.confirmBtn} ${modalAction === 'delete' ? styles.debitConfirm : ''}`}
                  onClick={
                    modalAction === 'topup'
                      ? handleTopUpUser
                      : modalAction === 'status'
                        ? handleUpdateStatus
                        : handleDeleteUser
                  }
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Processing...'
                    : modalAction === 'topup'
                      ? 'Top Up Wallet'
                      : modalAction === 'status'
                        ? 'Update Status'
                        : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
