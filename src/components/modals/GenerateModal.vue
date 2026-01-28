<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="generateModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="close"
      >
        <Transition name="scale">
          <div
            v-if="generateModalVisible"
            class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white">随机生成 MachineGuid</h3>
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
                生成前将自动备份当前机器码
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  新生成的 MachineGuid
                </label>
                <div class="flex items-center gap-2">
                  <code class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-purple-400 font-mono">
                    {{ generatedGuid }}
                  </code>
                  <Button variant="outline" size="icon" @click="regenerate">
                    <RefreshCw class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  描述 (可选)
                </label>
                <input
                  v-model="description"
                  type="text"
                  placeholder="随机生成的新机器码"
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
                :disabled="isLoading"
                :loading="isLoading"
                @click="handleGenerate"
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
import { ref, watch } from 'vue';
import { X, AlertTriangle, RefreshCw } from 'lucide-vue-next';
import { useDialogStore, useMachineIdStore } from '@stores';
import { generateGuid } from '@utils';
import Button from '@components/ui/Button.vue';

const dialogStore = useDialogStore();
const machineIdStore = useMachineIdStore();

const { generateModalVisible } = dialogStore;
const { isLoading } = machineIdStore;

const generatedGuid = ref(generateGuid());
const description = ref('');

// 当对话框打开时生成新的 GUID
watch(() => generateModalVisible.value, (visible) => {
  if (visible) {
    generatedGuid.value = generateGuid();
    description.value = '';
  }
});

function regenerate() {
  generatedGuid.value = generateGuid();
}

function close() {
  dialogStore.closeGenerateModal();
}

async function handleGenerate() {
  const confirmed = await dialogStore.showConfirm({
    title: '最终确认',
    message: `确定要将机器码替换为随机生成的 GUID 吗？`,
    confirmText: '确认替换',
    cancelText: '取消',
    variant: 'destructive',
  });

  if (confirmed) {
    const result = await machineIdStore.generateRandomMachineId(description.value);

    if (result.success) {
      close();
      await dialogStore.showAlert({
        title: '生成成功',
        message: result.message || '新的机器码已生成并替换',
      });
    } else {
      await dialogStore.showAlert({
        title: '生成失败',
        message: result.error || '生成过程中发生错误',
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
