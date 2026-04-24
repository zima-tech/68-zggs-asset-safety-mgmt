import { appMeta } from "@/lib/domain";

export type MockAiResponse = {
  topic: string;
  result: string;
};

export async function runLocalAiAssistant(prompt: string): Promise<MockAiResponse> {
  const topic = prompt.trim().slice(0, 48) || appMeta.aiTitle;
  const modules = appMeta.modules.slice(0, 4).join("、");

  return {
    topic,
    result: [
      `研判对象：${topic}`,
      `建议从${modules}四个维度核验，并保留人工确认节点。`,
      "处置流程：先完成信息补录，再触发责任部门复核，最后写入台账形成闭环。",
      "风险提示：若涉及高风险或跨部门事项，应同步生成督办记录和二次提醒。",
    ].join("\n"),
  };
}

export function getMockIntegrationHealth() {
  return appMeta.integrations.map((service, index) => ({
    service,
    status: index === 0 ? "已采集" : index === 1 ? "已校验" : "持续更新",
    batch: `${service}·2026年第${index + 1}批`,
    quality: index === 0 ? "完整率 98%" : index === 1 ? "重复率 1.6%" : "抽检通过",
    detail:
      index === 0
        ? "已完成业务字段核验，支持当前流程办理和统计分析。"
        : "已纳入本地业务台账，责任岗位可直接复核和更新。",
  }));
}
