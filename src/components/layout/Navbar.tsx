// src/components/layout/Navbar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/verification', label: 'Verification' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/settings', label: 'Settings' },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span className={styles.logoText}>StatusCheck</span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  styles.navLink,
                  pathname.startsWith(link.href) && styles.navLinkActive
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Section */}
        <div className={styles.rightSection}>
          {isAuthenticated && user ? (
            <>
              {/* Profile Menu */}
              <div className={styles.profileMenu}>
                <button
                  type="button"
                  className={styles.profileButton}
                  onClick={toggleProfileMenu}
                  aria-label="Profile menu"
                >
                  <Avatar
                    src={null}
                    alt={user.firstName}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="sm"
                  />
                  <span className={styles.profileName}>
                    {user.firstName} {user.lastName}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={cn(
                      styles.profileArrow,
                      isProfileMenuOpen && styles.profileArrowOpen
                    )}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div
                      className={styles.profileMenuOverlay}
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className={styles.profileMenuDropdown}>
                      <div className={styles.profileMenuHeader}>
                        <p className={styles.profileMenuName}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className={styles.profileMenuEmail}>{user.email}</p>
                      </div>
                      <div className={styles.profileMenuDivider} />
                      <Link
                        href="/dashboard"
                        className={styles.profileMenuItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={styles.profileMenuIcon}
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        href="/wallet"
                        className={styles.profileMenuItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={styles.profileMenuIcon}
                        >
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Wallet
                      </Link>
                      <Link
                        href="/settings"
                        className={styles.profileMenuItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={styles.profileMenuIcon}
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.49 3.17a1 1 0 00-1.98 0l-.2 1.33a1 1 0 01-.74.82 5.99 5.99 0 00-1.28.53 1 1 0 01-1.09-.12l-1.06-.83a1 1 0 00-1.4.1l-1.4 1.71a1 1 0 00.12 1.41l1.05.83a1 1 0 01.32 1.03 5.92 5.92 0 000 1.4 1 1 0 01-.32 1.03l-1.05.83a1 1 0 00-.12 1.4l1.4 1.72a1 1 0 001.4.09l1.06-.82a1 1 0 011.09-.13c.4.22.83.39 1.28.53a1 1 0 01.74.82l.2 1.33a1 1 0 001.98 0l.2-1.33a1 1 0 01.74-.82 5.99 5.99 0 001.28-.53 1 1 0 011.09.13l1.06.82a1 1 0 001.4-.1l1.4-1.71a1 1 0 00-.12-1.4l-1.05-.83a1 1 0 01-.32-1.03 5.92 5.92 0 000-1.4 1 1 0 01.32-1.03l1.05-.83a1 1 0 00.12-1.4l-1.4-1.72a1 1 0 00-1.4-.09l-1.06.82a1 1 0 01-1.09.13 5.99 5.99 0 00-1.28-.53 1 1 0 01-.74-.82l-.2-1.33zM10.5 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Settings
                      </Link>
                      <Link
                        href="/settings?tab=security"
                        className={styles.profileMenuItem}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={styles.profileMenuIcon}
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Change Password
                      </Link>
                      <div className={styles.profileMenuDivider} />
                      <button
                        type="button"
                        className={styles.profileMenuItem}
                        onClick={handleLogout}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={styles.profileMenuIcon}
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className={styles.mobileMenuButton}
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={styles.mobileMenuIcon}
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={styles.mobileMenuIcon}
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button variant="primary" onClick={() => router.push('/register')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && isMobileMenuOpen && (
        <>
          <div
            className={styles.mobileMenuOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={styles.mobileMenu}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  styles.mobileMenuLink,
                  pathname.startsWith(link.href) && styles.mobileMenuLinkActive
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
