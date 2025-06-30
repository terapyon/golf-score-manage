import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme';
import { vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';

// カスタムレンダー関数
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

const AllTheProviders = ({ 
  children, 
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })
}: { 
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, ...renderOptions } = options;
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// テスト用のモック関数
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  name: 'テストユーザー',
  handicap: 15,
  avatar: null,
  preferences: {
    defaultTee: 'レギュラー',
    scoreDisplayMode: 'stroke' as const,
    notifications: {
      email: true,
      push: true,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockRound = (overrides = {}) => ({
  id: 'test-round-123',
  userId: 'test-user-123',
  courseId: 'dummy-course-1',
  courseName: 'テストゴルフクラブ',
  playDate: '2024-01-15',
  startTime: '08:30',
  weather: '晴れ',
  temperature: 25,
  windSpeed: 5,
  teeName: 'レギュラー',
  totalScore: 85,
  totalPar: 72,
  scores: Array.from({ length: 18 }, (_, i) => ({
    holeNumber: i + 1,
    par: 4,
    strokes: 4 + Math.floor(Math.random() * 3) - 1,
    putts: 2,
    fairwayHit: Math.random() > 0.5,
    greenInRegulation: Math.random() > 0.6,
    penalties: 0,
  })),
  participants: [
    {
      name: 'テストユーザー',
      type: 'registered' as const,
      handicap: 15,
      totalScore: 85,
    },
  ],
  memo: 'テストラウンド',
  isCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCourse = (overrides = {}) => ({
  id: 'dummy-course-1',
  name: 'テストゴルフクラブ',
  nameKana: 'てすとごるふくらぶ',
  address: '東京都渋谷区テスト1-1-1',
  prefecture: '東京都',
  city: '渋谷区',
  postalCode: '150-0000',
  phone: '03-0000-0000',
  website: 'https://example.com',
  holesCount: 18 as const,
  parTotal: 72,
  yardageTotal: 6500,
  tees: [
    { name: 'レディース', color: 'red', gender: 'women' as const },
    { name: 'レギュラー', color: 'white', gender: 'unisex' as const },
    { name: 'バック', color: 'blue', gender: 'men' as const },
  ],
  facilities: ['レストラン', 'プロショップ'],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Firebase Auth のモック
export const mockFirebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
};

// Firestore のモック
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
};

// React Router のモック
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// LocalStorage のモック
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Window オブジェクトのモック
export const mockWindow = {
  location: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  localStorage: mockLocalStorage,
  alert: vi.fn(),
  confirm: vi.fn(),
  prompt: vi.fn(),
};

// テスト用ユーティリティ関数
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const suppressConsoleError = () => {
  const originalError = console.error;
  console.error = vi.fn();
  return () => {
    console.error = originalError;
  };
};

// re-export everything
export * from '@testing-library/react';
export { customRender as render };