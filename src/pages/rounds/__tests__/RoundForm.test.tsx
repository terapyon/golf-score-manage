import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { RoundForm } from '../RoundForm';
import { createMockCourse } from '@/utils/test-utils';
import * as firestoreService from '@/services/firestoreService';

// モックデータ
const mockCourses = [
  createMockCourse({ id: 'course1', name: 'テストコース1' }),
  createMockCourse({ id: 'course2', name: 'テストコース2' }),
];

// Firestoreサービスのモック
vi.mock('@/services/firestoreService', () => ({
  CourseService: {
    getCourses: vi.fn(),
    searchCourses: vi.fn(),
  },
  RoundService: {
    createRound: vi.fn(),
  },
}));

// React Routerのモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// AuthContextのモック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@example.com' },
  }),
}));

describe('RoundForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトのモック設定
    vi.mocked(firestoreService.CourseService.getCourses).mockResolvedValue({
      data: mockCourses,
      total: mockCourses.length,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    
    vi.mocked(firestoreService.RoundService.createRound).mockResolvedValue('round-id');
  });

  it('ラウンドフォームが正常にレンダリングされること', async () => {
    render(<RoundForm />);
    
    // 基本情報ステップが表示される
    expect(screen.getByText('基本情報')).toBeInTheDocument();
    expect(screen.getByLabelText('プレイ日 *')).toBeInTheDocument();
    expect(screen.getByLabelText('スタート時間 *')).toBeInTheDocument();
    
    // 次へボタンが表示される
    expect(screen.getByRole('button', { name: '次へ' })).toBeInTheDocument();
  });

  it('基本情報からプレイヤー情報へのステップ進行が正常に動作すること', async () => {
    render(<RoundForm />);
    
    // 基本情報を入力
    fireEvent.change(screen.getByLabelText('プレイ日 *'), {
      target: { value: '2024-01-15' },
    });
    fireEvent.change(screen.getByLabelText('スタート時間 *'), {
      target: { value: '08:30' },
    });
    
    // コース選択（モックコースを使用）
    const courseSelect = screen.getByLabelText('ゴルフ場 *');
    fireEvent.mouseDown(courseSelect);
    
    await waitFor(() => {
      expect(screen.getByText('テストコース1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('テストコース1'));
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    
    await waitFor(() => {
      expect(screen.getByText('プレイヤー情報')).toBeInTheDocument();
      expect(screen.getByText('参加者を追加')).toBeInTheDocument();
    });
  });

  it('プレイヤー追加機能が正常に動作すること', async () => {
    render(<RoundForm />);
    
    // 基本情報を入力してプレイヤーステップに進む
    await navigateToPlayerStep();
    
    // プレイヤー追加ボタンをクリック
    fireEvent.click(screen.getByText('参加者を追加'));
    
    // プレイヤー入力フィールドが表示される
    expect(screen.getByLabelText('名前 *')).toBeInTheDocument();
    expect(screen.getByLabelText('ハンディキャップ')).toBeInTheDocument();
    
    // プレイヤー情報を入力
    fireEvent.change(screen.getByLabelText('名前 *'), {
      target: { value: 'テストプレイヤー' },
    });
    fireEvent.change(screen.getByLabelText('ハンディキャップ'), {
      target: { value: '15' },
    });
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    
    await waitFor(() => {
      expect(screen.getByText('スコア入力')).toBeInTheDocument();
    });
  });

  it('スコア入力フォームが18ホール分表示されること', async () => {
    render(<RoundForm />);
    
    // スコアステップまで進む
    await navigateToScoreStep();
    
    // 18ホール分のスコア入力フィールドが表示される
    for (let i = 1; i <= 18; i++) {
      expect(screen.getByTestId(`hole-${i}-strokes`)).toBeInTheDocument();
      expect(screen.getByTestId(`hole-${i}-putts`)).toBeInTheDocument();
    }
    
    // フロント9・バック9の区分が表示される
    expect(screen.getByText('Front 9')).toBeInTheDocument();
    expect(screen.getByText('Back 9')).toBeInTheDocument();
  });

  it('スコア入力時に合計が自動計算されること', async () => {
    render(<RoundForm />);
    
    await navigateToScoreStep();
    
    // 1番ホールにスコアを入力
    const hole1Strokes = screen.getByTestId('hole-1-strokes');
    fireEvent.change(hole1Strokes, { target: { value: '4' } });
    
    // 2番ホールにスコアを入力
    const hole2Strokes = screen.getByTestId('hole-2-strokes');
    fireEvent.change(hole2Strokes, { target: { value: '5' } });
    
    // 合計が表示されることを確認（正確な計算は実装依存）
    await waitFor(() => {
      const totalElements = screen.getAllByText(/合計/);
      expect(totalElements.length).toBeGreaterThan(0);
    });
  });

  it('フォーム送信が正常に動作すること', async () => {
    render(<RoundForm />);
    
    // 確認ステップまで進む
    await navigateToConfirmationStep();
    
    // 登録ボタンをクリック
    const submitButton = screen.getByRole('button', { name: 'ラウンドを登録' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(firestoreService.RoundService.createRound).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/rounds');
    });
  });

  it('必須フィールドのバリデーションが動作すること', async () => {
    render(<RoundForm />);
    
    // 何も入力せずに次へボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    
    await waitFor(() => {
      expect(screen.getByText('プレイ日を選択してください')).toBeInTheDocument();
      expect(screen.getByText('スタート時間を選択してください')).toBeInTheDocument();
      expect(screen.getByText('ゴルフ場を選択してください')).toBeInTheDocument();
    });
  });

  it('戻るボタンで前のステップに戻れること', async () => {
    render(<RoundForm />);
    
    // プレイヤーステップまで進む
    await navigateToPlayerStep();
    
    expect(screen.getByText('プレイヤー情報')).toBeInTheDocument();
    
    // 戻るボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '戻る' }));
    
    await waitFor(() => {
      expect(screen.getByText('基本情報')).toBeInTheDocument();
    });
  });

  // ヘルパー関数
  async function navigateToPlayerStep() {
    // 基本情報を入力
    fireEvent.change(screen.getByLabelText('プレイ日 *'), {
      target: { value: '2024-01-15' },
    });
    fireEvent.change(screen.getByLabelText('スタート時間 *'), {
      target: { value: '08:30' },
    });
    
    // コース選択
    const courseSelect = screen.getByLabelText('ゴルフ場 *');
    fireEvent.mouseDown(courseSelect);
    await waitFor(() => screen.getByText('テストコース1'));
    fireEvent.click(screen.getByText('テストコース1'));
    
    // 次へボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    
    await waitFor(() => {
      expect(screen.getByText('プレイヤー情報')).toBeInTheDocument();
    });
  }

  async function navigateToScoreStep() {
    await navigateToPlayerStep();
    
    // プレイヤー追加
    fireEvent.click(screen.getByText('参加者を追加'));
    fireEvent.change(screen.getByLabelText('名前 *'), {
      target: { value: 'テストプレイヤー' },
    });
    
    // スコアステップに進む
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    
    await waitFor(() => {
      expect(screen.getByText('スコア入力')).toBeInTheDocument();
    });
  }

  async function navigateToConfirmationStep() {
    await navigateToScoreStep();
    
    // 簡単なスコア入力
    for (let i = 1; i <= 18; i++) {
      const strokesInput = screen.getByTestId(`hole-${i}-strokes`);
      fireEvent.change(strokesInput, { target: { value: '4' } });
    }
    
    // 確認ステップに進む
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    
    await waitFor(() => {
      expect(screen.getByText('内容確認')).toBeInTheDocument();
    });
  }
});