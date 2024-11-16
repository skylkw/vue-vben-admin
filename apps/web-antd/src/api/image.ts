// 获取图片list

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getImageListApi() {
  return requestClient.get<any>('/image/list', {
    params: { pageNum: 0, pageSize: 10 },
  });
}
