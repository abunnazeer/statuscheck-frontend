// src/components/ui/Spinner.tsx

import { HTMLAttributes } from 'react';
import styles from './Spinner.module.css';
import { cn } from '@/lib/utils';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
}

export default function Spinner({
  size = 'md',
  color = 'primary',
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn(styles.spinner, styles[size], styles[color], className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg viewBox="0 0 50 50" className={styles.svg}>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          className={styles.circle}
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  message = 'Loading...',
  transparent = false,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        styles.overlay,
        transparent && styles.overlayTransparent
      )}
    >
      <div className={styles.overlayContent}>
        <Spinner size="lg" color="primary" />
        {message && <p className={styles.overlayMessage}>{message}</p>}
      </div>
    </div>
  );
}

interface LoadingDotsProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingDots({
  size = 'md',
  className,
  ...props
}: LoadingDotsProps) {
  return (
    <div
      className={cn(styles.dotsContainer, styles[`dots-${size}`], className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}