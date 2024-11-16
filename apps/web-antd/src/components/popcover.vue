<script setup lang="ts">
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@vben/common-ui';

const show = defineModel('show', { default: false });
const x = defineModel('x', { default: 0 });
const y = defineModel('y', { default: 0 });
</script>

<template>
  <div class="absolute h-80 w-80" :style="{ top: `${y}px`, left: `${x}px` }">
    <Popover v-model:open="show">
      <PopoverTrigger></PopoverTrigger>
      <PopoverContent class="h-80 w-80">
        {{ x }} {{ y }}
        <Button @click="show = false">确定</Button>
        <Button @click="show = false">取消</Button>
      </PopoverContent>
    </Popover>
  </div>
</template>
