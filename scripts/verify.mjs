import fs from "node:fs";

const required = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/login/page.tsx",
  "app/actions.ts",
  "components/console-shell.tsx",
  "components/dashboard-client.tsx",
  "components/agent-workbench.tsx",
  "components/auth/login-page-client.tsx",
  "lib/auth.ts",
  "lib/demo-auth-config.ts",
  "lib/prisma.ts",
  "lib/service.ts",
  "lib/mock-integrations.ts",
  "lib/ai/glm.ts",
  "lib/feedback.ts",
  "prisma/schema.prisma",
  "prisma/seed.ts",
  ".env.example",
  "README.md",
  "68_资管公司_资产安全管理_PRD.md",
  "68_资管公司_资产安全管理_需求文档.md",
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length > 0) {
  console.error("Missing required files:", missing.join(", "));
  process.exit(1);
}

const source = required
  .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".md"))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

if (/https?:\/\/.*(cdn|jsdelivr|unpkg|googleapis)/i.test(source)) {
  console.error("External CDN reference detected.");
  process.exit(1);
}

if (!source.includes("@ant-design/x") || !source.includes("Sender") || !source.includes("Bubble")) {
  console.error("Ant Design X interaction components are not wired.");
  process.exit(1);
}

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
for (const modelName of ["SystemUser", "AuditLog", "SystemSetting"]) {
  if (!schema.includes(`model ${modelName}`)) {
    console.error(`Governance model missing: ${modelName}`);
    process.exit(1);
  }
}

const dashboard = fs.readFileSync("components/dashboard-client.tsx", "utf8");
for (const text of ["用户管理", "日志审计", "系统设置", "Modal", "confirmLoading"]) {
  if (!dashboard.includes(text)) {
    console.error(`Governance UI or modal form marker missing: ${text}`);
    process.exit(1);
  }
}

const shell = fs.readFileSync("components/console-shell.tsx", "utf8");
for (const text of ["user-management", "audit-logs", "system-settings", "systemRoutes", "console-menu-divider"]) {
  if (!shell.includes(text)) {
    console.error(`Governance menu marker missing: ${text}`);
    process.exit(1);
  }
}

const envExample = fs.readFileSync(".env.example", "utf8");
for (const text of ["GLM_API_KEY", "GLM_MODEL", "GLM_BASE_URL"]) {
  if (!envExample.includes(text)) {
    console.error(`GLM configuration marker missing in .env.example: ${text}`);
    process.exit(1);
  }
}

const userVisibleForbidden = [
  "已写入演示数据库",
  "历史遗留补偿材料补充",
  "Vercel 就绪",
  "运行配置",
  "DATABASE_URL",
  "Prisma + SQLite",
  "Next.js App Router",
  "Ant Design X",
  "协同数据",
  "协同数据状态",
  "协同来源",
  "待接入外部系统",
  "需要外部接口",
  "未配置接口",
];

const visibleFiles = [
  "components/console-shell.tsx",
  "components/dashboard-client.tsx",
  "components/auth/login-page-client.tsx",
  "app/page.tsx",
  "app/login/page.tsx",
  "prisma/seed.ts",
];

for (const file of visibleFiles) {
  const content = fs.readFileSync(file, "utf8");
  const hit = userVisibleForbidden.find((word) => content.includes(word));
  if (hit) {
    console.error(`Business-facing copy contains forbidden text "${hit}" in ${file}.`);
    process.exit(1);
  }
}

console.log("资产安全驾驶舱 structure verification passed.");
