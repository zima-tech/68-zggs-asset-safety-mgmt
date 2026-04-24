"use client";

import {
  CheckCircleOutlined,
  CopyOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Bubble, Conversations, Sender } from "@ant-design/x";
import { App, Alert, Button, Card, Col, Descriptions, Empty, Row, Select, Space, Spin, Tag, Timeline, Typography } from "antd";
import { useEffect, useMemo, useState, useTransition } from "react";
import { generateAiDraft, saveAiDraft } from "@/app/actions";
import { appMeta } from "@/lib/domain";
import { aiFeedback } from "@/lib/feedback";
import type { AiConversationView, AiDraftView, DashboardSnapshot, WorkItemView } from "@/lib/types";

type AgentWorkbenchProps = {
  snapshot: DashboardSnapshot;
  disabled: boolean;
  onSnapshotChange: (nextSnapshot: DashboardSnapshot) => void;
};

function formatWhen(value: string | null) {
  if (!value) {
    return "待补充";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function firstMeaningfulLine(text: string) {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "待补充"
  );
}

function resolveFieldValue(fieldSource: string, item: WorkItemView | null, draft: AiDraftView | null) {
  if (!draft) {
    return "待生成";
  }

  switch (fieldSource) {
    case "category":
      return item?.category ?? draft.resultType;
    case "owner":
      return item?.owner ?? "待确认";
    case "riskLevel":
      return item?.riskLevel ?? "待研判";
    case "status":
      return item?.status ?? draft.status;
    case "sourceBatch":
      return item?.sourceBatch ?? draft.sourceSummary;
    case "summary":
      return firstMeaningfulLine(draft.result);
    default:
      return draft.sourceSummary;
  }
}

function buildTimelineItems(item: WorkItemView | null, draft: AiDraftView | null, pending: boolean) {
  return appMeta.aiExperience.stepTitles.map((title, index) => {
    const isSaved = draft?.saveStatus === appMeta.aiExperience.savedStatusLabel;
    const isCurrentStep = pending && index === 2;
    const color = isSaved && index === appMeta.aiExperience.stepTitles.length - 1 ? "green" : isCurrentStep ? "blue" : "gray";
    let detail = "等待处理";

    if (index === 0) {
      detail = item ? `已读取${appMeta.aiExperience.objectLabel}《${item.title}》及${item.sourceBatch}。` : "请选择业务对象后开始分析。";
    } else if (index === 1) {
      detail = item ? `当前状态${item.status}，责任岗位${item.owner}，风险等级${item.riskLevel}。` : "待读取规则和历史留痕。";
    } else if (index === 2) {
      detail = pending ? `正在生成${appMeta.aiExperience.resultType}。` : draft ? firstMeaningfulLine(draft.result) : "待生成智能结果。";
    } else if (index === 3) {
      detail = isSaved ? appMeta.aiExperience.savedSuccessText : "结果可继续追问，也可直接采纳写入业务留痕。";
    }

    return {
      color,
      children: (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{title}</Typography.Text>
          <Typography.Text type="secondary">{detail}</Typography.Text>
        </Space>
      ),
    };
  });
}

export function AgentWorkbench({ snapshot, disabled, onSnapshotChange }: AgentWorkbenchProps) {
  const { message } = App.useApp();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(snapshot.aiConversations[0]?.id);
  const [selectedObjectId, setSelectedObjectId] = useState<string>(snapshot.aiConversations[0]?.businessObjectId ?? snapshot.items[0]?.id ?? "");
  const [prompt, setPrompt] = useState<string>(appMeta.aiPrompt);
  const [aiError, setAiError] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [aiPending, startAiTransition] = useTransition();
  const [savePending, startSaveTransition] = useTransition();

  useEffect(() => {
    setActiveConversationId((current) => {
      if (current && snapshot.aiConversations.some((conversation) => conversation.id === current)) {
        return current;
      }

      return snapshot.aiConversations[0]?.id;
    });
  }, [snapshot.aiConversations]);

  useEffect(() => {
    if (activeConversationId) {
      const activeConversation = snapshot.aiConversations.find((conversation) => conversation.id === activeConversationId);
      if (activeConversation) {
        setSelectedObjectId(activeConversation.businessObjectId);
        return;
      }
    }

    if (!selectedObjectId && snapshot.items[0]) {
      setSelectedObjectId(snapshot.items[0].id);
    }
  }, [activeConversationId, selectedObjectId, snapshot.aiConversations, snapshot.items]);

  const activeConversation = useMemo<AiConversationView | null>(
    () => snapshot.aiConversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, snapshot.aiConversations],
  );

  const activeTurns = useMemo(
    () =>
      snapshot.aiDrafts
        .filter((draft) => draft.conversationId === activeConversationId)
        .slice()
        .sort((left, right) => left.turnIndex - right.turnIndex),
    [activeConversationId, snapshot.aiDrafts],
  );

  const activeDraft = activeTurns[activeTurns.length - 1] ?? null;
  const selectedItem = snapshot.items.find((item) => item.id === (activeDraft?.businessObjectId ?? selectedObjectId)) ?? null;

  const conversationItems = useMemo(
    () =>
      snapshot.aiConversations.map((conversation) => ({
        key: conversation.id,
        label: conversation.topic,
        timestamp: new Date(conversation.updatedAt).getTime(),
      })),
    [snapshot.aiConversations],
  );

  const resultDescriptions = appMeta.aiExperience.resultFields.map((field) => ({
    key: field.label,
    label: field.label,
    children: resolveFieldValue(field.source, selectedItem, activeDraft),
  }));

  const canSubmit = Boolean(prompt.trim()) && Boolean(selectedObjectId);

  function startNewConversation() {
    setActiveConversationId(undefined);
    setAiError(null);
    setSuccessText(null);
    setPrompt(appMeta.aiPrompt);
  }

  function submitPrompt(nextPrompt: string, conversationId?: string) {
    if (!nextPrompt.trim()) {
      message.warning("请输入需要处理的业务问题");
      return;
    }

    if (!selectedObjectId) {
      message.warning(`请先选择${appMeta.aiExperience.objectLabel}`);
      return;
    }

    setAiError(null);
    setSuccessText(null);

    startAiTransition(async () => {
      try {
        const result = await generateAiDraft({
          prompt: nextPrompt,
          businessObjectId: selectedObjectId,
          conversationId: conversationId ?? undefined,
        });

        onSnapshotChange(result.snapshot);
        setActiveConversationId(result.conversationId);
        setPrompt("");
        message.success(aiFeedback(result.source));
      } catch (error) {
        const text = error instanceof Error ? error.message : "本次智能处理未能完成，请稍后重试";
        setAiError(text);
        message.error(text);
      }
    });
  }

  function handleRetry() {
    const retryPrompt = activeDraft?.prompt ?? prompt;
    setPrompt(retryPrompt);
    submitPrompt(retryPrompt, activeConversationId);
  }

  function handleSave() {
    if (!activeDraft) {
      return;
    }

    setAiError(null);

    startSaveTransition(async () => {
      try {
        const result = await saveAiDraft({ draftId: activeDraft.id });
        onSnapshotChange(result.snapshot);
        setSuccessText(result.message);
        message.success(result.message);
      } catch (error) {
        const text = error instanceof Error ? error.message : "结果采纳未完成，请稍后重试";
        setAiError(text);
        message.error(text);
      }
    });
  }

  return (
    <Row gutter={[16, 16]} align="stretch">
      <Col xs={24} xl={6}>
        <Card
          title="智能会话"
          extra={
            <Button icon={<PlusOutlined />} onClick={startNewConversation}>
              新建会话
            </Button>
          }
          style={{ height: "100%" }}
        >
          <Space direction="vertical" size={16} className="full-width">
            <div>
              <Typography.Text strong>历史会话</Typography.Text>
              <div style={{ marginTop: 12 }}>
                {conversationItems.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无历史会话" />
                ) : (
                  <Conversations items={conversationItems} activeKey={activeConversationId} onActiveChange={setActiveConversationId} />
                )}
              </div>
            </div>

            <div>
              <Typography.Text strong>{appMeta.aiExperience.objectLabel}</Typography.Text>
              <Select
                style={{ width: "100%", marginTop: 12 }}
                value={selectedObjectId || undefined}
                onChange={setSelectedObjectId}
                options={snapshot.items.map((item) => ({
                  label: `${item.code} · ${item.title}`,
                  value: item.id,
                }))}
                placeholder={`请选择${appMeta.aiExperience.objectLabel}`}
              />
            </div>

            <div>
              <Typography.Text strong>常用追问</Typography.Text>
              <Space direction="vertical" size={8} className="full-width" style={{ marginTop: 12 }}>
                {appMeta.aiExperience.quickPrompts.map((quickPrompt) => (
                  <Button key={quickPrompt} block onClick={() => setPrompt(quickPrompt)}>
                    {quickPrompt}
                  </Button>
                ))}
              </Space>
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24} xl={10}>
        <Card
          title={activeConversation?.topic ?? appMeta.aiTitle}
          extra={<Tag icon={<RobotOutlined />} color="blue">{appMeta.aiExperience.panelTag}</Tag>}
          style={{ height: "100%" }}
        >
          <Space direction="vertical" size={16} className="full-width">
            {selectedItem ? (
              <Alert
                type="info"
                showIcon
                message={`${appMeta.aiExperience.objectLabel}：${selectedItem.title}`}
                description={`当前状态：${selectedItem.status}；责任岗位：${selectedItem.owner}；来源批次：${selectedItem.sourceBatch}`}
              />
            ) : (
              <Alert type="warning" showIcon message={appMeta.aiExperience.emptyTitle} description={appMeta.aiExperience.emptyDescription} />
            )}

            {aiPending ? (
              <Alert
                type="info"
                showIcon
                message={`${appMeta.aiExperience.resultType}生成中`}
                description={`系统正在结合${appMeta.aiExperience.objectLabel}、历史留痕和业务规则生成结果，请稍候。`}
              />
            ) : null}

            {aiError ? (
              <Alert
                type="error"
                showIcon
                message="本次处理未完成"
                description={aiError}
                action={
                  <Button size="small" icon={<ReloadOutlined />} onClick={handleRetry}>
                    重试
                  </Button>
                }
              />
            ) : null}

            {successText ? <Alert type="success" showIcon message="结果已同步" description={successText} /> : null}

            <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
              {activeTurns.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={appMeta.aiExperience.emptyDescription} />
              ) : (
                <Space direction="vertical" size={16} className="full-width">
                  {activeTurns.map((turn) => (
                    <Space key={turn.id} direction="vertical" size={10} className="full-width">
                      <Bubble placement="end" header={`第 ${turn.turnIndex + 1} 轮提问`} content={turn.prompt} />
                      <Bubble
                        header={`${appMeta.aiTitle} · ${turn.resultType}`}
                        content={<Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>{turn.result}</Typography.Paragraph>}
                        footer={
                          <Space size={8}>
                            <Tag color={turn.saveStatus === appMeta.aiExperience.savedStatusLabel ? "green" : "blue"}>{turn.saveStatus}</Tag>
                            <Typography.Text type="secondary">{turn.sourceSummary}</Typography.Text>
                          </Space>
                        }
                      />
                    </Space>
                  ))}
                </Space>
              )}
            </div>

            {aiPending ? <Spin tip="正在生成业务建议" /> : null}

            <Sender
              value={prompt}
              onChange={(value) => setPrompt(value)}
              onSubmit={(value) => submitPrompt(value, activeConversationId)}
              loading={aiPending}
              disabled={disabled || savePending || !snapshot.items.length}
              placeholder={activeConversation ? "继续追问当前会话，保持业务对象和上下文一致" : appMeta.aiPrompt}
            />

            <Space wrap>
              <Button type="primary" disabled={!canSubmit || aiPending || disabled} onClick={() => submitPrompt(prompt, activeConversationId)}>
                {activeConversation ? "继续当前会话" : "发起新会话"}
              </Button>
              <Button icon={<PlusOutlined />} onClick={startNewConversation}>
                另起新会话
              </Button>
              <Typography.Text type="secondary">
                刷新页面后会恢复最近会话，并继续绑定当前业务对象。
              </Typography.Text>
            </Space>
          </Space>
        </Card>
      </Col>

      <Col xs={24} xl={8}>
        <Space direction="vertical" size={16} className="full-width">
          <Card title="Agent 步骤">
            <Timeline items={buildTimelineItems(selectedItem, activeDraft, aiPending)} />
          </Card>

          <Card
            title="结果操作"
            extra={
              <Tag color={activeDraft?.saveStatus === appMeta.aiExperience.savedStatusLabel ? "green" : "blue"}>
                {activeDraft?.saveStatus ?? "待生成"}
              </Tag>
            }
          >
            {activeDraft ? (
              <Space direction="vertical" size={16} className="full-width">
                <Descriptions column={1} size="small" items={resultDescriptions} />
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={savePending}
                    disabled={activeDraft.saveStatus === appMeta.aiExperience.savedStatusLabel || aiPending}
                    onClick={handleSave}
                  >
                    {appMeta.aiExperience.saveActionLabel}
                  </Button>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard?.writeText(activeDraft.result);
                      message.success("当前结果已复制");
                    }}
                  >
                    复制结果
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleRetry} disabled={aiPending}>
                    重试生成
                  </Button>
                </Space>
                {activeDraft.savedAt ? (
                  <Typography.Text type="secondary">
                    最近采纳时间：{formatWhen(activeDraft.savedAt)}
                  </Typography.Text>
                ) : (
                  <Typography.Text type="secondary">
                    结果尚未采纳，采纳后会刷新台账、流程留痕和当前会话状态。
                  </Typography.Text>
                )}
                {activeDraft.saveSummary ? (
                  <Space size={8}>
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    <Typography.Text>{activeDraft.saveSummary}</Typography.Text>
                  </Space>
                ) : null}
              </Space>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="生成结果后可在这里采纳、复制或继续追问" />
            )}
          </Card>
        </Space>
      </Col>
    </Row>
  );
}
