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
            <h3 class="text-lg font-semibold text-white mb-2">{{ confirmConfig.title }}</h3>
            <p class="text-slate-400 mb-6">{{ confirmConfig.message }}</p>
            
            <div class="flex justify-end gap-3">
              <Button variant="outline" @click="cancel">
                {{ confirmConfig.cancelText }}
              </Button>
              <Button
                :variant="confirmConfig.variant === 'destructive' ? 'destructive' : 'default'"
                @click="confirm"
              >
                {{ confirmConfig.confirmText }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useDialogStore } from '@stores';
import Button from './Button.vue';

const dialogStore = useDialogStore();
const { confirmVisible, confirmConfig } = dialogStore;

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
