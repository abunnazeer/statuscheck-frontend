// src/stores/notificationStore.ts

import { create } from 'zustand';
import type { Notification, NotificationType } from '@/types';

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  addNotification: (
    type: NotificationType,
    message: string,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

type NotificationStore = NotificationState & NotificationActions;

const DEFAULT_DURATION = 5000; // 5 seconds

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial State
  notifications: [],

  // Actions
  addNotification: (type, message, duration = DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // Convenience methods
  success: (message, duration) => {
    get().addNotification('success', message, duration);
  },

  error: (message, duration) => {
    get().addNotification('error', message, duration);
  },

  warning: (message, duration) => {
    get().addNotification('warning', message, duration);
  },

  info: (message, duration) => {
    get().addNotification('info', message, duration);
  },
}));