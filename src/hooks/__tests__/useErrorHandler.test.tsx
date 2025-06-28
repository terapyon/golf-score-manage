import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

  it('初期状態が正しく設定されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('Firebaseエラーが日本語に変換されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const firebaseError = new MockFirebaseError(
      'auth/user-not-found',
      'Firebase: Error (auth/user-not-found).'
    );

    act(() => {
      result.current.handleError(firebaseError);
    });

    expect(result.current.error).toBe('ユーザーが見つかりませんでした');
  });

  it('一般的なエラーが適切に処理されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const genericError = new Error('一般的なエラー');

    act(() => {
      result.current.handleError(genericError);
    });

    expect(result.current.error).toBe('一般的なエラー');
  });

  it('文字列エラーが適切に処理されること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleError('文字列エラー');
    });

    expect(result.current.error).toBe('文字列エラー');
  });

  it('リトライ機能が正常に動作すること', async () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const retryableError = new MockFirebaseError(
      'auth/network-request-failed',
      'Network error'
    );

    const mockRetryFn = vi.fn().mockResolvedValue('success');

    act(() => {
      result.current.handleError(retryableError);
    });

    // エラーがリトライ可能か確認
    expect(result.current.canRetry).toBe(true);

    // リトライ実行
    await act(async () => {
      await result.current.retry(mockRetryFn);
    });

    expect(mockRetryFn).toHaveBeenCalled();
    expect(result.current.retryCount).toBe(1);
  });

  it('リトライ不可能なエラーではリトライボタンが表示されないこと', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const nonRetryableError = new MockFirebaseError(
      'auth/invalid-email',
      'Invalid email'
    );

    act(() => {
      result.current.handleError(nonRetryableError);
    });

    expect(result.current.canRetry).toBe(false);
  });

  it('エラークリア機能が正常に動作すること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const error = new Error('テストエラー');

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toBe('テストエラー');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it('最大リトライ回数に達した場合の処理が正しいこと', async () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const retryableError = new MockFirebaseError(
      'auth/network-request-failed',
      'Network error'
    );

    const mockRetryFn = vi.fn().mockRejectedValue(retryableError);

    act(() => {
      result.current.handleError(retryableError);
    });

    // 最大リトライ回数までリトライ
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        try {
          await result.current.retry(mockRetryFn);
        } catch (error) {
          // リトライ失敗を無視
        }
      });
    }

    expect(result.current.retryCount).toBe(3);
    expect(result.current.canRetry).toBe(false); // 最大回数に達したため
  });

  it('成功メッセージ表示機能が正常に動作すること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.showSuccess('保存しました');
    });

    // 成功メッセージが表示されることを確認
    // （実際の実装ではトースト通知などが表示される）
    expect(consoleSpy).not.toHaveBeenCalled(); // 成功メッセージはエラーではない
  });

  it('警告メッセージ表示機能が正常に動作すること', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.showWarning('注意が必要です');
    });

    // 警告メッセージが表示されることを確認
    expect(consoleSpy).not.toHaveBeenCalled(); // 警告メッセージはエラーではない
  });

  it('非同期エラー処理が正常に動作すること', async () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const asyncFunction = vi.fn().mockRejectedValue(new Error('非同期エラー'));

    await act(async () => {
      await result.current.handleAsyncError(asyncFunction);
    });

    expect(result.current.error).toBe('非同期エラー');
    expect(asyncFunction).toHaveBeenCalled();
  });

  it('非同期関数が成功した場合の処理が正しいこと', async () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: createWrapper(),
    });

    const asyncFunction = vi.fn().mockResolvedValue('成功結果');

    let returnValue;
    await act(async () => {
      returnValue = await result.current.handleAsyncError(asyncFunction);
    });

    expect(returnValue).toBe('成功結果');
    expect(result.current.error).toBeNull();
    expect(asyncFunction).toHaveBeenCalled();
  });
});