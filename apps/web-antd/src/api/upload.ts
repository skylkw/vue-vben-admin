import { requestClient } from './request';

export namespace UploadApi {
  /** 上传图片接口返回值 */
  export interface UploadImageResult {
    filename: string;
    url: string;
  }
}

/**
 * 文件上传
 */
export async function uploadImage(
  file: File,
): Promise<Array<UploadApi.UploadImageResult>> {
  const response: any = await requestClient.upload('/upload/image', {
    file,
  });
  return response as Array<UploadApi.UploadImageResult>;
}
