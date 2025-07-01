import { test, expect } from '@playwright/test';

test.describe('ラウンド入力フォーム', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用ユーザーでログイン（エミュレーター使用）
    await page.goto('/auth/login');
    // TODO: エミュレーター用のログイン処理を実装
    await page.goto('/rounds/new');
  });

  test('ステップフォームが正しく表示される', async ({ page }) => {
    // ステップインジケーターの確認
    await expect(page.locator('[data-testid="step-indicator"]')).toBeVisible();
    
    // 現在のステップが「基本情報」であることを確認
    await expect(page.locator('text=基本情報')).toBeVisible();
    await expect(page.locator('text=1 / 4')).toBeVisible();
  });

  test('基本情報ステップの入力が正しく動作する', async ({ page }) => {
    // プレイ日を入力
    await page.fill('input[name="playDate"]', '2024-01-15');
    
    // スタート時間を入力
    await page.fill('input[name="startTime"]', '08:30');
    
    // コース選択（オートコンプリートドロップダウン）
    await page.click('[data-testid="course-select"]');
    await page.fill('[data-testid="course-search"]', 'テスト');
    await page.waitForTimeout(500); // 検索結果の待機
    await page.click('text=テストゴルフクラブ');
    
    // 天気を選択
    await page.selectOption('select[name="weather"]', '晴れ');
    
    // 次へボタンをクリック
    await page.click('button:has-text("次へ")');
    
    // プレイヤー情報ステップに遷移したことを確認
    await expect(page.locator('text=プレイヤー情報')).toBeVisible();
    await expect(page.locator('text=2 / 4')).toBeVisible();
  });

  test('プレイヤー追加機能が正しく動作する', async ({ page }) => {
    // 基本情報を入力してプレイヤーステップに進む
    await fillBasicInfo(page);
    
    // プレイヤー追加ボタンをクリック
    await page.click('button:has-text("参加者を追加")');
    
    // プレイヤー入力フォームが表示される
    await expect(page.locator('input[name="playerName"]')).toBeVisible();
    await expect(page.locator('input[name="playerHandicap"]')).toBeVisible();
    
    // プレイヤー情報を入力
    await page.fill('input[name="playerName"]', 'テストプレイヤー');
    await page.fill('input[name="playerHandicap"]', '15');
    
    // プレイヤー追加ボタンをクリック
    await page.click('button:has-text("追加")');
    
    // 追加されたプレイヤーが一覧に表示される
    await expect(page.locator('text=テストプレイヤー')).toBeVisible();
    await expect(page.locator('text=HCP: 15')).toBeVisible();
  });

  test('スコア入力ステップのスコアカードが正しく表示される', async ({ page }) => {
    // スコアステップまで進む
    await navigateToScoreStep(page);
    
    // 18ホール分のスコア入力フィールドが表示される
    for (let i = 1; i <= 18; i++) {
      await expect(page.locator(`[data-testid="hole-${i}-strokes"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="hole-${i}-putts"]`)).toBeVisible();
    }
    
    // フロント9・バック9のタブが表示される
    await expect(page.locator('text=Front 9')).toBeVisible();
    await expect(page.locator('text=Back 9')).toBeVisible();
  });

  test('スコア入力時に合計が自動更新される', async ({ page }) => {
    await navigateToScoreStep(page);
    
    // いくつかのホールにスコアを入力
    await page.fill('[data-testid="hole-1-strokes"]', '4');
    await page.fill('[data-testid="hole-2-strokes"]', '5');
    await page.fill('[data-testid="hole-3-strokes"]', '3');
    
    // 合計が表示・更新されることを確認
    await expect(page.locator('[data-testid="front-nine-total"]')).toContainText('12');
  });

  test('フォームの全ステップを順次完了できる', async ({ page }) => {
    // 基本情報を入力
    await fillBasicInfo(page);
    
    // プレイヤーを追加
    await page.click('button:has-text("参加者を追加")');
    await page.fill('input[name="playerName"]', 'テストプレイヤー');
    await page.fill('input[name="playerHandicap"]', '15');
    await page.click('button:has-text("追加")');
    await page.click('button:has-text("次へ")');
    
    // 簡単なスコアを入力（全ホール4打）
    for (let i = 1; i <= 18; i++) {
      await page.fill(`[data-testid="hole-${i}-strokes"]`, '4');
      await page.fill(`[data-testid="hole-${i}-putts"]`, '2');
    }
    
    // 確認ステップに進む
    await page.click('button:has-text("次へ")');
    
    // 確認ページでデータを確認
    await expect(page.locator('text=内容確認')).toBeVisible();
    await expect(page.locator('text=2024-01-15')).toBeVisible();
    await expect(page.locator('text=テストゴルフクラブ')).toBeVisible();
    await expect(page.locator('text=テストプレイヤー')).toBeVisible();
    
    // 登録ボタンをクリック
    await page.click('button:has-text("ラウンドを登録")');
    
    // 成功メッセージまたはリダイレクトを確認
    await expect(page).toHaveURL('/rounds');
  });

  test('バリデーションエラーで次のステップに進めない', async ({ page }) => {
    // 何も入力せずに次へボタンをクリック
    await page.click('button:has-text("次へ")');
    
    // エラーメッセージが表示される
    await expect(page.locator('text=プレイ日を選択してください')).toBeVisible();
    await expect(page.locator('text=スタート時間を選択してください')).toBeVisible();
    
    // ステップが進んでいないことを確認
    await expect(page.locator('text=基本情報')).toBeVisible();
    await expect(page.locator('text=1 / 4')).toBeVisible();
  });

  // ヘルパー関数
  async function fillBasicInfo(page: any) {
    await page.fill('input[name="playDate"]', '2024-01-15');
    await page.fill('input[name="startTime"]', '08:30');
    await page.click('[data-testid="course-select"]');
    await page.fill('[data-testid="course-search"]', 'テスト');
    await page.waitForTimeout(500);
    await page.click('text=テストゴルフクラブ');
    await page.selectOption('select[name="weather"]', '晴れ');
    await page.click('button:has-text("次へ")');
  }

  async function navigateToScoreStep(page: any) {
    await fillBasicInfo(page);
    await page.click('button:has-text("参加者を追加")');
    await page.fill('input[name="playerName"]', 'テストプレイヤー');
    await page.fill('input[name="playerHandicap"]', '15');
    await page.click('button:has-text("追加")');
    await page.click('button:has-text("次へ")');
  }
});