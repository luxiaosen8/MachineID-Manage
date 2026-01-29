<template>
  <header class="relative z-20 border-b border-white/5">
    <div class="container mx-auto px-4 py-4 max-w-5xl">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Cpu class="w-5 h-5 text-white" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[hsl(220_25%_8%)] flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white tracking-tight">
              MachineID-Manage
            </h1>
            <p class="text-xs text-slate-400">
              Windows 机器码管理器 v{{ appVersion }}
            </p>
          </div>
        </div>

        <!-- Permission Badge -->
        <PermissionBadge />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Cpu } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import PermissionBadge from '@components/ui/PermissionBadge.vue';
import { useMachineIdStore } from '@stores';

const machineIdStore = useMachineIdStore();
const { appVersion } = storeToRefs(machineIdStore);
</script>
