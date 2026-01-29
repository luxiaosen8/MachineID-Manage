<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- 背景效果 -->
    <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(220_25%_12%)_0%,_hsl(220_25%_6%)_50%,_hsl(220_25%_4%)_100%)]" />
    <div class="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
    
    <!-- 顶部光晕 -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_60%_/_0.15)_0%,_transparent_70%)] pointer-events-none" />
    
    <!-- 内容 -->
    <div class="relative z-10">
      <AppHeader />
      <main class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="space-y-6 page-enter">
          <CurrentMachineId class="animate-fade-in-up" />
          <ActionPanel class="animate-fade-in-up animation-delay-100" />
          <BackupList class="animate-fade-in-up animation-delay-200" />
          <StatusBar class="animate-fade-in-up animation-delay-300" />
        </div>
      </main>
      <AppFooter />
    </div>
    
    <!-- Modals -->
    <ReplaceModal />
    <GenerateModal />
    <ConfirmDialog />
    <AlertDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMachineIdStore } from '@stores/machineId';
import { useBackupStore } from '@stores/backup';
import AppHeader from '@components/layout/AppHeader.vue';
import AppFooter from '@components/layout/AppFooter.vue';
import CurrentMachineId from '@components/features/CurrentMachineId.vue';
import ActionPanel from '@components/features/ActionPanel.vue';
import BackupList from '@components/features/BackupList.vue';
import StatusBar from '@components/features/StatusBar.vue';
import ReplaceModal from '@components/modals/ReplaceModal.vue';
import GenerateModal from '@components/modals/GenerateModal.vue';
import ConfirmDialog from '@components/ui/ConfirmDialog.vue';
import AlertDialog from '@components/ui/AlertDialog.vue';

const machineIdStore = useMachineIdStore();
const backupStore = useBackupStore();

onMounted(async () => {
  await machineIdStore.initialize();
  await backupStore.loadBackups();
});
</script>
