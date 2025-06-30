import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import RoundForm from '../RoundForm';
import { createMockCourse } from '@/utils/test-utils';
import * as firestoreService from '@/services/firestoreService';

// モックデータ
const mockCourses = [
  createMockCourse({ id: 'course1', name: 'テストコース1' }),
  createMockCourse({ id: 'course2', name: 'テストコース2' }),
];

// Firebase サービスのモック
vi.mock('@/services/firestoreService', () => ({
  CourseService: {
    getAllCourses: vi.fn(),
  },
  RoundService: {
    createRound: vi.fn(),
  },
}));

// React Router のモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: undefined }),
  };
});

describe('RoundForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // CourseService のモック設定
    vi.mocked(firestoreService.CourseService.getAllCourses).mockResolvedValue(mockCourses);
  });

  it('フォームが正常にレンダリングされること', () => {
    render(<RoundForm />);
    
    // フォームの基本要素が表示されることを確認
    expect(screen.getByText(/基本情報/i)).toBeInTheDocument();
  });

  it('新規ラウンド作成モードで初期化されること', () => {
    render(<RoundForm />);
    
    // 新規作成の場合の要素が表示されることを確認
    expect(screen.getByText(/基本情報/i)).toBeInTheDocument();
  });

  it('ステッパーが正しく表示されること', () => {
    render(<RoundForm />);
    
    // ステッパーの要素が表示されることを確認
    expect(screen.getByText(/基本情報/i)).toBeInTheDocument();
    expect(screen.getByText(/プレイヤー情報/i)).toBeInTheDocument();
  });
});