import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@/utils/test-utils';
import { AuthProvider, useAuth } from '../AuthContext';
import { User } from 'firebase/auth';
import React from 'react';

// テスト用コンポーネント
const TestComponent = () => {
  const { user, isLoading, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password', 'Test User')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// モックFirebaseユーザー
const mockUser: Partial<User> = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
};

describe('AuthContext', () => {
  let mockOnAuthStateChanged: any;
  let mockSignInWithEmailAndPassword: any;
  let mockCreateUserWithEmailAndPassword: any;
  let mockSignOut: any;

  beforeEach(() => {
    mockOnAuthStateChanged = vi.fn();
    mockSignInWithEmailAndPassword = vi.fn();
    mockCreateUserWithEmailAndPassword = vi.fn();
    mockSignOut = vi.fn();

    // Firebase Authのモック
    vi.doMock('firebase/auth', () => ({
      getAuth: vi.fn(() => ({
        currentUser: null,
        onAuthStateChanged: mockOnAuthStateChanged,
      })),
      signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
      createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
      signOut: mockSignOut,
      GoogleAuthProvider: vi.fn(),
      signInWithPopup: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態でローディング中であること', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('認証状態が変更されるとユーザー情報が更新されること', async () => {
    let authStateCallback: any;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
      return vi.fn(); // unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 認証状態変更をシミュレート
    act(() => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('ログイン機能が正常に動作すること', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    });

    let authStateCallback: any;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });

  it('新規登録機能が正常に動作すること', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: mockUser,
    });

    let authStateCallback: any;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register');
    
    await act(async () => {
      registerButton.click();
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });

  it('ログアウト機能が正常に動作すること', async () => {
    mockSignOut.mockResolvedValue(undefined);

    let authStateCallback: any;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // まずログイン状態にする
    act(() => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      logoutButton.click();
    });

    expect(mockSignOut).toHaveBeenCalledWith(expect.anything());
  });

  it('エラーが発生した場合の処理が正常に動作すること', async () => {
    const errorMessage = 'Authentication failed';
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));

    let authStateCallback: any;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
      return vi.fn();
    });

    // コンソールエラーを一時的に無効化
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    // エラーがコンソールに出力されることを確認
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('プロバイダー外でuseAuthを使用するとエラーが発生すること', () => {
    const TestComponentOutsideProvider = () => {
      const { user } = useAuth();
      return <div>{user?.email}</div>;
    };

    // エラーをキャッチするためのコンポーネント
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>;
      } catch (error) {
        return <div data-testid="error">Error caught</div>;
      }
    };

    expect(() => {
      render(
        <ErrorBoundary>
          <TestComponentOutsideProvider />
        </ErrorBoundary>
      );
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});