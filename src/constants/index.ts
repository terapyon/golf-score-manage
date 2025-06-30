// アプリケーション定数
export const APP_NAME = 'ゴルフスコア管理';
export const APP_VERSION = '0.1.0';

// ゴルフ関連定数
export const GOLF_CONSTANTS = {
  MIN_STROKES: 1,
  MAX_STROKES: 15,
  STANDARD_HOLES: 18,
  PAR_VALUES: [3, 4, 5] as const,
} as const;

// UI定数
export const UI_CONSTANTS = {
  DRAWER_WIDTH: 240,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 600,
} as const;

// ルーティング定数
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ROUNDS: '/rounds',
  ROUNDS_NEW: '/rounds/new',
  ROUNDS_DETAIL: '/rounds/:id',
  ROUNDS_EDIT: '/rounds/:id/edit',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

// フォームバリデーション定数
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\-()+ \s]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 50,
  MEMO_MAX_LENGTH: 500,
} as const;

// 日本の都道府県一覧
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const;

// ティー色の定数
export const TEE_COLORS = {
  BLACK: '#000000',
  BLUE: '#1976d2',
  WHITE: '#ffffff',
  YELLOW: '#ffd600',
  RED: '#d32f2f',
  GREEN: '#388e3c',
} as const;

// 天気の選択肢
export const WEATHER_OPTIONS = [
  '晴れ',
  '曇り',
  '雨',
  '雪',
  '強風',
  '霧'
] as const;

// ハンディキャップ範囲
export const HANDICAP_RANGE = {
  MIN: -10,
  MAX: 54,
} as const;