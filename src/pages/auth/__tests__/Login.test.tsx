import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { Login } from '../Login';
import * as AuthContext from '@/contexts/AuthContext';
import { createMockUser } from '@/utils/test-utils';

// AuthContext のモック
const mockLogin = vi.fn();
const mockGoogleLogin = vi.fn();
const mockNavigate = vi.fn();

// React Router のモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // useAuth モック
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      googleLogin: mockGoogleLogin,
      updateProfile: vi.fn(),
    });
  });

  it('ログインフォームが正常にレンダリングされること', () => {
    render(<Login />);
    
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス *')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Googleでログイン' })).toBeInTheDocument();
  });

  it('有効なデータでログインできること', async () => {
    mockLogin.mockResolvedValue(undefined);
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText('メールアドレス *');
    const passwordInput = screen.getByLabelText('パスワード *');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('バリデーションエラーが表示されること', async () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText('メールアドレス *');
    const passwordInput = screen.getByLabelText('パスワード *');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    
    // 無効なメールアドレスを入力
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: '123' } }); // 短いパスワード
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('Googleログインが正常に動作すること', async () => {
    mockGoogleLogin.mockResolvedValue(undefined);
    
    render(<Login />);
    
    const googleButton = screen.getByRole('button', { name: 'Googleでログイン' });
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalled();
    });
  });

  it('ログインエラーが表示されること', async () => {
    const errorMessage = 'メールアドレスまたはパスワードが正しくありません';
    mockLogin.mockRejectedValue(new Error(errorMessage));
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText('メールアドレス *');
    const passwordInput = screen.getByLabelText('パスワード *');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('ローディング中はボタンが無効化されること', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true, // ローディング中
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      googleLogin: mockGoogleLogin,
      updateProfile: vi.fn(),
    });
    
    render(<Login />);
    
    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    const googleButton = screen.getByRole('button', { name: 'Googleでログイン' });
    
    expect(loginButton).toBeDisabled();
    expect(googleButton).toBeDisabled();
  });

  it('ログイン済みユーザーはダッシュボードにリダイレクトされること', () => {
    const mockUser = createMockUser();
    
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      googleLogin: mockGoogleLogin,
      updateProfile: vi.fn(),
    });
    
    render(<Login />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('パスワードの表示/非表示が切り替えられること', () => {
    render(<Login />);
    
    const passwordInput = screen.getByLabelText('パスワード *');
    const toggleButton = screen.getByRole('button', { name: /パスワードを/ });
    
    // 初期状態ではパスワード非表示
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // クリックで表示に切り替え
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // 再度クリックで非表示に戻る
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('新規登録リンクが正しく表示されること', () => {
    render(<Login />);
    
    const registerLink = screen.getByText('アカウントを作成');
    expect(registerLink.closest('a')).toHaveAttribute('href', '/auth/register');
  });
});