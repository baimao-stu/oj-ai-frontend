/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JudgeInfo } from './JudgeInfo';

export type ContestRankSnapshot = {
    acceptedNum?: number;
    contestId?: number;
    createTime?: string;
    id?: number;
    questionStatus?: Record<string, JudgeInfo>;
    snapshotTime?: string;
    totalTime?: number;
    updateTime?: string;
    userId?: number;
};
