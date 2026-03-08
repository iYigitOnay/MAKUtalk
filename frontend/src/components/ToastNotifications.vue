<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
    <transition-group name="toast-list">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl border-l-4 backdrop-blur-md transition-all duration-300 transform"
        :class="[
          n.type === 'success' ? 'bg-emerald-500/90 border-l-emerald-200 text-white' : 
          n.type === 'error' ? 'bg-rose-500/90 border-l-rose-200 text-white' : 
          n.type === 'warning' ? 'bg-amber-500/90 border-l-amber-200 text-white' : 
          'bg-indigo-600/90 border-l-indigo-200 text-white'
        ]"
      >
        <div class="flex-shrink-0">
          <svg v-if="n.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <svg v-else-if="n.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p class="text-sm font-medium pr-8">{{ n.message }}</p>
        <button @click="removeNotification(n.id)" class="ml-auto hover:opacity-70">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
const { notifications, removeNotification } = useNotification();
</script>

<style scoped>
.toast-list-enter-from { opacity: 0; transform: translateX(50px) scale(0.9); }
.toast-list-leave-to { opacity: 0; transform: scale(0.8); }
.toast-list-move { transition: transform 0.4s ease; }
</style>
