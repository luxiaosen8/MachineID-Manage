/**
 * GUID 测试数据
 * 用于数据驱动测试
 */

export interface GuidTestCase {
  value: string;
  description: string;
  expectedValid: boolean;
  expectedError?: string;
}

/**
 * 有效的 GUID 测试用例
 */
export const validGuidTestCases: GuidTestCase[] = [
  {
    value: '550E8400-E29B-41D4-A716-446655440000',
    description: '标准格式大写',
    expectedValid: true,
  },
  {
    value: '550e8400-e29b-41d4-a716-446655440000',
    description: '标准格式小写',
    expectedValid: true,
  },
  {
    value: '00000000-0000-0000-0000-000000000000',
    description: '全零GUID',
    expectedValid: true,
  },
  {
    value: 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
    description: '全F GUID',
    expectedValid: true,
  },
  {
    value: '12345678-1234-1234-1234-123456789012',
    description: '数字GUID',
    expectedValid: true,
  },
  {
    value: 'A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D',
    description: '混合字符GUID',
    expectedValid: true,
  },
  {
    value: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    description: '小写混合字符GUID',
    expectedValid: true,
  },
];

/**
 * 无效的 GUID 测试用例
 */
export const invalidGuidTestCases: GuidTestCase[] = [
  {
    value: '',
    description: '空字符串',
    expectedValid: false,
    expectedError: 'GUID 不能为空',
  },
  {
    value: '   ',
    description: '空白字符串',
    expectedValid: false,
    expectedError: 'GUID 不能为空',
  },
  {
    value: 'invalid',
    description: '无效字符串',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400-E29B-41D4-A716',
    description: '长度不足',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400-E29B-41D4-A716-44665544000G',
    description: '包含非法字符G',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400E29B41D4A716446655440000',
    description: '缺少分隔符',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400-E29B-41D4-A716-44665544000',
    description: '长度不足1位',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400-E29B-41D4-A716-4466554400000',
    description: '长度超出1位',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400-E29B-41D4-A716-44665544000!',
    description: '包含特殊字符',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
  {
    value: '550E8400_E29B_41D4_A716_446655440000',
    description: '使用下划线分隔',
    expectedValid: false,
    expectedError: '无效的 GUID 格式',
  },
];

/**
 * 所有 GUID 测试用例
 */
export const allGuidTestCases: GuidTestCase[] = [
  ...validGuidTestCases,
  ...invalidGuidTestCases,
];
