import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    email: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
  }

  /** 刷新token接口参数 */
  export interface RefreshTokenParams {
    token: string;
  }

  /** 刷新token接口返回值 */
  export interface RefreshTokenResult {
    accessToken: string;
    refreshToken: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/user/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(token: AuthApi.RefreshTokenParams) {
  return requestClient.post<AuthApi.RefreshTokenResult>(
    '/token/refresh',
    token,
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/user/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/user/codes');
}
