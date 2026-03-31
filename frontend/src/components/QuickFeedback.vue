<!-- src/components/QuickFeedback.vue -->
<template>
  <!-- Global Portal Container -->
  <div
    ref="containerRef"
    class="fixed bottom-24 sm:bottom-10 right-6 z-[200] flex flex-col items-end pointer-events-none"
  >
    <!-- Expansion Panel (Minimalist Area) -->
    <transition name="panel-fade" @after-enter="onPanelOpen">
      <div
        v-if="isOpen"
        class="pointer-events-auto w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-[2rem] shadow-2xl mb-4 overflow-hidden"
      >
        <div class="p-6 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3
              class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]"
            >
              Geri Bildirim
            </h3>
            <button
              @click="isOpen = false"
              class="text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Input Field -->
          <textarea
            v-model="message"
            ref="inputRef"
            rows="3"
            maxlength="500"
            placeholder="Hata ve Eksikleri yaz ve düzeltileceğini bil..."
            class="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-black/20 border border-transparent focus:border-blue-500/20 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all resize-none no-scrollbar shadow-inner"
          ></textarea>

          <!-- Submit Button (Minimal) -->
          <div class="flex items-center justify-between gap-4">
            <span
              class="text-[9px] font-black tracking-widest transition-colors duration-300"
              :class="
                message.length >= 500
                  ? 'text-red-500 animate-pulse'
                  : 'text-gray-300'
              "
            >
              {{ message.length }}/500
            </span>
            <button
              @click="submitFeedback"
              :disabled="loading || !message.trim() || message.length > 500"
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <template v-if="loading">
                <div
                  class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
              </template>
              <span v-else>GÖNDER</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Simple Floating Button -->
    <button
      @click="togglePanel"
      class="pointer-events-auto group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out shadow-lg"
      :class="
        isOpen
          ? 'bg-blue-600'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5'
      "
    >
      <transition name="icon-swap" mode="out-in">
        <svg
          v-if="!isOpen"
          key="open"
          class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <svg
          v-else
          key="close"
          class="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </transition>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";

const toast = useToast();
const isOpen = ref(false);
const message = ref("");
const loading = ref(false);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const onPanelOpen = () => {
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const togglePanel = (e: Event) => {
  e.stopPropagation();
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const submitFeedback = async () => {
  if (!message.value.trim()) return;

  loading.value = true;
  try {
    await apiClient.post("/users/feedback", {
      type: "magic_feedback",
      message: message.value.trim(),
    });
    toast.success("Mesajın alındı emin ol değerlendirilecek!");
    message.value = "";
    isOpen.value = false;
  } catch (error) {
    console.error("Quick feedback error:", error);
    toast.error("Hata oluştu.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Minimal Fade & Slide Animation */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* Icon Swap Animation */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.2s ease;
}
.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
