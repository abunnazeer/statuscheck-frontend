// frontend/src/app/(dashboard)/settings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { isValidEmail, isValidNigerianPhone } from '@/lib/utils';
import styles from './page.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { success, error: showError } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    verificationAlerts: true,
    walletAlerts: true,
    promotionalEmails: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setProfileData({
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'security' || tab === 'notifications') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleProfileUpdate = async () => {
    if (!profileData.fullName.trim()) {
      showError('Full name is required');
      return;
    }

    if (!isValidEmail(profileData.email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (!isValidNigerianPhone(profileData.phone)) {
      showError('Please enter a valid Nigerian phone number');
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = profileData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      await authService.updateProfile({
        firstName,
        lastName,
        email: profileData.email,
        phone: profileData.phone,
      });

      updateUser({
        firstName,
        lastName,
        email: profileData.email,
        phone: profileData.phone,
      });

      success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      showError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      showError('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      showError('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      success('Password changed successfully');
    } catch (err) {
      console.error('Failed to change password:', err);
      showError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);

    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      success('Notification preferences updated');
    } catch (err) {
      console.error('Failed to update notifications:', err);
      showError('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
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
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Security
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'notifications' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifications
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                <p className={styles.sectionDesc}>Update your personal information</p>
              </div>

              <div className={styles.form}>
                <div className={styles.avatarSection}>
                  <div className={styles.avatar}>
                    <span>
                      {profileData.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || '?'}
                    </span>
                  </div>
                  <div className={styles.avatarInfo}>
                    <h3>{profileData.fullName || 'User'}</h3>
                    <p>{profileData.email}</p>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    className={styles.input}
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Change Password</h2>
                <p className={styles.sectionDesc}>
                  Ensure your account is using a strong password
                </p>
              </div>

              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={styles.input}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className={styles.input}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className={styles.hint}>
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={styles.input}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                <p className={styles.sectionDesc}>
                  Choose how you want to receive notifications
                </p>
              </div>

              <div className={styles.form}>
                <div className={styles.toggleGroup}>
                  <div className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <h4>Email Notifications</h4>
                      <p>Receive notifications via email</p>
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailNotifications: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <h4>SMS Notifications</h4>
                      <p>Receive notifications via SMS</p>
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={notifications.smsNotifications}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            smsNotifications: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <h4>Verification Alerts</h4>
                      <p>Get notified when verification is complete</p>
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={notifications.verificationAlerts}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            verificationAlerts: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <h4>Wallet Alerts</h4>
                      <p>Get notified about wallet transactions</p>
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={notifications.walletAlerts}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            walletAlerts: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <h4>Promotional Emails</h4>
                      <p>Receive offers and updates from us</p>
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={notifications.promotionalEmails}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            promotionalEmails: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleNotificationUpdate}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
