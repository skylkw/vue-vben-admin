<script setup lang="ts">
import CanvasLabeler from 'canvas-labeler';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getImageListApi } from '#/api/image';
import {
  ToggleGroup,
  ToggleGroupItem,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Button,
} from '@vben/common-ui';
import {
  Move,
  Square,
  Circle,
  RotateCcwSquare,
  Minus,
  Shapes,
  Dot,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { getAnnotationsApi, saveAnnotationBulkApi } from '#/api';

// 定义绘图类型常量
enum DRAW_TYPES {
  DRAG = 0,
  RECTANGLE = 1,
  POLYGON = 2,
  DOT = 3,
  LINE = 4,
  CIRCLE = 5,
  ROTATE_RECTANGLE = 8,
}

// 定义绘图选项的接口
interface DrawOption {
  label: string;
  coor: number[][] | number[];
  strokeStyle: string;
  fillStyle: string;
  labelFillStyle: string;
  labelFont: string;
  textFillStyle: string;
  type: DRAW_TYPES;
  radius?: number; // 仅用于圆形
  active: boolean;
  count: number;
  creating: boolean;
  dragging: boolean;
  index: number;
  uuid: string;
}

// 定义工具的接口
interface ToolOption {
  value: string;
  label: string;
  icon: Component;
  shortcut?: string;
}

// 定义标签的接口
interface LabelOption {
  id: number;
  name: string;
  color: string;
}

// 映射工具名称到对应的 createType
const toolToCreateType: Record<string, DRAW_TYPES> = {
  drag: DRAW_TYPES.DRAG,
  rectangle: DRAW_TYPES.RECTANGLE,
  polygon: DRAW_TYPES.POLYGON,
  dot: DRAW_TYPES.DOT,
  line: DRAW_TYPES.LINE,
  circle: DRAW_TYPES.CIRCLE,
  rotateRectangle: DRAW_TYPES.ROTATE_RECTANGLE,
};

// 创建一个引用来存储 CanvasLabeler 实例
let labelerInstance: CanvasLabeler | null = null;

// 定义一个响应式变量来跟踪当前选中的绘图类型
const selectedTool = ref<string>('drag');

// 定义工具选项列表，并添加快捷键
const tools: ToolOption[] = [
  {
    value: 'drag',
    label: '拖动',
    icon: Move,
    shortcut: 'D',
  },
  {
    value: 'rectangle',
    label: '矩形',
    icon: Square,
    shortcut: 'R',
  },
  {
    value: 'polygon',
    label: '多边形',
    icon: Shapes,
    shortcut: 'P',
  },
  {
    value: 'dot',
    label: '点',
    icon: Dot,
    shortcut: 'O',
  },
  {
    value: 'line',
    label: '线',
    icon: Minus,
    shortcut: 'L',
  },
  {
    value: 'circle',
    label: '圆形',
    icon: Circle,
    shortcut: 'C',
  },
  {
    value: 'rotateRectangle',
    label: '旋转矩形',
    icon: RotateCcwSquare,
    shortcut: 'T',
  },
];

// 定义标签列表和选中的标签
const labels = ref<LabelOption[]>([
  { id: 1, name: '标签1', color: '#FF0000' },
  { id: 2, name: '标签2', color: '#00FF00' },
  { id: 3, name: '标签3', color: '#0000FF' },
  // 添加更多标签
]);

const selectedLabel = ref<LabelOption>(labels.value[0]!);

// 切换标签的方法
const switchLabel = (label: LabelOption) => {
  selectedLabel.value = label;
};

// 定义图片列表
const imageList = ref<any[]>([]);

// 切换图片的方法
const currentImage = ref<any>(null);
const switchImage = async (image: any) => {
  currentImage.value = image;
  if (labelerInstance) {
    // 清空数据
    labelerInstance.setData([]);
    labelerInstance.setImage(image.url);
    let { annotations } = await getAnnotationsApi({ imageId: image.id });
    labelerInstance.setData(annotations);
    // 根据标签名设置颜色
    annotations.forEach((annotation: any) => {
      annotation.strokeStyle = labels.value.find(
        (label) => label.name === annotation.label,
      )?.color;
    });
  }
};

// 保存标注的方法
const saveAnnotationBulk = async () => {
  if (labelerInstance) {
    try {
      const annotations = labelerInstance.dataset.map((shape: any) => ({
        ...shape,
        label_id: 1,
      }));
      await saveAnnotationBulkApi({
        imageId: currentImage.value.id,
        annotations,
      });
      console.log('Annotations saved successfully:', annotations);
    } catch (error) {
      console.error('Failed to save annotations:', error);
    }
  }
};

const updateAnnotation = useThrottleFn((info) => {
  console.log('updateAnnotation', info);
}, 1000);

// 初始化 CanvasLabeler 实例并设置初始绘图类型
const initializeLabeler = (): void => {
  if (!labelerInstance) {
    labelerInstance = new CanvasLabeler('.canvas');
    labelerInstance.activeStrokeStyle = '#FFFFFF';
    labelerInstance.on('add', (drawOption: DrawOption) => {
      console.log('Add:', drawOption);
      drawOption.label = selectedLabel.value.name;
      drawOption.strokeStyle = selectedLabel.value.color;
      labelerInstance?.update();
    });
    labelerInstance.on('select', (drawOption: DrawOption) => {
      console.log('Select:', drawOption);
    });
    labelerInstance.on('updated', (allDrawOptions: DrawOption[]) => {
      updateAnnotation(allDrawOptions);
    });
  }

  // 设置初始绘图类型
  labelerInstance.createType = toolToCreateType[selectedTool.value]!;
};

// 错误处理函数
const handleError = (error: unknown): void => {
  console.error('An error occurred:', error);
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent): void => {
  const key = event.key.toUpperCase();
  const tool = tools.find((t) => t.shortcut === key);
  if (tool) {
    selectedTool.value = tool.value;
  }
  if (labelerInstance) {
    labelerInstance.strokeStyle = selectedLabel.value.color;
  }
};

// 挂载时初始化 CanvasLabeler 并添加键盘事件监听器
onMounted(async () => {
  try {
    // 获取图片列表
    const { list } = await getImageListApi();
    imageList.value = list;
    console.log(list);

    initializeLabeler();
    window.addEventListener('keyup', handleKeyDown);
  } catch (error) {
    handleError(error);
  }
});

// 卸载时移除键盘事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('keyup', handleKeyDown);
});

// 监听 selectedTool 的变化，更新 createType
watch(selectedTool, (newTool: string) => {
  if (labelerInstance) {
    labelerInstance.createType = toolToCreateType[newTool] ?? DRAW_TYPES.DRAG;
  }
});
</script>

<template>
  <div class="flex h-[calc(100vh-50px)] overflow-hidden">
    <!-- 图片列表 -->

    <ul class="w-32 overflow-y-auto p-2">
      <li
        v-for="(image, index) in imageList"
        :key="index"
        class="mb-2 cursor-pointer"
        @click="switchImage(image)"
      >
        <img
          :src="image.url"
          alt="切换图片"
          class="w-32 rounded object-contain shadow"
        />
      </li>
    </ul>

    <!-- 画布及工具区域 -->
    <div class="flex h-full flex-1 flex-col items-center">
      <!-- 工具选择组 -->
      <ToggleGroup
        v-model="selectedTool"
        type="single"
        variant="outline"
        class="bg-primary-50/50 flex-wrap rounded-md bg-opacity-30 p-1 shadow-md backdrop-blur-md"
      >
        <ToggleGroupItem
          v-for="tool in tools"
          :key="tool.value"
          :value="tool.value"
          class="hover:bg-primary-200 data-[state=on]:bg-primary-300 m-1 flex items-center justify-center rounded p-2 transition-colors duration-200"
          aria-label="工具选择"
        >
          <HoverCard>
            <HoverCardTrigger>
              <component
                :is="tool.icon"
                class="hover:text-foreground h-4 w-4"
              />
            </HoverCardTrigger>
            <HoverCardContent class="mt-2 max-w-fit rounded p-2 text-sm shadow">
              {{ tool.label }} ({{ tool.shortcut }})
            </HoverCardContent>
          </HoverCard>
        </ToggleGroupItem>
      </ToggleGroup>
      <Button @click="saveAnnotationBulk"> 保存标注 </Button>

      <!-- 画布 -->
      <div class="flex w-full flex-1">
        <canvas
          class="canvas border-primary-200 h-full w-full rounded-lg border bg-opacity-10 p-2 shadow backdrop-blur-lg"
        ></canvas>
      </div>
    </div>
    <!-- 标签选择列表 -->

    <div class="w-60 max-w-md p-2">
      <label class="mb-2 block text-sm font-medium"> 选择标签 </label>
      <div class="flex flex-col flex-wrap gap-2">
        <Button
          v-for="label in labels"
          :key="label.id"
          @click="switchLabel(label)"
          :class="[
            'bg-muted cursor-pointer rounded-md px-4 py-2',
            selectedLabel.id === label.id ? 'bg-primary-500' : 'text-black',
          ]"
        >
          {{ label.name }}
        </Button>
      </div>
    </div>
  </div>
</template>
