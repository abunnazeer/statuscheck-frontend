// src/components/common/StatCard.tsx

import { ReactNode } from 'react';
import styles from './StatCard.module.css';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  isLoading?: boolean;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  variant = 'default',
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn(styles.card, className)} padding="lg">
        <div className={styles.skeleton}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonValue} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(styles.card, styles[variant], className)}
      padding="lg"
      hoverable
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.info}>
            <p className={styles.title}>{title}</p>
            <h3 className={styles.value}>{value}</h3>
          </div>
          {icon && <div className={styles.icon}>{icon}</div>}
        </div>

        {(trend || description) && (
          <div className={styles.footer}>
            {trend && (
              <div
                className={cn(
                  styles.trend,
                  trend.isPositive ? styles.trendPositive : styles.trendNegative
                )}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={styles.trendIcon}
                >
                  {trend.isPositive ? (
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <span className={styles.trendValue}>
                  {Math.abs(trend.value)}%
                </span>
                {trend.label && (
                  <span className={styles.trendLabel}>{trend.label}</span>
                )}
              </div>
            )}
            {description && (
              <p className={styles.description}>{description}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}