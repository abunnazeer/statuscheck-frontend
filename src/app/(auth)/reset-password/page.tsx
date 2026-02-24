// frontend/src/app/(auth)/reset-password/page.tsx

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useNotificationStore();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors = {
      password: '',
      confirmPassword: '',
    };

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      success('Password reset successful! You can now sign in with your new password.');
    } catch (err) {
      console.error('Password reset error:', err);
      showError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'password') {
      setPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <Layout showNavbar={false} showFooter={false}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Left Section - Branding */}
          <div className={styles.leftSection}>
            <div className={styles.branding}>
              <Link href="/" className={styles.logo}>
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

              <div className={styles.brandContent}>
                <h1 className={styles.brandTitle}>Create New Password</h1>
                <p className={styles.brandDescription}>
                  Choose a strong password to secure your account. Make sure it is
                  something you can remember but hard for others to guess.
                </p>

                <div className={styles.passwordTips}>
                  <h3>Password Tips</h3>
                  <ul>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      At least 8 characters long
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      Include uppercase and lowercase letters
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      Include at least one number
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      Avoid common words and patterns
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className={styles.rightSection}>
            <Card variant="elevated" padding="lg" className={styles.card}>
              {tokenError ? (
                <>
                  <CardHeader>
                    <div className={styles.errorIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                    </div>
                    <CardTitle>Invalid Reset Link</CardTitle>
                    <CardDescription>
                      {tokenError}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Link href="/forgot-password" className={styles.requestNewBtn}>
                      Request New Reset Link
                    </Link>
                  </CardContent>

                  <CardFooter>
                    <Link href="/login" className={styles.backToLogin}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      Back to Sign In
                    </Link>
                  </CardFooter>
                </>
              ) : !isSuccess ? (
                <>
                  <CardHeader>
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                    </div>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                      Enter your new password below.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit} className={styles.form}>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        label="New Password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={errors.password}
                        required
                        fullWidth
                        leftIcon={
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.toggleBtn}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              {showPassword ? (
                                <path
                                  fillRule="evenodd"
                                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                  clipRule="evenodd"
                                />
                              ) : (
                                <>
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </>
                              )}
                            </svg>
                          </button>
                        }
                      />

                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}
                        required
                        fullWidth
                        leftIcon={
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={styles.toggleBtn}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              {showConfirmPassword ? (
                                <path
                                  fillRule="evenodd"
                                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                  clipRule="evenodd"
                                />
                              ) : (
                                <>
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </>
                              )}
                            </svg>
                          </button>
                        }
                      />

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        Reset Password
                      </Button>
                    </form>
                  </CardContent>

                  <CardFooter>
                    <Link href="/login" className={styles.backToLogin}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      Back to Sign In
                    </Link>
                  </CardFooter>
                </>
              ) : (
                <>
                  <CardHeader>
                    <div className={styles.successIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <CardTitle>Password Reset Complete</CardTitle>
                    <CardDescription>
                      Your password has been successfully reset. You can now sign in with your new password.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Link href="/login" className={styles.signInBtn}>
                      Sign In Now
                    </Link>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
