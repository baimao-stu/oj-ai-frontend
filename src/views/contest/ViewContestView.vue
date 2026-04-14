<template>
  <div id="ViewContestView">
    <a-row :gutter="[24, 24]">
      <a-col :md="17" :xs="24">
        <a-tabs :active-key="tabsKey" @change="onTabClick">
          <a-tab-pane key="contest" title="比赛说明">
            <a-card v-if="contest" :title="contest.title">
              <MdViewer :value="contest.description || ''" />
              <template #extra>
                <a-space wrap>
                  <div v-if="contestStatus === 0">
                    <a-button
                      type="primary"
                      @click="join"
                      :disabled="disable"
                      >{{ joinText }}</a-button
                    >
                  </div>
                  <div v-if="editable">
                    <a-button type="primary" @click="editContest">
                      编辑比赛
                    </a-button>
                  </div>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>

          <a-tab-pane
            key="questionList"
            title="题目列表"
            :disabled="contestStatus === 0 || (contestStatus === 1 && !disable)"
          >
            <a-list size="large" :bordered="false">
              <a-list-item
                v-for="(questionVO, index) of contestQuestionList"
                :key="index"
              >
                <div class="contestInfo">
                  <span
                    class="question_title"
                    @click="toQuestionPage(questionVO)"
                    >{{
                      `${String.fromCharCode(index + 65)}. &nbsp;&nbsp;  ${
                        questionVO.title
                      }`
                    }}</span
                  >
                  <span>
                    <a-tag
                      v-if="questionVO.isSubmit"
                      color="green"
                      style="font-size: 15px"
                    >
                      已提交
                    </a-tag>
                    <a-tag v-else color="red" style="font-size: 15px">
                      未提交
                    </a-tag>
                  </span>
                </div>
              </a-list-item>
            </a-list>
          </a-tab-pane>
          <a-tab-pane
            key="rank"
            title="排行榜"
            :disabled="contestStatus === 0 || (contestStatus === 1 && !disable)"
          >
            <a-list size="large" :bordered="false" :scrollbar="true">
              <div class="rank-scroll-wrapper">
                <a-list-item style="width: max-content; min-width: 100%">
                  <a-space>
                    <div class="list1">名次</div>
                    <div class="list1">参赛者</div>
                    <div class="list1">通过题数</div>
                    <div class="list1">总耗时</div>
                    <div style="display: flex; justify-content: start">
                      <div
                        class="rank-header"
                        v-for="(questionVO, index) of contestQuestionList"
                        :key="index"
                      >
                        <div>
                          {{ String.fromCharCode(index + 65) }}
                        </div>
                      </div>
                    </div>
                  </a-space>
                </a-list-item>

                <a-list-item
                  style="width: max-content; min-width: 100%"
                  v-for="(item, index) of rankList"
                  :key="index"
                >
                  <a-space style="margin-right: 0">
                    <div
                      style="font-weight: bold; color: #404040"
                      class="list1"
                    >
                      #{{
                        (rankParam.current - 1) * rankParam.pageSize + index + 1
                      }}
                    </div>
                    <div
                      style="font-weight: bold; color: #52c31a"
                      class="list1"
                    >
                      {{ item?.userVO.userName }}
                    </div>
                    <div
                      style="font-weight: bold; color: #3380c2"
                      class="list1"
                    >
                      {{ item?.contestRankSnapshot?.acceptedNum ?? 0 }}
                    </div>
                    <div
                      style="font-weight: bold; color: #404040"
                      class="list1"
                    >
                      {{ item?.contestRankSnapshot?.totalTime ?? 0 }}ms
                    </div>
                    <div
                      style="
                        display: flex;
                        justify-content: start;
                        height: 64px;
                      "
                    >
                      <div
                        class="rank-content"
                        v-for="(judgeInfo, index) of item.submitStatusList"
                        :key="index"
                      >
                        <div v-if="judgeInfo" style="height: 100%; width: 100%">
                          <div
                            v-if="judgeInfo.message === 'Accepted'"
                            style="
                              background: #d8eec6;
                              color: #52c361;
                              font-weight: bold;
                              height: 100%;
                              width: 100%;
                            "
                          >
                            {{ judgeInfo.time }}ms
                          </div>
                          <div
                            v-else
                            style="
                              background: #ffe3e0;
                              color: #e94c3c;
                              font-weight: bold;
                              height: 100%;
                              width: 100%;
                            "
                          >
                            {{ judgeInfo.time ?? 0 }}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  </a-space>
                </a-list-item>
              </div>
            </a-list>
            <div
              style="display: flex; justify-content: flex-end; margin-top: 20px"
            >
              <a-pagination
                :total="rankTotal"
                :current="rankParam.current"
                :page-size="RANK_PAGE_SIZE"
                @change="onRankPageChange"
                show-total
              />
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="7" :xs="24">
        <a-card>
          <a-list :bordered="false">
            <a-list-item>
              <div class="contestInfo">
                <span>比赛编号</span>
                <span>{{ contest?.id }}</span>
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>举办者</span>
                <span style="color: #3380c2; font-weight: 500">{{
                  contest?.userVO?.userName
                }}</span>
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>比赛类型</span>
                <a-tag
                  v-if="contest?.type === 0"
                  color="green"
                  style="font-size: 15px; font-weight: bold"
                >
                  <span> 基础 </span>
                </a-tag>
                <a-tag
                  v-else-if="contest?.type === 1"
                  color="blue"
                  style="font-size: 15px; font-weight: bold"
                >
                  <span> 提高 </span>
                </a-tag>
                <a-tag
                  v-else
                  color="red"
                  style="font-size: 15px; font-weight: bold"
                >
                  <span> 进阶 </span>
                </a-tag>
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>开始时间</span>
                <span style="color: #3d3d3d">{{ contest?.startTime }}</span>
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>结束时间</span>
                <span style="color: #3d3d3d">{{ contest?.endTime }}</span>
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>比赛时长</span>
                <span style="color: #3d3d3d">{{ continueTime }}</span>
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>报名人数</span>
                <span style="color: #3d3d3d">
                  {{ `${joinNum}/${contest?.plimit}` }}</span
                >
              </div>
            </a-list-item>
            <a-list-item>
              <div class="contestInfo">
                <span>题目数</span>
                <span style="color: #3d3d3d"> {{ questionNum }}</span>
              </div>
            </a-list-item>
          </a-list>
        </a-card>
        <a-divider size="0" />
        <a-card>
          <span v-if="contestStatus === 1">
            <a-space style="font-size: 18px; color: #4646f6; font-weight: 500">
              该比赛正在进行
            </a-space>
            <a-divider size="0" />
            <a-space style="line-height: 20px; color: #3d3d3d">
              请注意比赛排行榜非实时更新，提交出分到榜单更新最多约有1分钟时间差。
            </a-space>
          </span>
          <span v-else-if="contestStatus === 2">
            <a-space style="font-size: 18px; color: #fa2e2e; font-weight: 500">
              该比赛已结束
            </a-space>
            <a-divider size="0" />
            <a-space style="line-height: 20px; color: #3d3d3d">
              请注意比赛排行榜非实时更新，提交出分到榜单更新最多约有1分钟时间差。
            </a-space>
          </span>
          <span v-else>
            <a-space style="font-size: 18px; color: #00b42a; font-weight: 500">
              该比赛未开始
            </a-space>
            <a-divider size="0" />
            <a-space style="line-height: 20px; color: #3d3d3d">
              请注意比赛排行榜非实时更新，提交出分到榜单更新最多约有1分钟时间差。
            </a-space>
          </span>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref, withDefaults } from "vue";
import {
  Contest,
  ContestControllerService,
  type ContestUserVOQueryRequest,
  ContestVO,
  OpenAPI,
  Question,
} from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import MdViewer from "@/components/MdViewer.vue";
import moment from "moment/moment";
import store from "@/store";
import { useRouter } from "vue-router";
import COMMON from "@/common/constant";

//当前时间
const nowTime = ref();
//比赛状态：0-未开始，1-正在进行，2-已结束
const contestStatus = ref();
//持续时长
const continueTime = ref();
const getHoursAndMinutesBetweenDates = (date1: any, date2: any) => {
  // 将日期转换为毫秒
  const ms1 = new Date(date1).getTime();
  const ms2 = new Date(date2).getTime();
  // 计算两个日期之间的差值（毫秒）
  const diff = ms2 - ms1;
  // 转换差值为小时和分钟
  const hours = Math.floor(diff / 3600000); // 3600000 毫秒 = 1 小时
  const minutes = Math.floor((diff % 3600000) / 60000); // 60000 毫秒 = 1 分钟

  continueTime.value = hours + "h " + minutes + "min";
};

interface Props {
  id: string;
}

//1. 当路由的props设置为时true，route.params将会被设置为组件 props，所以这里的props的id会被设置为route.params
const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});
const contest = ref<ContestVO>();

//2. 也可以使用route直接拿到参数
// const route = useRoute();
// console.log(route.params?.id);

const tabsKey = ref("contest");
/**
 * 点击卡片时触发
 * @param key
 */
const onTabClick = (key: string) => {
  console.log("onTabClick:" + key);
  tabsKey.value = key;
  if (tabsKey.value === "contest") {
    // loadData1(); //加载比赛信息
    console.log("tab:contest");
  } else if (tabsKey.value === "rank") {
    loadData3(); //加载排行榜
    console.log("tab:rank");
  } else {
    console.log("tab:questionList");
    // loadData2(); //加载题目列表
  }
};

/** 卡片1：比赛信息（描述） */
const joinText = ref("报名"); //报名按钮的文字
const disable = ref(false); //是否禁用报名按钮
const questionNum = ref(); //题目数量
const joinNum = ref(); //报名人数
const editable = ref(false); //是否可编辑比赛
const loadData1 = async () => {
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  const res = await ContestControllerService.getContestVoByIdUsingGet(
    props.id as any
  );
  if (res.code === 0) {
    contest.value = res.data as any;
    console.log("比赛信息：", contest.value);
    //计算时长
    getHoursAndMinutesBetweenDates(
      contest.value?.startTime,
      contest.value?.endTime
    );
    //计算当前时间
    nowTime.value = moment().format("YYYY-MM-DD HH:mm:ss");
    //计算比赛状态
    if (
      contest.value?.startTime < nowTime.value &&
      contest.value?.endTime > nowTime.value
    ) {
      contestStatus.value = 1; //正在进行
    } else if (contest.value?.endTime < nowTime.value) {
      contestStatus.value = 2; //已结束
    } else {
      contestStatus.value = 0; //未开始
    }
    console.log("比赛状态：", contestStatus.value);
  } else {
    message.error("请求失败，" + res.message);
    return;
  }
  console.log("时长", continueTime.value);
  //当前用户是否报名该比赛
  const res2 =
    await ContestControllerService.getRegistrationByContestIdUsingPost(
      contest.value?.id
    );
  if (res2.data) {
    joinText.value = "已报名";
    disable.value = true;
    console.log("用户的报名信息：", res2);
  }

  /**
   * 获取题目数量
   */
  const res3 = await ContestControllerService.getQuestionCountUsingGet(
    props.id as any
  );
  if (res3.code === 0) {
    questionNum.value = res3.data;
    console.log("题目数量：" + questionNum.value);
  } else {
    message.error("获取题目数量失败");
  }
  /**
   * 获取报名人数
   */
  const res4 = await ContestControllerService.getRegistrationCountUsingGet(
    props.id as any
  );
  if (res4.code === 0) {
    joinNum.value = res4.data;
    console.log("报名人数：" + joinNum.value);
    if (joinNum.value >= contest.value?.plimit) {
      disable.value = true;
    }
  } else {
    message.error("获取报名人数失败");
  }

  /**
   * 判断是否可编辑比赛：比赛是当前用户创建的或者当亲用户是管理员
   */
  if (
    loginUser.value.id === contest.value?.userId ||
    loginUser.value.userRole === "admin"
  ) {
    editable.value = true;
  }
};

//当前用户信息
const loginUser = ref();
onMounted(async () => {
  await loadData1(); //加载比赛信息
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  console.log("用户信息：", loginUser.value, loginUser.value.id);
  //题目列表 和 排行榜可见时获取其信息
  if (
    !(
      contestStatus.value === 0 ||
      (contestStatus.value === 1 && !disable.value)
    )
  ) {
    await loadData2();
    await loadData3();
  }
});

/**
 * 卡片2：加载题目信息
 */
const contestQuestionList = ref(); //题目列表
const loadData2 = async () => {
  console.log("加载题目信息");
  const res =
    await ContestControllerService.listContestQuestionVoByContestIdUsingPost(
      props.id as any
    );
  if (res.code === 0) {
    contestQuestionList.value = res.data;
    console.log(
      "比赛题目列表",
      contestQuestionList.value,
      contestQuestionList.value.length
    );
  } else {
    message.error("加载题目信息失败，" + res.message);
  }
};

/**
 * 卡片3：加载排行榜
 */
const rankList = ref(); //后端获取的排名信息
const rankTotal = ref(0); //排行榜总条数
const RANK_PAGE_SIZE = 50;
const rankParam = ref<ContestUserVOQueryRequest>({
  contestId: props.id as any,
  current: 1,
  pageSize: RANK_PAGE_SIZE,
});
const onRankPageChange = (page: number) => {
  rankParam.value.current = page;
  loadData3();
};

const loadData3 = async () => {
  const res = await ContestControllerService.listRankByContestIdByPageUsingPost(
    rankParam.value
  );
  if (res.code === 0) {
    rankList.value = res.data.records ?? [];
    rankTotal.value = Number(res.data.total) || 0;
    console.log("排名情况：", rankList.value);
    /**
     * 题目顺序与用户的提交记录匹配
     */
    for (let j = 0; j < rankList.value.length; j++) {
      let submitStatusList = []; //与比赛题目顺序一致的判题结果
      /**
       * 当前的判题记录是由题目id映射的，不是比赛题目的顺序
       */
      const questionStatus =
        rankList.value[j]?.contestRankSnapshot?.questionStatus ?? {};
      const questionIdSubmitMap = new Map(Object.entries(questionStatus));
      for (let i = 0; i < contestQuestionList.value.length; i++) {
        const question = contestQuestionList.value[i];
        const judgeInfo =
          questionIdSubmitMap.get(question.id) ??
          questionIdSubmitMap.get(String(question.id));
        console.log("judgeInfo:", judgeInfo, typeof judgeInfo);
        submitStatusList.push(judgeInfo);
      }
      console.log("与比赛题目顺序一致的判题结果：", submitStatusList);
      /**
       * 加上顺序一致的判题结果的排名
       */
      rankList.value[j] = {
        ...rankList.value[j],
        submitStatusList: submitStatusList,
      };
    }
    console.log("加上顺序一致的判题结果的排名：", rankList.value);
  } else {
    message.error("获取排行榜失败");
  }
};

//报名比赛
const join = async () => {
  await store.dispatch("user/getLoginUser");
  loginUser.value = store.state.user.loginUser;
  const res = await ContestControllerService.addRegistrationUsingPost({
    contestId: contest.value?.id,
  });
  if (res.code === 0) {
    message.success("报名成功");
    joinText.value = "已报名";
    disable.value = true;
  } else {
    message.error("请求失败，" + res.message);
  }
};

const router = useRouter();
/**
 * 进入做题页面
 * @param question 当前记录
 */
const toQuestionPage = (question: Question) => {
  if (contestStatus.value === 1) {
    window.open(
      `${COMMON.FRONT_END_LOCALPATH}/view/question/${question.id}/${contest.value.id}`
      // `${COMMON.FRONT_END_REMOTPATH}/view/question/${question.id}/${contest.value.id}`
    );
  } else {
    window.open(`${COMMON.FRONT_END_LOCALPATH}/view/question/${question.id}`);
    // `${COMMON.FRONT_END_REMOTPATH}/view/question/${question.id}/${contest.value.id}`;
  }

  // router.push({
  //   path: `/view/question/${question.id}/${contest.value.id}`,
  // });
};
/**
 * 进入修改比赛页面
 */
const editContest = () => {
  console.log(contest);
  router.push({
    path: "/update/contest",
    query: {
      id: contest.value?.id,
    },
  });
};
</script>

<style scoped>
.list1 {
  width: 80px;
  box-sizing: border-box;
  text-align: center;
}
::-webkit-scrollbar {
  //width: 33px;
  height: 12px;
}
::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #dcdcdc;
  border-radius: 4px;
  border: 2px solid #f5f5f5;
}
.arco-col.arco-col-16.rank-content {
  padding: 0 12px !important;
}
.arco-col.arco-col-8 {
  padding: 0 12px !important;
}
.arco-col.arco-col-16 {
  padding: 0 12px !important;
}
.rank-header {
  min-height: 48px;
  min-width: 96px;
  line-height: 48px;
  text-align: center;
  border-left: 2px solid #fff;
  background-color: #f2f3f5;
  box-sizing: border-box;
}
.rank-content {
  min-height: 64px;
  min-width: 96px;
  line-height: 64px;
  text-align: center;
  border-left: 2px solid #fff;
  background-color: #f2f3f5;
  box-sizing: border-box;
}
.rank-scroll-wrapper {
  max-width: 100%;
  height: calc(100vh - 260px);
  overflow: auto;
}
.contestInfo {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
.question_title {
  color: #3380c2;
  font-weight: 500;
  font-size: 18px;
}
.question_title:hover {
  text-decoration: underline;
  cursor: pointer;
}

#ViewContestView {
  max-width: 1400px;
  margin: 0 auto;
}

#ViewContestView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}
</style>
