Feature: 备份管理
  作为系统管理员
  我需要备份和恢复机器码
  以便在修改后能够回滚

  Background:
    Given 应用已初始化
    And 用户具有管理员权限

  Scenario: 创建手动备份
    Given 当前机器码已显示
    When 用户点击备份按钮
    Then 应创建新的备份
    And 备份应出现在备份列表中
    And 应显示备份成功提示

  Scenario: 跳过重复备份
    Given 当前机器码已显示
    And 已存在相同机器码的备份
    When 用户点击备份按钮
    Then 应跳过备份创建
    And 应显示已跳过提示

  Scenario: 恢复备份
    Given 存在至少一个备份
    When 用户选择一个备份
    And 用户点击恢复按钮
    And 用户确认恢复操作
    Then 应恢复选中的机器码
    And 应创建恢复前的自动备份
    And 应显示恢复成功提示

  Scenario: 删除备份
    Given 存在至少一个备份
    When 用户选择一个备份
    And 用户点击删除按钮
    And 用户确认删除操作
    Then 应从备份列表中移除该备份
    And 应显示删除成功提示

  Scenario: 清空所有备份
    Given 存在多个备份
    When 用户点击清空按钮
    And 用户确认清空操作
    Then 应删除所有备份
    And 备份列表应为空
    And 应显示清空成功提示

  Scenario: 复制备份的 GUID
    Given 存在至少一个备份
    When 用户点击备份的复制按钮
    Then 该备份的 GUID 应被复制到剪贴板
    And 应显示复制成功提示
