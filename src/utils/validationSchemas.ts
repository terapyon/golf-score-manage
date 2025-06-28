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

// 型定義をエクスポート
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;