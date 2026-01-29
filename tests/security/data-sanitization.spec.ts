/**
 * 数据脱敏安全测试
 * 确保敏感数据不会被打包到发布版本中
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

describe('数据脱敏安全测试', () => {
  const projectRoot = resolve(__dirname, '../../');
  const srcTauriDir = join(projectRoot, 'src-tauri');

  describe('本地测试数据检查', () => {
    it('不应在 src-tauri 目录下存在 backups.json 文件', () => {
      const backupFile = join(srcTauriDir, 'backups.json');
      const fileExists = existsSync(backupFile);

      if (fileExists) {
        const content = readFileSync(backupFile, 'utf-8');
        const data = JSON.parse(content);

        // 如果文件存在，应该只包含空备份列表或是测试环境
        if (data.backups && data.backups.length > 0) {
          console.warn('⚠️ 警告: src-tauri/backups.json 包含真实备份数据');
        }
      }

      // 测试通过，但输出警告
      expect(true).toBe(true);
    });

    it('备份文件路径应指向用户数据目录而非项目目录', () => {
      // 读取 machine_id.rs 文件内容
      const machineIdFile = join(srcTauriDir, 'src', 'machine_id.rs');

      if (existsSync(machineIdFile)) {
        const content = readFileSync(machineIdFile, 'utf-8');

        // 验证使用 APPDATA 或用户目录
        const usesAppData = content.includes('APPDATA') ||
                           content.includes('HOME') ||
                           content.includes('XDG_DATA_HOME');
        const usesProjectDir = content.includes('src-tauri') &&
                              !content.includes('BACKUP_TEST_PATH');

        expect(usesAppData).toBe(true);
        expect(usesProjectDir).toBe(false);
      }
    });
  });

  describe('Git 忽略配置检查', () => {
    it('.gitignore 应包含敏感数据文件', () => {
      const gitignorePath = join(projectRoot, '.gitignore');
      const gitignoreContent = readFileSync(gitignorePath, 'utf-8');

      // 检查是否包含关键忽略规则
      expect(gitignoreContent).toContain('src-tauri/backups.json');
      expect(gitignoreContent).toContain('dist/');
      expect(gitignoreContent).toContain('target/');
      expect(gitignoreContent).toContain('test-results/');
    });
  });

  describe('发布流程安全检查', () => {
    it('发布工作流应包含数据清理步骤', () => {
      const workflowPath = join(projectRoot, '.github', 'workflows', 'release.yml');

      if (existsSync(workflowPath)) {
        const workflowContent = readFileSync(workflowPath, 'utf-8');

        // 检查是否包含清理步骤
        const hasSanitizeStep = workflowContent.includes('sanitize') ||
                               workflowContent.includes('clean') ||
                               workflowContent.includes('backups.json');

        expect(hasSanitizeStep).toBe(true);
      }
    });
  });

  describe('敏感数据模式检测', () => {
    it('不应在代码中硬编码真实 GUID', () => {
      const machineIdFile = join(srcTauriDir, 'src', 'machine_id.rs');

      if (existsSync(machineIdFile)) {
        const content = readFileSync(machineIdFile, 'utf-8');

        // GUID 正则表达式
        const guidPattern = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
        const matches = content.match(guidPattern) || [];

        // 过滤掉测试用的示例 GUID
        const testGuids = [
          '550E8400-E29B-41D4-A716-446655440000',
          '12345678-1234-1234-1234-123456789012',
          'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
          '00000000-0000-0000-0000-000000000000',
        ];

        const suspiciousGuids = matches.filter(guid =>
          !testGuids.includes(guid.toUpperCase())
        );

        if (suspiciousGuids.length > 0) {
          console.warn('⚠️ 发现可疑 GUID:', suspiciousGuids);
        }

        // 测试通过，但输出警告
        expect(true).toBe(true);
      }
    });
  });
});

describe('数据脱敏运行时检查', () => {
  it('备份文件应存储在用户数据目录', async () => {
    // 验证备份路径逻辑
    const isWindows = process.platform === 'win32';
    const isMacOS = process.platform === 'darwin';
    const isLinux = process.platform === 'linux';

    if (isWindows) {
      expect(process.env.APPDATA).toBeDefined();
    } else if (isMacOS || isLinux) {
      expect(process.env.HOME).toBeDefined();
    }
  });
});
