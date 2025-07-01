import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// テスト用ラッパー
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Firebaseエラーのモッククラス
class MockFirebaseError extends Error {
  code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'FirebaseError';
  }
}

describe('useErrorHandler', () => {
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('フックが正常に初期化されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    expect(result.current.handleError).toBeDefined();
    expect(result.current.getErrorMessage).toBeDefined();
    expect(result.current.isRetryable).toBeDefined();
    expect(result.current.showSuccess).toBeDefined();
    expect(result.current.showWarning).toBeDefined();
    expect(result.current.showInfo).toBeDefined();
  });

  it('Firebaseエラーメッセージが正しく変換されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const firebaseError = new MockFirebaseError('auth/user-not-found', 'User not found');
    const message = result.current.getErrorMessage(firebaseError);
    
    expect(message).toBe('ユーザーが見つかりません');
  });

  it('一般的なエラーメッセージが適切に処理されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const generalError = new Error('一般的なエラー');
    const message = result.current.getErrorMessage(generalError);
    
    expect(message).toBe('一般的なエラー');
  });

  it('リトライ可能なエラーが正しく判定されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const retryableError = new MockFirebaseError('network-error', 'Network error');
    const isRetryable = result.current.isRetryable(retryableError);
    
    expect(isRetryable).toBe(true);
  });

  it('リトライ不可能なエラーが正しく判定されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const nonRetryableError = new MockFirebaseError('auth/user-not-found', 'User not found');
    const isRetryable = result.current.isRetryable(nonRetryableError);
    
    expect(isRetryable).toBe(false);
  });

  it('HTTPステータスエラーが適切に処理されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const httpError = { status: 404 }; // messageプロパティを削除
    const message = result.current.getErrorMessage(httpError);
    
    expect(message).toBe('データが見つかりません');
  });

  it('不明なエラーが適切に処理されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const unknownError = {};
    const message = result.current.getErrorMessage(unknownError);
    
    expect(message).toBe('不明なエラーが発生しました');
  });
});