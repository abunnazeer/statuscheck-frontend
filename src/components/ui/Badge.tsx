// src/components/ui/Badge.tsx

import { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  outline?: boolean;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  outline = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        styles.badge,
        styles[variant],
        styles[size],
        outline && styles.outline,
        dot && styles.withDot,
        className
      )}
      {...props}
    >
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}