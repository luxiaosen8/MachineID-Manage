<template>
  <div
    class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
    :class="badgeClass"
  >
    <Shield v-if="hasPermission" class="w-4 h-4" />
    <ShieldAlert v-else class="w-4 h-4" />
    <span>{{ badgeText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Shield, ShieldAlert } from 'lucide-vue-next';
import { useMachineIdStore } from '@stores';

const machineIdStore = useMachineIdStore();

const hasPermission = computed(() => machineIdStore.hasPermission);

const badgeClass = computed(() => {
  return hasPermission.value
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
});

const badgeText = computed(() => {
  return hasPermission.value ? '管理员权限' : '普通权限';
});
</script>
