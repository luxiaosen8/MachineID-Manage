<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="replaceModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="close"
      >
        <Transition name="scale">
          <div
            v-if="replaceModalVisible"
            class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">自定义替换 MachineGuid</h3>
              <button
                class="text-slate-400 hover:text-white transition-colors"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
              <p class="text-sm text-amber-400 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" />
                替换前将自动备份当前机器码
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  新的 MachineGuid
                </label>
                <input
                  v-model="guidInput"
                  type="text"
                  placeholder="550E8400-E29B-41D4-A716-446655440000"
                  maxlength="36"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  :class="{ 'border-red-500': !isValid && guidInput.length > 0 }"
                />
                <p class="mt-1 text-xs text-slate-500">
                  格式: 550E8400-E29B-41D4-A716-446655440000
                </p>
                <p v-if="!isValid && guidInput.length > 0" class="mt-1 text-xs text-red-400">
                  无效的 GUID 格式
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  描述 (可选)
                </label>
                <input
                  v-model="description"
                  type="text"
                  placeholder="为什么要替换这个机器码"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <Button variant="outline" @click="close">
                取消
              </Button>
              <Button
                variant="destructive"
                :disabled="!isValid || isLoading"
                :loading="isLoading"
                @click="handleReplace"
              >
                确认替换
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, AlertTriangle } from 'lucide-vue-next';
import { useDialogStore, useMachineIdStore } from '@stores';
import { isValidGuid } from '@utils';
import Button from '@components/ui/Button.vue';

const dialogStore = useDialogStore();
const machineIdStore = useMachineIdStore();

const { replaceModalVisible } = dialogStore;
const { isLoading } = machineIdStore;

const guidInput = ref('');
const description = ref('');

const isValid = computed(() => isValidGuid(guidInput.value));

function close() {
  guidInput.value = '';
  description.value = '';
  dialogStore.closeReplaceModal();
}

async function handleReplace() {
  if (!isValid.value) return;

  const confirmed = await dialogStore.showConfirm({
    title: '最终确认',
    message: `确定要将机器码替换为 ${guidInput.value} 吗？`,
    confirmText: '确认替换',
    cancelText: '取消',
    variant: 'destructive',
  });

  if (confirmed) {
    const result = await machineIdStore.writeMachineId(
      guidInput.value,
      description.value
    );

    if (result.success) {
      close();
      await dialogStore.showAlert({
        title: '替换成功',
        message: result.message || '机器码已成功替换',
      });
    } else {
      await dialogStore.showAlert({
        title: '替换失败',
        message: result.error || '替换过程中发生错误',
      });
    }
  }
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
