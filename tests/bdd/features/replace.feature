Feature: 自定义替换机器码
  作为系统管理员
  我需要输入自定义机器码
  以便使用特定的机器码

  Background:
    Given 应用已初始化
    And 用户具有管理员权限

  Scenario: 输入有效的 GUID
    When 用户打开替换模态框
    And 用户输入有效的 GUID "550E8400-E29B-41D4-A716-446655440000"
    Then 应验证 GUID 格式正确
    And 确认按钮应可用

  Scenario: 输入无效的 GUID
    When 用户打开替换模态框
    And 用户输入无效的 GUID "invalid-guid"
    Then 应显示格式错误提示
    And 确认按钮应禁用

  Scenario: 确认替换
    Given 用户输入了有效的 GUID
    When 用户点击确认替换
    And 用户确认最终操作
    Then 应替换当前机器码
    And 应创建自动备份
    And 应显示替换成功提示

  Scenario: 取消替换操作
    Given 用户打开了替换模态框
    When 用户点击取消按钮
    Then 应关闭替换模态框
    And 不应修改当前机器码

  Scenario: 替换时添加描述
    Given 用户打开了替换模态框
    When 用户输入有效的 GUID
    And 用户输入描述 "自定义替换"
    And 用户点击确认替换
    And 用户确认最终操作
    Then 应替换当前机器码
    And 备份应包含描述 "自定义替换"

  Scenario: 无权限时阻止替换
    Given 用户没有管理员权限
    When 用户尝试打开替换模态框
    Then 应显示权限不足提示
    And 不应打开替换模态框
