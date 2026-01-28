<template>
  <footer class="border-t border-slate-700/50 bg-slate-900/30 mt-8">
    <div class="container mx-auto px-4 py-4 max-w-5xl">
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2 text-amber-400">
          <AlertTriangle class="w-4 h-4" />
          <span>修改注册表前请备份您的数据</span>
        </div>
        <div class="text-slate-500">
          版本 2.0.0
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
</script>
