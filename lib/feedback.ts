export function createFeedback(category: string) {
  return `${category}已登记，责任人和处理期限已同步至台账`;
}

export function advanceFeedback(status: string) {
  return `事项已推进至${status}，过程记录已更新`;
}

export function deleteFeedback(category: string) {
  return `${category}记录已删除，相关统计已刷新`;
}

export function aiFeedback(source: "glm" | "local") {
  return source === "glm" ? "智能结果已生成，可继续追问或直接采纳" : "业务初稿已生成，可补充追问后再采纳";
}
