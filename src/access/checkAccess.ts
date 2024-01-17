import ACCESS_ENUM from "@/access/accessEnum";

/**
 * 检查用户权限
 * @param loginUser 登陆用户
 * @param needAccess 需要的权限
 */
const checkAccess = (loginUser: any, needAccess = ACCESS_ENUM.NOT_LOGIN) => {
  //获取当前用户的权限，获取不到则未登录
  const loginUserAccess = loginUser?.userRole ?? ACCESS_ENUM.NOT_LOGIN;
  //不需要登录
  if (needAccess === ACCESS_ENUM.NOT_LOGIN) {
    return true;
  }
  //需要登录但没有登录
  if (
    needAccess === ACCESS_ENUM.USER &&
    loginUserAccess === ACCESS_ENUM.NOT_LOGIN
  ) {
    return false;
  }
  //需要管理员权限但没有权限
  if (
    needAccess === ACCESS_ENUM.ADMIN &&
    loginUserAccess !== ACCESS_ENUM.ADMIN
  ) {
    return false;
  }
  return true;
};

export default checkAccess;
