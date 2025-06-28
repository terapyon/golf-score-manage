import { z } from 'zod';

// ログインフォームのバリデーションスキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください'),
});

// 新規登録フォームのバリデーションスキーマ
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, '名前を入力してください')
      .max(50, '名前は50文字以内で入力してください'),
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(6, 'パスワードは6文字以上で入力してください')
      .max(128, 'パスワードは128文字以内で入力してください'),
    confirmPassword: z
      .string()
      .min(1, 'パスワード（確認）を入力してください'),
    handicap: z
      .number()
      .min(-10, 'ハンディキャップは-10以上で入力してください')
      .max(54, 'ハンディキャップは54以下で入力してください')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

// プロフィール更新フォームのバリデーションスキーマ
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  handicap: z
    .number()
    .min(-10, 'ハンディキャップは-10以上で入力してください')
    .max(54, 'ハンディキャップは54以下で入力してください'),
  preferences: z.object({
    defaultTee: z.string().min(1, 'デフォルトティーを選択してください'),
    scoreDisplayMode: z.enum(['stroke', 'net']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
    }),
  }),
});

// ラウンド入力フォームのバリデーションスキーマ
export const roundFormSchema = z.object({
  courseId: z.string().min(1, 'ゴルフ場を選択してください'),
  playDate: z.string().min(1, 'プレー日を入力してください'),
  startTime: z.string().min(1, 'スタート時間を入力してください'),
  teeName: z.string().min(1, 'ティーを選択してください'),
  participants: z.array(z.object({
    name: z.string().min(1, '名前を入力してください'),
    type: z.enum(['registered', 'guest']),
    handicap: z.number().min(-10).max(54).optional(),
  })).min(1, '参加者を追加してください').max(4, '参加者は4名まで登録できます'),
  scores: z.array(z.object({
    holeNumber: z.number().min(1).max(18),
    strokes: z.number().min(1, 'ストローク数を入力してください').max(20, 'ストローク数は20以下で入力してください'),
    putts: z.number().min(0).max(10).optional(),
    fairwayHit: z.boolean().optional(),
    greenInRegulation: z.boolean().optional(),
    penalties: z.number().min(0).max(10).optional(),
  })).length(18, '18ホール分のスコアを入力してください'),
  weather: z.string().optional(),
  temperature: z.number().min(-20).max(50).optional(),
  windSpeed: z.number().min(0).max(100).optional(),
  memo: z.string().max(500, 'メモは500文字以内で入力してください').optional(),
});

// ラウンド検索フォームのバリデーションスキーマ
export const roundSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  courseId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// 型定義をエクスポート
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type RoundFormData = z.infer<typeof roundFormSchema>;
export type RoundSearchFormData = z.infer<typeof roundSearchSchema>;