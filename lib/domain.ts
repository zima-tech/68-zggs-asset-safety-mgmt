import type { AnalysisView, ConsoleRoute, DashboardSnapshot, RouteMetric, WorkspaceView, WorkItemInput } from "@/lib/types";

export const appMeta = {
  "seq": "68",
  "title": "资产安全管理",
  "department": "资管公司",
  "shortName": "资产安全驾驶舱",
  "description": "围绕租户安全档案、风险分析、巡检留痕、访客管理和决策支撑的全过程安全管理平台。",
  "modules": [
    "租户档案",
    "安全风险",
    "巡检留痕",
    "访客管理",
    "整改闭环",
    "决策支撑"
  ],
  "statuses": [
    "待巡检",
    "整改中",
    "复核中",
    "已闭环"
  ],
  "aiTitle": "风险研判助手",
  "aiPrompt": "请结合租户档案和巡检记录研判安全风险，并生成整改建议。",
  "integrations": [
    "门禁访客记录",
    "巡检上报批次",
    "租赁合同台账",
    "风险评估规则库"
  ],
  "sourceObjectName": "租户资产",
  "dataSourceTitle": "安全巡检批次",
  "aiExperience": {
    "panelTag": "巡检隐患 / 风险分级 / 整改闭环",
    "objectLabel": "当前租户资产",
    "emptyTitle": "请选择租户资产后发起风险研判",
    "emptyDescription": "系统会结合租户档案、巡检留痕和访客异常，输出风险等级、整改措施、复核重点和闭环建议。",
    "resultType": "安全整改方案",
    "savedStatusLabel": "已采纳",
    "saveActionLabel": "采纳整改建议",
    "saveEventAction": "采纳整改建议",
    "generateEventAction": "生成风险研判",
    "savedSuccessText": "风险分级、整改措施和复核重点已写入当前租户资产。",
    "stepTitles": [
      "读取租户档案与巡检记录",
      "核验隐患等级和访客异常",
      "形成整改措施与复核要求",
      "等待采纳并写入闭环留痕"
    ],
    "focusAreas": [
      "租户档案",
      "巡检隐患",
      "访客异常",
      "风险等级",
      "整改措施",
      "闭环复核"
    ],
    "quickPrompts": [
      "请研判当前隐患等级，并说明需要立即整改的三项问题。",
      "请结合访客异常给出复核重点和责任岗位安排。",
      "请生成整改闭环建议，明确整改期限和复查节点。"
    ],
    "resultFields": [
      { "label": "资产模块", "source": "category" },
      { "label": "责任岗位", "source": "owner" },
      { "label": "风险等级", "source": "riskLevel" },
      { "label": "整改摘要", "source": "summary" }
    ]
  },
  "prd": "68_资管公司_资产安全管理_PRD.md",
  "demand": "68_资管公司_资产安全管理_需求文档.md"
} as const;

export const seedRecords = [
  {
    "code": "AS-2026-001",
    "title": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-001",
    "category": "租户档案",
    "status": "待巡检",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "业务受理岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于租户档案模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-001",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 2
  },
  {
    "code": "AS-2026-002",
    "title": "安全风险-写字楼夜间访客异常聚集-002",
    "category": "安全风险",
    "status": "整改中",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "风险研判岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于安全风险模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "安全风险-写字楼夜间访客异常聚集-002",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 3
  },
  {
    "code": "AS-2026-003",
    "title": "巡检留痕-消防通道占用复查-003",
    "category": "巡检留痕",
    "status": "复核中",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "台账复核岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于巡检留痕模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "巡检留痕-消防通道占用复查-003",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 4
  },
  {
    "code": "AS-2026-004",
    "title": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-004",
    "category": "访客管理",
    "status": "已闭环",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "部门负责人",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于访客管理模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-004",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 5
  },
  {
    "code": "AS-2026-005",
    "title": "整改闭环-写字楼夜间访客异常聚集-005",
    "category": "整改闭环",
    "status": "待巡检",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "专项工作组",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于整改闭环模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "整改闭环-写字楼夜间访客异常聚集-005",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 6
  },
  {
    "code": "AS-2026-006",
    "title": "决策支撑-消防通道占用复查-006",
    "category": "决策支撑",
    "status": "整改中",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "数据分析岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于决策支撑模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "决策支撑-消防通道占用复查-006",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 7
  },
  {
    "code": "AS-2026-007",
    "title": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-007",
    "category": "租户档案",
    "status": "复核中",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "归档管理岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于租户档案模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-007",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 8
  },
  {
    "code": "AS-2026-008",
    "title": "安全风险-写字楼夜间访客异常聚集-008",
    "category": "安全风险",
    "status": "已闭环",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "运营协调岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于安全风险模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "安全风险-写字楼夜间访客异常聚集-008",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 9
  },
  {
    "code": "AS-2026-009",
    "title": "巡检留痕-消防通道占用复查-009",
    "category": "巡检留痕",
    "status": "待巡检",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "业务受理岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于巡检留痕模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "巡检留痕-消防通道占用复查-009",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 10
  },
  {
    "code": "AS-2026-010",
    "title": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-010",
    "category": "访客管理",
    "status": "整改中",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "风险研判岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于访客管理模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-010",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 11
  },
  {
    "code": "AS-2026-011",
    "title": "整改闭环-写字楼夜间访客异常聚集-011",
    "category": "整改闭环",
    "status": "复核中",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "台账复核岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于整改闭环模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "整改闭环-写字楼夜间访客异常聚集-011",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 12
  },
  {
    "code": "AS-2026-012",
    "title": "决策支撑-消防通道占用复查-012",
    "category": "决策支撑",
    "status": "已闭环",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "部门负责人",
    "description": "已完成复查照片上传和责任人确认。 本记录用于决策支撑模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "决策支撑-消防通道占用复查-012",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 13
  },
  {
    "code": "AS-2026-013",
    "title": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-013",
    "category": "租户档案",
    "status": "待巡检",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "专项工作组",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于租户档案模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-013",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 14
  },
  {
    "code": "AS-2026-014",
    "title": "安全风险-写字楼夜间访客异常聚集-014",
    "category": "安全风险",
    "status": "整改中",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "数据分析岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于安全风险模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "安全风险-写字楼夜间访客异常聚集-014",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 15
  },
  {
    "code": "AS-2026-015",
    "title": "巡检留痕-消防通道占用复查-015",
    "category": "巡检留痕",
    "status": "复核中",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "归档管理岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于巡检留痕模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "巡检留痕-消防通道占用复查-015",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 16
  },
  {
    "code": "AS-2026-016",
    "title": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-016",
    "category": "访客管理",
    "status": "已闭环",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "运营协调岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于访客管理模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-016",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 17
  },
  {
    "code": "AS-2026-017",
    "title": "整改闭环-写字楼夜间访客异常聚集-017",
    "category": "整改闭环",
    "status": "待巡检",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "业务受理岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于整改闭环模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "整改闭环-写字楼夜间访客异常聚集-017",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 18
  },
  {
    "code": "AS-2026-018",
    "title": "决策支撑-消防通道占用复查-018",
    "category": "决策支撑",
    "status": "整改中",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "风险研判岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于决策支撑模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "决策支撑-消防通道占用复查-018",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 19
  },
  {
    "code": "AS-2026-019",
    "title": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-019",
    "category": "租户档案",
    "status": "复核中",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "台账复核岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于租户档案模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-019",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 2
  },
  {
    "code": "AS-2026-020",
    "title": "安全风险-写字楼夜间访客异常聚集-020",
    "category": "安全风险",
    "status": "已闭环",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "部门负责人",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于安全风险模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "安全风险-写字楼夜间访客异常聚集-020",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 3
  },
  {
    "code": "AS-2026-021",
    "title": "巡检留痕-消防通道占用复查-021",
    "category": "巡检留痕",
    "status": "待巡检",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "专项工作组",
    "description": "已完成复查照片上传和责任人确认。 本记录用于巡检留痕模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "巡检留痕-消防通道占用复查-021",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 4
  },
  {
    "code": "AS-2026-022",
    "title": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-022",
    "category": "访客管理",
    "status": "整改中",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "数据分析岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于访客管理模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-022",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 5
  },
  {
    "code": "AS-2026-023",
    "title": "整改闭环-写字楼夜间访客异常聚集-023",
    "category": "整改闭环",
    "status": "复核中",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "归档管理岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于整改闭环模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "整改闭环-写字楼夜间访客异常聚集-023",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 6
  },
  {
    "code": "AS-2026-024",
    "title": "决策支撑-消防通道占用复查-024",
    "category": "决策支撑",
    "status": "已闭环",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "运营协调岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于决策支撑模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "决策支撑-消防通道占用复查-024",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 7
  },
  {
    "code": "AS-2026-025",
    "title": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-025",
    "category": "租户档案",
    "status": "待巡检",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "业务受理岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于租户档案模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-025",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 8
  },
  {
    "code": "AS-2026-026",
    "title": "安全风险-写字楼夜间访客异常聚集-026",
    "category": "安全风险",
    "status": "整改中",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "风险研判岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于安全风险模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "安全风险-写字楼夜间访客异常聚集-026",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 9
  },
  {
    "code": "AS-2026-027",
    "title": "巡检留痕-消防通道占用复查-027",
    "category": "巡检留痕",
    "status": "复核中",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "台账复核岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于巡检留痕模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "巡检留痕-消防通道占用复查-027",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 10
  },
  {
    "code": "AS-2026-028",
    "title": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-028",
    "category": "访客管理",
    "status": "已闭环",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "部门负责人",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于访客管理模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-028",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 11
  },
  {
    "code": "AS-2026-029",
    "title": "整改闭环-写字楼夜间访客异常聚集-029",
    "category": "整改闭环",
    "status": "待巡检",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "专项工作组",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于整改闭环模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "整改闭环-写字楼夜间访客异常聚集-029",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 12
  },
  {
    "code": "AS-2026-030",
    "title": "决策支撑-消防通道占用复查-030",
    "category": "决策支撑",
    "status": "整改中",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "数据分析岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于决策支撑模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "决策支撑-消防通道占用复查-030",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 13
  },
  {
    "code": "AS-2026-031",
    "title": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-031",
    "category": "租户档案",
    "status": "复核中",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "归档管理岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于租户档案模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "租户档案-云锦产业园 A3 栋餐饮租户燃气隐患-031",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 14
  },
  {
    "code": "AS-2026-032",
    "title": "安全风险-写字楼夜间访客异常聚集-032",
    "category": "安全风险",
    "status": "已闭环",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "运营协调岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于安全风险模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "安全风险-写字楼夜间访客异常聚集-032",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 15
  },
  {
    "code": "AS-2026-033",
    "title": "巡检留痕-消防通道占用复查-033",
    "category": "巡检留痕",
    "status": "待巡检",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "业务受理岗",
    "description": "已完成复查照片上传和责任人确认。 本记录用于巡检留痕模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "门禁访客记录",
    "sourceType": "租户资产",
    "sourceTitle": "巡检留痕-消防通道占用复查-033",
    "sourceBatch": "门禁访客记录·2026年第1批",
    "dueDateOffsetDays": 16
  },
  {
    "code": "AS-2026-034",
    "title": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-034",
    "category": "访客管理",
    "status": "整改中",
    "priority": "P2",
    "riskLevel": "中",
    "owner": "风险研判岗",
    "description": "现场发现软管老化和报警器离线，已下发整改通知。 本记录用于访客管理模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "巡检上报批次",
    "sourceType": "租户资产",
    "sourceTitle": "访客管理-云锦产业园 A3 栋餐饮租户燃气隐患-034",
    "sourceBatch": "巡检上报批次·2026年第2批",
    "dueDateOffsetDays": 17
  },
  {
    "code": "AS-2026-035",
    "title": "整改闭环-写字楼夜间访客异常聚集-035",
    "category": "整改闭环",
    "status": "复核中",
    "priority": "P1",
    "riskLevel": "高",
    "owner": "台账复核岗",
    "description": "门禁记录显示非工作时段访客频次升高，需核验租户报备。 本记录用于整改闭环模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "租赁合同台账",
    "sourceType": "租户资产",
    "sourceTitle": "整改闭环-写字楼夜间访客异常聚集-035",
    "sourceBatch": "租赁合同台账·2026年第3批",
    "dueDateOffsetDays": 18
  },
  {
    "code": "AS-2026-036",
    "title": "决策支撑-消防通道占用复查-036",
    "category": "决策支撑",
    "status": "已闭环",
    "priority": "P3",
    "riskLevel": "低",
    "owner": "部门负责人",
    "description": "已完成复查照片上传和责任人确认。 本记录用于决策支撑模块演示，已补充来源批次、责任岗位、办理期限和处理留痕。",
    "source": "风险评估规则库",
    "sourceType": "租户资产",
    "sourceTitle": "决策支撑-消防通道占用复查-036",
    "sourceBatch": "风险评估规则库·2026年第4批",
    "dueDateOffsetDays": 19
  }
] as const;

export const seedInsights = [
  {
    "title": "高风险租户 8 家，集中在餐饮和仓储业态",
    "value": "86%",
    "trend": "up",
    "level": "success"
  },
  {
    "title": "本月整改闭环率 86%",
    "value": "24",
    "trend": "steady",
    "level": "warning"
  },
  {
    "title": "访客异常预警较上周下降 11%",
    "value": "4.6h",
    "trend": "down",
    "level": "processing"
  }
] as const;

export const consoleRoutes: ConsoleRoute[] = [
  { key: "dashboard", slug: "dashboard", path: "/dashboard", title: "安全管理首页", description: "查看安全态势、预警和整改动态。", kind: "dashboard" },
  { key: "tenants", slug: "tenants", path: "/tenants", title: "租户管理", description: "维护租户档案并补录安全风险评估信息。", kind: "workspace" },
  { key: "inspections", slug: "inspections", path: "/inspections", title: "安全巡检", description: "跟踪巡检任务、整改动作和闭环进度。", kind: "workspace" },
  { key: "analysis", slug: "analysis", path: "/analysis", title: "访客与决策", description: "查看访客异常、决策支撑和风险复盘。", kind: "analysis" },
  {
    key: "user-management",
    slug: "users",
    path: "/users",
    title: "用户管理",
    description: "维护后台用户、部门角色和账号状态。",
    kind: "users",
  },
  {
    key: "audit-logs",
    slug: "audit-logs",
    path: "/audit-logs",
    title: "日志审计",
    description: "查看业务操作、设置变更和智能分析留痕。",
    kind: "auditLogs",
  },
  {
    key: "system-settings",
    slug: "settings",
    path: "/settings",
    title: "系统设置",
    description: "维护流程阈值、通知偏好和智能分析开关。",
    kind: "settings",
  },
  { key: "assistant", slug: "assistant", path: "/assistant", title: appMeta.aiTitle, description: "基于租户档案和巡检记录生成整改建议。", kind: "assistant" },
] as const;

const workspaceFieldMap = {
  tenants: [
    { key: "tenantName", label: "租户名称", placeholder: "例如：云锦产业园 A3 栋餐饮租户", required: true },
    { key: "room", label: "房间/区域", placeholder: "例如：A3 栋 302", required: true },
    { key: "ownerUnit", label: "责任岗位", placeholder: "例如：园区安全岗", required: true },
    { key: "riskLevel", label: "风险等级", type: "select", options: ["高", "中", "低"], required: true },
    { key: "description", label: "档案说明", type: "textarea", placeholder: "补充入住情况、风险因素和整改建议", required: true },
  ],
  inspections: [
    { key: "title", label: "巡检任务", placeholder: "例如：消防通道占用复查", required: true },
    { key: "owner", label: "责任岗位", placeholder: "例如：安全巡检组", required: true },
    { key: "riskLevel", label: "隐患等级", type: "select", options: ["高", "中", "低"], required: true },
    { key: "description", label: "巡检说明", type: "textarea", placeholder: "填写隐患表现、证据链和整改时限", required: true },
  ],
} as const;

function routeMetrics(snapshot: DashboardSnapshot, rows = snapshot.items): RouteMetric[] {
  const finalStatus = appMeta.statuses.at(-1);
  return [
    { label: "当前事项", value: rows.length, helper: "当前页展示的租户/巡检记录" },
    { label: "高风险", value: rows.filter((item) => item.riskLevel === "高").length, helper: "需优先核查的安全隐患", tone: "danger" },
    { label: "未闭环", value: rows.filter((item) => item.status !== finalStatus).length, helper: "仍在整改或复核中的记录", tone: "warning" },
    { label: "已闭环", value: rows.filter((item) => item.status === finalStatus).length, helper: "已完成整改的记录", tone: "success" },
  ];
}

function sortedRows(rows: DashboardSnapshot["items"]) {
  return rows.slice().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function byCategories(snapshot: DashboardSnapshot, categories: string[]) {
  return sortedRows(snapshot.items.filter((item) => categories.includes(item.category)));
}

export function getRouteBySlug(slug?: string) {
  return consoleRoutes.find((route) => route.slug === (slug?.trim() || "dashboard"));
}

export function getRouteByKey(key: string) {
  return consoleRoutes.find((route) => route.key === key);
}

export function buildWorkItemInput(routeKey: string, values: Record<string, string>): WorkItemInput {
  if (routeKey === "tenants") {
    return {
      title: `${values.tenantName?.trim() || "未命名租户"}-${values.room?.trim() || "未登记区域"}`,
      category: "租户档案",
      owner: values.ownerUnit?.trim() || "园区安全岗",
      riskLevel: values.riskLevel || "中",
      description: values.description?.trim() || "已登记租户安全档案。",
    };
  }

  return {
    title: values.title?.trim() || "待处理巡检任务",
    category: "巡检留痕",
    owner: values.owner?.trim() || "安全巡检组",
    riskLevel: values.riskLevel || "中",
    description: values.description?.trim() || "待补充巡检说明。",
  };
}

export function getWorkspaceView(routeKey: string, snapshot: DashboardSnapshot): WorkspaceView {
  if (routeKey === "tenants") {
    const rows = byCategories(snapshot, ["租户档案", "安全风险", "访客管理"]).slice(0, 10);
    return {
      title: "租户管理",
      description: "集中维护租户档案、风险评估和访客异常信息。",
      metrics: routeMetrics(snapshot, rows),
      formTitle: "新增租户档案",
      submitLabel: "保存档案并纳入安全视图",
      fields: [...workspaceFieldMap.tenants],
      columns: [
        { key: "code", label: "档案编号", width: 140 },
        { key: "title", label: "租户/区域", width: 280, kind: "summary" },
        { key: "category", label: "档案模块", width: 120, kind: "tag" },
        { key: "status", label: "当前状态", width: 120, kind: "badge" },
        { key: "riskLevel", label: "风险等级", width: 100, kind: "tag" },
        { key: "owner", label: "责任岗位", width: 140 },
        { key: "sourceBatch", label: "来源批次", width: 180 },
      ],
      rows,
      emptyDescription: "暂无租户安全档案，可通过上方表单新增。",
      actions: [{ key: "advance", label: "推进核查", disabledWhenFinal: true }],
    };
  }

  const rows = byCategories(snapshot, ["巡检留痕", "整改闭环", "决策支撑"]).slice(0, 12);
  return {
    title: "安全巡检",
    description: "围绕巡检任务、整改动作和闭环复核推进全过程留痕。",
    metrics: routeMetrics(snapshot, rows),
    formTitle: "新增巡检任务",
    submitLabel: "创建巡检任务",
    fields: [...workspaceFieldMap.inspections],
    columns: [
      { key: "code", label: "巡检编号", width: 140 },
      { key: "title", label: "巡检事项", width: 280, kind: "summary" },
      { key: "category", label: "任务模块", width: 120, kind: "tag" },
      { key: "status", label: "整改阶段", width: 120, kind: "badge" },
      { key: "riskLevel", label: "隐患等级", width: 100, kind: "tag" },
      { key: "owner", label: "责任岗位", width: 140 },
      { key: "sourceBatch", label: "巡检批次", width: 180 },
    ],
    rows,
    emptyDescription: "暂无巡检任务，请先登记巡检记录。",
    actions: [
      { key: "advance", label: "推进整改", disabledWhenFinal: true },
      { key: "delete", label: "删除", danger: true, confirmTitle: "确认删除该巡检任务？", confirmText: "删除后将同步移除整改留痕，请确认无需继续处理。" },
    ],
  };
}

export function getAnalysisView(snapshot: DashboardSnapshot): AnalysisView {
  return {
    title: "访客与决策",
    description: "复盘访客异常、租户风险和整改闭环效果。",
    metrics: routeMetrics(snapshot),
    highlights: [
      "餐饮、仓储等业态应持续关注消防和燃气隐患。",
      "非工作时段访客聚集是当前重点异常类型，需要结合门禁记录复核。",
      "整改闭环率提升依赖现场复查、证据上传和责任人签收同步推进。",
    ],
    tables: [
      {
        title: "近期重点事项",
        columns: [{ key: "title", label: "事项" }, { key: "level", label: "风险等级" }, { key: "owner", label: "责任岗位" }],
        rows: snapshot.items.slice(0, 6).map((item) => ({ title: item.title, level: item.riskLevel, owner: item.owner })),
      },
      {
        title: "流程留痕",
        columns: [{ key: "action", label: "动作" }, { key: "content", label: "处理内容" }, { key: "actor", label: "执行岗位" }],
        rows: snapshot.events.slice(0, 6).map((event) => ({ action: event.action, content: event.content, actor: event.actor })),
      },
    ],
  };
}
