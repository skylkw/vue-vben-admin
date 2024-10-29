<script lang="ts" setup>
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface';

import { ref } from 'vue';

import { Card, CardContent, CardHeader, Page } from '@vben/common-ui';

import { message, type UploadProps } from 'ant-design-vue';
import { UploadDragger } from 'ant-design-vue';
import { Inbox } from 'lucide-vue-next';

import { uploadImage } from '#/api';

const fileList = ref<UploadProps['fileList']>([]);
const loading = ref<boolean>(false);

const customRequest = async (options: UploadRequestOption) => {
  const { file, onSuccess, onError } = options;
  if (file instanceof File) {
    loading.value = true;

    try {
      const res = await uploadImage(file);

      message.success(`${file.name} file uploaded successfully`);
      onSuccess!(res);
    } catch (error) {
      message.error('upload error');
      onError!(error as Error);
    } finally {
      loading.value = false;
    }
  }
};
</script>
<template>
  <Page>
    <Card>
      <CardHeader>
        <h2 class="text-primary-500 text-xl font-bold">上传图片</h2>
      </CardHeader>
      <CardContent>
        <UploadDragger
          v-model:file-list="fileList"
          :custom-request="customRequest"
          list-type="picture"
          multiple
        >
          <div class="flex flex-col items-center justify-center">
            <Inbox class="text-primary-600 h-8 w-8" />
            <p class="ant-upload-text">点击或拖动文件到此区域上传</p>
          </div>
        </UploadDragger>
      </CardContent>
    </Card>
  </Page>
</template>
