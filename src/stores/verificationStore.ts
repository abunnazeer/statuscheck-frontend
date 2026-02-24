// src/stores/verificationStore.ts

import { create } from 'zustand';
import type { Verification, VerificationRequest } from '@/types';
import { verificationService } from '@/lib/api/services';

interface VerificationState {
  verifications: Verification[];
  currentVerification: Verification | null;
  verificationCosts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
}

interface VerificationActions {
  fetchVerifications: (page?: number, limit?: number) => Promise<void>;
  fetchVerificationById: (id: string) => Promise<void>;
  fetchVerificationCosts: () => Promise<void>;
  verifyNIN: (data: VerificationRequest) => Promise<any>;
  verifyBVN: (data: VerificationRequest) => Promise<any>;
  verifyNINDemographic: (data: VerificationRequest) => Promise<any>;
  verifyBVNByPhone: (data: VerificationRequest) => Promise<any>;
  verifyBVNByNIN: (data: VerificationRequest) => Promise<any>;
  downloadPDF: (id: string, filename: string) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

type VerificationStore = VerificationState & VerificationActions;

const initialState: VerificationState = {
  verifications: [],
  currentVerification: null,
  verificationCosts: {},
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
};

export const useVerificationStore = create<VerificationStore>((set, get) => ({
  // Initial State
  ...initialState,

  // Actions
  fetchVerifications: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await verificationService.getVerifications(page, limit);
      
      set({
        verifications: response.data,
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch verifications';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchVerificationById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const verification = await verificationService.getVerificationById(id);
      
      set({
        currentVerification: verification,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch verification';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchVerificationCosts: async () => {
    try {
      const costs = await verificationService.getVerificationCosts();
      set({ verificationCosts: costs });
    } catch (error) {
      console.error('Failed to fetch verification costs:', error);
    }
  },

  verifyNIN: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const verification = await verificationService.verifyNIN(data);
      
      set({ isLoading: false });
      
      return verification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NIN verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyBVN: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const verification = await verificationService.verifyBVN(data);
      
      set({ isLoading: false });
      
      return verification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BVN verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyNINDemographic: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const verification = await verificationService.verifyNINDemographic(data);
      
      set({ isLoading: false });
      
      return verification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NIN demographic verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyBVNByPhone: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const verification = await verificationService.verifyBVNByPhone(data);
      
      set({ isLoading: false });
      
      return verification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BVN by phone verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyBVNByNIN: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const verification = await verificationService.verifyBVNByNIN(data);
      
      set({ isLoading: false });
      
      return verification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'BVN by NIN verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  downloadPDF: async (id, filename) => {
    try {
      set({ isLoading: true, error: null });
      
      await verificationService.downloadPDF(id, filename);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download PDF';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetState: () => {
    set(initialState);
  },
}));
