import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { AppProviders } from "@/app/providers";

export const metadata: Metadata = {
  title: "资产安全驾驶舱",
  description: "围绕租户安全档案、风险分析、巡检留痕、访客管理和决策支撑的全过程安全管理平台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
