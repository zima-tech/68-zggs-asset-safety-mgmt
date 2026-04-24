"use client";

import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1764e8",
          colorInfo: "#1764e8",
          colorSuccess: "#1f9d55",
          colorWarning: "#d98500",
          colorError: "#d93026",
          colorTextBase: "#1f2937",
          colorBgLayout: "#f5f7fb",
          borderRadius: 6,
          fontSize: 14,
          controlHeight: 34,
        },
        components: {
          Button: { borderRadius: 4 },
          Card: { borderRadiusLG: 6, paddingLG: 18 },
          Table: { cellPaddingBlock: 10, cellPaddingInline: 12 },
          Form: { itemMarginBottom: 16 },
          Layout: { bodyBg: "#f5f7fb", headerBg: "#ffffff", siderBg: "#ffffff" },
          Menu: { itemBorderRadius: 4 },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
