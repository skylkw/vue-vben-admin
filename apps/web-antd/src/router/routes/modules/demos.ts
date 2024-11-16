import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: $t('page.demos.uploadImage'),
        },
        name: 'AntDesignDemos',
        path: '/demos/ant-design',
        component: () => import('#/views/demos/antd/index.vue'),
      },
      {
        meta: {
          title: $t('page.demos.pixi'),
        },
        name: 'pixi',
        path: '/demos/pixi',
        component: () => import('#/views/demos/pixi/index.vue'),
      },
      {
        meta: {
          title: $t('page.demos.canvas'),
        },
        name: 'canvas',
        path: '/demos/canvas',
        component: () => import('#/views/demos/canvas/index.vue'),
      },
    ],
  },
];

export default routes;
