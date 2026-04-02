import { StoreOptions } from "vuex";
import ACCESS_ENUM from "@/access/accessEnum";
import { UserControllerService } from "../../generated";

export default {
  namespaced: true,
  state: () => ({
    loginUser: {},
  }),
  actions: {
    async getLoginUser({ commit, state }, payload) {
      if (payload) {
        commit("updateUser", payload);
        return payload;
      }
      try {
        const res = await UserControllerService.getLoginUserUsingGet();
        if (res.code === 0) {
          commit("updateUser", res.data);
          console.log("updateUser", res.data);
          return res.data;
        }
        console.log("updateUser fail", res.data);
      } catch (error) {
        console.warn("getLoginUser failed", error);
      }
      const notLoginUser = {
        ...state.loginUser,
        userRole: ACCESS_ENUM.NOT_LOGIN,
      };
      commit("updateUser", notLoginUser);
      return notLoginUser;
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.loginUser = payload;
    },
  },
} as StoreOptions<any>;
