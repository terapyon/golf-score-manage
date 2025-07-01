import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { AuthProvider, useAuth } from '../AuthContext';
import React from 'react';

// テスト用コンポーネント
const TestComponent = () => {
  const { currentUser, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{currentUser ? currentUser.email : 'no-user'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態でローディング中であること', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 初期状態ではローディング中
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('AuthProviderでラップされた場合にエラーが発生しないこと', () => {
    const TestComponentWithProvider = () => {
      const { currentUser, loading } = useAuth();
      return <div data-testid="no-error">No error: {loading ? 'loading' : 'ready'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponentWithProvider />
      </AuthProvider>
    );
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
  });

  it('AuthProviderが正常にレンダリングされること', () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });
});