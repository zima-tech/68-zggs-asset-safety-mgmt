import { PrismaClient } from "@prisma/client";
import { appMeta, seedInsights, seedRecords } from "../lib/domain";
import { getMockIntegrationHealth } from "../lib/mock-integrations";
import { buildInitialPasswordHash } from "../lib/password";

const prisma = new PrismaClient();

function governanceUsers(now: Date) {
  return [
    {
      username: "admin",
      passwordHash: buildInitialPasswordHash("admin"),
      displayName: "演示管理员",
      department: appMeta.department,
      role: "系统管理员",
      status: "启用",
      lastLoginAt: now,
    },
    {
      username: `${appMeta.seq}-manager`,
      passwordHash: buildInitialPasswordHash(`${appMeta.seq}-manager`),
      displayName: `${appMeta.shortName}负责人`,
      department: appMeta.department,
      role: "业务负责人",
      status: "启用",
      lastLoginAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      username: `${appMeta.seq}-auditor`,
      passwordHash: buildInitialPasswordHash(`${appMeta.seq}-auditor`),
      displayName: "审计复核岗",
      department: appMeta.department,
      role: "审计员",
      status: "停用",
      lastLoginAt: null,
    },
  ];
}

function governanceSettings() {
  return [
    {
      group: "流程设置",
      key: `${appMeta.seq}.sla.hours`,
      label: "高优先级响应时限",
      value: "4",
      valueType: "number",
      enabled: true,
      description: `${appMeta.title}高优先级事项的首次响应时限，单位为小时。`,
      updatedBy: "演示管理员",
    },
    {
      group: "通知设置",
      key: `${appMeta.seq}.notice.owner`,
      label: "责任岗位提醒",
      value: "开启",
      valueType: "select",
      enabled: true,
      description: "状态流转后提醒责任岗位复核处理进度。",
      updatedBy: "演示管理员",
    },
    {
      group: "智能分析",
      key: `${appMeta.seq}.ai.enabled`,
      label: "智能分析工作台",
      value: "开启",
      valueType: "boolean",
      enabled: true,
      description: `允许在${appMeta.aiTitle}中发起业务化智能分析和结果采纳。`,
      updatedBy: "演示管理员",
    },
  ];
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.systemUser.deleteMany();
  await prisma.processEvent.deleteMany();
  await prisma.aiDraft.deleteMany();
  await prisma.integrationLog.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.workItem.deleteMany();

  const now = new Date();
  const createdItems: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    owner: string;
    riskLevel: string;
    sourceBatch: string;
  }> = [];

  for (const record of seedRecords) {
    const item = await prisma.workItem.create({
      data: {
        code: record.code,
        title: record.title,
        category: record.category,
        status: record.status,
        priority: record.priority,
        riskLevel: record.riskLevel,
        owner: record.owner,
        description: record.description,
        source: record.source,
        sourceType: record.sourceType,
        sourceTitle: record.sourceTitle,
        sourceBatch: record.sourceBatch,
        dueDate: new Date(now.getTime() + record.dueDateOffsetDays * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.processEvent.createMany({
      data: [
        {
          itemId: item.id,
          sourceType: item.sourceType,
          sourceTitle: item.sourceTitle,
          action: "初始化导入",
          actor: item.owner,
          content: `来自${item.sourceType}《${item.sourceTitle}》：${item.category}已登记，责任人和处理期限已同步至台账。`,
        },
        {
          itemId: item.id,
          sourceType: item.sourceType,
          sourceTitle: item.sourceTitle,
          action: "智能研判",
          actor: "业务智能分析",
          content: `来自${item.sourceType}《${item.sourceTitle}》：风险等级为 ${item.riskLevel}，已生成跟踪建议。`,
        },
      ],
    });

    createdItems.push({
      id: item.id,
      title: item.title,
      category: item.category,
      status: item.status,
      owner: item.owner,
      riskLevel: item.riskLevel,
      sourceBatch: item.sourceBatch,
    });
  }

  await prisma.insight.createMany({ data: [...seedInsights] });
  await prisma.integrationLog.createMany({ data: getMockIntegrationHealth() });
  await prisma.aiDraft.createMany({
    data: createdItems.slice(0, 3).flatMap((item, index) => {
      const conversationId = `seed-${appMeta.seq}-conversation-${index + 1}`;
      const base = {
        conversationId,
        topic: `${item.title} · ${appMeta.aiExperience.resultType}`.slice(0, 48),
        resultType: appMeta.aiExperience.resultType,
        sourceSummary: `已读取${item.sourceBatch}，当前状态${item.status}，责任岗位${item.owner}。`,
        businessObjectId: item.id,
        businessObjectType: appMeta.sourceObjectName,
        businessObjectTitle: item.title,
        sourceMode: "local",
        saveStatus: index === 0 ? appMeta.aiExperience.savedStatusLabel : "待采纳",
        saveSummary: index === 0 ? appMeta.aiExperience.savedSuccessText : null,
        savedAt: index === 0 ? new Date() : null,
      };

      return [
        {
          ...base,
          turnIndex: 0,
          prompt: appMeta.aiExperience.quickPrompts[index] ?? appMeta.aiPrompt,
          result: [
            `处理对象：${item.title}`,
            `${appMeta.aiExperience.focusAreas[0]}：建议围绕${item.category}先完成原始材料核验和责任边界确认。`,
            `${appMeta.aiExperience.focusAreas[1]}：由${item.owner}牵头推进，保持${item.status}阶段的过程留痕。`,
            `${appMeta.aiExperience.focusAreas[2]}：当前风险等级${item.riskLevel}，建议补充人工复核节点。`,
          ].join("\n"),
          status: index === 0 ? "已保存" : "已形成初稿",
        },
        {
          ...base,
          turnIndex: 1,
          prompt: `请继续补充${appMeta.aiExperience.focusAreas[3]}与后续动作。`,
          result: [
            `后续动作：继续围绕${item.title}完善${appMeta.aiExperience.focusAreas[3]}和${appMeta.aiExperience.focusAreas[4]}。`,
            `执行建议：同步更新台账、时间节点和需协调的岗位，避免会话结果脱离业务对象。`,
            `保存提醒：确认后可直接采纳，刷新页面仍可恢复当前会话。`,
          ].join("\n"),
          status: "已形成初稿",
        },
      ];
    }),
  });

  await prisma.systemUser.createMany({ data: governanceUsers(now) });
  await prisma.systemSetting.createMany({ data: governanceSettings() });
  await prisma.auditLog.createMany({
    data: [
      {
        module: "用户管理",
        action: "初始化用户",
        targetType: "管理用户",
        targetName: `${appMeta.shortName}负责人`,
        result: "成功",
        actor: "演示管理员",
        summary: `${appMeta.department}已初始化业务负责人和审计复核岗。`,
        createdAt: now,
      },
      {
        module: "系统设置",
        action: "初始化设置",
        targetType: "业务参数",
        targetName: "高优先级响应时限",
        result: "成功",
        actor: "演示管理员",
        summary: `${appMeta.title}流程阈值、提醒规则和智能分析开关已就绪。`,
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
