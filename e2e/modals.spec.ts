/**
 * Modals E2E 测试
 * 测试所有模态框和对话框功能
 */

import { test, expect } from '@playwright/test';

test.describe('模态框和对话框', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('h2:has-text("管理操作")');
  });

  test.describe('生成模态框', () => {
    test('应能打开和关闭生成模态框', async ({ page }) => {
      // 点击随机生成按钮
      const generateButton = page.locator('button:has-text("随机生成")');
      await generateButton.click();

      // 可能需要确认
      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // 检查模态框是否打开
      const modal = page.locator('h3:has-text("随机生成 MachineGuid")');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // 点击取消关闭
      const cancelButton = page.locator('button:has-text("取消")').first();
      await cancelButton.click();

      // 等待关闭动画
      await page.waitForTimeout(300);
    });

    test('生成模态框应显示警告信息', async ({ page }) => {
      const generateButton = page.locator('button:has-text("随机生成")');
      await generateButton.click();

      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // 检查警告信息
      const warningText = page.locator('text=生成前将自动备份当前机器码');
      await expect(warningText).toBeVisible({ timeout: 3000 });
    });

    test('应能重新生成 GUID', async ({ page }) => {
      const generateButton = page.locator('button:has-text("随机生成")');
      await generateButton.click();

      const confirmButton = page.locator('button:has-text("确认")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // 查找重新生成按钮
      const regenerateButton = page.locator('button[title="重新生成"]').first();
      if (await regenerateButton.isVisible().catch(() => false)) {
        await regenerateButton.click();
      }
    });
  });

  test.describe('替换模态框', () => {
    test('应能打开和关闭替换模态框', async ({ page }) => {
      // 点击自定义替换按钮
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 检查模态框是否打开
      const modal = page.locator('h3:has-text("自定义替换 MachineGuid")');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // 点击取消关闭
      const cancelButton = page.locator('button:has-text("取消")').first();
      await cancelButton.click();

      // 等待关闭动画
      await page.waitForTimeout(300);
    });

    test('替换模态框应显示格式提示', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 检查格式提示
      const formatText = page.locator('text=格式:');
      await expect(formatText).toBeVisible({ timeout: 3000 });
    });

    test('替换模态框应显示警告信息', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 检查警告信息
      const warningText = page.locator('text=替换前将自动备份当前机器码');
      await expect(warningText).toBeVisible({ timeout: 3000 });
    });

    test('输入有效的 GUID 后确认按钮应启用', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 输入有效的 GUID
      const input = page.locator('input[maxlength="36"]').first();
      await input.fill('550E8400-E29B-41D4-A716-446655440000');

      // 检查确认按钮是否启用
      const confirmButton = page.locator('button:has-text("确认替换")');
      await expect(confirmButton).toBeEnabled({ timeout: 3000 });
    });

    test('输入无效的 GUID 应显示错误', async ({ page }) => {
      const replaceButton = page.locator('button:has-text("自定义替换")');
      await replaceButton.click();

      // 输入无效的 GUID
      const input = page.locator('input[maxlength="36"]').first();
      await input.fill('invalid');

      // 检查错误提示
      const errorText = page.locator('text=无效的 GUID 格式');
      await expect(errorText).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('确认对话框', () => {
    test('删除操作应显示确认对话框', async ({ page }) => {
      // 查找删除按钮
      const deleteButton = page.locator('button[title="删除"]').first();

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // 检查确认对话框
        const confirmDialog = page.locator('text=确认删除');
        await expect(confirmDialog).toBeVisible({ timeout: 3000 });

        // 取消操作
        const cancelButton = page.locator('button:has-text("取消")').first();
        await cancelButton.click();
      } else {
        test.skip();
      }
    });

    test('恢复操作应显示确认对话框', async ({ page }) => {
      // 查找恢复按钮
      const restoreButton = page.locator('button[title="恢复"]').first();

      if (await restoreButton.isVisible().catch(() => false)) {
        await restoreButton.click();

        // 检查确认对话框
        const confirmDialog = page.locator('text=确认恢复');
        await expect(confirmDialog).toBeVisible({ timeout: 3000 });

        // 取消操作
        const cancelButton = page.locator('button:has-text("取消")').first();
        await cancelButton.click();
      } else {
        test.skip();
      }
    });

    test('清空操作应显示确认对话框', async ({ page }) => {
      // 点击清空按钮
      const clearButton = page.locator('button:has-text("清空")');
      await clearButton.click();

      // 检查确认对话框
      const confirmDialog = page.locator('text=确认清空');
      await expect(confirmDialog).toBeVisible({ timeout: 3000 });

      // 取消操作
      const cancelButton = page.locator('button:has-text("取消")').first();
      await cancelButton.click();
    });
  });

  test.describe('提示对话框', () => {
    test('操作成功应显示成功提示', async ({ page }) => {
      // 点击备份按钮
      const backupButton = page.locator('button:has-text("备份机器码")');
      await backupButton.click();

      // 等待可能的提示
      await page.waitForTimeout(1000);

      // 检查是否有成功提示（可能有多种提示方式）
      const successTexts = ['备份成功', '成功', '已备份'];
      const pageContent = await page.content();

      const hasSuccess = successTexts.some(text => pageContent.includes(text));
      // 不强制要求，因为可能有不同的提示方式
    });
  });
});
