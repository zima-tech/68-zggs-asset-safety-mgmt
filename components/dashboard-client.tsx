"use client";

import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  ForwardOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useTransition } from "react";
import {
  advanceWorkItem,
  createSystemUser,
  createWorkItem,
  deleteWorkItem,
  toggleSystemSetting,
  toggleSystemUserStatus,
  updateSystemSetting,
  updateSystemUser,
} from "@/app/actions";
import { AgentWorkbench } from "@/components/agent-workbench";
import { ConsoleShell } from "@/components/console-shell";
import {
  appMeta,
  buildWorkItemInput,
  getAnalysisView,
  getRouteByKey,
  getWorkspaceView,
  seedInsights,
} from "@/lib/domain";
import { advanceFeedback, createFeedback, deleteFeedback } from "@/lib/feedback";
import type {
  AnalysisTable,
  AnalysisView,
  AuditLogView,
  DashboardSnapshot,
  SystemSettingInput,
  SystemSettingView,
  SystemUserInput,
  SystemUserView,
  WorkspaceField,
  WorkspaceView,
  WorkItemView,
} from "@/lib/types";

const riskColor: Record<string, string> = {
  高: "red",
  中: "orange",
  低: "green",
};

function buildColumns(view: WorkspaceView): ColumnsType<WorkItemView> {
  const columns: ColumnsType<WorkItemView> = view.columns.map((column) => ({
    title: column.label,
    dataIndex: column.key,
    width: column.width,
    render: (value: string, record: WorkItemView) => {
      if (column.kind === "summary") {
        return (
          <Space direction="vertical" size={2}>
            <Typography.Text strong>{record.title}</Typography.Text>
            <Typography.Text type="secondary" className="table-description">
              {record.description}
            </Typography.Text>
          </Space>
        );
      }

      if (column.kind === "tag") {
        return <Tag color={column.key === "riskLevel" ? riskColor[value] ?? "default" : "blue"}>{value}</Tag>;
      }

      if (column.kind === "badge") {
        const finalStatus = appMeta.statuses.at(-1);
        return <Tag color={value === finalStatus ? "green" : "blue"}>{value}</Tag>;
      }

      return <Typography.Text>{String(value ?? "")}</Typography.Text>;
    },
  }));

  return columns;
}

function renderWorkspaceField(field: WorkspaceField) {
  if (field.type === "select") {
    return <Select options={(field.options ?? []).map((option) => ({ label: option, value: option }))} placeholder={field.placeholder} />;
  }

  if (field.type === "textarea") {
    return <Input.TextArea rows={4} placeholder={field.placeholder} />;
  }

  return <Input placeholder={field.placeholder} />;
}

function renderAnalysisTable(table: AnalysisTable) {
  return (
    <Card key={table.title} title={table.title}>
      <Table
        rowKey={(row) => JSON.stringify(row)}
        pagination={false}
        dataSource={table.rows}
        columns={table.columns.map((column) => ({
          title: column.label,
          dataIndex: column.key,
          key: column.key,
          render: (value: string) => <Typography.Text>{value}</Typography.Text>,
        }))}
      />
    </Card>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "未登录";
}

export function DashboardClient({
  initialSnapshot,
  routeKey,
  currentPath,
}: {
  initialSnapshot: DashboardSnapshot;
  routeKey: string;
  currentPath: string;
}) {
  const { message, modal } = App.useApp();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [pending, startTransition] = useTransition();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserView | null>(null);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSettingView | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogView | null>(null);
  const [logKeyword, setLogKeyword] = useState("");
  const [logModule, setLogModule] = useState<string | undefined>();
  const [settingGroup, setSettingGroup] = useState<string | undefined>();
  const [form] = Form.useForm<Record<string, string>>();
  const [userForm] = Form.useForm<SystemUserInput>();
  const [settingForm] = Form.useForm<SystemSettingInput>();

  const route = getRouteByKey(routeKey);
  const workspaceView = route?.kind === "workspace" ? getWorkspaceView(routeKey, snapshot) : null;
  const analysisView = route?.kind === "analysis" ? getAnalysisView(snapshot) : null;
  const riskCount = snapshot.items.filter((item) => item.riskLevel === "高").length;
  const completionRate = Math.round(
    (snapshot.items.filter((item) => item.status === appMeta.statuses.at(-1)).length / Math.max(snapshot.items.length, 1)) * 100,
  );

  const workspaceColumns = (() => {
    if (!workspaceView) {
      return [];
    }

    const columns = buildColumns(workspaceView);
    if (!workspaceView.actions?.length) {
      return columns;
    }

    columns.push({
      title: "操作",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space>
          {workspaceView.actions?.map((action) => {
            if (action.key === "advance") {
              return (
                <Button
                  key={action.key}
                  size="small"
                  icon={<ForwardOutlined />}
                  loading={pending}
                  disabled={action.disabledWhenFinal && record.status === appMeta.statuses.at(-1)}
                  onClick={() => handleAdvance(record, action.label)}
                >
                  {action.label}
                </Button>
              );
            }

            return (
              <Button
                key={action.key}
                size="small"
                danger={action.danger}
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record, action.confirmTitle, action.confirmText)}
              >
                {action.label}
              </Button>
            );
          })}
        </Space>
      ),
    });
    return columns;
  })();

  const logRows = snapshot.auditLogs.filter((log) => {
    const keyword = logKeyword.trim();
    const keywordHit = !keyword || [log.module, log.action, log.targetName, log.actor, log.summary].some((value) => value.includes(keyword));
    const moduleHit = !logModule || log.module === logModule;
    return keywordHit && moduleHit;
  });

  const settingRows = snapshot.systemSettings.filter((setting) => !settingGroup || setting.group === settingGroup);

  function refreshWith(action: Promise<DashboardSnapshot>, successText: string, afterSuccess?: () => void) {
    startTransition(async () => {
      try {
        const nextSnapshot = await action;
        setSnapshot(nextSnapshot);
        afterSuccess?.();
        message.success(successText);
      } catch (error) {
        message.error(error instanceof Error ? error.message : "操作失败，请重试");
      }
    });
  }

  function handleCreate(values: Record<string, string>) {
    const payload = buildWorkItemInput(routeKey, values);
    refreshWith(createWorkItem(payload), createFeedback(payload.category), () => {
      setCreateModalOpen(false);
      form.resetFields();
    });
  }

  function handleAdvance(record: WorkItemView, label: string) {
    const statuses: readonly string[] = appMeta.statuses;
    const index = statuses.indexOf(record.status);
    const next = statuses[Math.min(index + 1, statuses.length - 1)] ?? record.status;

    if (record.riskLevel === "高") {
      modal.confirm({
        title: `确认${label}？`,
        icon: <ExclamationCircleOutlined />,
        content: `当前事项为高风险记录：${record.title}，推进后将写入新的流程留痕。`,
        okText: "确认推进",
        cancelText: "取消",
        onOk: () => refreshWith(advanceWorkItem(record.id), advanceFeedback(next)),
      });
      return;
    }

    refreshWith(advanceWorkItem(record.id), advanceFeedback(next));
  }

  function handleDelete(record: WorkItemView, title?: string, text?: string) {
    modal.confirm({
      title: title ?? "确认删除该记录？",
      icon: <ExclamationCircleOutlined />,
      content: text ?? `删除后将同步移除关联过程记录：${record.title}`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => refreshWith(deleteWorkItem(record.id), deleteFeedback(record.category)),
    });
  }

  function openCreateUser() {
    setEditingUser(null);
    userForm.setFieldsValue({
      username: "",
      displayName: "",
      department: appMeta.department,
      role: "业务人员",
      status: "启用",
    });
    setUserModalOpen(true);
  }

  function openEditUser(user: SystemUserView) {
    setEditingUser(user);
    userForm.setFieldsValue({
      username: user.username,
      displayName: user.displayName,
      department: user.department,
      role: user.role,
      status: user.status,
    });
    setUserModalOpen(true);
  }

  function handleUserSubmit(values: SystemUserInput) {
    const action = editingUser ? updateSystemUser(editingUser.id, values) : createSystemUser(values);
    refreshWith(action, editingUser ? "用户信息已更新" : "用户已新增", () => {
      setUserModalOpen(false);
      setEditingUser(null);
      userForm.resetFields();
    });
  }

  function handleToggleUser(user: SystemUserView) {
    modal.confirm({
      title: `确认${user.status === "启用" ? "停用" : "启用"}该用户？`,
      icon: <ExclamationCircleOutlined />,
      content: `${user.displayName}（${user.role}）的账号状态将被调整。`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => refreshWith(toggleSystemUserStatus(user.id), "用户状态已更新"),
    });
  }

  function openEditSetting(setting: SystemSettingView) {
    setEditingSetting(setting);
    settingForm.setFieldsValue({
      value: setting.value,
      enabled: setting.enabled,
      updatedBy: "演示管理员",
    });
    setSettingModalOpen(true);
  }

  function handleSettingSubmit(values: SystemSettingInput) {
    if (!editingSetting) {
      return;
    }
    refreshWith(updateSystemSetting(editingSetting.id, values), "系统设置已更新", () => {
      setSettingModalOpen(false);
      setEditingSetting(null);
      settingForm.resetFields();
    });
  }

  function handleToggleSetting(setting: SystemSettingView) {
    modal.confirm({
      title: `确认${setting.enabled ? "停用" : "启用"}该设置？`,
      icon: <ExclamationCircleOutlined />,
      content: `${setting.label}会影响${setting.group}中的相关业务规则。`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => refreshWith(toggleSystemSetting(setting.id), "设置状态已更新"),
    });
  }

  function renderDashboard() {
    return (
      <Space direction="vertical" size={16} className="full-width">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="核心记录" value={snapshot.items.length} suffix="条" prefix={<FileAddOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="高风险待办" value={riskCount} suffix="条" valueStyle={{ color: "#d93026" }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="闭环进度" value={completionRate} suffix="%" prefix={<CheckCircleOutlined />} />
              <Progress percent={completionRate} size="small" />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Card
              title="业务洞察"
              extra={
                <Button icon={<ReloadOutlined />} onClick={() => message.info("首页数据已刷新")}>
                  刷新
                </Button>
              }
            >
              <Row gutter={[12, 12]}>
                {seedInsights.map((insight, index) => (
                  <Col xs={24} md={8} key={`${insight.title}-${index}`}>
                    <div className="insight-tile">
                      <Typography.Text strong>{insight.title}</Typography.Text>
                      <Typography.Title level={4}>{insight.value}</Typography.Title>
                      <Tag color={insight.level === "success" ? "green" : insight.level === "warning" ? "orange" : "blue"}>
                        {insight.trend === "up" ? "重点关注" : insight.trend === "down" ? "持续改善" : "保持稳定"}
                      </Tag>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card title="流程留痕">
              {snapshot.events.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无流程留痕" />
              ) : (
                <Timeline
                  items={snapshot.events.slice(0, 6).map((event) => ({
                    children: (
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{event.action}</Typography.Text>
                        <Typography.Text type="secondary">{event.content}</Typography.Text>
                        <Tag color="blue">{`来自${event.sourceType}：${event.sourceTitle}`}</Tag>
                      </Space>
                    ),
                  }))}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    );
  }

  function renderWorkspace(view: WorkspaceView) {
    return (
      <>
        <Space direction="vertical" size={16} className="full-width">
          <Row gutter={[16, 16]}>
            {view.metrics.map((metric) => (
              <Col xs={24} md={12} xl={6} key={metric.label}>
                <Card>
                  <Statistic title={metric.label} value={metric.value} />
                  {metric.helper ? <Typography.Text type="secondary">{metric.helper}</Typography.Text> : null}
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            title={view.title}
            extra={
              <Space>
                <Typography.Text type="secondary">{view.description}</Typography.Text>
                {view.fields?.length ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                    {view.submitLabel ?? "新增记录"}
                  </Button>
                ) : null}
              </Space>
            }
          >
            <Table
              rowKey="id"
              loading={pending}
              columns={workspaceColumns}
              dataSource={view.rows}
              locale={{ emptyText: view.emptyDescription }}
              scroll={{ x: 1180 }}
              pagination={{ pageSize: 8, showSizeChanger: false }}
            />
          </Card>

          {view.timeline?.length ? (
            <Card title={view.timelineTitle}>
              <Timeline
                items={view.timeline.map((item) => ({
                  children: (
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Typography.Text type="secondary">{item.description}</Typography.Text>
                      {item.tag ? <Tag color="blue">{item.tag}</Tag> : null}
                    </Space>
                  ),
                }))}
              />
            </Card>
          ) : null}
        </Space>

        <Modal
          title={view.formTitle ?? "新增记录"}
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          okText="提交"
          cancelText="取消"
          confirmLoading={pending}
          onOk={() => form.submit()}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleCreate} preserve={false}>
            {view.fields?.map((field) => (
              <Form.Item key={field.key} name={field.key} label={field.label} rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}>
                {renderWorkspaceField(field)}
              </Form.Item>
            ))}
          </Form>
        </Modal>
      </>
    );
  }

  function renderAnalysis(view: AnalysisView) {
    return (
      <Space direction="vertical" size={16} className="full-width">
        <Row gutter={[16, 16]}>
          {view.metrics.map((metric) => (
            <Col xs={24} md={12} xl={6} key={metric.label}>
              <Card>
                <Statistic title={metric.label} value={metric.value} />
                {metric.helper ? <Typography.Text type="secondary">{metric.helper}</Typography.Text> : null}
              </Card>
            </Col>
          ))}
        </Row>
        <Card title={view.title}>
          <Space direction="vertical" size={10} className="full-width">
            <Typography.Text type="secondary">{view.description}</Typography.Text>
            {view.highlights.map((highlight) => (
              <Tag key={highlight} color="blue">
                {highlight}
              </Tag>
            ))}
          </Space>
        </Card>
        {view.tables.map(renderAnalysisTable)}
      </Space>
    );
  }

  function renderUsers() {
    const columns: ColumnsType<SystemUserView> = [
      { title: "账号", dataIndex: "username", width: 150 },
      { title: "姓名", dataIndex: "displayName", width: 150 },
      { title: "部门", dataIndex: "department", width: 180 },
      { title: "角色", dataIndex: "role", width: 140, render: (value) => <Tag color="blue">{value}</Tag> },
      { title: "状态", dataIndex: "status", width: 100, render: (value) => <Tag color={value === "启用" ? "green" : "default"}>{value}</Tag> },
      { title: "最近登录", dataIndex: "lastLoginAt", width: 180, render: formatDate },
      {
        title: "操作",
        key: "action",
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditUser(record)}>
              编辑
            </Button>
            <Button size="small" danger={record.status === "启用"} onClick={() => handleToggleUser(record)}>
              {record.status === "启用" ? "停用" : "启用"}
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <>
        <Card
          title="用户管理"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateUser}>
              新增用户
            </Button>
          }
        >
          <Table
            rowKey="id"
            loading={pending}
            columns={columns}
            dataSource={snapshot.systemUsers}
            locale={{ emptyText: "暂无用户，请新增管理账号" }}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
        <Modal
          title={editingUser ? "编辑用户" : "新增用户"}
          open={userModalOpen}
          onCancel={() => setUserModalOpen(false)}
          okText="保存"
          cancelText="取消"
          confirmLoading={pending}
          onOk={() => userForm.submit()}
          destroyOnClose
        >
          <Form<SystemUserInput> form={userForm} layout="vertical" onFinish={handleUserSubmit} preserve={false}>
            <Form.Item name="username" label="登录账号" rules={[{ required: true, message: "请输入登录账号" }]}>
              <Input placeholder="例如：admin" />
            </Form.Item>
            <Form.Item name="displayName" label="用户姓名" rules={[{ required: true, message: "请输入用户姓名" }]}>
              <Input placeholder="例如：业务管理员" />
            </Form.Item>
            <Form.Item name="department" label="所属部门" rules={[{ required: true, message: "请输入所属部门" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="role" label="角色" rules={[{ required: true, message: "请选择角色" }]}>
              <Select options={["系统管理员", "业务负责人", "业务人员", "审计员"].map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="status" label="账号状态" rules={[{ required: true, message: "请选择账号状态" }]}>
              <Select options={["启用", "停用"].map((value) => ({ label: value, value }))} />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  function renderAuditLogs() {
    const modules = Array.from(new Set(snapshot.auditLogs.map((log) => log.module)));
    const columns: ColumnsType<AuditLogView> = [
      { title: "时间", dataIndex: "createdAt", width: 180, render: formatDate },
      { title: "模块", dataIndex: "module", width: 130, render: (value) => <Tag color="blue">{value}</Tag> },
      { title: "动作", dataIndex: "action", width: 150 },
      { title: "对象", dataIndex: "targetName", width: 220 },
      { title: "结果", dataIndex: "result", width: 100, render: (value) => <Tag color={value === "成功" ? "green" : "orange"}>{value}</Tag> },
      { title: "操作人", dataIndex: "actor", width: 130 },
      {
        title: "操作",
        key: "action",
        width: 100,
        render: (_, record) => (
          <Button size="small" onClick={() => setSelectedLog(record)}>
            详情
          </Button>
        ),
      },
    ];

    return (
      <>
        <Card
          title="日志审计"
          extra={
            <Space wrap>
              <Input.Search allowClear placeholder="搜索对象、操作人或摘要" onSearch={setLogKeyword} onChange={(event) => setLogKeyword(event.target.value)} style={{ width: 240 }} />
              <Select
                allowClear
                placeholder="筛选模块"
                value={logModule}
                onChange={setLogModule}
                style={{ width: 180 }}
                options={modules.map((module) => ({ label: module, value: module }))}
              />
            </Space>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={logRows}
            locale={{ emptyText: "暂无匹配的审计日志" }}
            scroll={{ x: 1080 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Card>
        <Modal title="日志详情" open={Boolean(selectedLog)} onCancel={() => setSelectedLog(null)} footer={null} destroyOnClose>
          {selectedLog ? (
            <Space direction="vertical" size={10} className="full-width">
              <Typography.Text strong>{selectedLog.action}</Typography.Text>
              <Typography.Text>模块：{selectedLog.module}</Typography.Text>
              <Typography.Text>对象：{selectedLog.targetType} / {selectedLog.targetName}</Typography.Text>
              <Typography.Text>操作人：{selectedLog.actor}</Typography.Text>
              <Typography.Text>结果：{selectedLog.result}</Typography.Text>
              <Typography.Text type="secondary">{selectedLog.summary}</Typography.Text>
            </Space>
          ) : null}
        </Modal>
      </>
    );
  }

  function renderSettings() {
    const groups = Array.from(new Set(snapshot.systemSettings.map((setting) => setting.group)));
    const columns: ColumnsType<SystemSettingView> = [
      { title: "分组", dataIndex: "group", width: 120, render: (value) => <Tag color="blue">{value}</Tag> },
      { title: "设置项", dataIndex: "label", width: 180 },
      { title: "当前值", dataIndex: "value", width: 160 },
      { title: "状态", dataIndex: "enabled", width: 100, render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "停用"}</Tag> },
      { title: "说明", dataIndex: "description", width: 320 },
      { title: "更新人", dataIndex: "updatedBy", width: 130 },
      {
        title: "操作",
        key: "action",
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditSetting(record)}>
              编辑
            </Button>
            <Button size="small" danger={record.enabled} onClick={() => handleToggleSetting(record)}>
              {record.enabled ? "停用" : "启用"}
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <>
        <Card
          title="系统设置"
          extra={
            <Select
              allowClear
              placeholder="筛选分组"
              value={settingGroup}
              onChange={setSettingGroup}
              style={{ width: 180 }}
              options={groups.map((group) => ({ label: group, value: group }))}
            />
          }
        >
          <Table
            rowKey="id"
            loading={pending}
            columns={columns}
            dataSource={settingRows}
            locale={{ emptyText: "暂无匹配的系统设置" }}
            scroll={{ x: 1180 }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
        <Modal
          title={editingSetting?.label ?? "编辑设置"}
          open={settingModalOpen}
          onCancel={() => setSettingModalOpen(false)}
          okText="保存"
          cancelText="取消"
          confirmLoading={pending}
          onOk={() => settingForm.submit()}
          destroyOnClose
        >
          <Form<SystemSettingInput> form={settingForm} layout="vertical" onFinish={handleSettingSubmit} preserve={false}>
            <Form.Item name="value" label="设置值" rules={[{ required: true, message: "请输入设置值" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="enabled" label="启用状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
            <Form.Item name="updatedBy" label="更新人" initialValue="演示管理员" rules={[{ required: true, message: "请输入更新人" }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  return (
    <ConsoleShell currentPath={currentPath}>
      {!route || route.kind === "dashboard"
        ? renderDashboard()
        : route.kind === "users"
          ? renderUsers()
          : route.kind === "auditLogs"
            ? renderAuditLogs()
            : route.kind === "settings"
              ? renderSettings()
              : route.kind === "assistant"
                ? <AgentWorkbench snapshot={snapshot} disabled={pending} onSnapshotChange={setSnapshot} />
                : route.kind === "analysis" && analysisView
                  ? renderAnalysis(analysisView)
                  : workspaceView
                    ? renderWorkspace(workspaceView)
                    : null}
    </ConsoleShell>
  );
}
