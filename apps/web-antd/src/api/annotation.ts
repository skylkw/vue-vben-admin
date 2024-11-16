import type { UUID } from 'crypto';
import { requestClient } from './request';

export namespace AnnotationApi {
  /** 上传或更新图片标注接口请求 */
  export interface saveAnnotationBulkRequest {
    imageId: number;
    annotations: Array<Annotation>;
  }

  // 获取标注接口请求
  export interface getAnnotationsRequest {
    imageId: number;
  }

  export interface Annotation {
    type: string;
    id: UUID;
    label_id: number;
    coor: Array<Array<number>>;
    tagLevel1: number;
    tagLevel2: number;
    tagLevel3: number;
    tagLevel4: number;
    tagLevel5: number | null;
  }
}

// 保存（添加或更新）标注
export async function saveAnnotationBulkApi(
  data: AnnotationApi.saveAnnotationBulkRequest,
) {
  return requestClient.post<any>('/annotation/save_bulk', data);
}


// 获取标注
export async function getAnnotationsApi(params: AnnotationApi.getAnnotationsRequest) {
  return requestClient.get<any>('/annotation/image', { params });
}
