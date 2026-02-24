// src/types/index.ts

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  verificationRequestRef?: string;
  verificationPdfPath?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string;
  userId: string;
  verificationType: 'NIN' | 'BVN' | 'NIN_DEMOGRAPHIC' | 'BVN_BY_PHONE' | 'BVN_BY_NIN';
  requestRef?: string;
  identityNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result?: VerificationResult;
  cost: number;
  pdfPath?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationResult {
  nin?: string;
  bvn?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  photo?: string;
  [key: string]: any;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: string;
  provider: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  wallet: Wallet;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerificationRequest {
  type: 'NIN' | 'BVN' | 'NIN_DEMOGRAPHIC' | 'BVN_BY_PHONE' | 'BVN_BY_NIN';
  identityNumber: string;
  phoneNumber?: string;
}

export interface FundWalletRequest {
  amount: number;
  paymentMethod: 'MONNIFY' | 'BANK_TRANSFER';
}

export interface DashboardStats {
  totalVerifications: number;
  pendingVerifications: number;
  completedVerifications: number;
  failedVerifications: number;
  walletBalance: number;
  totalSpent: number;
  recentTransactions: Transaction[];
  recentVerifications: Verification[];
}

export interface AdminStats extends DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  recentUsers: User[];
  recentPayments: Payment[];
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}
