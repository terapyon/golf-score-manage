import { test, expect } from '@playwright/test';

test.describe('ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用ユーザーでログイン（エミュレーター使用）
    await page.goto('/auth/login');
    // TODO: エミュレーター用のログイン処理を実装
    await page.goto('/dashboard');
  });

  test('ダッシュボードが正しく表示される', async ({ page }) => {
    // メインコンテンツの確認
    await expect(page.locator('h1')).toContainText('ダッシュボード');
    
    // 統計カードの確認
    await expect(page.locator('text=総ラウンド数')).toBeVisible();
    await expect(page.locator('text=平均スコア')).toBeVisible();
    await expect(page.locator('text=ベストスコア')).toBeVisible();
    await expect(page.locator('text=最新スコア')).toBeVisible();
  });

  test('クイックアクションボタンが正しく動作する', async ({ page }) => {
    // ラウンド記録ボタン
    await page.click('text=ラウンドを記録');
    await expect(page).toHaveURL('/rounds/new');
    
    // ブラウザを戻してダッシュボードに戻る
    await page.goBack();
    
    // ラウンド一覧ボタン
    await page.click('text=ラウンド一覧');
    await expect(page).toHaveURL('/rounds');
  });

  test('最新ラウンド一覧が表示される', async ({ page }) => {
    // 最新ラウンドセクションの確認
    await expect(page.locator('text=最新ラウンド')).toBeVisible();
    
    // ラウンドデータがある場合のカード表示を確認
    // データがない場合のメッセージ表示を確認
    const hasRounds = await page.locator('[data-testid="round-card"]').count();
    if (hasRounds > 0) {
      await expect(page.locator('[data-testid="round-card"]').first()).toBeVisible();
    } else {
      await expect(page.locator('text=まだラウンドデータがありません')).toBeVisible();
    }
  });

  test('ナビゲーションメニューが正しく動作する', async ({ page }) => {
    // メニューアイテムの確認
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
    await expect(page.locator('text=ラウンド管理')).toBeVisible();
    await expect(page.locator('text=プロフィール')).toBeVisible();
    
    // プロフィールメニューへの遷移
    await page.click('text=プロフィール');
    await expect(page).toHaveURL('/profile');
  });

  test('レスポンシブデザインが正しく動作する', async ({ page }) => {
    // モバイルサイズでの表示をテスト
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // モバイルメニューの確認
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // メニューを開く
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-drawer"]')).toBeVisible();
    
    // デスクトップサイズに戻す
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('[data-testid="mobile-menu-button"]')).not.toBeVisible();
  });
});