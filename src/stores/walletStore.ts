// // src/stores/walletStore.ts

// import { create } from 'zustand';
// import type { Wallet, Transaction } from '@/types';
// import { walletService } from '@/lib/api/services';

// interface WalletState {
//   wallet: Wallet | null;
//   transactions: Transaction[];
//   isLoading: boolean;
//   error: string | null;
//   currentPage: number;
//   totalPages: number;
//   total: number;
// }

// interface WalletActions {
//   setWallet: (wallet: Wallet | null) => void;
//   fetchWallet: () => Promise<void>;
//   fetchTransactions: (page?: number, limit?: number) => Promise<void>;
//   fundWallet: (amount: number, paymentMethod: 'MONNIFY' | 'BANK_TRANSFER') => Promise<any>;
//   verifyPayment: (reference: string) => Promise<void>;
//   clearError: () => void;
//   resetState: () => void;
// }

// type WalletStore = WalletState & WalletActions;

// const initialState: WalletState = {
//   wallet: null,
//   transactions: [],
//   isLoading: false,
//   error: null,
//   currentPage: 1,
//   totalPages: 1,
//   total: 0,
// };

// export const useWalletStore = create<WalletStore>((set, get) => ({
//   // Initial State
//   ...initialState,

//   // Actions
//   setWallet: (wallet) => {
//     set({ wallet });
//   },

//   fetchWallet: async () => {
//     try {
//       set({ isLoading: true, error: null });
      
//       const wallet = await walletService.getWallet();
      
//       set({ wallet, isLoading: false });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wallet';
//       set({ error: errorMessage, isLoading: false });
//       throw error;
//     }
//   },

//   fetchTransactions: async (page = 1, limit = 10) => {
//     try {
//       set({ isLoading: true, error: null });
      
//       const response = await walletService.getTransactions(page, limit);
      
//       set({
//         transactions: response.data,
//         currentPage: response.pagination.page,
//         totalPages: response.pagination.totalPages,
//         total: response.pagination.total,
//         isLoading: false,
//       });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
//       set({ error: errorMessage, isLoading: false });
//       throw error;
//     }
//   },

//   fundWallet: async (amount, paymentMethod) => {
//     try {
//       set({ isLoading: true, error: null });
      
//       const payment = await walletService.fundWallet({ amount, paymentMethod });
      
//       set({ isLoading: false });
      
//       return payment;
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to fund wallet';
//       set({ error: errorMessage, isLoading: false });
//       throw error;
//     }
//   },

//   verifyPayment: async (reference) => {
//     try {
//       set({ isLoading: true, error: null });
      
//       const payment = await walletService.verifyPayment(reference);
      
//       // Refresh wallet after successful payment
//       if (payment.status === 'COMPLETED') {
//         await get().fetchWallet();
//       }
      
//       set({ isLoading: false });
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
//       set({ error: errorMessage, isLoading: false });
//       throw error;
//     }
//   },

//   clearError: () => {
//     set({ error: null });
//   },

//   resetState: () => {
//     set(initialState);
//   },
// }));


// frontend/src/stores/walletStore.ts

import { create } from 'zustand';
import { walletService } from '@/lib/api/services';
import type { Wallet, Transaction } from '@/types';

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  totalTransactions: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWallet: () => Promise<void>;
  fetchTransactions: (page?: number, limit?: number, filters?: { type?: string; status?: string }) => Promise<void>;
  initiatePayment: (amount: number) => Promise<any>;
  verifyPayment: (paymentReference: string) => Promise<any>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  wallet: null,
  transactions: [],
  totalTransactions: 0,
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletState>((set, get) => ({
  ...initialState,

  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletService.getBalance();
      set({
        wallet: {
          balance: data.balance,
          currency: data.currency,
        } as unknown as Wallet,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch wallet';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchTransactions: async (page = 1, limit = 20, filters) => {
    set({ isLoading: true, error: null });
    try {
      const { transactions, total } = await walletService.getTransactions(page, limit, filters);
      set({
        transactions,
        totalTransactions: total,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  initiatePayment: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await walletService.initiatePayment(amount);
      set({ isLoading: false });
      return payment;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate payment';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  verifyPayment: async (paymentReference: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await walletService.verifyPayment(paymentReference);
      // Refresh wallet after successful payment
      if (result.success) {
        await get().fetchWallet();
      }
      set({ isLoading: false });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify payment';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));