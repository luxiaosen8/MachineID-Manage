<template>
  <header class="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
    <div class="container mx-auto px-4 py-6 max-w-5xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Cpu class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">MachineID-Manage</h1>
            <p class="text-sm text-slate-400">Windows 机器码管理器 v2.0</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <PermissionBadge />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Cpu } from 'lucide-vue-next';
import PermissionBadge from '@components/ui/PermissionBadge.vue';
</script>
