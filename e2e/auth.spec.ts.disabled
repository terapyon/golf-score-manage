import { test, expect } from '@playwright/test';

test.describe('認証機能', () => {
  test.beforeEach(async ({ page }) => {
    // Firebase エミュレーターを使用
    await page.goto('/');
  });

  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/auth/login');
    
    // ページタイトルとフォーム要素を確認
    await expect(page.locator('h1')).toContainText('ログイン');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('ログイン');
  });

  test('新規登録ページが正しく表示される', async ({ page }) => {
    await page.goto('/auth/register');
    
    // ページタイトルとフォーム要素を確認
    await expect(page.locator('h1')).toContainText('新規登録');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('アカウントを作成');
  });

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 無効なデータでフォームを送信
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    // エラーメッセージを確認
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible();
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible();
  });

  test('ログインページから新規登録ページへの遷移', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 新規登録リンクをクリック
    await page.click('text=アカウントを作成');
    
    // 新規登録ページに遷移することを確認
    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('新規登録');
  });

  test('新規登録ページからログインページへの遷移', async ({ page }) => {
    await page.goto('/auth/register');
    
    // ログインリンクをクリック
    await page.click('text=既にアカウントをお持ちですか？');
    
    // ログインページに遷移することを確認
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('ログイン');
  });
});