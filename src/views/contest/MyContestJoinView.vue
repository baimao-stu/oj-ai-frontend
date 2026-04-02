<template>
  <div id="MyContestJoinListView">
    <a-divider size="0" />

    <a-list
      size="large"
      :bordered="false"
      :pagination-props="{
        current: searchParams.current,
        pageSize: searchParams.pageSize,
        total: total,
        showTotal: true,
      }"
      @page-change="onPageChange"
    >
      <a-list-item v-for="(contestVO, index) of dataList" :key="index">
        <div class="contestInfo">
          <span class="question_title" @click="toContestPage(contestVO)">{{
            contestVO.title
          }}</span>
          <span style="color: #313131">
            举办者：
            <span style="color: #3380c2">
              {{ contestVO?.userVO?.userName }}
            </span>
          </span>
        </div>
        <a-space style="margin-top: 5px">
          <div style="color: #3d3d3d; font-weight: 550; font-size: 15px">
            编号 - {{ contestVO.id }}
          </div>
          <div>
            <a-tag
              v-if="contestVO.type === 0"
              color="green"
              style="font-size: 15px"
            >
              <span> 基础 </span>
            </a-tag>
            <a-tag
              v-else-if="contestVO.type === 1"
              color="blue"
              style="font-size: 15px"
            >
              <span> 提高 </span>
            </a-tag>
            <a-tag v-else color="red" style="font-size: 15px">
              <span> 进阶 </span>
            </a-tag>
          </div>
          <div>
            <a-tag
              v-if="
                contestVO.startTime < nowTime && contestVO.endTime > nowTime
              "
              style="font-size: 15px; color: #4646f6; font-weight: bold"
            >
              正在进行
            </a-tag>
            <a-tag
              v-else-if="contestVO.endTime < nowTime"
              style="font-size: 15px; color: #fa2e2e; font-weight: bold"
            >
              已结束
            </a-tag>
            <a-tag
              v-else
              style="font-size: 15px; color: #00b42a; font-weight: bold"
            >
              未开始
            </a-tag>
          </div>
          <div>
            <a-tag color="green" style="font-size: 15px">
              {{ contestVO.startTime }}
            </a-tag>
            -
            <a-tag color="red" style="font-size: 15px">
              {{ contestVO.endTime }}
            </a-tag>
          </div>
        </a-space>
      </a-list-item>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  ContestControllerService,
  ContestQueryRequest,
  ContestVO,
} from "../../../generated/";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment/moment";

//当前时间
const nowTime = ref();

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<ContestQueryRequest>({
  current: 1,
  pageSize: 5,
});
/** 加载分页数据*/
const loadData = async () => {
  const res = await ContestControllerService.listMyJoinContestVoPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    console.log("我参加的比赛列表", dataList.value);
  } else {
    message.error("请求失败，" + res.message);
  }

  nowTime.value = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log("当前时间：" + nowTime.value);
};
/** 监听 loadData 的响应式依赖，如 searchParams改变时重新执行 loadData */
watchEffect(() => {
  loadData();
  console.log("watchEffect");
});

onMounted(() => {
  loadData();
});

// 切换页码
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const router = useRouter();

/**
 * 进入比赛详细页面
 * @param contestVO 当前记录
 */
const toContestPage = (contestVO: ContestVO) => {
  router.push({
    path: `/view/contest/${contestVO.id}`,
  });
};
</script>

<style scoped>
#MyContestJoinListView {
  max-width: 960px;
  margin: 0 auto;
}
.question_title {
  color: #3380c2;
  font-weight: 500;
  font-size: 18px;
}
.question_title:hover {
  cursor: pointer;
}
.contestInfo {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
</style>
