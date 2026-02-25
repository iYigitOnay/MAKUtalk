<!-- src/views/Messages.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen"
  >
    <!-- Header -->
    <div
    <div class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/90 to-white/80 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-4">
    >
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        💌 Sohbetler
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></div>
    </div>

    <!-- Conversations List -->
    <div
      v-else-if="conversations.length > 0"
      class="divide-y divide-gray-200 dark:divide-primary-900/20"
    >
      <router-link
        v-for="conversation in conversations"
        :key="conversation.id"
        :to="`/messages/${conversation.id}`"
        class="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div class="flex gap-3">
          <!-- Avatar -->
          <img
            v-if="conversation.participant?.profileImage"
            :src="conversation.participant.profileImage"
            :alt="conversation.participant.username"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div
            v-else
            class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold"
          >
            {{ conversation.participant?.username?.charAt(0).toUpperCase() }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ conversation.participant?.username }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-500">{{
                formatTime(conversation.lastMessageAt)
              }}</span>
            </div>
            <p
              class="text-sm text-gray-600 dark:text-gray-400 truncate"
              :class="{ 'font-semibold': conversation.unreadCount > 0 }"
            >
              {{ conversation.lastMessage }}
            </p>
            <div
              v-if="conversation.unreadCount > 0"
              class="flex items-center gap-2 mt-1"
            >
              <span
                class="inline-block w-2 h-2 bg-primary-600 rounded-full"
              ></span>
              <span class="text-xs text-primary-600 font-medium"
                >{{ conversation.unreadCount }} yeni mesaj</span
              >
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center h-64 text-center"
    >
      <svg
        class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">Henüz mesaj yok</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const conversations = ref<any[]>([]);
const loading = ref(true);

const formatTime = (date: string) => {
  const now = new Date();
  const created = new Date(date);
  const diff = now.getTime() - created.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "şu anda";
  if (minutes < 60) return `${minutes}d`;
  if (hours < 24) return `${hours}s`;
  if (days < 7) return `${days}g`;
  return created.toLocaleDateString("tr-TR");
};

onMounted(async () => {
  try {
    // TODO: messagesStore.fetchConversations() çağırı
    conversations.value = [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
  } finally {
    loading.value = false;
  }
});
</script>
