// src/lib/utils/index.ts

import { type ClassValue } from 'clsx';

/**
 * Combines class names conditionally
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Format currency to Nigerian Naira
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Mask sensitive information (NIN, BVN, etc.)
 */
export function maskIdentity(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) return value;
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  const lastFour = phone.slice(-4);
  const firstThree = phone.slice(0, 3);
  return `${firstThree}****${lastFour}`;
}

/**
 * Validate Nigerian phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^(0|\+?234)?[789]\d{9}$/.test(cleanPhone);
}

/**
 * Format Nigerian phone number to standard format
 */
export function formatNigerianPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('234')) {
    return `+${cleanPhone}`;
  }
  
  if (cleanPhone.startsWith('0')) {
    return `+234${cleanPhone.slice(1)}`;
  }
  
  return `+234${cleanPhone}`;
}

/**
 * Validate NIN (11 digits)
 */
export function isValidNIN(nin: string): boolean {
  const cleanNIN = nin.replace(/\D/g, '');
  return /^\d{11}$/.test(cleanNIN);
}

/**
 * Validate BVN (11 digits)
 */
export function isValidBVN(bvn: string): boolean {
  const cleanBVN = bvn.replace(/\D/g, '');
  return /^\d{11}$/.test(cleanBVN);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random reference
 */
export function generateReference(prefix: string = 'REF'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Download file
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: 'var(--color-warning)',
    PROCESSING: 'var(--color-info)',
    COMPLETED: 'var(--color-success)',
    FAILED: 'var(--color-error)',
    CREDIT: 'var(--color-success)',
    DEBIT: 'var(--color-error)',
  };

  return statusColors[status] || 'var(--color-neutral-500)';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}