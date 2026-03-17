<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-10 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-10 opacity-0 scale-95"
  >
    <div
      v-if="isVisible && messageData"
      @click="goToChat"
      class="fixed bottom-6 right-6 z-50 flex items-center p-4 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-white/90 dark:hover:bg-slate-900/95 transition-colors group"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <img
          :src="avatarUrl"
          alt="Avatar"
          class="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/30"
        />
        <div class="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"></div>
      </div>

      <!-- Content -->
      <div class="ml-4 flex-1 overflow-hidden">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {{ senderName }}
          </h4>
          <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">Şimdi</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">
          {{ messagePreview }}
        </p>
      </div>

      <!-- Close Button -->
      <button 
        @click.stop="closeNotification" 
        class="absolute -top-2 -right-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chat';

const router = useRouter();
const route = useRoute();
const chatStore = useChatStore();

const isVisible = ref(false);
const messageData = ref<any>(null);
let hideTimer: any = null;
let timeRemaining = 5000;
let startTime = 0;

const senderName = computed(() => {
  return messageData.value?.sender?.fullName || messageData.value?.sender?.username || 'Biri';
});

const avatarUrl = computed(() => {
  if (messageData.value?.sender?.avatarUrl) {
    return import.meta.env.VITE_API_URL?.replace('/api', '') + messageData.value.sender.avatarUrl;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName.value)}&background=random`;
});

const messagePreview = computed(() => {
  return messageData.value?.content || 'Yeni bir mesaj gönderdi.';
});

const startTimer = (duration: number) => {
  clearTimeout(hideTimer);
  timeRemaining = duration;
  startTime = Date.now();
  hideTimer = setTimeout(() => {
    isVisible.value = false;
  }, timeRemaining);
};

const pauseTimer = () => {
  clearTimeout(hideTimer);
  timeRemaining -= Date.now() - startTime;
};

const resumeTimer = () => {
  if (timeRemaining > 0) {
    startTimer(timeRemaining);
  } else {
    isVisible.value = false;
  }
};

const closeNotification = () => {
  isVisible.value = false;
  clearTimeout(hideTimer);
};

const goToChat = () => {
  closeNotification();
  router.push({
    path: '/messages',
    query: { conversationId: messageData.value.conversationId }
  });
};

watch(() => chatStore.latestIncomingMessage, (newMsg) => {
  if (newMsg) {
    // Kullanıcı zaten "Mesajlar" sayfasındaysa bildirim çıkarma
    if (route.path === '/messages') return;

    messageData.value = newMsg;
    isVisible.value = false; // Animasyonu tetiklemek için önce kapat
    
    setTimeout(() => {
      isVisible.value = true;
      startTimer(5000); // 5 saniye sonra kapanır
    }, 50);
  }
});

onUnmounted(() => {
  clearTimeout(hideTimer);
});
</script>
