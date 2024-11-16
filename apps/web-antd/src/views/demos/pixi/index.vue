<script lang="ts" setup>
import { Application, Graphics } from 'pixi.js';
import { onMounted, ref } from 'vue';
import FormModalDemo from '#/components/form-model.vue';
import { useVbenModal } from '@vben/common-ui';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: FormModalDemo,
});

const pixiRef = ref<HTMLElement | null>(null);
const rectangles = ref<Graphics[]>([]);

function openFormModal() {
  formModalApi.setData({
    // 表单值
    values: { field1: 'abc' },
  });
  formModalApi.open();
}

onMounted(async () => {
  const app = new Application();
  await app.init({
    antialias: true,
    background: '#1099bb',
    width: 800,
    height: 800,
  });
  pixiRef.value?.appendChild(app.canvas);
  const crossLine = new Graphics();
  let dragTarget: Graphics | null = null;

  function onDragMove(event) {
    if (dragTarget) {
      // 更改位置
      dragTarget.position.copyFrom(event.global);
    }
  }

  function onDragStart() {
    // Store a reference to the data
    // * The reason for this is because of multitouch *
    // * We want to track the movement of this particular touch *
    
    dragTarget = this;
    dragTarget.alpha = 0.5;
    app.stage.on('pointermove', onDragMove);
  }

  function onDragEnd() {
    if (dragTarget) {
      app.stage.off('pointermove', onDragMove);

      dragTarget.alpha = 1;
      dragTarget = null;
    }
  }

  // 画十字虚线
  crossLine.moveTo(-10, 0);
  crossLine.lineTo(10, 0);
  crossLine.moveTo(0, -10);
  crossLine.lineTo(0, 10);

  crossLine.stroke({ width: 2, color: 0xff0000 });
  app.stage.addChild(crossLine);
  crossLine.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.addEventListener('pointermove', (e) => {
    // 鼠标移动时更新十字线位置
    crossLine.visible = true;
    crossLine.position.copyFrom(e.global);
  });
  app.stage.addEventListener('pointerout', () => {
    // 鼠标移出画布时隐藏十字线
    crossLine.visible = false;
  });

  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let rect: Graphics | null = null;
  app.stage.addEventListener('pointerdown', (e) => {
    // 如果已经选中了矩形，不再绘制
    if (dragTarget) {
      return;
    }
    // 鼠标按下时开始绘制矩形
    isDrawing = true;
    startX = e.global.x;
    startY = e.global.y;
    rect = new Graphics();
    app.stage.addChild(rect);
  });

  app.stage.addEventListener('pointermove', (e) => {
    if (isDrawing && rect) {
      const currentX = e.global.x;
      const currentY = e.global.y;
      rect.clear();
      rect.context.rect(startX, startY, currentX - startX, currentY - startY);
      rect.fill({ color: 0xff0000, alpha: 0.2 });
    }
  });

  app.stage.addEventListener('pointerup', (e) => {
    if (e.button === 0 && isDrawing) {
      // 左键松开
      isDrawing = false;
      // 获取矩形的位置和大小
      const x = Math.min(startX, e.global.x);
      const y = Math.min(startY, e.global.y);
      const width = Math.abs(e.global.x - startX);
      const height = Math.abs(e.global.y - startY);
      console.log({ x, y, width, height });

      if (rect) {
        rect.eventMode = 'static';
        rect.cursor = 'pointer';
        rect.pivot.set(width, height);
 
        // Setup events for mouse + touch using the pointer events
        rect.on('pointerdown', onDragStart, rect);
        rectangles.value.push(rect);
      }
      // 显示弹窗
      console.log(e.client.x, e.client.y);
      openFormModal();
      rect = null;
    } else {
      console.log('onDragEnd');
      onDragEnd();
    }
  });
});
</script>

<template>
  <div class="relative flex h-full items-center justify-center">
    <div id="pixi" ref="pixiRef"></div>
    <FormModal />
  </div>
</template>
