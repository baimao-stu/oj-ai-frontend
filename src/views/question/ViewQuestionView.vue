<template>
  <div id="ViewQuestionView">
    <div
      ref="workspaceRef"
      class="workspace"
      :class="{ stacked: isStacked, 'workspace--ai-collapsed': aiCollapsed }"
    >
      <section
        class="workspace-pane question-pane"
        :class="{ collapsed: questionCollapsed }"
        :style="getPaneStyle(0)"
      >
        <div
          v-if="questionCollapsed"
          class="pane-collapsed-rail"
          @click="expandQuestionPane"
        >
          <div class="rail-badge">Q</div>
          <div class="rail-title">Question</div>
          <div class="rail-hint">点击展开</div>
        </div>
        <div v-else class="pane-surface">
          <a-tabs
            :active-key="tabsKey"
            class="pane-tabs"
            @tab-click="onTabClick"
          >
            <a-tab-pane key="question" title="题目描述">
              <div class="pane-scroll pane-scroll--question">
                <div v-if="question" class="question-block">
                  <div class="question-title-row">
                    <div>
                      <div class="eyebrow">Question</div>
                      <h1 class="question-title">
                        {{ question.id }}. {{ question.title }}
                      </h1>
                    </div>
                    <div class="question-stats">
                      <span>通过 {{ question.acceptedNum ?? 0 }}</span>
                      <span>提交 {{ question.subNum ?? 0 }}</span>
                    </div>
                  </div>

                  <a-space wrap class="question-tags">
                    <a-tag
                      v-for="(tag, index) in question.tags || []"
                      :key="`${tag}-${index}`"
                      color="arcoblue"
                    >
                      {{ tag }}
                    </a-tag>
                  </a-space>

                  <a-descriptions
                    title="判题条件"
                    :column="questionMetaColumns"
                    class="question-meta"
                  >
                    <a-descriptions-item label="时间限制">
                      {{ question.judgeConfig?.timeLimit ?? 0 }} ms
                    </a-descriptions-item>
                    <a-descriptions-item label="内存限制">
                      {{ memoryLimitText }}
                    </a-descriptions-item>
                    <a-descriptions-item label="测试用例数">
                      {{ question.judgeCaseNumber ?? 0 }}
                    </a-descriptions-item>
                  </a-descriptions>

                  <MdViewer :value="question.content || ''" />
                </div>
                <a-empty v-else description="题目信息加载中" />
              </div>
            </a-tab-pane>

            <a-tab-pane key="submissions" title="提交记录">
              <div class="pane-scroll pane-scroll--submission">
                <div class="temp">
                  <template v-if="!isLogin">
                    <div class="auth-empty-state">
                      <a-empty description="登录后可查看自己的提交记录">
                        <a-button type="primary" @click="goToLogin">
                          去登录
                        </a-button>
                      </a-empty>
                    </div>
                  </template>

                  <template v-else-if="showSubmissionsTable">
                    <div class="submission-block">
                      <div class="question-title-row">
                        <div>
                          <div class="eyebrow">Submissions</div>
                          <h2 class="question-title submission-title">
                            提交记录
                          </h2>
                        </div>
                        <div class="question-stats">
                          <span>共 {{ total }} 条</span>
                          <span>仅展示我的提交</span>
                        </div>
                      </div>

                      <div class="submission-panel">
                        <div class="submission-filter-bar">
                          <a-select
                            v-model="searchParams.judgeStatus"
                            allow-clear
                            class="submission-filter"
                            placeholder="所有状态"
                            @change="onSubmissionFilterChange"
                          >
                            <a-option
                              v-for="item in submissionJudgeStatusOptions"
                              :key="item.value"
                              :value="item.value"
                            >
                              {{ item.label }}
                            </a-option>
                          </a-select>
                          <a-select
                            v-model="searchParams.language"
                            allow-clear
                            class="submission-filter"
                            placeholder="所有语言"
                            @change="onSubmissionFilterChange"
                          >
                            <a-option
                              v-for="language in submissionLanguageOptions"
                              :key="language"
                              :value="language"
                            >
                              {{ language }}
                            </a-option>
                          </a-select>
                        </div>

                        <div class="submission-board">
                          <div class="submission-list-head">
                            <div class="submission-col submission-col--id">
                              #
                            </div>
                            <div class="submission-col submission-col--result">
                              提交结果
                            </div>
                            <div
                              class="submission-col submission-col--language"
                            >
                              语言
                            </div>
                            <div class="submission-col submission-col--runtime">
                              执行用时
                            </div>
                            <div class="submission-col submission-col--memory">
                              消耗内存
                            </div>
                            <div class="submission-col submission-col--remark">
                              备注
                            </div>
                          </div>

                          <a-spin
                            :loading="loadTable"
                            class="submission-list-body"
                          >
                            <template v-if="dataList.length">
                              <div
                                v-for="record in dataList"
                                :key="record.id"
                                class="submission-row"
                              >
                                <div class="submission-col submission-col--id">
                                  {{ record.id ?? "-" }}
                                </div>
                                <div
                                  class="submission-col submission-col--result"
                                >
                                  <button
                                    type="button"
                                    class="submission-status-button"
                                    @click="showSubmissionDetail(record)"
                                  >
                                    <span
                                      :class="getSubmissionStatusClass(record)"
                                    >
                                      {{ getSubmissionResultText(record) }}
                                    </span>
                                  </button>
                                  <div class="submission-create-time">
                                    {{
                                      formatSubmissionCreateTime(
                                        record.createTime
                                      )
                                    }}
                                  </div>
                                </div>
                                <div
                                  class="submission-col submission-col--language"
                                >
                                  <span class="submission-language-pill">
                                    {{ record.language || "-" }}
                                  </span>
                                </div>
                                <div
                                  class="submission-col submission-col--runtime"
                                >
                                  <div class="metric-cell">
                                    <icon-clock-circle />
                                    {{
                                      formatSubmissionRuntime(
                                        record.judgeInfo?.time
                                      )
                                    }}
                                  </div>
                                </div>
                                <div
                                  class="submission-col submission-col--memory"
                                >
                                  <div class="metric-cell">
                                    <icon-common />
                                    {{
                                      formatSubmissionMemory(
                                        record.judgeInfo?.memory
                                      )
                                    }}
                                  </div>
                                </div>
                                <div
                                  class="submission-col submission-col--remark"
                                >
                                  <div class="submission-remark-text">
                                    {{ getSubmissionRemark(record) }}
                                  </div>
                                  <a-button
                                    type="text"
                                    size="mini"
                                    class="submission-detail-button"
                                    @click="showSubmissionDetail(record)"
                                  >
                                    查看详情
                                  </a-button>
                                </div>
                              </div>
                            </template>
                            <a-empty v-else description="暂无提交记录" />
                          </a-spin>
                        </div>

                        <div class="submission-pagination">
                          <a-pagination
                            :total="total"
                            :current="searchParams.current"
                            :page-size="searchParams.pageSize"
                            show-total
                            simple
                            @change="onPageChange"
                          />
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="submission-block">
                      <div class="question-title-row">
                        <div>
                          <div class="eyebrow">Submission Detail</div>
                          <h2 class="question-title submission-title">
                            提交详情
                          </h2>
                        </div>
                        <div class="question-stats">
                          <span
                            >记录 #{{
                              selectedSubmissionRecord?.id ?? "-"
                            }}</span
                          >
                          <span>
                            {{
                              selectedSubmissionRecord
                                ? getSubmissionResultText(
                                    selectedSubmissionRecord
                                  )
                                : "详情"
                            }}
                          </span>
                        </div>
                      </div>

                      <div class="submission-detail-header">
                        <a-button type="text" @click="backToSubmissionList">
                          返回列表
                        </a-button>
                      </div>

                      <div class="submission-detail-stack">
                        <a-card v-if="selectedSubmissionRecord">
                          <a-descriptions :column="{ xs: 1, md: 2, lg: 3 }">
                            <a-descriptions-item label="结果">
                              <span
                                :class="
                                  getSubmissionStatusClass(
                                    selectedSubmissionRecord
                                  )
                                "
                              >
                                {{
                                  getSubmissionResultText(
                                    selectedSubmissionRecord
                                  )
                                }}
                              </span>
                            </a-descriptions-item>
                            <a-descriptions-item label="用户">
                              {{
                                selectedSubmissionRecord?.userVO?.userName ||
                                loginUser?.userName ||
                                "-"
                              }}
                            </a-descriptions-item>
                            <a-descriptions-item label="运行时间">
                              {{
                                formatSubmissionRuntime(
                                  selectedSubmissionRecord?.judgeInfo?.time
                                )
                              }}
                            </a-descriptions-item>
                            <a-descriptions-item label="运行空间">
                              {{
                                formatSubmissionMemory(
                                  selectedSubmissionRecord?.judgeInfo?.memory
                                )
                              }}
                            </a-descriptions-item>
                            <a-descriptions-item label="提交时间">
                              {{
                                moment(selectedSubmissionRecord?.createTime)
                                  .utcOffset(8)
                                  .format("YYYY-MM-DD HH:mm:ss")
                              }}
                            </a-descriptions-item>
                            <a-descriptions-item label="语言">
                              {{ selectedSubmissionRecord?.language || "-" }}
                            </a-descriptions-item>
                          </a-descriptions>
                        </a-card>

                        <a-card
                          v-if="selectedSubmissionRecord?.errorCase"
                          title="失败样例"
                        >
                          <div class="error-case-row">
                            <div class="error-case-label">输入</div>
                            <a-textarea
                              :model-value="
                                selectedSubmissionRecord.errorCase.input
                              "
                              readonly
                              :auto-size="{ minRows: 3, maxRows: 6 }"
                            />
                          </div>
                          <div class="error-case-row">
                            <div class="error-case-label">输出</div>
                            <a-textarea
                              :model-value="
                                selectedSubmissionRecord.errorCase.output
                              "
                              readonly
                              :auto-size="{ minRows: 3, maxRows: 6 }"
                            />
                          </div>
                        </a-card>

                        <a-card
                          v-if="selectedSubmissionRecord"
                          :title="selectedSubmissionRecord.language || '代码'"
                        >
                          <CodeEditor
                            :value="selectedSubmissionRecord.code || ''"
                            :readonly="true"
                            :language="
                              selectedSubmissionRecord.language || 'java'
                            "
                            height="360px"
                            min-height="360px"
                            :handle-change="noopCodeChange"
                          />
                        </a-card>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </section>

      <div
        v-if="!isStacked && !questionCollapsed && !codeCollapsed"
        class="resize-handle"
        @mousedown="startResize(0, $event)"
      />

      <section
        class="workspace-pane code-pane"
        :class="{ collapsed: codeCollapsed }"
        :style="getPaneStyle(1)"
      >
        <div
          v-if="codeCollapsed"
          class="pane-collapsed-rail"
          @click="expandCodePane"
        >
          <div class="rail-badge">C</div>
          <div class="rail-title">Code</div>
          <div class="rail-hint">点击展开</div>
        </div>
        <div v-else class="pane-surface code-surface">
          <div class="code-toolbar">
            <div class="toolbar-left">
              <div class="eyebrow">Code</div>
              <a-form :model="form" layout="inline">
                <a-form-item field="language" label="编程语言">
                  <a-select
                    v-model="form.language"
                    :style="{ width: '180px' }"
                    placeholder="请选择语言"
                  >
                    <a-option value="java">java</a-option>
                    <a-option value="cpp">cpp</a-option>
                    <a-option value="python">python</a-option>
                  </a-select>
                </a-form-item>
              </a-form>
            </div>

            <div class="toolbar-right">
              <div v-if="loading" class="running-indicator">
                <div class="loader" />
                <span>Judging</span>
              </div>
              <a-button type="primary" status="success" @click="doSubmit">
                提交
              </a-button>
            </div>
          </div>

          <div class="editor-area">
            <CodeEditor
              ref="editorRef"
              :value="form.code || ''"
              :language="form.language"
              height="100%"
              min-height="0"
              :handle-change="onCodeChange"
            />
          </div>

          <div class="code-footer">
            <div class="latest-result-label">最近判题结果</div>
            <div class="latest-result-value">
              {{ latestJudgeResult || "暂无提交记录" }}
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="!isStacked && !codeCollapsed && !aiCollapsed"
        class="resize-handle"
        @mousedown="startResize(1, $event)"
      />

      <section
        class="workspace-pane ai-pane"
        :class="{ collapsed: aiCollapsed }"
        :style="getPaneStyle(2)"
      >
        <div v-if="aiCollapsed" class="ai-collapsed-rail" @click="expandAiPane">
          <div class="rail-glow" />
          <div class="rail-badge">AI</div>
          <div class="rail-title">ACoder</div>
          <div class="rail-hint">点击展开</div>
        </div>
        <div v-else class="pane-surface ai-surface">
          <AiChatPanel
            v-if="isLogin"
            embedded
            :question-id="props.id"
            :contest-id="props.contestId"
            :question-title="question?.title"
            :question-content="question?.content"
            :user-code="form.code"
            :latest-judge-result="latestJudgeResult"
            :language="form.language"
          />
          <div v-else class="auth-empty-state">
            <a-empty description="登录后可使用 ACoder 辅助解题">
              <a-button type="primary" @click="goToLogin">去登录</a-button>
            </a-empty>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconClockCircle, IconCommon } from "@arco-design/web-vue/es/icon";
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
import moment from "moment";
import message from "@arco-design/web-vue/es/message";
import { useRoute, useRouter } from "vue-router";
import store from "@/store";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import AiChatPanel from "@/components/AiChatPanel.vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import {
  LoginUserVO,
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionSubmitQueryRequest,
  QuestionSubmitVO,
  QuestionVO,
} from "../../../generated";

interface Props {
  id: string;
  contestId: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
  contestId: () => "",
});

const router = useRouter();
const route = useRoute();

const workspaceRef = ref<HTMLElement | null>(null);
const viewportWidth = ref(window.innerWidth);
const paneSizes = ref<[number, number, number]>([50, 30, 20]);
const minPanePercent = 20;
const collapsedAiPanePercent = 1;
const autoCollapseAiPanePercent = minPanePercent + 0.5;
const minExpandedAiPanePercent = autoCollapseAiPanePercent + 4.5;
const desktopPaneMinWidths = [500, 360, 300] as const;
const collapsedAiPaneWidth = 40;
const isStacked = computed(() => viewportWidth.value < 1280);
const questionCollapsed = ref(false);
const codeCollapsed = ref(false);
const aiCollapsed = ref(false);
const lastExpandedQuestionPaneSize = ref(50);
const lastExpandedCodePaneSize = ref(30);
const lastExpandedAiPaneSize = ref(32);

const question = ref<QuestionVO>();
const loginUser = ref<LoginUserVO>();
const isLogin = computed(
  () => !!loginUser.value?.id && loginUser.value?.userRole !== "notLogin"
);
const tabsKey = ref("question");
const loadTable = ref(false);
const loading = ref(false);
const showSubmissionsTable = ref(true);
const selectedSubmissionRecord = ref<QuestionSubmitVO | null>(null);
const editorRef = ref<InstanceType<typeof CodeEditor> | null>(null);

const form = ref<QuestionSubmitAddRequest>({
  code: "",
  language: "java",
});

const dataList = ref<QuestionSubmitVO[]>([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  current: 1,
  judgeStatus: undefined,
  language: undefined,
  pageSize: 8,
  questionId: Number(props.id || 0),
  sortField: "createTime",
  sortOrder: "descend",
  userId: undefined,
});
const submissionJudgeStatusOptions = [
  { label: "Accepted", value: "Accepted" },
  { label: "Wrong Answer", value: "Wrong Answer" },
  { label: "Compile Error", value: "Compile Error" },
  { label: "Runtime Error", value: "Runtime Error" },
  { label: "Time Limit Exceeded", value: "Time Limit Exceeded" },
  { label: "Memory Limit Exceeded", value: "Memory Limit Exceeded" },
  { label: "Waiting", value: "Waiting" },
];
const submissionLanguageOptions = ["java", "cpp", "python", "go"];

const memoryLimitText = computed(() => {
  const memoryLimit = question.value?.judgeConfig?.memoryLimit;
  if (!memoryLimit) {
    return "0 MB";
  }
  return `${Math.ceil(memoryLimit / 1024 / 1024)} MB`;
});

const questionMetaColumns = computed(() => {
  if (isStacked.value) {
    return { xs: 1, md: 1, lg: 1 };
  }
  return { xs: 1, md: 1, lg: 2 };
});

const latestJudgeResult = computed(() => {
  const latestRecord = dataList.value?.[0];
  if (!latestRecord?.judgeInfo) {
    return "";
  }
  const status = getSubmissionResultText(latestRecord);
  const time = formatSubmissionRuntime(latestRecord.judgeInfo.time);
  const memory = formatSubmissionMemory(latestRecord.judgeInfo.memory);
  return `状态：${status}，耗时：${time}，内存：${memory}`;
});

const scheduleEditorLayout = async () => {
  await nextTick();
  editorRef.value?.layoutEditor();
};

const getPaneStyle = (index: number) => {
  if (isStacked.value) {
    return {};
  }
  if (index === 0 && questionCollapsed.value) {
    return {
      flex: `0 0 ${collapsedAiPaneWidth}px`,
      width: `${collapsedAiPaneWidth}px`,
      minWidth: `${collapsedAiPaneWidth}px`,
      maxWidth: `${collapsedAiPaneWidth}px`,
    };
  }
  if (index === 1 && codeCollapsed.value) {
    return {
      flex: `0 0 ${collapsedAiPaneWidth}px`,
      width: `${collapsedAiPaneWidth}px`,
      minWidth: `${collapsedAiPaneWidth}px`,
      maxWidth: `${collapsedAiPaneWidth}px`,
    };
  }
  if (index === 2 && aiCollapsed.value) {
    return {
      flex: `0 0 ${collapsedAiPaneWidth}px`,
      width: `${collapsedAiPaneWidth}px`,
      minWidth: `${collapsedAiPaneWidth}px`,
      maxWidth: `${collapsedAiPaneWidth}px`,
    };
  }
  const minWidth = desktopPaneMinWidths[index];
  return {
    flex: `${paneSizes.value[index]} 1 0%`,
    minWidth: `${minWidth}px`,
  };
};

const collapseQuestionPane = () => {
  if (isStacked.value || questionCollapsed.value) {
    return;
  }
  lastExpandedQuestionPaneSize.value = paneSizes.value[0];
  const released = paneSizes.value[0] - collapsedAiPanePercent;
  const nextSizes = [...paneSizes.value] as [number, number, number];
  nextSizes[0] = collapsedAiPanePercent;
  if (!codeCollapsed.value) {
    nextSizes[1] += released;
  } else {
    nextSizes[2] += released;
  }
  paneSizes.value = nextSizes;
  questionCollapsed.value = true;
};

const expandQuestionPane = () => {
  if (isStacked.value || !questionCollapsed.value) {
    return;
  }
  const nextSizes = [...paneSizes.value] as [number, number, number];
  const targetQuestionPaneSize = Math.max(
    lastExpandedQuestionPaneSize.value,
    minExpandedAiPanePercent
  );
  const requiredSpace = targetQuestionPaneSize - nextSizes[0];
  if (requiredSpace > 0) {
    if (!codeCollapsed.value) {
      const codeReducible = Math.max(0, nextSizes[1] - minPanePercent);
      const fromCode = Math.min(codeReducible, requiredSpace);
      nextSizes[1] -= fromCode;
      nextSizes[0] += fromCode;
    }

    const remaining = targetQuestionPaneSize - nextSizes[0];
    if (remaining > 0 && !aiCollapsed.value) {
      const aiReducible = Math.max(0, nextSizes[2] - minPanePercent);
      const fromAi = Math.min(aiReducible, remaining);
      nextSizes[2] -= fromAi;
      nextSizes[0] += fromAi;
    }
  }
  paneSizes.value = nextSizes;
  questionCollapsed.value = false;
};

const collapseCodePane = () => {
  if (isStacked.value || codeCollapsed.value) {
    return;
  }
  lastExpandedCodePaneSize.value = paneSizes.value[1];
  const released = paneSizes.value[1] - collapsedAiPanePercent;
  const nextSizes = [...paneSizes.value] as [number, number, number];
  nextSizes[1] = collapsedAiPanePercent;
  if (!questionCollapsed.value && !aiCollapsed.value) {
    nextSizes[0] += released / 2;
    nextSizes[2] += released / 2;
  } else if (!questionCollapsed.value) {
    nextSizes[0] += released;
  } else {
    nextSizes[2] += released;
  }
  paneSizes.value = nextSizes;
  codeCollapsed.value = true;
};

const expandCodePane = () => {
  if (isStacked.value || !codeCollapsed.value) {
    return;
  }
  const nextSizes = [...paneSizes.value] as [number, number, number];
  const targetCodePaneSize = Math.max(
    lastExpandedCodePaneSize.value,
    minExpandedAiPanePercent
  );
  const requiredSpace = targetCodePaneSize - nextSizes[1];
  if (requiredSpace > 0) {
    if (!questionCollapsed.value) {
      const questionReducible = Math.max(0, nextSizes[0] - minPanePercent);
      const fromQuestion = Math.min(questionReducible, requiredSpace / 2);
      nextSizes[0] -= fromQuestion;
      nextSizes[1] += fromQuestion;
    }

    let remaining = targetCodePaneSize - nextSizes[1];
    if (remaining > 0 && !aiCollapsed.value) {
      const aiReducible = Math.max(0, nextSizes[2] - minPanePercent);
      const fromAi = Math.min(aiReducible, remaining);
      nextSizes[2] -= fromAi;
      nextSizes[1] += fromAi;
      remaining = targetCodePaneSize - nextSizes[1];
    }

    if (remaining > 0 && !questionCollapsed.value) {
      const questionReducible = Math.max(0, nextSizes[0] - minPanePercent);
      const fromQuestion = Math.min(questionReducible, remaining);
      nextSizes[0] -= fromQuestion;
      nextSizes[1] += fromQuestion;
    }
  }
  paneSizes.value = nextSizes;
  codeCollapsed.value = false;
};

const collapseAiPane = () => {
  if (isStacked.value || aiCollapsed.value) {
    return;
  }
  lastExpandedAiPaneSize.value = paneSizes.value[2];
  const released = paneSizes.value[2] - collapsedAiPanePercent;
  paneSizes.value = [
    paneSizes.value[0],
    paneSizes.value[1] + released,
    collapsedAiPanePercent,
  ];
  aiCollapsed.value = true;
};

const expandAiPane = () => {
  if (isStacked.value || !aiCollapsed.value) {
    return;
  }
  const nextSizes = [...paneSizes.value] as [number, number, number];
  const targetAiPaneSize = Math.max(
    lastExpandedAiPaneSize.value,
    minExpandedAiPanePercent
  );
  const requiredSpace = targetAiPaneSize - nextSizes[2];
  if (requiredSpace > 0) {
    const codeReducible = Math.max(0, nextSizes[1] - minPanePercent);
    const fromCode = Math.min(codeReducible, requiredSpace);
    nextSizes[1] -= fromCode;
    nextSizes[2] += fromCode;

    const remaining = requiredSpace - fromCode;
    if (remaining > 0) {
      const questionReducible = Math.max(0, nextSizes[0] - minPanePercent);
      const fromQuestion = Math.min(questionReducible, remaining);
      nextSizes[0] -= fromQuestion;
      nextSizes[2] += fromQuestion;
    }
  }
  paneSizes.value = nextSizes;
  aiCollapsed.value = false;
};

const maybeCollapseAiPane = () => {
  if (isStacked.value || aiCollapsed.value) {
    return;
  }
  if (paneSizes.value[2] <= autoCollapseAiPanePercent) {
    collapseAiPane();
  }
};

const maybeCollapseQuestionPane = () => {
  if (isStacked.value || questionCollapsed.value) {
    return;
  }
  if (paneSizes.value[0] <= autoCollapseAiPanePercent) {
    collapseQuestionPane();
  }
};

const maybeCollapseCodePane = () => {
  if (isStacked.value || codeCollapsed.value) {
    return;
  }
  if (paneSizes.value[1] <= autoCollapseAiPanePercent) {
    collapseCodePane();
  }
};

const syncLoginUser = async () => {
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  searchParams.value.userId = loginUser.value?.id;
};

const resetSubmissionState = () => {
  dataList.value = [];
  total.value = 0;
  showSubmissionsTable.value = true;
  selectedSubmissionRecord.value = null;
};

const goToLogin = () => {
  router.push({
    path: "/user/login",
    query: {
      redirect: route.fullPath,
    },
  });
};

const loadQuestion = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    Number(props.id || 0)
  );
  if (res.code === 0) {
    question.value = res.data as QuestionVO;
  } else {
    message.error(`请求失败：${res.message}`);
  }
};

const loadSubmissions = async (refreshLoginUser = true) => {
  if (refreshLoginUser) {
    await syncLoginUser();
  }
  if (!isLogin.value) {
    resetSubmissionState();
    return;
  }
  loadTable.value = true;
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = (res.data.records || []) as QuestionSubmitVO[];
    total.value = res.data.total || 0;
  } else {
    message.error(`请求失败：${res.message}`);
  }
  loadTable.value = false;
};

const onTabClick = async (key: string | number) => {
  tabsKey.value = String(key);
  if (tabsKey.value === "submissions") {
    showSubmissionsTable.value = true;
    await loadSubmissions();
  }
};

const onCodeChange = (value: string) => {
  form.value.code = value;
};

const noopCodeChange = () => undefined;

const doSubmit = async () => {
  if (!question.value?.id) {
    return;
  }
  await syncLoginUser();
  if (!isLogin.value) {
    message.warning("请先登录后再提交代码");
    goToLogin();
    return;
  }
  loading.value = true;
  const res = await QuestionControllerService.doQuestionSubmitVoUsingPost({
    ...form.value,
    questionId: question.value.id,
    contestId: Number(props.contestId || 0),
  });
  if (res.code === 0) {
    message.success("提交成功");
    tabsKey.value = "submissions";
    showSubmissionsTable.value = true;
    searchParams.value.current = 1;
    await loadSubmissions(false);
  } else {
    message.error(`提交失败：${res.message}`);
  }
  loading.value = false;
};

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
  loadSubmissions(false);
};

const showSubmissionDetail = (record: QuestionSubmitVO) => {
  showSubmissionsTable.value = false;
  selectedSubmissionRecord.value = record;
};

const backToSubmissionList = () => {
  showSubmissionsTable.value = true;
  selectedSubmissionRecord.value = null;
};

const onSubmissionFilterChange = () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
  loadSubmissions(false);
};

const getSubmissionProcessText = (status?: number) => {
  const statusMap: Record<number, string> = {
    0: "等待中",
    1: "判题中",
    2: "完成",
    3: "失败",
  };
  if (status === undefined || status === null) {
    return "未知状态";
  }
  return statusMap[status] || `状态 ${status}`;
};

const getSubmissionResultText = (record: QuestionSubmitVO) => {
  return record?.judgeInfo?.message || getSubmissionProcessText(record?.status);
};

const formatSubmissionCreateTime = (date?: string) => {
  if (!date) {
    return "-";
  }
  const submitTime = moment(date);
  if (!submitTime.isValid()) {
    return date;
  }
  if (moment().diff(submitTime, "hours") < 24) {
    return submitTime.fromNow();
  }
  return submitTime.utcOffset(8).format("YYYY.MM.DD HH:mm");
};

const formatSubmissionRuntime = (time?: number) => {
  if (time === undefined || time === null) {
    return "-";
  }
  return `${time} ms`;
};

const formatSubmissionMemory = (memory?: number) => {
  if (memory === undefined || memory === null) {
    return "-";
  }
  const memoryInMb = memory / 1024;
  const precision = memoryInMb >= 100 ? 0 : 1;
  return `${memoryInMb.toFixed(precision)} MB`;
};

const getSubmissionRemark = (record: QuestionSubmitVO) => {
  const processText = getSubmissionProcessText(record?.status);
  if (record?.errorCase) {
    return `${processText} · 已返回失败样例`;
  }
  return processText;
};

const getSubmissionStatusClass = (record: QuestionSubmitVO) => {
  const result = record?.judgeInfo?.message;
  if (result === "Accepted" || record?.status === 2) {
    return "success-text";
  }
  if (result === "Waiting" || record?.status === 0 || record?.status === 1) {
    return "waiting-text";
  }
  return "error-text";
};

const startResize = (handleIndex: number, event: MouseEvent) => {
  if (isStacked.value || !workspaceRef.value) {
    return;
  }
  event.preventDefault();
  const startX = event.clientX;
  const totalWidth = workspaceRef.value.clientWidth;
  const initialSizes = [...paneSizes.value] as [number, number, number];

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaPercent = ((moveEvent.clientX - startX) / totalWidth) * 100;
    const nextSizes = [...initialSizes] as [number, number, number];

    if (handleIndex === 0) {
      nextSizes[0] = initialSizes[0] + deltaPercent;
      nextSizes[1] = initialSizes[1] - deltaPercent;
      if (nextSizes[0] < minPanePercent || nextSizes[1] < minPanePercent) {
        return;
      }
    } else {
      nextSizes[1] = initialSizes[1] + deltaPercent;
      nextSizes[2] = initialSizes[2] - deltaPercent;
      if (nextSizes[1] < minPanePercent || nextSizes[2] < minPanePercent) {
        return;
      }
    }

    paneSizes.value = nextSizes;
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

const onViewportResize = () => {
  viewportWidth.value = window.innerWidth;
  maybeCollapseAiPane();
  scheduleEditorLayout();
};

watch(isStacked, (stacked) => {
  if (stacked) {
    questionCollapsed.value = false;
    codeCollapsed.value = false;
    aiCollapsed.value = false;
  }
  scheduleEditorLayout();
});

watch(
  paneSizes,
  () => {
    maybeCollapseQuestionPane();
    maybeCollapseCodePane();
    maybeCollapseAiPane();
    scheduleEditorLayout();
  },
  {
    deep: true,
  }
);

onMounted(async () => {
  window.addEventListener("resize", onViewportResize);
  await syncLoginUser();
  await loadQuestion();
  await loadSubmissions(false);
  maybeCollapseQuestionPane();
  maybeCollapseCodePane();
  maybeCollapseAiPane();
  await scheduleEditorLayout();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onViewportResize);
});
</script>

<style scoped>
#ViewQuestionView {
  --page-bg: #f5f7fb;
  --surface-bg: #ffffff;
  --surface-subtle: #f8fafc;
  --surface-muted: #f3f4f6;
  --border-color: #e5e7eb;
  --border-strong: #d1d5db;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --primary: #2563eb;
  --primary-soft: #eff6ff;
  --success: #15803d;
  --warning: #6b7280;
  --danger: #dc2626;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0;
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--text-primary);
  box-sizing: border-box;
  overflow: hidden;
}

.workspace {
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
  gap: 0;
  height: 100%;
  min-height: 0;
  /* border: 1px solid var(--border-color); */
  border-radius: 20px;
  overflow: hidden;
  background: var(--page-bg);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.workspace.stacked {
  flex-direction: column;
  gap: 6px;
  height: auto;
  min-height: auto;
  border: none;
  box-shadow: none;
  overflow: visible;
}

.workspace-pane {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  padding: 6px;
  box-sizing: border-box;
}

.pane-surface {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  border-radius: 16px;
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.pane-tabs,
.pane-scroll,
.code-surface,
.ai-surface {
  min-height: 0;
  flex: 1 1 auto;
}

.pane-tabs {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pane-scroll {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 240px;
  gap: 12px;
  overflow-x: auto;
  overflow-y: auto;
  padding: 4px 14px 14px;
}

.pane-scroll > * {
  min-width: 0;
}

.pane-scroll--question > .question-block {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 12px;
}

.pane-scroll--submission > .submission-block {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  box-sizing: border-box;
}

.pane-scroll--submission {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.pane-scroll--submission > .auth-empty-state {
  flex: 1 1 auto;
}

.question-block {
  padding-bottom: 12px;
}

.submission-block {
  padding-bottom: 12px;
}

.question-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.question-title-row > div:first-child {
  flex: 1 1 320px;
  min-width: 0;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.question-title {
  margin: 6px 0 0;
  font-size: 30px;
  line-height: 1.2;
  color: var(--text-primary);
}

.submission-title {
  font-size: 28px;
}

.question-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 12px;
}

.question-stats span {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--surface-subtle);
}

.question-tags {
  margin: 12px 0 4px;
}

.question-meta {
  margin-bottom: 12px;
}

.resize-handle {
  position: relative;
  width: 10px;
  cursor: col-resize;
  flex: 0 0 10px;
  background: transparent;
}

.resize-handle::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 72px;
  border-radius: 999px;
  background: var(--border-strong);
  transform: translate(-50%, -50%);
}

.code-surface {
  flex: 1 1 auto;
  padding: 14px;
  background: var(--surface-bg);
}

.code-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-area {
  flex: 1;
  min-height: 0;
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-subtle);
}

.code-footer {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--surface-subtle);
  border: 1px solid var(--border-color);
}

.latest-result-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.latest-result-value {
  margin-top: 4px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.6;
}

.question-pane.collapsed,
.code-pane.collapsed,
.ai-pane.collapsed {
  padding: 6px 0 6px 0;
}

.ai-surface {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: var(--surface-bg);
  overflow: hidden;
}

.auth-empty-state {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 240px;
  padding: 24px;
  box-sizing: border-box;
}

.pane-collapsed-rail,
.ai-collapsed-rail {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px 0 0 16px;
  margin-right: 0;
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.pane-collapsed-rail {
  border-radius: 16px;
}

.rail-badge,
.rail-title,
.rail-hint {
  position: relative;
}

.rail-badge {
  padding: 3px 6px;
  border-radius: 6px;
  background: var(--surface-subtle);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.rail-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.rail-hint {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: var(--text-tertiary);
  font-size: 10px;
}

.running-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-weight: 500;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #dbeafe;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.submission-detail-header {
  display: flex;
  justify-content: flex-start;
}

.submission-panel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.submission-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--surface-subtle);
  margin-top: 10px;
}

.submission-filter {
  width: 160px;
}

.submission-board {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-bg);
  box-sizing: border-box;
}

.submission-list-head,
.submission-row {
  display: grid;
  grid-template-columns:
    44px
    minmax(0, 1.85fr)
    minmax(0, 0.95fr)
    minmax(0, 1fr)
    minmax(0, 1fr)
    minmax(0, 1.2fr);
  align-items: start;
  gap: 12px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.submission-list-head {
  padding: 16px 14px 14px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  background: var(--surface-subtle);
  border-bottom: 1px solid var(--border-color);
}

.submission-list-body {
  display: block;
  background: var(--surface-bg);
}

.submission-row {
  padding: 16px 14px;
  color: var(--text-primary);
  background: var(--surface-bg);
  border-top: 1px solid rgba(229, 231, 235, 0.7);
  transition: background-color 0.2s ease;
}

.submission-row:hover {
  background: var(--primary-soft);
}

.submission-col {
  min-width: 0;
  word-break: break-word;
}

.submission-col--id {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.submission-col--result {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.submission-status-button {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.submission-status-button:hover .success-text,
.submission-status-button:hover .waiting-text,
.submission-status-button:hover .error-text {
  color: var(--primary);
}

.submission-create-time {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.submission-language-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--surface-muted);
  color: #4b5563;
  font-size: 13px;
}

.submission-col--runtime,
.submission-col--memory {
  color: #4b5563;
  font-size: 14px;
}

.submission-col--remark {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.submission-remark-text {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.submission-detail-button {
  padding: 0 !important;
  color: var(--primary) !important;
}

.submission-pagination {
  display: flex;
  justify-content: flex-end;
}

.submission-detail-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-case-row {
  margin-top: 12px;
}

.error-case-label {
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

.success-text {
  color: var(--success);
  font-weight: 600;
}

.waiting-text {
  color: var(--warning);
  font-weight: 600;
}

.error-text {
  color: var(--danger);
  font-weight: 600;
}

.metric-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.5;
  white-space: nowrap;
}

#ViewQuestionView :deep(.arco-tabs-nav::before) {
  background-color: var(--border-color);
}

#ViewQuestionView :deep(.arco-tabs-tab) {
  color: var(--text-secondary);
  font-weight: 500;
}

#ViewQuestionView :deep(.arco-tabs-tab-active),
#ViewQuestionView :deep(.arco-tabs-tab:hover) {
  color: var(--text-primary);
}

#ViewQuestionView :deep(.arco-tabs) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

#ViewQuestionView :deep(.arco-tabs-content) {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  padding-top: 4px;
}

#ViewQuestionView :deep(.arco-tabs-content-list) {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

#ViewQuestionView :deep(.arco-tabs-content-item.arco-tabs-content-item-active),
#ViewQuestionView :deep(.arco-tabs-pane) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

#ViewQuestionView
  :deep(.arco-tabs-content-item:not(.arco-tabs-content-item-active)),
#ViewQuestionView :deep(.arco-tabs-pane[style*="display: none"]) {
  display: none !important;
}

#ViewQuestionView :deep(.arco-tag) {
  border-radius: 8px;
}

#ViewQuestionView :deep(.arco-descriptions) {
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--surface-subtle);
}

#ViewQuestionView :deep(.arco-descriptions-title) {
  margin-bottom: 12px;
  color: var(--text-primary);
  font-size: 14px;
}

#ViewQuestionView :deep(.arco-card) {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: none;
}

#ViewQuestionView :deep(.arco-card-header) {
  min-height: auto;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

#ViewQuestionView :deep(.arco-card-body) {
  padding: 16px;
}

#ViewQuestionView :deep(.arco-spin-children) {
  display: block;
}

#ViewQuestionView :deep(.arco-table-th) {
  background: var(--surface-subtle);
  color: var(--text-secondary);
  font-weight: 600;
}

#ViewQuestionView :deep(.arco-table-td) {
  color: var(--text-primary);
}

#ViewQuestionView :deep(.arco-table-border .arco-table-container) {
  border-radius: 12px;
}

#ViewQuestionView :deep(.arco-btn-primary) {
  background: var(--primary);
}

#ViewQuestionView :deep(.arco-btn-primary:hover) {
  background: #1d4ed8;
}

#ViewQuestionView :deep(.arco-textarea-wrapper),
#ViewQuestionView :deep(.arco-select-view),
#ViewQuestionView :deep(.arco-input-wrapper) {
  border-radius: 10px;
}

#ViewQuestionView :deep(.bytemd) {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

#ViewQuestionView :deep(.ai-chat-panel.embedded),
#ViewQuestionView :deep(.ai-chat-shell),
#ViewQuestionView :deep(.ai-chat-body) {
  min-height: 0;
}

#ViewQuestionView :deep(.ai-chat-shell),
#ViewQuestionView :deep(.ai-chat-body) {
  overflow: hidden;
}

#ViewQuestionView :deep(.ai-message-box) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1279px) {
  #ViewQuestionView {
    height: 100%;
    min-height: 100%;
    padding-bottom: 12px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .workspace {
    height: max-content;
    min-height: max-content;
  }

  .workspace-pane {
    width: 100% !important;
    flex-basis: auto !important;
    flex: 1 1 auto;
    padding: 0;
  }

  .pane-surface {
    min-height: 560px;
    display: flex;
    flex: 1 1 auto;
  }

  .ai-collapsed-rail {
    display: none;
  }
}

@media (max-width: 768px) {
  #ViewQuestionView {
    padding-bottom: 12px;
  }

  .question-title-row,
  .code-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    flex-wrap: wrap;
  }

  .question-title {
    font-size: 24px;
  }

  .workspace {
    border-radius: 16px;
  }
}
.submission-table {
  width: 100%;
  min-width: 0;
}
.temp {
  margin-left: 51%;
  margin-right: 1%;
}
</style>
