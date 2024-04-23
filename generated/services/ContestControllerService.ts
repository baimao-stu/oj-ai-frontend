/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
// eslint-disable-next-line
import type { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import type { BaseResponse_Contest_ } from "../models/BaseResponse_Contest_";
import type { BaseResponse_ContestVO_ } from "../models/BaseResponse_ContestVO_";
import type { BaseResponse_List_ContestQuestionVO_ } from "../models/BaseResponse_List_ContestQuestionVO_";
import type { BaseResponse_long_ } from "../models/BaseResponse_long_";
import type { BaseResponse_Page_ContestUserVO_ } from "../models/BaseResponse_Page_ContestUserVO_";
import type { BaseResponse_Page_ContestVO_ } from "../models/BaseResponse_Page_ContestVO_";
import type { BaseResponse_Registrations_ } from "../models/BaseResponse_Registrations_";
import type { ContestAddRequest } from "../models/ContestAddRequest";
import type { ContestEditRequest } from "../models/ContestEditRequest";
import type { ContestQueryRequest } from "../models/ContestQueryRequest";
import type { ContestUpdateRequest } from "../models/ContestUpdateRequest";
import type { ContestUserVOQueryRequest } from "../models/ContestUserVOQueryRequest";
import type { DeleteRequest } from "../models/DeleteRequest";
import type { RegistrationsAddRequest } from "../models/RegistrationsAddRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class ContestControllerService {
  /**
   * addContest
   * @param contestAddRequest contestAddRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static addContestUsingPost(
    contestAddRequest: ContestAddRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/add",
      body: contestAddRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * addRegistration
   * @param registrationsAddRequest registrationsAddRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static addRegistrationUsingPost(
    registrationsAddRequest: RegistrationsAddRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/add/registration",
      body: registrationsAddRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * deleteContest
   * @param deleteRequest deleteRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static deleteContestUsingPost(
    deleteRequest: DeleteRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/delete",
      body: deleteRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * editContest
   * @param contestEditRequest contestEditRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static editContestUsingPost(
    contestEditRequest: ContestEditRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/edit",
      body: contestEditRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getContestById
   * @param id id
   * @returns BaseResponse_Contest_ OK
   * @throws ApiError
   */
  public static getContestByIdUsingGet(
    id?: number
  ): CancelablePromise<BaseResponse_Contest_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/get",
      query: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * 获取某个比赛的题目数量
   * @param contestId contestId
   * @returns BaseResponse_long_ OK
   * @throws ApiError
   */
  public static getQuestionCountUsingGet(
    contestId?: number
  ): CancelablePromise<BaseResponse_long_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/get/count/question",
      query: {
        contestId: contestId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * 获取某个比赛的报名人数
   * @param contestId contestId
   * @returns BaseResponse_long_ OK
   * @throws ApiError
   */
  public static getRegistrationCountUsingGet(
    contestId?: number
  ): CancelablePromise<BaseResponse_long_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/get/count/registration",
      query: {
        contestId: contestId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * 用户是否报名某个比赛
   * @param contestId contestId
   * @returns BaseResponse_Registrations_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static getRegistrationByContestIdUsingPost(
    contestId?: number
  ): CancelablePromise<BaseResponse_Registrations_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/get/registrationByContestId",
      query: {
        contestId: contestId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getContestVOById
   * @param id id
   * @returns BaseResponse_ContestVO_ OK
   * @throws ApiError
   */
  public static getContestVoByIdUsingGet(
    id?: number
  ): CancelablePromise<BaseResponse_ContestVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/get/vo",
      query: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listMyJoinContestVOPage
   * @param contestQueryRequest contestQueryRequest
   * @returns BaseResponse_Page_ContestVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listMyJoinContestVoPageUsingPost(
    contestQueryRequest: ContestQueryRequest
  ): CancelablePromise<BaseResponse_Page_ContestVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/list/myJoinContestVOPage",
      body: contestQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listContestVOByPage
   * @param contestQueryRequest contestQueryRequest
   * @returns BaseResponse_Page_ContestVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listContestVoByPageUsingPost(
    contestQueryRequest: ContestQueryRequest
  ): CancelablePromise<BaseResponse_Page_ContestVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/list/page/vo",
      body: contestQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listContestQuestionVOByContestId
   * @param contestId contestId
   * @returns BaseResponse_List_ContestQuestionVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listContestQuestionVoByContestIdUsingPost(
    contestId?: number
  ): CancelablePromise<BaseResponse_List_ContestQuestionVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/list/questionVOByContestId",
      query: {
        contestId: contestId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listRankByContestIdByPage
   * @param contestUserVoQueryRequest contestUserVOQueryRequest
   * @returns BaseResponse_Page_ContestUserVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listRankByContestIdByPageUsingPost(
    contestUserVoQueryRequest: ContestUserVOQueryRequest
  ): CancelablePromise<BaseResponse_Page_ContestUserVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/list/rankByContestIdByPage",
      body: contestUserVoQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listMyContestVOByPage
   * @param contestQueryRequest contestQueryRequest
   * @returns BaseResponse_Page_ContestVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listMyContestVoByPageUsingPost(
    contestQueryRequest: ContestQueryRequest
  ): CancelablePromise<BaseResponse_Page_ContestVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/my/list/page/vo",
      body: contestQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * updateContest
   * @param contestUpdateRequest contestUpdateRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static updateContestUsingPost(
    contestUpdateRequest: ContestUpdateRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/update",
      body: contestUpdateRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
