// 基本的な型定義
export interface User {
  uid: string;
  email: string;
  name: string;
  handicap: number;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  defaultTee: string;
  scoreDisplayMode: 'stroke' | 'net';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface Course {
  id: string;
  name: string;
  nameKana: string;
  address: string;
  prefecture: string;
  city: string;
  postalCode: string;
  phone: string;
  website?: string;
  holesCount: 18 | 27 | 36;
  parTotal: number;
  yardageTotal: number;
  tees: CourseTeeName[];
  rating?: {
    [teeName: string]: {
      courseRating: number;
      slopeRating: number;
    };
  };
  facilities: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseTeeName {
  name: string;
  color: string;
  gender: 'men' | 'women' | 'unisex';
}

export interface CourseHole {
  courseId: string;
  holeNumber: number;
  par: 3 | 4 | 5;
  handicap: number;
  yardage: {
    [teeName: string]: number;
  };
  description?: string;
  hazards?: string[];
}

export interface Round {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  playDate: string;
  startTime: string;
  weather?: string;
  temperature?: number;
  windSpeed?: number;
  teeName: string;
  totalScore: number;
  totalPar: number;
  scores: RoundScore[];
  participants: RoundParticipant[];
  memo?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoundScore {
  holeNumber: number;
  par: number;
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penalties?: number;
}

export interface RoundParticipant {
  userId?: string;
  name: string;
  type: 'registered' | 'guest';
  handicap?: number;
  totalScore?: number;
}

export interface UserStats {
  userId: string;
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  currentHandicap: number;
  last5Rounds: {
    averageScore: number;
    improvement: number;
    dates: string[];
  };
  last10Rounds: {
    averageScore: number;
    improvement: number;
  };
  thisYear: {
    rounds: number;
    averageScore: number;
  };
  courseStats: {
    [courseId: string]: {
      courseName: string;
      rounds: number;
      averageScore: number;
      bestScore: number;
    };
  };
  monthlyStats: {
    [yearMonth: string]: {
      rounds: number;
      averageScore: number;
    };
  };
  updatedAt: Date;
}

// フォーム用の型
export interface RoundFormData {
  courseId: string;
  playDate: string;
  startTime: string;
  teeName: string;
  participants: RoundParticipant[];
  scores: Omit<RoundScore, 'par'>[];
  weather?: string;
  temperature?: number;
  windSpeed?: number;
  memo?: string;
}

export interface RoundFilters {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  courseId?: string;
}

// API レスポンス用の型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}