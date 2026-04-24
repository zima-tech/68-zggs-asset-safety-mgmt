"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { signInDemo, signOutDemo } from "@/lib/auth";
import { appMeta } from "@/lib/domain";
import { runGlmAssistant } from "@/lib/ai/glm";
import { getDashboardSnapshot } from "@/lib/service";
import type { DemoLoginInput, DemoLoginResult } from "@/lib/demo-auth-config";
import type { GenerateAiDraftInput, SaveAiDraftInput, SystemSettingInput, SystemUserInput, WorkItemInput } from "@/lib/types";

const statusFlow: string[] = [...appMeta.statuses];

type AuditInput = {
  module: string;
  action: string;
  targetType: string;
  targetName: string;
  result?: string;
  actor?: string;
  summary: string;
};

function nextStatus(current: string) {
  const index = statusFlow.indexOf(current);
  return statusFlow[Math.min(index + 1, statusFlow.length - 1)] ?? current;
}

async function recordAuditLog(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        module: input.module,
        action: input.action,
        targetType: input.targetType,
        targetName: input.targetName,
        result: input.result ?? "成功",
        actor: input.actor ?? "演示管理员",
        summary: input.summary,
      },
    });
  } catch {
    // 审计补写失败不阻断主业务，避免用户重复提交。
  }
}

export async function loginDemoAccount(input: DemoLoginInput): Promise<DemoLoginResult> {
  const ok = await signInDemo(input);
  if (!ok) {
    return { ok: false, message: "用户名或密码错误" };
  }
  await recordAuditLog({
    module: "登录",
    action: "账号登录",
    targetType: "管理后台",
    targetName: appMeta.shortName,
    actor: input.username,
    summary: `${input.username} 登录${appMeta.shortName}。`,
  });
  revalidatePath("/");
  return { ok: true };
}

export async function logoutDemoAccount() {
  await signOutDemo();
  revalidatePath("/");
  return { ok: true };
}

export async function createWorkItem(input: WorkItemInput) {
  const code = `${appMeta.seq}-${Date.now().toString().slice(-6)}`;
  const item = await prisma.workItem.create({
    data: {
      code,
      title: input.title,
      category: input.category,
      status: statusFlow[0] ?? "待处理",
      priority: input.riskLevel === "高" ? "P1" : "P2",
      riskLevel: input.riskLevel,
      owner: input.owner,
      description: input.description,
      source: "控制台录入",
      sourceType: appMeta.sourceObjectName,
      sourceTitle: input.title,
      sourceBatch: "人工登记批次",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.processEvent.create({
    data: {
      itemId: item.id,
      sourceType: item.sourceType,
      sourceTitle: item.sourceTitle,
      action: "新增记录",
      actor: input.owner,
      content: `来自${item.sourceType}《${item.sourceTitle}》：${input.category}已登记，责任人和处理期限已同步至台账。`,
    },
  });

  await recordAuditLog({
    module: "业务台账",
    action: "新增记录",
    targetType: appMeta.sourceObjectName,
    targetName: item.title,
    actor: input.owner,
    summary: `${item.category}已登记并同步责任岗位。`,
  });

  revalidatePath("/");
  return getDashboardSnapshot();
}

export async function advanceWorkItem(id: string) {
  const item = await prisma.workItem.findUniqueOrThrow({ where: { id } });
  const status = nextStatus(item.status);
  await prisma.workItem.update({ where: { id }, data: { status } });
  await prisma.processEvent.create({
    data: {
      itemId: id,
      sourceType: item.sourceType,
      sourceTitle: item.sourceTitle,
      action: "状态流转",
      actor: item.owner,
      content: `来自${item.sourceType}《${item.sourceTitle}》：状态由${item.status}推进至${status}。`,
    },
  });

  await recordAuditLog({
    module: "业务台账",
    action: "状态流转",
    targetType: appMeta.sourceObjectName,
    targetName: item.title,
    actor: item.owner,
    summary: `状态由${item.status}推进至${status}。`,
  });

  revalidatePath("/");
  return getDashboardSnapshot();
}

export async function deleteWorkItem(id: string) {
  const item = await prisma.workItem.findUniqueOrThrow({ where: { id } });
  await prisma.workItem.delete({ where: { id } });
  await recordAuditLog({
    module: "业务台账",
    action: "删除记录",
    targetType: appMeta.sourceObjectName,
    targetName: item.title,
    actor: item.owner,
    summary: `${item.category}记录已删除，关联过程记录同步移除。`,
  });
  revalidatePath("/");
  return getDashboardSnapshot();
}

function buildSourceSummary(item: { sourceBatch: string; status: string; owner: string }) {
  return `已读取${item.sourceBatch}，当前状态${item.status}，责任岗位${item.owner}。`;
}

function buildSaveSummary(result: string) {
  const firstLine = result
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? `${appMeta.aiExperience.savedSuccessText} ${firstLine}`.slice(0, 160) : appMeta.aiExperience.savedSuccessText;
}

export async function generateAiDraft(input: GenerateAiDraftInput) {
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new Error("请先输入需要处理的业务问题");
  }

  try {
    const item = await prisma.workItem.findUnique({
      where: { id: input.businessObjectId },
    });

    if (!item) {
      throw new Error(`未找到关联的${appMeta.sourceObjectName}，请重新选择后再试`);
    }

    const existingTurns = input.conversationId
      ? await prisma.aiDraft.findMany({
          where: { conversationId: input.conversationId },
          orderBy: [{ turnIndex: "asc" }],
        })
      : [];

    const conversationId = input.conversationId || randomUUID();
    const response = await runGlmAssistant({
      prompt,
      item: {
        title: item.title,
        category: item.category,
        status: item.status,
        riskLevel: item.riskLevel,
        owner: item.owner,
        description: item.description,
        sourceBatch: item.sourceBatch,
      },
      history: existingTurns.map((turn) => ({
        prompt: turn.prompt,
        result: turn.result,
      })),
    });

    const turnIndex = existingTurns.length > 0 ? existingTurns[existingTurns.length - 1]!.turnIndex + 1 : 0;
    const topic = existingTurns[0]?.topic ?? response.topic;

    await prisma.aiDraft.create({
      data: {
        conversationId,
        turnIndex,
        topic,
        prompt,
        result: response.result,
        status: response.source === "glm" ? "已生成" : "已形成初稿",
        resultType: appMeta.aiExperience.resultType,
        sourceSummary: buildSourceSummary(item),
        businessObjectId: item.id,
        businessObjectType: appMeta.sourceObjectName,
        businessObjectTitle: item.title,
        sourceMode: response.source,
        saveStatus: "待采纳",
      },
    });

    await prisma.processEvent.create({
      data: {
        itemId: item.id,
        sourceType: item.sourceType,
        sourceTitle: item.sourceTitle,
        action: appMeta.aiExperience.generateEventAction,
        actor: appMeta.shortName,
        content: `来自${item.sourceType}《${item.sourceTitle}》：已生成${appMeta.aiExperience.resultType}，可继续追问或直接采纳。`,
      },
    });

    await recordAuditLog({
      module: appMeta.aiTitle,
      action: appMeta.aiExperience.generateEventAction,
      targetType: appMeta.sourceObjectName,
      targetName: item.title,
      actor: appMeta.shortName,
      summary: response.source === "glm" ? "已完成智能分析并保存会话结果。" : "已基于当前业务数据形成分析初稿。",
    });

    revalidatePath("/");
    return { snapshot: await getDashboardSnapshot(), source: response.source, conversationId };
  } catch {
    throw new Error("本次智能处理未能完成，请稍后重试或更换当前业务对象后再发起。");
  }
}

export async function saveAiDraft(input: SaveAiDraftInput) {
  try {
    const draft = await prisma.aiDraft.findUnique({
      where: { id: input.draftId },
    });

    if (!draft) {
      throw new Error("未找到可采纳的智能结果");
    }

    if (draft.saveStatus === appMeta.aiExperience.savedStatusLabel) {
      return { snapshot: await getDashboardSnapshot(), message: "当前结果已采纳并同步" };
    }

    const item = await prisma.workItem.findUnique({
      where: { id: draft.businessObjectId },
    });

    if (!item) {
      throw new Error(`关联的${appMeta.sourceObjectName}不存在，无法写入当前结果`);
    }

    const next = nextStatus(item.status);
    const summary = buildSaveSummary(draft.result);

    await prisma.$transaction([
      prisma.workItem.update({
        where: { id: item.id },
        data: {
          status: next,
          description: `${item.description}\n${summary}`.slice(0, 500),
        },
      }),
      prisma.aiDraft.update({
        where: { id: draft.id },
        data: {
          status: "已保存",
          saveStatus: appMeta.aiExperience.savedStatusLabel,
          saveSummary: summary,
          savedAt: new Date(),
        },
      }),
      prisma.processEvent.create({
        data: {
          itemId: item.id,
          sourceType: item.sourceType,
          sourceTitle: item.sourceTitle,
          action: appMeta.aiExperience.saveEventAction,
          actor: appMeta.shortName,
          content: `来自${item.sourceType}《${item.sourceTitle}》：${summary}`,
        },
      }),
    ]);

    await recordAuditLog({
      module: appMeta.aiTitle,
      action: appMeta.aiExperience.saveEventAction,
      targetType: appMeta.sourceObjectName,
      targetName: item.title,
      actor: appMeta.shortName,
      summary,
    });

    revalidatePath("/");
    return { snapshot: await getDashboardSnapshot(), message: appMeta.aiExperience.savedSuccessText };
  } catch {
    throw new Error("结果采纳未完成，请稍后重试或先核对当前业务对象。");
  }
}

export async function createSystemUser(input: SystemUserInput) {
  const user = await prisma.systemUser.create({
    data: {
      username: input.username.trim(),
      displayName: input.displayName.trim(),
      department: input.department.trim(),
      role: input.role,
      status: input.status,
      lastLoginAt: null,
    },
  });
  await recordAuditLog({
    module: "用户管理",
    action: "新增用户",
    targetType: "管理用户",
    targetName: user.displayName,
    summary: `${user.displayName}已加入${user.department}，角色为${user.role}。`,
  });
  revalidatePath("/users");
  return getDashboardSnapshot();
}

export async function updateSystemUser(id: string, input: SystemUserInput) {
  const user = await prisma.systemUser.update({
    where: { id },
    data: {
      username: input.username.trim(),
      displayName: input.displayName.trim(),
      department: input.department.trim(),
      role: input.role,
      status: input.status,
    },
  });
  await recordAuditLog({
    module: "用户管理",
    action: "编辑用户",
    targetType: "管理用户",
    targetName: user.displayName,
    summary: `${user.displayName}的部门、角色或状态已更新。`,
  });
  revalidatePath("/users");
  return getDashboardSnapshot();
}

export async function toggleSystemUserStatus(id: string) {
  const user = await prisma.systemUser.findUniqueOrThrow({ where: { id } });
  const status = user.status === "启用" ? "停用" : "启用";
  const next = await prisma.systemUser.update({ where: { id }, data: { status } });
  await recordAuditLog({
    module: "用户管理",
    action: status === "启用" ? "启用用户" : "停用用户",
    targetType: "管理用户",
    targetName: next.displayName,
    summary: `${next.displayName}账号状态已调整为${status}。`,
  });
  revalidatePath("/users");
  return getDashboardSnapshot();
}

export async function updateSystemSetting(id: string, input: SystemSettingInput) {
  const setting = await prisma.systemSetting.update({
    where: { id },
    data: {
      value: input.value.trim(),
      enabled: input.enabled,
      updatedBy: input.updatedBy.trim() || "演示管理员",
    },
  });
  await recordAuditLog({
    module: "系统设置",
    action: "编辑设置",
    targetType: "业务参数",
    targetName: setting.label,
    actor: setting.updatedBy,
    summary: `${setting.group}中的${setting.label}已更新。`,
  });
  revalidatePath("/settings");
  return getDashboardSnapshot();
}

export async function toggleSystemSetting(id: string) {
  const setting = await prisma.systemSetting.findUniqueOrThrow({ where: { id } });
  const next = await prisma.systemSetting.update({
    where: { id },
    data: {
      enabled: !setting.enabled,
      updatedBy: "演示管理员",
    },
  });
  await recordAuditLog({
    module: "系统设置",
    action: next.enabled ? "启用设置" : "停用设置",
    targetType: "业务参数",
    targetName: next.label,
    summary: `${next.label}已${next.enabled ? "启用" : "停用"}。`,
  });
  revalidatePath("/settings");
  return getDashboardSnapshot();
}
