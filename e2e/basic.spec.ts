import { test, expect } from '@playwright/test';

test.describe('基本機能テスト', () => {
  test('アプリケーションが正常に起動すること', async ({ page }) => {
    // ルートページに移動
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // ページタイトルの確認
    await expect(page).toHaveTitle('ゴルフスコア管理');
  });

  test('ページが基本的な要素を含むこと', async ({ page }) => {
    // ルートページに移動
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // React rootが存在することを確認
    await expect(page.locator('#root')).toBeVisible();
    
    // HTMLタイトルも確認
    const title = await page.textContent('title');
    expect(title).toBe('ゴルフスコア管理');
  });
});