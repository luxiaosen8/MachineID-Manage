<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="alertVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="closeAlert"
      >
        <Transition name="scale">
          <div
            v-if="alertVisible"
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
                <h3 class="text-lg font-semibold text-white mb-1">{{ alertConfig.title }}</h3>
                <p class="text-slate-400 text-sm leading-relaxed">{{ alertConfig.message }}</p>
              </div>
            </div>
            
            <!-- 按钮 -->
            <div class="flex justify-end mt-6">
              <Button 
                @click="closeAlert"
                :variant="buttonVariant"
              >
                {{ alertConfig.confirmText }}
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
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  ShieldAlert
} from 'lucide-vue-next';
import { useDialogStore } from '@stores';
import Button from './Button.vue';

const dialogStore = useDialogStore();
const { alertVisible, alertConfig } = dialogStore;

// 根据类型确定图标
const iconComponent = computed(() => {
  switch (alertConfig.type) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return XCircle;
    case 'warning':
      return AlertTriangle;
    case 'permission':
      return ShieldAlert;
    case 'info':
    default:
      return Info;
  }
});

// 图标背景色
const iconBgClass = computed(() => {
  switch (alertConfig.type) {
    case 'success':
      return 'bg-emerald-500/20';
    case 'error':
      return 'bg-red-500/20';
    case 'warning':
      return 'bg-amber-500/20';
    case 'permission':
      return 'bg-purple-500/20';
    case 'info':
    default:
      return 'bg-blue-500/20';
  }
});

// 图标颜色
const iconClass = computed(() => {
  switch (alertConfig.type) {
    case 'success':
      return 'text-emerald-400';
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-amber-400';
    case 'permission':
      return 'text-purple-400';
    case 'info':
    default:
      return 'text-blue-400';
  }
});

// 按钮样式
const buttonVariant = computed(() => {
  switch (alertConfig.type) {
    case 'success':
      return 'default';
    case 'error':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'permission':
      return 'default';
    case 'info':
    default:
      return 'default';
  }
});

function closeAlert() {
  dialogStore.closeAlert();
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
