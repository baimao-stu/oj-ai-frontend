<template>
  <div v-if="embedded" class="ai-chat-panel embedded">
    <div class="ai-chat-shell">
      <div class="ai-chat-header">
        <div class="panel-copy">
          <div class="panel-kicker">ACoder</div>
          <!-- <div class="panel-title">ACoder</div> -->
        </div>
        <div class="panel-actions">
          <a-button size="mini" @click="loadSession">刷新</a-button>
          <a-button size="mini" @click="clearCurrentSession">清空会话</a-button>
        </div>
      </div>

      <div class="ai-chat-body">
        <div v-if="generating" class="ai-toolbar">
          <div class="toolbar-right">
            <a-button size="mini" status="warning" @click="stopGenerating">
              停止
            </a-button>
          </div>
        </div>

        <a-alert
          v-if="!enabled"
          :content="disableReason || 'AI 当前不可用'"
          type="warning"
          style="margin-bottom: 12px"
        />

        <div ref="messageBoxRef" class="ai-message-box">
          <a-spin v-if="loadingHistory" style="width: 100%; margin-top: 24px" />
          <template v-else>
            <div v-if="messages.length === 0" class="empty-state">
              <div class="empty-orb" />
              <div class="empty-title">随时开始一段新的解题协作</div>
            </div>

            <div
              v-for="(msg, idx) in messages"
              :key="`${msg.role}-${idx}-${msg.id ?? 'temp'}`"
              class="msg-row"
              :class="msg.role === 'user' ? 'user' : 'assistant'"
            >
              <div class="msg-role">
                <span class="role-dot" />
                {{ msg.role === "user" ? "你" : "ACoder" }}
              </div>

              <div class="msg-content">
                <template
                  v-if="msg.role === 'assistant' && hasMessageDetails(msg)"
                >
                  <button
                    class="trace-toggle"
                    @click="toggleMessageDetails(idx)"
                  >
                    <span class="trace-toggle-main">
                      <span class="trace-dot" />
                      <span class="trace-toggle-label">
                        {{ getTraceToggleLabel(msg) }}
                      </span>
                    </span>
                    <span class="trace-toggle-side">
                      <span class="trace-meta">{{
                        getTraceToggleSummary(msg)
                      }}</span>
                      <span
                        class="trace-chevron"
                        :class="{ open: msg.showDetails }"
                      >
                        ˅
                      </span>
                    </span>
                  </button>
                </template>

                <div
                  v-if="msg.role === 'assistant' && msg.showDetails"
                  class="assistant-details"
                >
                  <div
                    v-if="msg.reasoningSummary"
                    class="detail-card reasoning-card"
                  >
                    <div class="detail-title">思考过程（摘要）</div>
                    <div v-if="msg.streaming" class="plain-text detail-text">
                      {{ msg.reasoningSummary }}
                    </div>
                    <MdViewer v-else :value="msg.reasoningSummary || ''" />
                  </div>

                  <div
                    v-if="msg.toolEvents && msg.toolEvents.length"
                    class="detail-card tool-card"
                  >
                    <div class="detail-title">工具轨迹</div>
                    <div class="tool-event-list">
                      <div
                        v-for="(toolEvent, toolIndex) in msg.toolEvents"
                        :key="`${toolEvent.toolName ?? 'tool'}-${toolIndex}`"
                        class="tool-event-item"
                      >
                        <div class="tool-event-head">
                          <span class="tool-name">{{
                            toolEvent.toolName || "tool"
                          }}</span>
                          <span
                            class="tool-status"
                            :class="resolveToolStatusClass(toolEvent.status)"
                          >
                            {{ formatToolStatus(toolEvent.status) }}
                          </span>
                        </div>
                        <div class="tool-summary">
                          {{ toolEvent.summary || "已完成工具调用" }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <template v-if="msg.role === 'assistant'">
                  <div
                    v-if="msg.streaming"
                    class="plain-text streaming-text"
                    :class="{ 'is-placeholder': !msg.content }"
                  >
                    {{ msg.content || "AI 正在思考…" }}
                  </div>
                  <MdViewer v-else :value="msg.content || ''" />
                </template>

                <template v-else>
                  <div class="plain-text">{{ msg.content }}</div>
                </template>
              </div>
            </div>
          </template>
        </div>

        <div class="ai-input-box">
          <a-textarea
            v-model="inputMessage"
            :max-length="2000"
            :auto-size="{ minRows: 3, maxRows: 7 }"
            placeholder="问我思路、错误定位、复杂度优化建议，或让 Agent 帮你分析最近提交..."
            allow-clear
          />
          <div class="ai-send-row">
            <div class="send-actions">
              <label class="agent-switch" :class="{ active: agentEnabled }">
                <a-switch v-model="agentEnabled" size="small" />
                <span class="agent-switch-label">Agent</span>
              </label>
              <a-button
                type="primary"
                class="send-button"
                :loading="sending"
                :disabled="!enabled || generating"
                @click="sendMessage"
              >
                发送
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="ai-chat-entry">
    <a-button
      class="ai-entry-button"
      type="primary"
      shape="round"
      @click="openPanel"
    >
      ACoder AI
    </a-button>
    <a-drawer
      v-model:visible="visible"
      :width="520"
      placement="right"
      unmount-on-close
      :footer="false"
    >
      <template #title>ACoder AI</template>
      <div class="ai-chat-shell drawer-shell">
        <div class="ai-chat-header">
          <div class="panel-copy">
            <!-- <div class="panel-kicker">Agent Workspace</div> -->
            <div class="panel-title">ACoder AI</div>
          </div>
          <div class="panel-actions">
            <a-button size="mini" @click="loadSession">刷新</a-button>
            <a-button size="mini" @click="clearCurrentSession"
              >清空会话</a-button
            >
          </div>
        </div>

        <div class="ai-chat-body">
          <div v-if="generating" class="ai-toolbar">
            <div class="toolbar-right">
              <a-button size="mini" status="warning" @click="stopGenerating">
                停止
              </a-button>
            </div>
          </div>

          <a-alert
            v-if="!enabled"
            :content="disableReason || 'AI 当前不可用'"
            type="warning"
            style="margin-bottom: 12px"
          />

          <div ref="messageBoxRef" class="ai-message-box">
            <a-spin
              v-if="loadingHistory"
              style="width: 100%; margin-top: 24px"
            />
            <template v-else>
              <div v-if="messages.length === 0" class="empty-state">
                <div class="empty-orb" />
                <div class="empty-title">随时开始一段新的解题协作</div>
                <div class="empty-desc">
                  Agent 模式会结合题目、代码、判题结果和工具执行轨迹给出答案。
                </div>
              </div>

              <div
                v-for="(msg, idx) in messages"
                :key="`${msg.role}-${idx}-${msg.id ?? 'temp'}`"
                class="msg-row"
                :class="msg.role === 'user' ? 'user' : 'assistant'"
              >
                <div class="msg-role">
                  <span class="role-dot" />
                  {{ msg.role === "user" ? "你" : "ACoder AI" }}
                </div>

                <div class="msg-content">
                  <template
                    v-if="msg.role === 'assistant' && hasMessageDetails(msg)"
                  >
                    <button
                      class="trace-toggle"
                      @click="toggleMessageDetails(idx)"
                    >
                      <span class="trace-toggle-main">
                        <span class="trace-dot" />
                        <span class="trace-toggle-label">
                          {{ getTraceToggleLabel(msg) }}
                        </span>
                      </span>
                      <span class="trace-toggle-side">
                        <span class="trace-meta">{{
                          getTraceToggleSummary(msg)
                        }}</span>
                        <span
                          class="trace-chevron"
                          :class="{ open: msg.showDetails }"
                        >
                          ˅
                        </span>
                      </span>
                    </button>
                  </template>

                  <div
                    v-if="msg.role === 'assistant' && msg.showDetails"
                    class="assistant-details"
                  >
                    <div
                      v-if="msg.reasoningSummary"
                      class="detail-card reasoning-card"
                    >
                      <div class="detail-title">思考过程（摘要）</div>
                      <div v-if="msg.streaming" class="plain-text detail-text">
                        {{ msg.reasoningSummary }}
                      </div>
                      <MdViewer v-else :value="msg.reasoningSummary || ''" />
                    </div>

                    <div
                      v-if="msg.toolEvents && msg.toolEvents.length"
                      class="detail-card tool-card"
                    >
                      <div class="detail-title">工具轨迹</div>
                      <div class="tool-event-list">
                        <div
                          v-for="(toolEvent, toolIndex) in msg.toolEvents"
                          :key="`${toolEvent.toolName ?? 'tool'}-${toolIndex}`"
                          class="tool-event-item"
                        >
                          <div class="tool-event-head">
                            <span class="tool-name">{{
                              toolEvent.toolName || "tool"
                            }}</span>
                            <span
                              class="tool-status"
                              :class="resolveToolStatusClass(toolEvent.status)"
                            >
                              {{ formatToolStatus(toolEvent.status) }}
                            </span>
                          </div>
                          <div class="tool-summary">
                            {{ toolEvent.summary || "已完成工具调用" }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <template v-if="msg.role === 'assistant'">
                    <div
                      v-if="msg.streaming"
                      class="plain-text streaming-text"
                      :class="{ 'is-placeholder': !msg.content }"
                    >
                      {{
                        msg.content || "AI 正在整理最终答案，思考过程已折叠…"
                      }}
                    </div>
                    <MdViewer v-else :value="msg.content || ''" />
                  </template>

                  <template v-else>
                    <div class="plain-text">{{ msg.content }}</div>
                  </template>
                </div>
              </div>
            </template>
          </div>

          <div class="ai-input-box">
            <a-textarea
              v-model="inputMessage"
              :max-length="2000"
              :auto-size="{ minRows: 3, maxRows: 7 }"
              placeholder="问我思路、错误定位、复杂度优化建议，或让 Agent 帮你分析最近提交..."
              allow-clear
            />
            <div class="ai-send-row">
              <span class="tips">
                Shift+Enter 换行。默认只展示最终结果，思考与工具轨迹可按需展开。
              </span>
              <div class="send-actions">
                <label class="agent-switch" :class="{ active: agentEnabled }">
                  <a-switch v-model="agentEnabled" size="small" />
                  <span class="agent-switch-label">Agent</span>
                </label>
                <a-button
                  type="primary"
                  class="send-button"
                  :loading="sending"
                  :disabled="!enabled || generating"
                  @click="sendMessage"
                >
                  发送
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  withDefaults,
} from "vue";
import message from "@arco-design/web-vue/es/message";
import MdViewer from "@/components/MdViewer.vue";
import { OpenAPI } from "../../generated/core/OpenAPI";

interface Props {
  questionId: string | number;
  contestId?: string | number;
  questionTitle?: string;
  questionContent?: string;
  userCode?: string;
  latestJudgeResult?: string;
  language?: string;
  embedded?: boolean;
}

interface ToolEvent {
  toolName?: string;
  status?: string;
  summary?: string;
}

interface ChatMessage {
  id?: number | string;
  role: "user" | "assistant";
  mode?: string;
  rawContent: string;
  content: string;
  reasoningSummary: string;
  reasoningStartedAt?: number;
  reasoningDurationMs?: number;
  streaming?: boolean;
  toolEvents: ToolEvent[];
  showDetails: boolean;
}

interface ParsedAssistantPayload {
  finalContent: string;
  reasoningSummary: string;
  hasStructuredPayload: boolean;
}

const ANALYSIS_OPEN = "<analysis>";
const ANALYSIS_CLOSE = "</analysis>";
const FINAL_OPEN = "<final>";
const FINAL_CLOSE = "</final>";

const props = withDefaults(defineProps<Props>(), {
  contestId: "",
  questionTitle: "",
  questionContent: "",
  userCode: "",
  latestJudgeResult: "",
  language: "java",
  embedded: false,
});

const visible = ref(false);
const loadingHistory = ref(false);
const sending = ref(false);
const generating = ref(false);
const enabled = ref(true);
const disableReason = ref("");
const mode = ref("normal");
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref("");
const messageBoxRef = ref<HTMLElement | null>(null);
let abortController: AbortController | null = null;

const numericQuestionId = computed(() => Number(props.questionId || 0));
const numericContestId = computed(() => Number(props.contestId || 0));
const embedded = computed(() => props.embedded);
const agentEnabled = computed({
  get: () => mode.value === "agent",
  set: (enabled: boolean) => {
    mode.value = enabled ? "agent" : "normal";
  },
});

const openPanel = async () => {
  visible.value = true;
  await loadSession();
};

const loadSession = async () => {
  if (!numericQuestionId.value) {
    return;
  }
  loadingHistory.value = true;
  try {
    const res = await requestJson("/api/ai/chat/session/get", {
      questionId: numericQuestionId.value,
      contestId: numericContestId.value || 0,
    });
    if (res.code !== 0) {
      message.error(res.message || "加载 AI 会话失败");
      return;
    }
    enabled.value = !!res.data.enabled;
    disableReason.value = res.data.disableReason || "";
    mode.value = res.data.mode || "normal";
    messages.value = (res.data.messageList || []).map(
      (item: Record<string, unknown>) => buildHistoryMessage(item)
    );
    await scrollToBottom();
  } catch (error: unknown) {
    message.error(getErrorMessage(error, "加载 AI 会话失败"));
  } finally {
    loadingHistory.value = false;
  }
};

const clearCurrentSession = async () => {
  if (!numericQuestionId.value) {
    return;
  }
  const res = await requestJson("/api/ai/chat/session/clear", {
    questionId: numericQuestionId.value,
    contestId: numericContestId.value || 0,
  });
  if (res.code === 0) {
    messages.value = [];
    message.success("会话已清空");
  } else {
    message.error(res.message || "清空失败");
  }
};

const sendMessage = async () => {
  const currentMessage = inputMessage.value.trim();
  if (!currentMessage) {
    return;
  }
  if (!enabled.value) {
    message.warning(disableReason.value || "AI 当前不可用");
    return;
  }

  const payload = {
    questionId: numericQuestionId.value,
    contestId: numericContestId.value || 0,
    mode: mode.value,
    message: currentMessage,
    language: props.language || "java",
    userCode: props.userCode || "",
    latestJudgeResult: props.latestJudgeResult || "",
  };

  const nextMessages = [...messages.value];
  nextMessages.push(createUserMessage(payload.message));
  nextMessages.push(
    createAssistantMessage("", {
      mode: mode.value,
      reasoningStartedAt: Date.now(),
      streaming: true,
    })
  );
  messages.value = nextMessages;
  const assistantIndex = messages.value.length - 1;

  inputMessage.value = "";
  generating.value = true;
  sending.value = true;
  await scrollToBottom();

  abortController = new AbortController();
  try {
    const response = await fetch(`${OpenAPI.BASE}/api/ai/chat/message/stream`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
    if (!response.ok || !response.body) {
      throw new Error("流式接口调用失败");
    }
    await readSseStream(response.body, assistantIndex);
  } catch (error: unknown) {
    if ((error as { name?: string })?.name !== "AbortError") {
      message.warning("流式响应失败，自动切换为普通接口");
      try {
        const normalRes = await requestJson(
          "/api/ai/chat/message/send",
          payload
        );
        if (normalRes.code === 0) {
          replaceMessage(assistantIndex, (current) =>
            normalizeAssistantMessage({
              ...current,
              id: normalRes.data.id as number,
              mode:
                typeof normalRes.data.mode === "string"
                  ? normalRes.data.mode
                  : current.mode,
              rawContent:
                typeof normalRes.data.rawContent === "string"
                  ? normalRes.data.rawContent
                  : typeof normalRes.data.content === "string"
                  ? normalRes.data.content
                  : current.rawContent,
              content:
                typeof normalRes.data.finalContent === "string"
                  ? normalRes.data.finalContent
                  : current.content,
              reasoningSummary:
                typeof normalRes.data.reasoningSummary === "string"
                  ? normalRes.data.reasoningSummary
                  : current.reasoningSummary,
              reasoningDurationMs:
                typeof normalRes.data.reasoningDurationMs === "number"
                  ? normalRes.data.reasoningDurationMs
                  : resolveReasoningDurationMs(current),
              streaming: false,
              toolEvents: parseToolEvents(normalRes.data.toolCalls),
            })
          );
        } else {
          replaceMessage(assistantIndex, (current) =>
            normalizeAssistantMessage({
              ...current,
              rawContent: `请求失败：${normalRes.message || "未知错误"}`,
              reasoningDurationMs: resolveReasoningDurationMs(current),
              streaming: false,
            })
          );
        }
      } catch (fallbackError: unknown) {
        replaceMessage(assistantIndex, (current) =>
          normalizeAssistantMessage({
            ...current,
            rawContent: getErrorMessage(fallbackError, "请求失败"),
            reasoningDurationMs: resolveReasoningDurationMs(current),
            streaming: false,
          })
        );
      }
    } else {
      replaceMessage(assistantIndex, (current) => ({
        ...current,
        reasoningDurationMs: resolveReasoningDurationMs(current),
        streaming: false,
      }));
    }
  } finally {
    sending.value = false;
    generating.value = false;
    abortController = null;
    await scrollToBottom();
  }
};

const stopGenerating = () => {
  if (!abortController) {
    return;
  }
  abortController.abort();
  abortController = null;
  generating.value = false;
  sending.value = false;
};

const readSseStream = async (
  stream: ReadableStream<Uint8Array>,
  assistantIndex: number
) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let finished = false;

  while (!finished) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    buffer = buffer.replace(/\r\n/g, "\n");

    const frames = buffer.split("\n\n");
    buffer = frames.pop() || "";

    for (const frame of frames) {
      if (!frame.trim()) {
        continue;
      }
      finished = (await handleSseFrame(frame, assistantIndex)) || finished;
      if (finished) {
        break;
      }
    }

    if (done) {
      if (buffer.trim()) {
        await handleSseFrame(buffer, assistantIndex);
      }
      break;
    }
  }
};

const handleSseFrame = async (
  frame: string,
  assistantIndex: number
): Promise<boolean> => {
  const { eventType, dataRaw } = parseSseFrame(frame);
  if (eventType === "delta") {
    appendAssistantContent(assistantIndex, parseSseData(dataRaw));
    await scrollToBottom();
    return false;
  }
  if (eventType === "tool") {
    const toolData = safeParseJson(dataRaw);
    if (toolData && typeof toolData === "object") {
      appendToolEvent(assistantIndex, toolData as ToolEvent);
      await scrollToBottom();
    }
    return false;
  }
  if (eventType === "error") {
    throw new Error(parseSseData(dataRaw) || "流式输出异常");
  }
  if (eventType === "done") {
    const donePayload = safeParseJson(dataRaw);
    finalizeAssistantMessage(
      assistantIndex,
      donePayload && typeof donePayload === "object"
        ? (donePayload as Record<string, unknown>)
        : {}
    );
    await scrollToBottom();
    return true;
  }
  return false;
};

const parseSseFrame = (frame: string) => {
  const lines = frame.split("\n");
  let eventType = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = extractSseValue(line, "event");
    } else if (line.startsWith("data:")) {
      dataLines.push(extractSseValue(line, "data"));
    }
  }

  return {
    eventType,
    dataRaw: dataLines.join("\n"),
  };
};

const extractSseValue = (line: string, field: string): string => {
  const value = line.slice(field.length + 1);
  return value.startsWith(" ") ? value.slice(1) : value;
};

const appendAssistantContent = (assistantIndex: number, chunk: string) => {
  if (!chunk) {
    return;
  }
  replaceMessage(assistantIndex, (current) =>
    normalizeAssistantMessage({
      ...current,
      rawContent: `${current.rawContent || ""}${chunk}`,
    })
  );
};

const appendToolEvent = (assistantIndex: number, event: ToolEvent) => {
  replaceMessage(assistantIndex, (current) => ({
    ...current,
    toolEvents: [...(current.toolEvents || []), event],
  }));
};

const finalizeAssistantMessage = (
  assistantIndex: number,
  payload: Record<string, unknown>
) => {
  replaceMessage(assistantIndex, (current) =>
    normalizeAssistantMessage({
      ...current,
      id:
        typeof payload.messageId === "number" ||
        typeof payload.messageId === "string"
          ? (payload.messageId as number | string)
          : current.id,
      mode: typeof payload.mode === "string" ? payload.mode : current.mode,
      rawContent:
        typeof payload.rawContent === "string" && payload.rawContent.length > 0
          ? payload.rawContent
          : typeof payload.content === "string" && payload.content.length > 0
          ? payload.content
          : current.rawContent,
      content:
        typeof payload.finalContent === "string" &&
        payload.finalContent.length > 0
          ? payload.finalContent
          : current.content,
      reasoningSummary:
        typeof payload.reasoningSummary === "string"
          ? payload.reasoningSummary
          : current.reasoningSummary,
      reasoningDurationMs:
        typeof payload.reasoningDurationMs === "number"
          ? payload.reasoningDurationMs
          : resolveReasoningDurationMs(current),
      streaming: false,
    })
  );
};

const replaceMessage = (
  index: number,
  updater: (current: ChatMessage) => ChatMessage
) => {
  const current = messages.value[index];
  if (!current) {
    return;
  }
  const next = [...messages.value];
  next[index] = updater(current);
  messages.value = next;
};

const resolveReasoningDurationMs = (msg: ChatMessage) => {
  if (typeof msg.reasoningDurationMs === "number") {
    return msg.reasoningDurationMs;
  }
  if (typeof msg.reasoningStartedAt === "number") {
    return Math.max(Date.now() - msg.reasoningStartedAt, 0);
  }
  return undefined;
};

const toggleMessageDetails = (index: number) => {
  replaceMessage(index, (current) => ({
    ...current,
    showDetails: !current.showDetails,
  }));
};

const hasMessageDetails = (msg: ChatMessage) =>
  !!msg.reasoningSummary || !!msg.toolEvents?.length;

const formatReasoningDuration = (msg: ChatMessage) => {
  const durationMs = resolveReasoningDurationMs(msg);
  if (durationMs === undefined || durationMs < 1000) {
    return "";
  }
  return `${Math.max(1, Math.round(durationMs / 1000))}s`;
};

const getTraceToggleLabel = (msg: ChatMessage) => {
  if (msg.streaming) {
    const duration = formatReasoningDuration(msg);
    return duration ? `思考中 ${duration}` : "思考中";
  }
  const duration = formatReasoningDuration(msg);
  return duration ? `思考 ${duration}` : "思考过程";
};

const buildTraceMeta = (msg: ChatMessage) => {
  const parts: string[] = [];
  if (msg.reasoningSummary) {
    parts.push(msg.showDetails ? "点击折叠" : "点击查看");
  }
  if (msg.toolEvents?.length) {
    parts.push(`${msg.toolEvents.length} 个工具事件`);
  }
  return parts.join(" / ");
};

const getTraceToggleSummary = (msg: ChatMessage) => {
  const meta = buildTraceMeta(msg);
  if (meta) {
    return meta;
  }
  return msg.showDetails ? "点击折叠" : "点击展开";
};

const formatToolStatus = (status?: string) => {
  if (status === "done") {
    return "已完成";
  }
  if (status === "skipped") {
    return "已跳过";
  }
  if (status === "error") {
    return "异常";
  }
  return status || "处理中";
};

const resolveToolStatusClass = (status?: string) => {
  if (status === "done") {
    return "is-done";
  }
  if (status === "skipped") {
    return "is-skipped";
  }
  if (status === "error") {
    return "is-error";
  }
  return "is-running";
};

const createUserMessage = (content: string): ChatMessage => ({
  role: "user",
  mode: mode.value,
  rawContent: content,
  content,
  reasoningSummary: "",
  reasoningDurationMs: undefined,
  streaming: false,
  toolEvents: [],
  showDetails: false,
});

const createAssistantMessage = (
  rawContent: string,
  overrides: Partial<ChatMessage> = {}
): ChatMessage =>
  normalizeAssistantMessage({
    role: "assistant",
    mode: mode.value,
    rawContent,
    content: "",
    reasoningSummary: "",
    reasoningStartedAt: undefined,
    reasoningDurationMs: undefined,
    streaming: false,
    toolEvents: [],
    showDetails: false,
    ...overrides,
  });

const buildHistoryMessage = (item: Record<string, unknown>): ChatMessage => {
  const role = item.role === "assistant" ? "assistant" : "user";
  if (role === "assistant") {
    return createAssistantMessage(
      typeof item.rawContent === "string"
        ? item.rawContent
        : typeof item.content === "string"
        ? item.content
        : "",
      {
        id:
          typeof item.id === "number" || typeof item.id === "string"
            ? (item.id as number | string)
            : undefined,
        mode: typeof item.mode === "string" ? item.mode : undefined,
        content:
          typeof item.finalContent === "string"
            ? item.finalContent
            : typeof item.content === "string"
            ? item.content
            : "",
        reasoningSummary:
          typeof item.reasoningSummary === "string"
            ? item.reasoningSummary
            : "",
        reasoningDurationMs:
          typeof item.reasoningDurationMs === "number"
            ? item.reasoningDurationMs
            : undefined,
        streaming: false,
        toolEvents: parseToolEvents(item.toolCalls),
      }
    );
  }
  return {
    id:
      typeof item.id === "number" || typeof item.id === "string"
        ? (item.id as number | string)
        : undefined,
    role: "user",
    mode: typeof item.mode === "string" ? item.mode : undefined,
    rawContent: typeof item.content === "string" ? item.content : "",
    content: typeof item.content === "string" ? item.content : "",
    reasoningSummary: "",
    reasoningDurationMs: undefined,
    streaming: false,
    toolEvents: [],
    showDetails: false,
  };
};

const normalizeAssistantMessage = (messageState: ChatMessage): ChatMessage => {
  const parsed = parseAssistantPayload(messageState.rawContent || "");
  const finalContent = parsed.hasStructuredPayload
    ? parsed.finalContent
    : messageState.content || messageState.rawContent || "";
  const reasoningSummary =
    parsed.reasoningSummary || messageState.reasoningSummary;

  return {
    ...messageState,
    content: finalContent,
    reasoningSummary,
    showDetails:
      messageState.showDetails &&
      (reasoningSummary.length > 0 || messageState.toolEvents.length > 0),
  };
};

const parseAssistantPayload = (raw: string): ParsedAssistantPayload => {
  const normalized = raw || "";
  const lower = normalized.toLowerCase();

  const analysisOpenIndex = lower.indexOf(ANALYSIS_OPEN);
  const analysisCloseIndex = lower.indexOf(ANALYSIS_CLOSE);
  const finalOpenIndex = lower.indexOf(FINAL_OPEN);
  const finalCloseIndex = lower.indexOf(FINAL_CLOSE);
  const hasStructuredPayload = analysisOpenIndex >= 0 || finalOpenIndex >= 0;

  const reasoningSummary =
    analysisOpenIndex >= 0
      ? normalized
          .slice(
            analysisOpenIndex + ANALYSIS_OPEN.length,
            analysisCloseIndex >= 0 ? analysisCloseIndex : normalized.length
          )
          .trim()
      : "";

  let finalContent = "";
  if (finalOpenIndex >= 0) {
    finalContent = normalized
      .slice(
        finalOpenIndex + FINAL_OPEN.length,
        finalCloseIndex >= 0 ? finalCloseIndex : normalized.length
      )
      .trim();
  } else if (!hasStructuredPayload) {
    finalContent = normalized;
  }

  return {
    finalContent,
    reasoningSummary,
    hasStructuredPayload,
  };
};

const parseSseData = (raw: string): string => {
  const parsed = safeParseJson(raw);
  if (typeof parsed === "string") {
    return parsed;
  }
  if (parsed === null || parsed === undefined) {
    return raw;
  }
  return JSON.stringify(parsed);
};

const safeParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return raw;
  }
};

const parseToolEvents = (toolCallsRaw: unknown): ToolEvent[] => {
  if (typeof toolCallsRaw !== "string" || !toolCallsRaw.trim()) {
    return [];
  }
  const parsed = safeParseJson(toolCallsRaw);
  return Array.isArray(parsed) ? (parsed as ToolEvent[]) : [];
};

const requestJson = async (
  path: string,
  body: Record<string, unknown>
): Promise<Record<string, any>> => {
  const response = await fetch(`${OpenAPI.BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.json();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageBoxRef.value) {
    messageBoxRef.value.scrollTop = messageBoxRef.value.scrollHeight;
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

watch(
  () => [props.questionId, props.contestId],
  async () => {
    if (embedded.value || visible.value) {
      await loadSession();
    }
  }
);

onMounted(async () => {
  if (embedded.value) {
    await loadSession();
  }
});

onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
});
</script>

<style scoped>
.ai-chat-entry {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 24;
}

.ai-entry-button {
  border: 1px solid #dbeafe;
  background: #2563eb;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
}

.ai-chat-panel,
.ai-chat-shell {
  height: 100%;
  min-height: 0;
}

.embedded {
  min-height: 0;
}

.ai-chat-shell {
  --ai-bg: #ffffff;
  --ai-subtle: #f8fafc;
  --ai-muted-bg: #f3f4f6;
  --ai-border: #e5e7eb;
  --ai-border-strong: #d1d5db;
  --ai-text: #111827;
  --ai-muted: #6b7280;
  --ai-primary: #2563eb;
  --ai-primary-soft: #eff6ff;
  --ai-success: #15803d;
  --ai-warning: #6b7280;
  --ai-danger: #dc2626;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--ai-bg);
  border: 1px solid var(--ai-border);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  color: var(--ai-text);
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.drawer-shell {
  height: calc(100vh - 118px);
}

.ai-chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px;
  border-bottom: 1px solid var(--ai-border);
  background: var(--ai-bg);
}

.panel-kicker {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--ai-primary-soft);
  border: 1px solid #dbeafe;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ai-primary);
}

.panel-title {
  margin-top: 10px;
  font-size: 22px;
  line-height: 1;
  font-weight: 600;
  color: var(--ai-text);
}

.panel-subtitle {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ai-muted);
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.ai-chat-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 16px;
  background: var(--ai-subtle);
}

.ai-toolbar,
.toolbar-right,
.ai-send-row {
  display: flex;
  align-items: center;
}

.ai-toolbar,
.ai-send-row {
  justify-content: space-between;
}

.ai-toolbar {
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-right {
  gap: 10px;
}

.send-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: space-between;
}

.agent-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--ai-border);
  background: var(--ai-bg);
  color: var(--ai-muted);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.agent-switch.active {
  border-color: #bfdbfe;
  background: var(--ai-primary-soft);
  color: var(--ai-text);
}

.agent-switch-label {
  font-size: 12px;
  font-weight: 600;
  color: inherit;
}

.ai-message-box {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--ai-border);
  background: var(--ai-bg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 240px;
  text-align: center;
}

.empty-orb {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--ai-primary-soft);
  border: 1px solid #dbeafe;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ai-text);
}

.empty-desc {
  max-width: 320px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ai-muted);
}

.msg-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.user.msg-row {
  align-items: flex-end;
}

.assistant.msg-row {
  align-items: flex-start;
}

.msg-role {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  font-size: 12px;
  color: var(--ai-muted);
  width: fit-content;
  max-width: 88%;
}

.user .msg-role {
  flex-direction: row-reverse;
}

.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ai-primary);
}

.msg-content {
  width: fit-content;
  max-width: 88%;
  border-radius: 14px;
  padding: 14px;
  background: var(--ai-bg);
  border: 1px solid var(--ai-border);
}

.user .msg-content {
  background: var(--ai-primary-soft);
  border-color: #dbeafe;
}

.assistant .msg-content {
  background: var(--ai-bg);
}

.plain-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--ai-text);
  line-height: 1.75;
}

.streaming-text {
  color: var(--ai-text);
}

.streaming-text.is-placeholder {
  color: var(--ai-muted);
}

.trace-toggle {
  display: inline-flex;
  width: auto;
  max-width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 14px;
  border: 1px solid var(--ai-border);
  border-radius: 999px;
  background: #f7f7f6;
  color: var(--ai-text);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.trace-toggle:hover {
  border-color: var(--ai-border-strong);
  background: var(--ai-muted-bg);
}

.trace-meta {
  font-size: 11px;
  color: var(--ai-muted);
}

.trace-toggle-main,
.trace-toggle-side {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.trace-toggle-label {
  font-size: 12px;
  font-weight: 600;
}

.trace-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.trace-chevron {
  font-size: 12px;
  color: var(--ai-muted);
  transition: transform 0.2s ease;
}

.trace-chevron.open {
  transform: rotate(180deg);
}

.assistant-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
  padding-left: 14px;
  border-left: 2px solid #efe5cf;
}

.detail-card {
  border-radius: 12px;
  padding: 12px;
  background: var(--ai-subtle);
  border: 1px solid var(--ai-border);
}

.reasoning-card {
  background: #fffdf7;
  border-color: #eadfbe;
}

.detail-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-text {
  line-height: 1.7;
  color: var(--ai-text);
}

.tool-event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-event-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--ai-bg);
  border: 1px solid var(--ai-border);
}

.tool-event-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tool-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text);
}

.tool-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.tool-status.is-done {
  color: var(--ai-success);
  background: #f0fdf4;
}

.tool-status.is-skipped {
  color: var(--ai-warning);
  background: #f3f4f6;
}

.tool-status.is-error {
  color: var(--ai-danger);
  background: #fef2f2;
}

.tool-status.is-running {
  color: var(--ai-primary);
  background: var(--ai-primary-soft);
}

.tool-summary {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ai-muted);
}

.ai-input-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: var(--ai-bg);
  border: 1px solid var(--ai-border);
}

.ai-send-row {
  gap: 12px;
  margin-top: 10px;
}

.tips {
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-muted);
}

.send-button {
  border: 1px solid #dbeafe;
  background: var(--ai-primary);
  box-shadow: none;
}

:deep(.arco-radio-group-button .arco-radio-button) {
  background: var(--ai-bg);
  color: var(--ai-muted);
  border-color: var(--ai-border);
}

:deep(.arco-radio-group-button .arco-radio-button.arco-radio-checked) {
  background: var(--ai-primary-soft);
  color: var(--ai-primary);
  border-color: #bfdbfe;
}

:deep(.arco-textarea-wrapper),
:deep(.arco-textarea) {
  background: var(--ai-subtle);
  color: var(--ai-text);
  border-color: var(--ai-border);
}

:deep(.arco-textarea::placeholder) {
  color: #9ca3af;
}

:deep(.arco-alert) {
  border-radius: 12px;
}

:deep(.arco-switch) {
  background: #d1d5db;
}

:deep(.arco-switch.arco-switch-checked) {
  background: #6366f1;
}

:deep(.arco-btn-size-mini) {
  border-radius: 8px;
}

:deep(.arco-btn-primary:hover),
:deep(.arco-btn-primary:focus) {
  background: #1d4ed8;
}

:deep(.bytemd) {
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  overflow: hidden;
}

@media (max-width: 1280px) {
  .ai-chat-header,
  .ai-send-row {
    flex-direction: column;
    align-items: stretch;
  }

  .panel-actions,
  .toolbar-right,
  .send-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .ai-chat-entry {
    right: 14px;
    bottom: 14px;
  }

  .panel-title {
    font-size: 22px;
  }

  .ai-chat-body {
    padding: 12px;
  }

  .ai-message-box {
    padding: 12px;
  }
}
</style>
