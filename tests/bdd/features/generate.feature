Feature: 生成随机机器码
  作为系统管理员
  我需要生成随机机器码
  以便快速更换机器码

  Background:
    Given 应用已初始化
    And 用户具有管理员权限

  Scenario: 生成随机 GUID
    When 用户打开生成模态框
    Then 应显示随机生成的 GUID
    And GUID 格式应正确

  Scenario: 重新生成 GUID
    Given 生成模态框已打开
    When 用户点击重新生成按钮
    Then 应生成新的随机 GUID
    And 新 GUID 应与之前不同

  Scenario: 确认生成并替换
    Given 生成模态框已打开
    And 已显示随机生成的 GUID
    When 用户点击确认替换
    And 用户确认最终操作
    Then 应替换当前机器码
    And 应创建自动备份
    And 应显示替换成功提示

  Scenario: 取消生成操作
    Given 生成模态框已打开
    When 用户点击取消按钮
    Then 应关闭生成模态框
    And 不应修改当前机器码

  Scenario: 添加描述生成
    Given 生成模态框已打开
    When 用户输入描述 "测试生成"
    And 用户点击确认替换
    And 用户确认最终操作
    Then 应替换当前机器码
    And 备份应包含描述 "测试生成"
