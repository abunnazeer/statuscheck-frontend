// src/components/ui/Card.tsx

import { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        styles[variant],
        styles[`padding-${padding}`],
        hoverable && styles.hoverable,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  children,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn(styles.cardHeader, className)} {...props}>
      <div className={styles.cardHeaderContent}>{children}</div>
      {action && <div className={styles.cardHeaderAction}>{action}</div>}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
  children,
  as: Component = 'h3',
  className,
  ...props
}: CardTitleProps) {
  return (
    <Component className={cn(styles.cardTitle, className)} {...props}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn(styles.cardDescription, className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div className={cn(styles.cardContent, className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  return (
    <div className={cn(styles.cardFooter, className)} {...props}>
      {children}
    </div>
  );
}