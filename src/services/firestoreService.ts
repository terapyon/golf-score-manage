import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Round,
  RoundFormData,
  RoundFilters,
  Course,
  UserStats,
  PaginatedResponse,
} from '../types';

// コレクション名
const COLLECTIONS = {
  ROUNDS: 'rounds',
  COURSES: 'courses',
  USER_STATS: 'userStats',
} as const;

// ラウンド関連のサービス
export class RoundService {
  // ラウンド作成
  static async createRound(userId: string, roundData: RoundFormData): Promise<string> {
    try {
      const round: Omit<Round, 'id'> = {
        userId,
        courseId: roundData.courseId,
        courseName: roundData.courseId, // TODO: コース名の取得
        playDate: roundData.playDate,
        startTime: roundData.startTime,
        weather: roundData.weather,
        temperature: roundData.temperature,
        windSpeed: roundData.windSpeed,
        teeName: roundData.teeName,
        totalScore: roundData.scores.reduce((sum, score) => sum + score.strokes, 0),
        totalPar: roundData.scores.length * 4, // TODO: 実際のパー計算
        scores: roundData.scores.map(score => ({
          ...score,
          par: 4, // TODO: 実際のパー取得
        })),
        participants: roundData.participants,
        memo: roundData.memo,
        isCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.ROUNDS), {
        ...round,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating round:', error);
      throw new Error('ラウンドの作成に失敗しました');
    }
  }

  // ラウンド一覧取得
  static async getRounds(
    userId: string,
    filters: RoundFilters
  ): Promise<PaginatedResponse<Round>> {
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('playDate', 'desc'),
      ];

      // フィルタ条件の追加
      if (filters.from) {
        constraints.push(where('playDate', '>=', filters.from));
      }
      if (filters.to) {
        constraints.push(where('playDate', '<=', filters.to));
      }
      if (filters.courseId) {
        constraints.push(where('courseId', '==', filters.courseId));
      }

      // ページネーション用のクエリ
      const countQuery = query(collection(db, COLLECTIONS.ROUNDS), ...constraints);
      const countSnapshot = await getDocs(countQuery);
      const total = countSnapshot.size;

      // データ取得用のクエリ
      const dataQuery = query(
        collection(db, COLLECTIONS.ROUNDS),
        ...constraints,
        limit(filters.limit)
      );

      const snapshot = await getDocs(dataQuery);
      const rounds: Round[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Round[];

      return {
        items: rounds,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      };
    } catch (error) {
      console.error('Error getting rounds:', error);
      throw new Error('ラウンド一覧の取得に失敗しました');
    }
  }

  // ラウンド詳細取得
  static async getRound(roundId: string): Promise<Round | null> {
    try {
      const docRef = doc(db, COLLECTIONS.ROUNDS, roundId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Round;
    } catch (error) {
      console.error('Error getting round:', error);
      throw new Error('ラウンド詳細の取得に失敗しました');
    }
  }

  // ラウンド更新
  static async updateRound(roundId: string, updates: Partial<RoundFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ROUNDS, roundId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating round:', error);
      throw new Error('ラウンドの更新に失敗しました');
    }
  }

  // ラウンド削除
  static async deleteRound(roundId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ROUNDS, roundId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting round:', error);
      throw new Error('ラウンドの削除に失敗しました');
    }
  }

  // 最近のラウンド取得
  static async getRecentRounds(userId: string, count: number = 5): Promise<Round[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ROUNDS),
        where('userId', '==', userId),
        orderBy('playDate', 'desc'),
        limit(count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Round[];
    } catch (error) {
      console.error('Error getting recent rounds:', error);
      throw new Error('最近のラウンドの取得に失敗しました');
    }
  }
}

// コース関連のサービス
export class CourseService {
  // コース一覧取得
  static async getCourses(): Promise<Course[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.COURSES),
        where('isActive', '==', true),
        orderBy('name')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Course[];
    } catch (error) {
      console.error('Error getting courses:', error);
      throw new Error('コース一覧の取得に失敗しました');
    }
  }

  // コース詳細取得
  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const docRef = doc(db, COLLECTIONS.COURSES, courseId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Course;
    } catch (error) {
      console.error('Error getting course:', error);
      throw new Error('コース詳細の取得に失敗しました');
    }
  }

  // コース検索
  static async searchCourses(searchTerm: string): Promise<Course[]> {
    try {
      // Firestoreでは部分一致検索が制限されているため、
      // 開発時は全件取得してフィルタリング（本番では検索サービスの使用を推奨）
      const q = query(
        collection(db, COLLECTIONS.COURSES),
        where('isActive', '==', true),
        orderBy('name')
      );

      const snapshot = await getDocs(q);
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Course[];

      // クライアントサイドでフィルタリング
      return courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.nameKana.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching courses:', error);
      throw new Error('コース検索に失敗しました');
    }
  }
}

// 統計関連のサービス
export class StatsService {
  // ユーザー統計取得
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USER_STATS, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        ...docSnap.data(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as UserStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('統計情報の取得に失敗しました');
    }
  }

  // 統計計算（ラウンド作成・更新時に呼び出し）
  static async calculateStats(userId: string): Promise<UserStats> {
    try {
      // ユーザーの全ラウンドを取得
      const roundsQuery = query(
        collection(db, COLLECTIONS.ROUNDS),
        where('userId', '==', userId),
        orderBy('playDate', 'desc')
      );

      const roundsSnapshot = await getDocs(roundsQuery);
      const rounds: Round[] = roundsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Round[];

      if (rounds.length === 0) {
        // ラウンドがない場合のデフォルト統計
        const defaultStats: UserStats = {
          userId,
          totalRounds: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 0,
          currentHandicap: 0,
          last5Rounds: {
            averageScore: 0,
            improvement: 0,
            dates: [],
          },
          last10Rounds: {
            averageScore: 0,
            improvement: 0,
          },
          thisYear: {
            rounds: 0,
            averageScore: 0,
          },
          courseStats: {},
          monthlyStats: {},
          updatedAt: new Date(),
        };

        // Firestoreに保存
        const docRef = doc(db, COLLECTIONS.USER_STATS, userId);
        await updateDoc(docRef, {
          ...defaultStats,
          updatedAt: serverTimestamp(),
        });

        return defaultStats;
      }

      // 統計計算
      const scores = rounds.map(r => r.totalScore);
      const totalRounds = rounds.length;
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalRounds;
      const bestScore = Math.min(...scores);
      const worstScore = Math.max(...scores);

      // 直近5ラウンドの統計
      const last5Rounds = rounds.slice(0, 5);
      const last5Average = last5Rounds.length > 0
        ? last5Rounds.reduce((sum, r) => sum + r.totalScore, 0) / last5Rounds.length
        : 0;

      // 直近10ラウンドの統計
      const last10Rounds = rounds.slice(0, 10);
      const last10Average = last10Rounds.length > 0
        ? last10Rounds.reduce((sum, r) => sum + r.totalScore, 0) / last10Rounds.length
        : 0;

      // 今年のラウンド統計
      const currentYear = new Date().getFullYear();
      const thisYearRounds = rounds.filter(r => 
        new Date(r.playDate).getFullYear() === currentYear
      );

      // コース別統計
      const courseStats: { [courseId: string]: any } = {};
      rounds.forEach(round => {
        if (!courseStats[round.courseId]) {
          courseStats[round.courseId] = {
            courseName: round.courseName,
            rounds: 0,
            totalScore: 0,
            bestScore: round.totalScore,
          };
        }
        courseStats[round.courseId].rounds++;
        courseStats[round.courseId].totalScore += round.totalScore;
        courseStats[round.courseId].bestScore = Math.min(
          courseStats[round.courseId].bestScore,
          round.totalScore
        );
      });

      // コース別統計の平均計算
      Object.keys(courseStats).forEach(courseId => {
        courseStats[courseId].averageScore = 
          courseStats[courseId].totalScore / courseStats[courseId].rounds;
        delete courseStats[courseId].totalScore;
      });

      const stats: UserStats = {
        userId,
        totalRounds,
        averageScore,
        bestScore,
        worstScore,
        currentHandicap: 0, // TODO: ハンディキャップ計算
        last5Rounds: {
          averageScore: last5Average,
          improvement: 0, // TODO: 改善度計算
          dates: last5Rounds.map(r => r.playDate),
        },
        last10Rounds: {
          averageScore: last10Average,
          improvement: 0, // TODO: 改善度計算
        },
        thisYear: {
          rounds: thisYearRounds.length,
          averageScore: thisYearRounds.length > 0
            ? thisYearRounds.reduce((sum, r) => sum + r.totalScore, 0) / thisYearRounds.length
            : 0,
        },
        courseStats,
        monthlyStats: {}, // TODO: 月別統計計算
        updatedAt: new Date(),
      };

      // Firestoreに保存
      const docRef = doc(db, COLLECTIONS.USER_STATS, userId);
      await updateDoc(docRef, {
        ...stats,
        updatedAt: serverTimestamp(),
      });

      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      throw new Error('統計計算に失敗しました');
    }
  }
}