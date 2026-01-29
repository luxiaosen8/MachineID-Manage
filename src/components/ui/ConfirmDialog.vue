<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="confirmVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="cancel"
      >
        <Transition name="scale">
          <div
            v-if="confirmVisible"
            class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
            @click.stop
          >
            <!-- 图标和标题 -->
            <div class="flex items-start gap-4 mb-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                :class="iconBgClass"
              >
                <component :is="iconComponent" class="w-6 h-6" :class="iconClass" />
              </div>
              <div class="flex-1 pt-1">
                <h3 class="text-lg font-semibold text-white mb-1">{{ confirmConfig.title }}</h3>
                <p class="text-slate-400 text-sm leading-relaxed">{{ confirmConfig.message }}</p>
              </div>
            </div>

            <!-- 按钮 -->
            <div class="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                @click="cancel"
                :disabled="isLoading"
              >
                {{ confirmConfig.cancelText }}
              </Button>
              <Button
                :variant="confirmButtonVariant"
                @click="confirm"
                :disabled="isLoading"
                :loading="isLoading"
              >
                {{ confirmButtonText }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  AlertTriangle,
  Trash2,
  RefreshCw,
  ShieldAlert,
  HelpCircle,
  Power
} from 'lucide-vue-next';
import { useDialogStore } from '@stores';
import Button from './Button.vue';

const dialogStore = useDialogStore();
const { confirmVisible, confirmConfig, isLoading } = storeToRefs(dialogStore);

// 根据类型确定图标
const iconComponent = computed(() => {
  switch (confirmConfig.value.type) {
    case 'delete':
      return Trash2;
    case 'restore':
      return RefreshCw;
    case 'permission':
      return ShieldAlert;
    case 'restart':
      return Power;
    case 'warning':
      return AlertTriangle;
    case 'confirm':
    default:
      return HelpCircle;
  }
});

// 图标背景色
const iconBgClass = computed(() => {
  switch (confirmConfig.value.type) {
    case 'delete':
      return 'bg-red-500/20';
    case 'restore':
      return 'bg-blue-500/20';
    case 'permission':
      return 'bg-purple-500/20';
    case 'restart':
      return 'bg-amber-500/20';
    case 'warning':
      return 'bg-amber-500/20';
    case 'confirm':
    default:
      return 'bg-blue-500/20';
  }
});

// 图标颜色
const iconClass = computed(() => {
  switch (confirmConfig.value.type) {
    case 'delete':
      return 'text-red-400';
    case 'restore':
      return 'text-blue-400';
    case 'permission':
      return 'text-purple-400';
    case 'restart':
      return 'text-amber-400';
    case 'warning':
      return 'text-amber-400';
    case 'confirm':
    default:
      return 'text-blue-400';
  }
});

// 确认按钮样式
const confirmButtonVariant = computed(() => {
  if (confirmConfig.value.variant === 'destructive') {
    return 'destructive';
  }
  return 'default';
});

// 确认按钮文本
const confirmButtonText = computed(() => {
  if (isLoading.value) {
    return '处理中...';
  }
  return confirmConfig.value.confirmText;
});

function confirm() {
  dialogStore.confirm();
}

function cancel() {
  dialogStore.cancel();
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
