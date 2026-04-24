export type WorkItemView = {
  id: string;
  code: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  riskLevel: string;
  owner: string;
  description: string;
  source: string | null;
  sourceType: string;
  sourceTitle: string;
  sourceBatch: string;
  dueDate: string | null;
  updatedAt: string;
};

export type ProcessEventView = {
  id: string;
  itemId: string;
  sourceType: string;
  sourceTitle: string;
  action: string;
  actor: string;
  content: string;
  createdAt: string;
};

export type InsightView = {
  id: string;
  title: string;
  value: string;
  trend: string;
  level: string;
};

export type IntegrationLogView = {
  id: string;
  service: string;
  status: string;
  batch: string;
  quality: string;
  detail: string;
  createdAt: string;
};

export type AiDraftView = {
  id: string;
  conversationId: string;
  turnIndex: number;
  topic: string;
  prompt: string;
  result: string;
  status: string;
  resultType: string;
  sourceSummary: string;
  businessObjectId: string;
  businessObjectType: string;
  businessObjectTitle: string;
  sourceMode: "glm" | "local";
  saveStatus: string;
  saveSummary: string | null;
  savedAt: string | null;
  createdAt: string;
};

export type AiConversationView = {
  id: string;
  topic: string;
  businessObjectId: string;
  businessObjectType: string;
  businessObjectTitle: string;
  resultType: string;
  sourceSummary: string;
  latestStatus: string;
  saveStatus: string;
  lastPrompt: string;
  turnCount: number;
  updatedAt: string;
};

export type SystemUserView = {
  id: string;
  username: string;
  displayName: string;
  department: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogView = {
  id: string;
  module: string;
  action: string;
  targetType: string;
  targetName: string;
  result: string;
  actor: string;
  summary: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type SystemSettingView = {
  id: string;
  group: string;
  key: string;
  label: string;
  value: string;
  valueType: string;
  enabled: boolean;
  description: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSnapshot = {
  items: WorkItemView[];
  events: ProcessEventView[];
  insights: InsightView[];
  integrations: IntegrationLogView[];
  aiDrafts: AiDraftView[];
  aiConversations: AiConversationView[];
  systemUsers: SystemUserView[];
  auditLogs: AuditLogView[];
  systemSettings: SystemSettingView[];
};

export type WorkItemInput = {
  title: string;
  category: string;
  owner: string;
  riskLevel: string;
  description: string;
};

export type SystemUserInput = {
  username: string;
  displayName: string;
  department: string;
  role: string;
  status: string;
};

export type SystemSettingInput = {
  value: string;
  enabled: boolean;
  updatedBy: string;
};

export type GenerateAiDraftInput = {
  prompt: string;
  businessObjectId: string;
  conversationId?: string | null;
};

export type SaveAiDraftInput = {
  draftId: string;
};

export type ConsoleRouteKind = "dashboard" | "workspace" | "analysis" | "assistant" | "users" | "auditLogs" | "settings";

export type ConsoleRoute = {
  key: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  kind: ConsoleRouteKind;
};

export type RouteMetric = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type RouteTimelineItem = {
  title: string;
  description: string;
  tag?: string;
};

export type WorkspaceColumn = {
  key: keyof WorkItemView | "summary";
  label: string;
  width?: number;
  kind?: "text" | "tag" | "badge" | "summary";
};

export type WorkspaceAction = {
  key: "advance" | "delete";
  label: string;
  danger?: boolean;
  confirmTitle?: string;
  confirmText?: string;
  disabledWhenFinal?: boolean;
};

export type WorkspaceField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select";
  placeholder?: string;
  options?: readonly string[];
  required?: boolean;
};

export type WorkspaceView = {
  title: string;
  description: string;
  metrics: RouteMetric[];
  formTitle?: string;
  submitLabel?: string;
  fields?: WorkspaceField[];
  columns: WorkspaceColumn[];
  rows: WorkItemView[];
  emptyDescription: string;
  actions?: WorkspaceAction[];
  timelineTitle?: string;
  timeline?: RouteTimelineItem[];
};

export type AnalysisTable = {
  title: string;
  columns: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, string>>;
};

export type AnalysisView = {
  title: string;
  description: string;
  metrics: RouteMetric[];
  highlights: string[];
  tables: AnalysisTable[];
};
