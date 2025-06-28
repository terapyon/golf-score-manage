import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoundService, CourseService, UserStatsService } from '../firestoreService';
import { createMockRound, createMockCourse, createMockUser } from '@/utils/test-utils';
import type { RoundFormData, RoundFilters } from '@/types';

// Firebase Firestoreのモック
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockStartAfter = vi.fn();
const mockServerTimestamp = vi.fn();

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
  serverTimestamp: mockServerTimestamp,
}));

// モックデータ
const mockRound = createMockRound();
const mockCourse = createMockCourse();
const mockUser = createMockUser();

const mockRoundFormData: RoundFormData = {
  courseId: mockRound.courseId,
  courseName: mockRound.courseName,
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
    mockServerTimestamp.mockReturnValue(new Date());
  });

  describe('createRound', () => {
    it('ラウンドが正常に作成されること', async () => {
      const mockDocRef = { id: 'new-round-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);
      mockCollection.mockReturnValue('rounds-collection');

      const result = await RoundService.createRound(mockUser.uid, mockRoundFormData);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'rounds');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'rounds-collection',
        expect.objectContaining({
          userId: mockUser.uid,
          courseId: mockRoundFormData.courseId,
          courseName: mockRoundFormData.courseName,
          playDate: mockRoundFormData.playDate,
          totalScore: expect.any(Number),
          totalPar: expect.any(Number),
          isCompleted: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toBe('new-round-id');
    });

    it('総スコアが正しく計算されること', async () => {
      const mockDocRef = { id: 'round-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);
      mockCollection.mockReturnValue('rounds-collection');

      const testScores = mockRoundFormData.scores.map((score, index) => ({
        ...score,
        strokes: 4, // 全てのホールで4打
        par: index < 4 ? 3 : index < 14 ? 4 : 5, // パー3x4, パー4x10, パー5x4
      }));

      const formDataWithTestScores = {
        ...mockRoundFormData,
        scores: testScores,
      };

      await RoundService.createRound(mockUser.uid, formDataWithTestScores);

      const addDocCall = mockAddDoc.mock.calls[0][1];
      expect(addDocCall.totalScore).toBe(72); // 4打 x 18ホール = 72
      expect(addDocCall.totalPar).toBe(72); // 3x4 + 4x10 + 5x4 = 72
    });
  });

  describe('getRounds', () => {
    it('ラウンド一覧が正常に取得されること', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: mockRound.id,
            data: () => ({ ...mockRound, createdAt: { toDate: () => mockRound.createdAt } }),
          },
        ],
        size: 1,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      mockQuery.mockReturnValue('query-result');
      mockCollection.mockReturnValue('rounds-collection');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('orderBy-result');
      mockLimit.mockReturnValue('limit-result');

      const filters: RoundFilters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        courseId: undefined,
        page: 1,
        pageSize: 10,
      };

      const result = await RoundService.getRounds(mockUser.uid, filters);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'rounds');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', mockUser.uid);
      expect(mockOrderBy).toHaveBeenCalledWith('playDate', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(11); // pageSize + 1
      expect(mockGetDocs).toHaveBeenCalledWith('query-result');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(expect.objectContaining({
        id: mockRound.id,
        userId: mockRound.userId,
        courseName: mockRound.courseName,
      }));
      expect(result.total).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('フィルタ条件が正しく適用されること', async () => {
      const mockQuerySnapshot = { docs: [], size: 0 };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      mockQuery.mockReturnValue('query-result');
      mockCollection.mockReturnValue('rounds-collection');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('orderBy-result');
      mockLimit.mockReturnValue('limit-result');

      const filters: RoundFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        courseId: 'specific-course-id',
        page: 1,
        pageSize: 5,
      };

      await RoundService.getRounds(mockUser.uid, filters);

      // userId、日付範囲、コースIDのフィルタが適用されることを確認
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', mockUser.uid);
      expect(mockWhere).toHaveBeenCalledWith('playDate', '>=', '2024-01-01');
      expect(mockWhere).toHaveBeenCalledWith('playDate', '<=', '2024-01-31');
      expect(mockWhere).toHaveBeenCalledWith('courseId', '==', 'specific-course-id');
      expect(mockLimit).toHaveBeenCalledWith(6); // pageSize + 1
    });
  });

  describe('getRound', () => {
    it('ラウンド詳細が正常に取得されること', async () => {
      const mockDocSnapshot = {
        exists: () => true,
        id: mockRound.id,
        data: () => ({ ...mockRound, createdAt: { toDate: () => mockRound.createdAt } }),
      };

      mockGetDoc.mockResolvedValue(mockDocSnapshot);
      mockDoc.mockReturnValue('doc-ref');

      const result = await RoundService.getRound(mockRound.id!);

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'rounds', mockRound.id);
      expect(mockGetDoc).toHaveBeenCalledWith('doc-ref');
      expect(result).toEqual(expect.objectContaining({
        id: mockRound.id,
        userId: mockRound.userId,
        courseName: mockRound.courseName,
      }));
    });

    it('存在しないラウンドのIDでnullが返されること', async () => {
      const mockDocSnapshot = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockDocSnapshot);
      mockDoc.mockReturnValue('doc-ref');

      const result = await RoundService.getRound('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateRound', () => {
    it('ラウンドが正常に更新されること', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue('doc-ref');

      const updateData = {
        ...mockRoundFormData,
        memo: '更新されたメモ',
      };

      await RoundService.updateRound(mockRound.id!, mockUser.uid, updateData);

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'rounds', mockRound.id);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'doc-ref',
        expect.objectContaining({
          memo: '更新されたメモ',
          updatedAt: expect.any(Date),
        })
      );
    });
  });

  describe('deleteRound', () => {
    it('ラウンドが正常に削除されること', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue('doc-ref');

      await RoundService.deleteRound(mockRound.id!);

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'rounds', mockRound.id);
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });
  });
});

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourses', () => {
    it('コース一覧が正常に取得されること', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: mockCourse.id,
            data: () => mockCourse,
          },
        ],
        size: 1,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      mockQuery.mockReturnValue('query-result');
      mockCollection.mockReturnValue('courses-collection');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('orderBy-result');
      mockLimit.mockReturnValue('limit-result');

      const result = await CourseService.getCourses();

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'courses');
      expect(mockWhere).toHaveBeenCalledWith('isActive', '==', true);
      expect(mockOrderBy).toHaveBeenCalledWith('name', 'asc');
      expect(mockGetDocs).toHaveBeenCalledWith('query-result');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(expect.objectContaining({
        id: mockCourse.id,
        name: mockCourse.name,
      }));
    });
  });

  describe('searchCourses', () => {
    it('コース検索が正常に動作すること', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: mockCourse.id,
            data: () => mockCourse,
          },
        ],
        size: 1,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      mockQuery.mockReturnValue('query-result');
      mockCollection.mockReturnValue('courses-collection');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('orderBy-result');
      mockLimit.mockReturnValue('limit-result');

      const searchTerm = 'テスト';
      const result = await CourseService.searchCourses(searchTerm);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'courses');
      expect(mockWhere).toHaveBeenCalledWith('isActive', '==', true);
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(mockGetDocs).toHaveBeenCalledWith('query-result');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        id: mockCourse.id,
        name: mockCourse.name,
      }));
    });
  });
});

describe('UserStatsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('ユーザー統計が正常に取得されること', async () => {
      const mockRounds = [
        { ...mockRound, totalScore: 80, totalPar: 72 },
        { ...mockRound, totalScore: 85, totalPar: 72 },
        { ...mockRound, totalScore: 90, totalPar: 72 },
      ];

      const mockQuerySnapshot = {
        docs: mockRounds.map((round, index) => ({
          id: `round-${index}`,
          data: () => ({ ...round, createdAt: { toDate: () => new Date() } }),
        })),
        size: mockRounds.length,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      mockQuery.mockReturnValue('query-result');
      mockCollection.mockReturnValue('rounds-collection');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('orderBy-result');

      const result = await UserStatsService.getUserStats(mockUser.uid);

      expect(result).toEqual(expect.objectContaining({
        totalRounds: 3,
        averageScore: 85, // (80 + 85 + 90) / 3
        bestScore: 80,
        worstScore: 90,
        averageScoreDiff: 13, // 85 - 72
        bestScoreDiff: 8, // 80 - 72
        worstScoreDiff: 18, // 90 - 72
      }));

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'rounds');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', mockUser.uid);
      expect(mockWhere).toHaveBeenCalledWith('isCompleted', '==', true);
    });

    it('ラウンドがない場合の統計が正しいこと', async () => {
      const mockQuerySnapshot = {
        docs: [],
        size: 0,
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      mockQuery.mockReturnValue('query-result');
      mockCollection.mockReturnValue('rounds-collection');
      mockWhere.mockReturnValue('where-result');
      mockOrderBy.mockReturnValue('orderBy-result');

      const result = await UserStatsService.getUserStats(mockUser.uid);

      expect(result).toEqual({
        totalRounds: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        averageScoreDiff: 0,
        bestScoreDiff: 0,
        worstScoreDiff: 0,
      });
    });
  });
});