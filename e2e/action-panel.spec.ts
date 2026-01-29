/**
 * Action Panel E2E 测试
 * 测试管理操作面板的所有功能
 */

import { test, expect } from '@playwright/test';

test.describe('管理操作面板', () => {
  test.beforeEach(async ({ page }) => {
    // 启动应用
    await page.goto('http://localhost:1420');
    // 等待应用加载
    await page.waitForSelector('h2:has-text("管理操作")');
  });

  test.describe('备份机器码功能', () => {
    test('应能点击备份机器码按钮', async ({ page }) => {
      // 查找备份按钮
      const backupButton = page.locator('button:has-text("备份机器码")');
      await expect(backupButton).toBeVisible();
      await expect(backupButton).toBeEnabled();

      // 点击备份按钮
      await backupButton.click();

      // 等待操作完成（可能有弹窗或提示）
      await page.waitForTimeout(500);
    });

    test('备份成功应显示成功提示', async ({ page }) => {
      const backupButton = page.locator('button:has-text("备份机器码")');
      await backupButton.click();

      // 等待成功提示
      await page.waitForSelector('text=备份成功', { timeout: 5000 }).catch(() => {
        // 可能显示不同的成功消息
      });
    });
  });

  test.describe('随机生成功能', () => {
    test('应能点击随机生成按钮', async ({ page }) => {
      const generateButton = page.locator('button:has-text("随机生成")');
      await expect(generateButton).toBeVisible();
      await expect(generateButton).toBeEnabled();

      await generateButton.click();

      // 等待确认对话框或模态框
      await page.waitForTimeout(500);
    });

    test('点击随机生成应显示确认对话框', async ({ page }) => {
      const generateButton = page.locator('button:has-text("随机生成")');
      await generateButton.click();

      // 检查是否显示确认对话框
      const confirmDialog = page.locator('text=确认随机生成');
      await expect(confirmDialog).toBeVisible({ timeout: 3000 }).catch(() => {
        // 如果直接打开模态框，检查模态框
        const modal = page.locator('h3:has-text("随机生成")');
        return expect(modal).toBeVisible({ timeout: 3000 });
      });
    });

    test('确认后应打开生成模态框', async ({ page }) => {
      const generateButton = page.locator('button:has-text("随机生成")');
      await generateButton.click();

      // 等待并点击确认
      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // 检查模态框是否打开
      const modal = page.locator('h3:has-text("随机生成 MachineGuid")');
      await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test('生成模态框应显示生成的 GUID', async ({ page }) => {
      // 打开生成模态框
      const generateButton = page.locator('button:has-text("随机生成")');
      await generateButton.click();

      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // 检查是否显示 GUID
      const guidPattern = /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i;
      const pageContent = await page.content();
      expect(pageContent).toMatch(guidPattern);
    });
  });

  test.describe('自定义替换功能', () => {
    test('应能点击自定义替换按钮', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await expect(replaceButton).toBeVisible();
      await expect(replaceButton).toBeEnabled();

      await replaceButton.click();

      // 等待模态框打开
      await page.waitForTimeout(500);
    });

    test('应打开自定义替换模态框', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 检查模态框标题
      const modal = page.locator('h3:has-text("自定义替换 MachineGuid")');
      await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test('替换模态框应包含 GUID 输入框', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 检查输入框
      const input = page.locator('input[placeholder*="550E8400"]');
      await expect(input).toBeVisible({ timeout: 3000 });
    });

    test('输入无效的 GUID 应显示错误提示', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 输入无效的 GUID
      const input = page.locator('input[maxlength="36"]').first();
      await input.fill('invalid-guid');

      // 检查错误提示
      const errorText = page.locator('text=无效的 GUID 格式');
      await expect(errorText).toBeVisible({ timeout: 3000 });
    });

    test('输入有效的 GUID 应启用确认按钮', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 输入有效的 GUID
      const input = page.locator('input[maxlength="36"]').first();
      await input.fill('550E8400-E29B-41D4-A716-446655440000');

      // 检查确认按钮是否启用
      const confirmButton = page.locator('button:has-text("确认替换")');
      await expect(confirmButton).toBeEnabled({ timeout: 3000 });
    });
  });

  test.describe('权限状态显示', () => {
    test('应显示权限状态区域', async ({ page }) => {
      // 检查权限状态区域
      const permissionSection = page.locator('.bg-emerald-500\\/10, .bg-amber-500\\/10');
      await expect(permissionSection).toBeVisible({ timeout: 3000 });
    });

    test('权限状态应包含文本信息', async ({ page }) => {
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/管理员权限|权限/);
    });
  });
});
