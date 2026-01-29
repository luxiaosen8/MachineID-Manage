<template>
  <footer class="relative z-20 border-t border-white/5 mt-8">
    <div class="container mx-auto px-4 py-5 max-w-5xl">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Warning -->
        <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle class="w-4 h-4 text-amber-400" />
          <span class="text-xs text-amber-400">修改注册表前请备份您的数据</span>
        </div>
        
        <!-- Version & Links -->
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <span>版本 2.0.0</span>
          <div class="w-px h-3 bg-slate-700" />
          <span class="hover:text-slate-400 cursor-pointer transition-colors">帮助文档</span>
          <div class="w-px h-3 bg-slate-700" />
          <span class="hover:text-slate-400 cursor-pointer transition-colors">关于</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
</script>
