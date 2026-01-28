<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <AppHeader />
    <main class="container mx-auto px-4 py-6 max-w-5xl">
      <div class="space-y-6">
        <CurrentMachineId />
        <ActionPanel />
        <BackupList />
        <StatusBar />
      </div>
    </main>
    <AppFooter />
    
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
