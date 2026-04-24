"use client";

import { LockOutlined, LoginOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, App, Button, Card, Form, Input, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { loginDemoAccount } from "@/app/actions";
import { appMeta } from "@/lib/domain";
import { DEMO_CREDENTIALS, type DemoLoginInput } from "@/lib/demo-auth-config";

export function LoginPageClient() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<DemoLoginInput>();
  const [pending, startTransition] = useTransition();

  function handleLogin(values: DemoLoginInput) {
    startTransition(async () => {
      const result = await loginDemoAccount(values);
      if (!result.ok) {
        form.setFields([{ name: "password", errors: [result.message ?? "用户名或密码错误"] }]);
        message.error(result.message ?? "登录失败");
        return;
      }

      message.success("登录成功，正在进入管理后台");
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <main className="login-root">
      <section className="login-hero">
        <div className="login-brand-row">
          <span className="brand-mark">{appMeta.seq}</span>
          <div>
            <Typography.Text className="login-brand-title">{appMeta.shortName}</Typography.Text>
            <Typography.Text className="login-brand-subtitle">{appMeta.department}</Typography.Text>
          </div>
        </div>
        <div className="login-copy">
          <Typography.Title level={1}>{appMeta.title}</Typography.Title>
          <Typography.Paragraph>{appMeta.description}</Typography.Paragraph>
          <Space size={[8, 8]} wrap>
            {appMeta.modules.slice(0, 5).map((module) => (
              <Tag color="blue" key={module}>
                {module}
              </Tag>
            ))}
          </Space>
        </div>
        <div className="login-status-strip">
          <span>统一业务受理</span>
          <span>全流程留痕</span>
          <span>智能协同处置</span>
        </div>
      </section>

      <section className="login-panel-wrap">
        <Card className="login-panel" bordered={false}>
          <Space direction="vertical" size={18} className="full-width">
            <div>
              <Typography.Title level={3} className="login-title">
                用户登录
              </Typography.Title>
              <Typography.Text type="secondary">使用演示账号进入当前业务管理后台</Typography.Text>
            </div>

            <Alert
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              message="演示账户"
              description={
                <Space size={12} wrap>
                  <Typography.Text>
                    用户名：<Typography.Text code>{DEMO_CREDENTIALS.username}</Typography.Text>
                  </Typography.Text>
                  <Typography.Text>
                    密码：<Typography.Text code>{DEMO_CREDENTIALS.password}</Typography.Text>
                  </Typography.Text>
                </Space>
              }
            />

            <Form<DemoLoginInput>
              form={form}
              layout="vertical"
              initialValues={{ username: DEMO_CREDENTIALS.username, password: DEMO_CREDENTIALS.password }}
              onFinish={handleLogin}
              requiredMark={false}
            >
              <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
                <Input prefix={<UserOutlined />} placeholder="请输入用户名" autoComplete="username" size="large" />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" autoComplete="current-password" size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<LoginOutlined />} loading={pending} block size="large">
                登录管理后台
              </Button>
            </Form>
          </Space>
        </Card>
      </section>
    </main>
  );
}
