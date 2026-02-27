<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen pb-20"
  >
    <div
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-6"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">İstekler</h2>
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gelen takip isteklerini yönet</p>
        </div>
      </div>
    </div>

    <div v-if="followStore.loading" class="flex justify-center py-20">
      <div
        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <div
      v-else-if="followStore.pendingRequests.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div
        class="w-20 h-20 flex items-center justify-center mb-6"
      >
        <svg
          class="w-16 h-16 text-gray-300 dark:text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white mb-2">
        Henüz istek yok
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Biri seni takip etmek istediğinde burada görünecek.
      </p>
    </div>

    <div v-else class="divide-y divide-gray-100 dark:divide-primary-900/10">
      <div
        v-for="request in followStore.pendingRequests"
        :key="request.id"
        class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
      >
        <div class="flex items-center gap-3">
          <router-link
            :to="`/profile/${request.sender.username}`"
            class="relative flex-shrink-0"
          >
            <img
              v-if="request.sender.avatarUrl"
              :src="request.sender.avatarUrl"
              class="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-900"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black border-2 border-white dark:border-gray-900"
            >
              {{ request.sender.username.charAt(0).toUpperCase() }}
            </div>
          </router-link>
          <div class="min-w-0">
            <router-link
              :to="`/profile/${request.sender.username}`"
              class="font-black text-gray-900 dark:text-white hover:underline block truncate text-sm"
            >
              {{ request.sender.fullName || request.sender.username }}
            </router-link>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{{ request.sender.username }}
            </p>
            <p
              v-if="request.sender.department"
              class="text-[10px] text-blue-500 dark:text-blue-400 font-black uppercase mt-0.5"
            >
              {{ request.sender.department }}
            </p>
          </div>
        </div>

        <div class="flex gap-2 ml-4">
          <button
            @click="handleAccept(request.id)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            KABUL ET
          </button>
          <button
            @click="handleReject(request.id)"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-black rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 active:scale-95"
          >
            REDDET
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";

const followStore = useFollowStore();
const toast = useToast();

onMounted(() => {
  followStore.fetchPendingRequests();
});

const handleAccept = async (id: number) => {
  try {
    await followStore.acceptRequest(id);
    toast.success("İstek kabul edildi!");
  } catch {
    toast.error("İşlem başarısız.");
  }
};

const handleReject = async (id: number) => {
  try {
    await followStore.rejectRequest(id);
    toast.info("İstek reddedildi.");
  } catch {
    toast.error("İşlem başarısız.");
  }
};
</script>
