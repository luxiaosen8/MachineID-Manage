Feature: 机器码管理
  作为系统管理员
  我需要管理 Windows 机器码
  以便在需要时修改或恢复机器码

  Background:
    Given 应用已初始化
    And 已获取当前机器码

  Scenario: 查看当前机器码
    When 用户打开应用
    Then 应显示当前 MachineGuid
    And 应显示机器码来源

  Scenario: 复制机器码到剪贴板
    Given 当前机器码已显示
    When 用户点击复制按钮
    Then 机器码应被复制到剪贴板
    And 应显示复制成功提示

  Scenario: 刷新机器码显示
    Given 当前机器码已显示
    When 用户点击刷新按钮
    Then 应重新读取机器码
    And 应更新显示内容

  Scenario: 无权限时显示警告
    Given 用户没有管理员权限
    When 应用初始化完成
    Then 应显示权限不足警告
    And 应禁用修改操作按钮

  Scenario: 有权限时启用操作
    Given 用户具有管理员权限
    When 应用初始化完成
    Then 应启用修改操作按钮
    And 不应显示权限警告
