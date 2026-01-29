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
            <!-- 头部 -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Edit3 class="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white">自定义替换 MachineGuid</h3>
                  <p class="text-sm text-slate-400">使用指定的 GUID 替换当前机器码</p>
                </div>
              </div>
              <button
                class="text-slate-400 hover:text-white transition-colors"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- 警告提示 -->
            <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
              <p class="text-sm text-amber-400 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" />
                替换前将自动备份当前机器码
              </p>
            </div>

            <div class="space-y-4">
              <!-- GUID 输入 -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  新的 MachineGuid
                  <span class="text-slate-500 text-xs ml-1">(格式: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX)</span>
                </label>
                <div class="relative">
                  <input
                    v-model="guidInput"
                    type="text"
                    placeholder="550E8400-E29B-41D4-A716-446655440000"
                    maxlength="36"
                    class="w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase transition-all duration-200"
                    :class="inputBorderClass"
                    @input="handleInput"
                    @blur="handleBlur"
                  />
                  <!-- 验证状态图标 -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2
                      v-if="isValid && guidInput.length === 36"
                      class="w-5 h-5 text-emerald-400"
                    />
                    <XCircle
                      v-else-if="!isValid && guidInput.length > 0 && isTouched"
                      class="w-5 h-5 text-red-400"
                    />
                  </div>
                </div>
                <!-- 格式提示 -->
                <div class="mt-2 space-y-1">
                  <p class="text-xs" :class="formatHintClass">
                    <Info v-if="!isTouched || isValid" class="w-3 h-3 inline mr-1" />
                    <AlertCircle v-else class="w-3 h-3 inline mr-1" />
                    {{ formatHintText }}
                  </p>
                  <!-- 字符计数 -->
                  <p class="text-xs text-slate-500 text-right">
                    {{ guidInput.length }} / 36
                  </p>
                </div>
              </div>

              <!-- 描述输入 -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  描述 (可选)
                </label>
                <input
                  v-model="description"
                  type="text"
                  placeholder="为什么要替换这个机器码"
                  maxlength="200"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-slate-500 text-right">
                  {{ description.length }} / 200
                </p>
              </div>

              <!-- 预览区域 -->
              <div v-if="isValid" class="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                <p class="text-xs text-slate-400 mb-1">预览</p>
                <p class="text-sm font-mono text-emerald-400">{{ formattedGuid }}</p>
              </div>
            </div>

            <!-- 按钮 -->
            <div class="flex justify-end gap-3 mt-6">
              <Button variant="outline" @click="close" :disabled="isLoading">
                取消
              </Button>
              <Button
                variant="destructive"
                :disabled="!isValid || isLoading"
                :loading="isLoading"
                @click="handleReplace"
              >
                <span v-if="isLoading">替换中...</span>
                <span v-else>确认替换</span>
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, AlertTriangle, Edit3, CheckCircle2, XCircle, Info, AlertCircle } from 'lucide-vue-next';
import { useDialogStore, useMachineIdStore } from '@stores';
import { isValidGuid } from '@utils';
import Button from '@components/ui/Button.vue';

const dialogStore = useDialogStore();
const machineIdStore = useMachineIdStore();

const replaceModalVisible = computed(() => dialogStore.replaceModalVisible);
const { isLoading } = machineIdStore;

const guidInput = ref('');
const description = ref('');
const isTouched = ref(false);

// 格式化 GUID（转为大写）
const formattedGuid = computed(() => {
  return guidInput.value.toUpperCase();
});

// 验证 GUID 格式
const isValid = computed(() => isValidGuid(guidInput.value));

// 输入框边框样式
const inputBorderClass = computed(() => {
  if (!isTouched.value) return 'border-slate-700';
  if (guidInput.value.length === 0) return 'border-slate-700';
  if (isValid.value) return 'border-emerald-500/50 focus:border-emerald-500';
  return 'border-red-500/50 focus:border-red-500';
});

// 格式提示文本样式
const formatHintClass = computed(() => {
  if (!isTouched.value) return 'text-slate-500';
  if (guidInput.value.length === 0) return 'text-slate-500';
  if (isValid.value) return 'text-emerald-400';
  return 'text-red-400';
});

// 格式提示文本
const formatHintText = computed(() => {
  if (!isTouched.value) {
    return '请输入 36 位 GUID，格式: 550E8400-E29B-41D4-A716-446655440000';
  }
  if (guidInput.value.length === 0) {
    return '请输入 36 位 GUID，格式: 550E8400-E29B-41D4-A716-446655440000';
  }
  if (isValid.value) {
    return 'GUID 格式正确';
  }
  if (guidInput.value.length !== 36) {
    return `长度错误: 当前 ${guidInput.value.length} 位，需要 36 位`;
  }
  return '格式错误: 请使用 XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX 格式';
});

// 处理输入
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  // 自动转换为大写
  guidInput.value = target.value.toUpperCase();
  // 限制只能输入十六进制字符和连字符
  guidInput.value = guidInput.value.replace(/[^0-9A-F-]/g, '');
}

// 处理失焦
function handleBlur() {
  isTouched.value = true;
}

// 关闭对话框
function close() {
  guidInput.value = '';
  description.value = '';
  isTouched.value = false;
  dialogStore.closeReplaceModal();
}

// 处理替换
async function handleReplace() {
  if (!isValid.value) return;

  const confirmed = await dialogStore.showConfirm({
    title: '最终确认',
    message: `确定要将机器码替换为 ${formattedGuid.value} 吗？\n\n此操作将修改系统注册表，请确保您了解此操作的影响。`,
    confirmText: '确认替换',
    cancelText: '取消',
    variant: 'destructive',
    type: 'warning',
  });

  if (confirmed) {
    const result = await machineIdStore.writeMachineId(
      formattedGuid.value,
      description.value
    );

    if (result.success) {
      close();
      await dialogStore.showSuccess('替换成功', result.message || '机器码已成功替换');
    } else {
      await dialogStore.showError('替换失败', result.error || '替换过程中发生错误');
    }
  }
}

// 监听对话框打开状态
watch(replaceModalVisible, (visible) => {
  if (visible) {
    // 打开时重置状态
    guidInput.value = '';
    description.value = '';
    isTouched.value = false;
  }
});
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
