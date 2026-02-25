// frontend/src/app/(auth)/forgot-password/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authService } from '@/lib/api/services';
import { useNotificationStore } from '@/stores/notificationStore';
import { isValidEmail } from '@/lib/utils';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const { success, error: showError } = useNotificationStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [manualResetUrl, setManualResetUrl] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.requestPasswordReset(email);
      setManualResetUrl(result.resetUrl || '');
      setIsSubmitted(true);
      success(result.resetUrl
        ? 'Password reset link generated successfully'
        : 'If your account exists, password reset instructions have been sent');
    } catch (err) {
      console.error('Password reset error:', err);
      // Don't reveal if email exists or not for security
      setManualResetUrl('');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResetLink = async () => {
    if (!manualResetUrl) return;

    try {
      await navigator.clipboard.writeText(manualResetUrl);
      success('Reset link copied');
    } catch {
      showError('Unable to copy link automatically. Please copy it manually.');
    }
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
                <h1 className={styles.brandTitle}>Reset Your Password</h1>
                <p className={styles.brandDescription}>
                  Do not worry, it happens to the best of us. Enter your email
                  and we will send you instructions to reset your password.
                </p>

                <div className={styles.securityNote}>
                  <div className={styles.securityIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h3>Secure Process</h3>
                    <p>Your password reset link will expire in 1 hour for security.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className={styles.rightSection}>
            <Card variant="elevated" padding="lg" className={styles.card}>
              {!isSubmitted ? (
                <>
                  <CardHeader>
                    <div className={styles.cardIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                      Enter your email address and we will send you a link to reset your password.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit} className={styles.form}>
                      <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        error={error}
                        required
                        fullWidth
                        leftIcon={
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
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
                        Send Reset Link
                      </Button>
                    </form>
                  </CardContent>

                  <CardFooter>
                    <p className={styles.footerText}>
                      Remember your password?{' '}
                      <Link href="/login" className={styles.link}>
                        Sign in
                      </Link>
                    </p>
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
                    <CardTitle>{manualResetUrl ? 'Use Reset Link' : 'Check Your Email'}</CardTitle>
                    <CardDescription>
                      {manualResetUrl
                        ? 'Email delivery is not configured yet. Use this reset link:'
                        : 'We have sent password reset instructions to:'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className={styles.emailSent}>
                      {manualResetUrl ? (
                        <>
                          <p className={styles.manualResetNote}>{email}</p>
                          <a
                            href={manualResetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.resetLink}
                          >
                            Open password reset page
                          </a>
                          <button
                            type="button"
                            className={styles.copyLinkBtn}
                            onClick={copyResetLink}
                          >
                            Copy reset link
                          </button>
                        </>
                      ) : (
                        <>
                          <p className={styles.emailAddress}>{email}</p>
                          <p className={styles.instructions}>
                            Click the link in the email to reset your password. If you do not see the email, check your spam folder.
                          </p>
                        </>
                      )}

                      <div className={styles.resendSection}>
                        <p>{manualResetUrl ? 'Need another reset link?' : 'Did not receive the email?'}</p>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => {
                            setManualResetUrl('');
                            setIsSubmitted(false);
                          }}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
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
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
