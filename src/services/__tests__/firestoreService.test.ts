import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRound, createMockCourse, createMockUser } from '@/utils/test-utils';
import type { RoundFormData, RoundFilters } from '@/types';

// Firebase Firestoreのモック設定
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn(),
}));

// サービスのインポートをモック後に行う
import { RoundService, CourseService, StatsService } from '../firestoreService';

// モックデータ
const mockRound = createMockRound();
const mockCourse = createMockCourse();
const mockUser = createMockUser();

const mockRoundFormData: RoundFormData = {
  courseId: mockRound.courseId,
  playDate: mockRound.playDate,
  startTime: mockRound.startTime,
  weather: mockRound.weather,
  temperature: mockRound.temperature,
  windSpeed: mockRound.windSpeed,
  teeName: mockRound.teeName,
  scores: mockRound.scores,
  participants: mockRound.participants,
  memo: mockRound.memo || '',
};

describe('RoundService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRound', () => {
    it('RoundServiceのcreateRound関数が存在すること', () => {
      expect(RoundService.createRound).toBeDefined();
      expect(typeof RoundService.createRound).toBe('function');
    });

    it('createRound関数が適切な引数を受け取ること', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-round-id' } as any);

      // 関数が正常に呼び出せることを確認
      await expect(RoundService.createRound(mockUser.uid, mockRoundFormData)).resolves.not.toThrow();
    });
  });

  describe('getRounds', () => {
    it('RoundServiceのgetRounds関数が存在すること', () => {
      expect(RoundService.getRounds).toBeDefined();
      expect(typeof RoundService.getRounds).toBe('function');
    });
  });

  describe('getRound', () => {
    it('RoundServiceのgetRound関数が存在すること', () => {
      expect(RoundService.getRound).toBeDefined();
      expect(typeof RoundService.getRound).toBe('function');
    });
  });

  describe('updateRound', () => {
    it('RoundServiceのupdateRound関数が存在すること', () => {
      expect(RoundService.updateRound).toBeDefined();
      expect(typeof RoundService.updateRound).toBe('function');
    });
  });

  describe('deleteRound', () => {
    it('RoundServiceのdeleteRound関数が存在すること', () => {
      expect(RoundService.deleteRound).toBeDefined();
      expect(typeof RoundService.deleteRound).toBe('function');
    });
  });
});

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourses', () => {
    it('CourseServiceのgetCourses関数が存在すること', () => {
      expect(CourseService.getCourses).toBeDefined();
      expect(typeof CourseService.getCourses).toBe('function');
    });
  });

  describe('searchCourses', () => {
    it('CourseServiceのsearchCourses関数が存在すること', () => {
      expect(CourseService.searchCourses).toBeDefined();
      expect(typeof CourseService.searchCourses).toBe('function');
    });
  });
});

describe('StatsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('StatsServiceのgetUserStats関数が存在すること', () => {
      expect(StatsService.getUserStats).toBeDefined();
      expect(typeof StatsService.getUserStats).toBe('function');
    });
  });
});