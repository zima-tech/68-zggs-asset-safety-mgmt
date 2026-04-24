"use client";

import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FormOutlined,
  LogoutOutlined,
  RobotOutlined,
  SettingOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Menu, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";
import { logoutDemoAccount } from "@/app/actions";
import { appMeta, consoleRoutes } from "@/lib/domain";

const iconMap = {
  dashboard: <AppstoreOutlined />,
  reception: <FormOutlined />,
  handling: <SolutionOutlined />,
  analytics: <BarChartOutlined />,
  analysis: <BarChartOutlined />,
  archive: <FolderOpenOutlined />,
  config: <FormOutlined />,
  execution: <SolutionOutlined />,
  meetings: <FormOutlined />,
  minutes: <SolutionOutlined />,
  sync: <FileSearchOutlined />,
  tenants: <FormOutlined />,
  inspections: <SolutionOutlined />,
  transactions: <FormOutlined />,
  pricing: <SolutionOutlined />,
  reasons: <FormOutlined />,
  classification: <SolutionOutlined />,
  assistant: <RobotOutlined />,
  sources: <FileSearchOutlined />,
  "user-management": <UserOutlined />,
  "audit-logs": <AuditOutlined />,
  "system-settings": <SettingOutlined />,
} as const;

const systemRouteKeys = new Set(["user-management", "audit-logs", "system-settings"]);

export function ConsoleShell({
  currentPath,
  children,
}: {
  currentPath: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const activeRoute = consoleRoutes.find((route) => route.path === currentPath) ?? consoleRoutes[0];
  const coreRoute = consoleRoutes.find((route) => route.kind === "workspace") ?? consoleRoutes[0];
  const businessRoutes = consoleRoutes.filter((route) => !systemRouteKeys.has(route.key));
  const systemRoutes = consoleRoutes.filter((route) => systemRouteKeys.has(route.key));

  function toMenuItem(route: (typeof consoleRoutes)[number]) {
    return {
      key: route.key,
      icon: iconMap[route.key as keyof typeof iconMap] ?? <FileSearchOutlined />,
      label: (
        <a
          href={route.path}
          onClick={(event) => {
            event.preventDefault();
            router.push(route.path);
          }}
        >
          {route.title}
        </a>
      ),
    };
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutDemoAccount();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="console-root">
      <aside className="console-sidebar">
        <div className="console-brand">
          <span className="brand-mark">{appMeta.seq}</span>
          <div>
            <Typography.Text strong>{appMeta.shortName}</Typography.Text>
            <Typography.Text type="secondary" className="brand-subtitle">
              {appMeta.department}
            </Typography.Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeRoute?.key ?? "dashboard"]}
          items={businessRoutes.map(toMenuItem)}
          className="console-menu console-menu-business"
        />
        <div className="console-menu-divider" role="separator" aria-hidden="true" />
        <Menu
          mode="inline"
          selectedKeys={[activeRoute?.key ?? "dashboard"]}
          items={systemRoutes.map(toMenuItem)}
          className="console-menu console-menu-system"
        />
      </aside>
      <main className="console-main">
        <header className="console-header">
          <div>
            <Breadcrumb items={[{ title: appMeta.department }, { title: appMeta.title }, { title: activeRoute?.title }]} />
            <Typography.Title level={3} className="page-title">
              {activeRoute?.title ?? appMeta.shortName}
            </Typography.Title>
            <Typography.Text type="secondary">{activeRoute?.description ?? appMeta.description}</Typography.Text>
          </div>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                router.push(coreRoute.path);
              }}
            >
              进入核心业务
            </Button>
            <Button icon={<LogoutOutlined />} loading={pending} onClick={handleLogout}>退出</Button>
          </Space>
        </header>
        <section className="console-content">{children}</section>
      </main>
    </div>
  );
}
