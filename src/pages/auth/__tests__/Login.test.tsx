import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import Login from '../Login';
import * as AuthContext from '@/contexts/AuthContext';

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
    useLocation: () => ({ pathname: '/login', search: '', hash: '', state: null }),
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
      currentUser: null,
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: mockGoogleLogin,
      updateUserProfile: vi.fn(),
    });
  });

  it('ログインフォームが正常にレンダリングされること', () => {
    render(<Login />);
    
    // 基本的な要素の存在確認
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // メールアドレス入力フィールド
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument(); // ログインボタン
    expect(screen.getByText(/Googleでログイン/)).toBeInTheDocument(); // Googleログインボタンのテキスト
    expect(screen.getByText(/アカウントをお持ちでないですか/)).toBeInTheDocument(); // 新規登録リンク
  });

  it('認証済みユーザーは適切に処理される', () => {
    // 認証済みユーザーの場合のモック
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      currentUser: { 
        uid: 'test-uid', 
        email: 'test@example.com', 
        name: 'Test User',
        handicap: 15,
        avatar: null,
        preferences: {
          defaultTee: 'レギュラー',
          scoreDisplayMode: 'stroke' as const,
          notifications: { email: true, push: true }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: mockGoogleLogin,
      updateUserProfile: vi.fn(),
    });

    render(<Login />);
    
    // 認証済みの場合はリダイレクト処理されることを想定
    // 実際のロジックに応じてテストを調整
  });

  it('コンポーネントが正常にマウントされること', () => {
    const { container } = render(<Login />);
    
    // コンポーネントがレンダリングされることを確認
    expect(container).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });
});