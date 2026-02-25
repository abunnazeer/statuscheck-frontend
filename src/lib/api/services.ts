import { apiClient } from './client';
import type {
  ActivityLog,
  AdminStats,
  ApiResponse,
  AuthResponse,
  DashboardStats,
  LoginCredentials,
  Payment,
  RegisterData,
  Transaction,
  User,
  Verification,
  Wallet,
} from '@/types';

interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendVerificationResult {
  requestRef: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  data?: unknown;
  message: string;
}

const splitFullName = (fullName?: string) => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'User', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
};

const mapUser = (user: Partial<BackendUser>): User => {
  const { firstName, lastName } = splitFullName(user.fullName);

  return {
    id: user.id || '',
    email: user.email || '',
    phone: user.phone || '',
    firstName,
    lastName,
    isEmailVerified: Boolean(user.emailVerifiedAt),
    isPhoneVerified: true,
    role: user.role || 'USER',
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
};

const emptyWallet = (): Wallet => ({
  id: '',
  userId: '',
  balance: 0,
  currency: 'NGN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const toVerificationStatus = (status: string) => {
  if (status === 'SUCCESS' || status === 'COMPLETED') return 'COMPLETED';
  if (status === 'FAILED') return 'FAILED';
  return 'PROCESSING';
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ user: BackendUser; token: string }>('/auth/login', credentials);
    const data = response.data!;

    return {
      user: mapUser(data.user),
      token: data.token,
      wallet: emptyWallet(),
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const payload = {
      fullName: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    const response = await apiClient.post<{ user: BackendUser; token: string }>('/auth/register', payload);
    const result = response.data!;

    return {
      user: mapUser(result.user),
      token: result.token,
      wallet: emptyWallet(),
    };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best effort logout; frontend store still clears local session.
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<BackendUser>('/auth/profile');
    return mapUser(response.data || {});
  },

  async updateProfile(data: Partial<User> & { fullName?: string }): Promise<User> {
    const fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const payload = {
      ...(fullName ? { fullName } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
    };

    const response = await apiClient.put<BackendUser>('/auth/profile', payload);
    return mapUser(response.data || {});
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async requestPasswordReset(email: string): Promise<{ resetToken?: string; resetUrl?: string }> {
    const response = await apiClient.post<{ resetToken?: string; resetUrl?: string }>('/auth/forgot-password', { email });
    return response.data || {};
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async getActivities(page: number = 1, limit: number = 20): Promise<{ activities: ActivityLog[]; total: number }> {
    const response = await apiClient.getPaginated<ActivityLog>('/auth/activities', { page, limit });
    return {
      activities: response.data,
      total: response.pagination.total,
    };
  },
};

export const walletService = {
  async getWallet(): Promise<Wallet> {
    const balance = await this.getBalance();
    return {
      ...emptyWallet(),
      balance: Number(balance.balance || 0),
      currency: balance.currency,
    };
  },

  async getBalance(): Promise<{ balance: string; currency: string }> {
    const response = await apiClient.get<{ balance: string; currency: string }>('/wallet/balance');
    return response.data!;
  },

  async getTransactions(
    page: number = 1,
    limit: number = 20,
    filters?: { type?: string; status?: string }
  ): Promise<{ transactions: any[]; total: number }> {
    const response = await apiClient.getPaginated<any>('/wallet/transactions', {
      page,
      limit,
      ...filters,
    });

    return {
      transactions: response.data.map((txn) => ({
        id: txn.id,
        userId: '',
        walletId: '',
        type: txn.type,
        amount: Number(txn.amount || 0),
        balanceBefore: Number(txn.balanceBefore || 0),
        balanceAfter: Number(txn.balanceAfter || 0),
        description: txn.description || '',
        reference: txn.transactionRef,
        transactionRef: txn.transactionRef,
        status: txn.status,
        verificationRequestRef: txn.verificationRequestRef,
        verificationPdfPath: txn.verificationPdfPath,
        createdAt: txn.createdAt,
        updatedAt: txn.createdAt,
      })),
      total: response.pagination.total,
    };
  },

  async getTransactionByRef(transactionRef: string): Promise<Transaction> {
    const response = await apiClient.get<any>(`/wallet/transactions/${transactionRef}`);
    const txn = response.data!;

    return {
      id: txn.id,
      userId: '',
      walletId: '',
      type: txn.type,
      amount: Number(txn.amount || 0),
      balanceBefore: Number(txn.balanceBefore || 0),
      balanceAfter: Number(txn.balanceAfter || 0),
      description: txn.description || '',
      reference: txn.transactionRef,
      status: txn.status,
      verificationRequestRef: txn.verificationRequestRef,
      verificationPdfPath: txn.verificationPdfPath,
      createdAt: txn.createdAt,
      updatedAt: txn.createdAt,
    };
  },

  async getWalletStats(): Promise<{
    totalCredits: string;
    totalDebits: string;
    transactionCount: number;
    lastTransaction: string | null;
  }> {
    const response = await apiClient.get<{
      totalCredits: string;
      totalDebits: string;
      transactionCount: number;
      lastTransaction: string | null;
    }>('/wallet/stats');
    return response.data!;
  },

  async initiatePayment(amount: number): Promise<{
    paymentReference: string;
    amount: number;
    accountName: string;
    accountNumber: string;
    bankName: string;
    message: string;
  }> {
    const response = await apiClient.post<{
      paymentReference: string;
      amount: number;
      accountName: string;
      accountNumber: string;
      bankName: string;
      message: string;
    }>('/wallet/payment/initiate', { amount });

    return response.data!;
  },

  async getReservedAccount(): Promise<{
    accountName: string;
    accountNumber: string;
    bankName: string;
    message: string;
  }> {
    const response = await apiClient.get<{
      accountName: string;
      accountNumber: string;
      bankName: string;
      message: string;
    }>('/wallet/payment/reserved-account');

    return response.data!;
  },

  async syncDeposits(): Promise<{
    status: 'SYNCED' | 'SKIPPED';
    reason?: string;
    reservedAccountNumber?: string;
    scannedTransactions: number;
    matchedTransactions: number;
    creditedCount: number;
    alreadyReconciledCount: number;
    failedCount: number;
    failures: Array<{ reference: string; reason: string }>;
  }> {
    const response = await apiClient.post<{
      status: 'SYNCED' | 'SKIPPED';
      reason?: string;
      reservedAccountNumber?: string;
      scannedTransactions: number;
      matchedTransactions: number;
      creditedCount: number;
      alreadyReconciledCount: number;
      failedCount: number;
      failures: Array<{ reference: string; reason: string }>;
    }>('/wallet/payment/sync');

    return response.data!;
  },

  async verifyPayment(paymentReference: string): Promise<{
    success: boolean;
    status: string;
    amount: string;
    message: string;
  }> {
    const response = await apiClient.post<{ status: string; amount: string; message: string }>(
      '/wallet/payment/verify',
      { paymentReference }
    );

    const result = response.data!;
    return {
      success: result.status === 'SUCCESS',
      ...result,
    };
  },

  async getPaymentHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{ payments: Payment[]; total: number }> {
    const response = await apiClient.getPaginated<any>('/wallet/payments', { page, limit });

    return {
      payments: response.data.map((payment) => ({
        id: payment.id,
        userId: '',
        amount: Number(payment.amount || 0),
        reference: payment.paymentRef,
        status: payment.status === 'SUCCESS' ? 'COMPLETED' : payment.status,
        paymentMethod: payment.paymentGateway || 'BANK_TRANSFER',
        provider: payment.paymentGateway || 'paystack',
        createdAt: payment.createdAt,
        updatedAt: payment.createdAt,
      })),
      total: response.pagination.total,
    };
  },
};

export const verificationService = {
  async getServices(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/verification/services');
    return response.data || [];
  },

  async verifyNIN(payload: string | { nin?: string; identityNumber?: string }): Promise<BackendVerificationResult> {
    const nin = typeof payload === 'string' ? payload : payload.nin || payload.identityNumber || '';
    const response = await apiClient.post<BackendVerificationResult>('/verification/nin/verify', { nin });
    return response.data!;
  },

  async verifyNINByPhone(phone: string): Promise<BackendVerificationResult> {
    const response = await apiClient.post<BackendVerificationResult>('/verification/nin/verify-phone', {
      phoneNumber: phone,
    });
    return response.data!;
  },

  async searchNINByDemographic(data: {
    firstName?: string;
    lastName?: string;
    firstname?: string;
    lastname?: string;
    dateOfBirth: string;
    gender: string;
  }): Promise<BackendVerificationResult> {
    const response = await apiClient.post<BackendVerificationResult>('/verification/nin/search-demographic', {
      firstname: data.firstname || data.firstName,
      lastname: data.lastname || data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
    });
    return response.data!;
  },

  async verifyBVN(payload: string | { bvn?: string; identityNumber?: string }): Promise<BackendVerificationResult> {
    const bvn = typeof payload === 'string' ? payload : payload.bvn || payload.identityNumber || '';
    const response = await apiClient.post<BackendVerificationResult>('/verification/bvn/verify', { bvn });
    return response.data!;
  },

  async getBVNByPhone(phone: string): Promise<BackendVerificationResult> {
    const response = await apiClient.post<BackendVerificationResult>('/verification/bvn/get-by-phone', {
      phoneNumber: phone,
    });
    return response.data!;
  },

  async getBVNByNIN(nin: string): Promise<BackendVerificationResult> {
    const response = await apiClient.post<BackendVerificationResult>('/verification/bvn/get-by-nin', { nin });
    return response.data!;
  },

  async getHistory(
    page: number = 1,
    limit: number = 20,
    filters?: { searchType?: string; status?: string }
  ): Promise<{ verifications: any[]; total: number }> {
    const response = await apiClient.getPaginated<any>('/verification/history', {
      page,
      limit,
      ...(filters || {}),
    });

    return {
      verifications: response.data,
      total: response.pagination.total,
    };
  },

  async getVerificationByRef(requestRef: string): Promise<any> {
    const response = await apiClient.get<any>(`/verification/${requestRef}`);
    return response.data!;
  },

  async getVerifications(page: number = 1, limit: number = 10) {
    return apiClient.getPaginated<Verification>('/verification/history', { page, limit });
  },

  async getVerificationById(id: string) {
    return this.getVerificationByRef(id);
  },

  async getVerificationCosts(): Promise<Record<string, number>> {
    const services = await this.getServices();
    return services.reduce((acc: Record<string, number>, service: any) => {
      acc[service.serviceCode] = Number(service.price || 0);
      return acc;
    }, {});
  },

  async verifyNINDemographic(data: any) {
    return this.searchNINByDemographic(data);
  },

  async verifyBVNByPhone(data: any) {
    return this.getBVNByPhone(data.phoneNumber || data.phone || '');
  },

  async verifyBVNByNIN(data: any) {
    return this.getBVNByNIN(data.nin || data.identityNumber || '');
  },

  async downloadPDF(id: string, filename: string): Promise<void> {
    const blob = await pdfService.downloadNINSlip(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export const pdfService = {
  async downloadVerificationPDF(requestRef: string): Promise<Blob> {
    return apiClient.getBlob(`/pdf/verification/download/${encodeURIComponent(requestRef)}`, {
      _t: Date.now(),
    });
  },

  async downloadNINSlip(requestRef: string): Promise<Blob> {
    return this.downloadVerificationPDF(requestRef);
  },
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<any>('/dashboard/stats');
    const data = response.data || {};

    return {
      totalVerifications: data.verifications?.total || 0,
      pendingVerifications: data.verifications?.pending || 0,
      completedVerifications: data.verifications?.successful || 0,
      failedVerifications: data.verifications?.failed || 0,
      walletBalance: Number(data.wallet?.balance || 0),
      totalSpent: Number(data.transactions?.totalDebits || 0),
      recentTransactions: (data.recentActivity?.transactions || []).map((txn: any) => ({
        id: txn.id,
        userId: '',
        walletId: '',
        type: txn.type,
        amount: Number(txn.amount || 0),
        balanceBefore: 0,
        balanceAfter: 0,
        description: txn.description || '',
        reference: txn.transactionRef,
        status: txn.status,
        createdAt: txn.createdAt,
        updatedAt: txn.createdAt,
      })),
      recentVerifications: (data.recentActivity?.verifications || []).map((item: any) => ({
        id: item.id,
        userId: '',
        verificationType: item.searchType,
        requestRef: item.requestRef,
        identityNumber: item.searchParameter || item.requestRef,
        status: toVerificationStatus(item.status) as Verification['status'],
        cost: Number(item.amountCharged || 0),
        pdfPath: item.pdfPath,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      })),
    };
  },
};

export const adminService = {
  async getDashboardStats(): Promise<{ data: any }> {
    const response = await apiClient.get<any>('/admin/dashboard/statistics');
    const stats = response.data || {};

    return {
      data: {
        totalUsers: stats.users?.total || 0,
        activeUsers: stats.users?.active || 0,
        totalVerifications: stats.verifications?.total || 0,
        successfulVerifications: stats.verifications?.success || 0,
        failedVerifications: stats.verifications?.failed || 0,
        totalRevenue: Number(stats.revenue?.total || 0),
        todayRevenue: 0,
        totalWalletBalance: 0,
        recentUsers: [],
        recentVerifications: [],
      },
    };
  },

  async getUsers(
    page: number = 1,
    limit: number = 20,
    filters?: string | { status?: string; role?: string; search?: string }
  ) {
    const normalizedFilters = typeof filters === 'string' ? { search: filters } : (filters || {});

    const response = await apiClient.getPaginated<any>('/admin/users', {
      page,
      limit,
      ...normalizedFilters,
    });

    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        wallet: {
          balance: item.walletBalance || '0',
        },
      })),
    };
  },

  async getUserById(userId: string): Promise<any> {
    const response = await apiClient.get<any>(`/admin/users/${userId}`);
    return response.data!;
  },

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  async getTransactions(page: number = 1, limit: number = 20, filters?: { type?: string; status?: string; userId?: string }) {
    const response = await apiClient.getPaginated<any>('/admin/transactions', {
      page,
      limit,
      ...(filters || {}),
    });

    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        reference: item.transactionRef,
        user: {
          fullName: item.userName,
          email: item.userEmail,
        },
      })),
    };
  },

  async getVerifications(page: number = 1, limit: number = 20, filters?: { status?: string; searchType?: string; userId?: string }) {
    const response = await apiClient.getPaginated<any>('/admin/verifications', {
      page,
      limit,
      ...(filters || {}),
    });

    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        serviceCode: item.searchType,
        user: {
          fullName: item.userName,
          email: item.userEmail,
        },
      })),
    };
  },

  async getServicePricing(): Promise<{ data: any[] }> {
    const response = await apiClient.get<any[]>('/admin/services');
    return { data: response.data || [] };
  },

  async updateServicePricing(serviceCode: string, payload: { price?: number; isActive?: boolean } | number, isActive?: boolean): Promise<void> {
    if (typeof payload === 'number') {
      await apiClient.patch(`/admin/services/${serviceCode}`, { price: payload, isActive });
      return;
    }

    await apiClient.patch(`/admin/services/${serviceCode}`, payload);
  },

  async getDashboardStatistics(startDate?: string, endDate?: string): Promise<AdminStats> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get<any>('/admin/dashboard/statistics', params);
    return response.data as AdminStats;
  },

  async getAllVerifications(page: number = 1, limit: number = 20, filters?: { status?: string; searchType?: string; userId?: string }) {
    return this.getVerifications(page, limit, filters);
  },

  async getAllTransactions(page: number = 1, limit: number = 20, filters?: { type?: string; status?: string; userId?: string }) {
    return this.getTransactions(page, limit, filters);
  },

  async getRevenueAnalytics(startDate: string, endDate: string): Promise<ApiResponse> {
    return apiClient.get('/admin/analytics/revenue', { startDate, endDate });
  },

  async topUpOwnWallet(amount: number, description?: string): Promise<void> {
    await apiClient.post('/admin/wallet/top-up', { amount, description });
  },

  async getMaintenanceMode(): Promise<{ enabled: boolean; message: string | null }> {
    const response = await apiClient.get<{ enabled: boolean; message: string | null }>('/admin/settings/maintenance');
    return response.data || { enabled: false, message: null };
  },

  async updateMaintenanceMode(enabled: boolean, message?: string): Promise<{ enabled: boolean; message: string | null }> {
    const response = await apiClient.patch<{ enabled: boolean; message: string | null }>('/admin/settings/maintenance', {
      enabled,
      message,
    });
    return response.data || { enabled, message: message || null };
  },
};
