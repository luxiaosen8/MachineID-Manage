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
            <h3 class="text-lg font-semibold text-white mb-2">{{ alertConfig.title }}</h3>
            <p class="text-slate-400 mb-6">{{ alertConfig.message }}</p>
            
            <div class="flex justify-end">
              <Button @click="closeAlert">
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
import { useDialogStore } from '@stores';
import Button from './Button.vue';

const dialogStore = useDialogStore();
const { alertVisible, alertConfig } = dialogStore;

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
