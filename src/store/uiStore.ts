import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // ローディング状態
  isLoading: boolean;
  loadingMessage?: string;
  
  // エラー状態
  error: string | null;
  
  // サイドバー状態（モバイル用）
  sidebarOpen: boolean;
  
  // 通知・トースト
  toast: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null;
  
  // アクション
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
  clearError: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // 初期状態
      isLoading: false,
      loadingMessage: undefined,
      error: null,
      sidebarOpen: false,
      toast: null,

      // アクション
      setLoading: (loading, message) =>
        set({ isLoading: loading, loadingMessage: message }, false, 'setLoading'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false, 'setSidebarOpen'),

      showToast: (message, severity = 'info') =>
        set(
          { toast: { open: true, message, severity } },
          false,
          'showToast'
        ),

      hideToast: () =>
        set({ toast: null }, false, 'hideToast'),

      clearError: () =>
        set({ error: null }, false, 'clearError'),
    }),
    {
      name: 'ui-store',
    }
  )
);