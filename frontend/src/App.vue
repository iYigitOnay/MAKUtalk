<!-- src/App.vue -->
<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300"
  >
    <!-- Main Layout (Sidebar + Content + RightSidebar) -->
    <div v-if="showMainLayout" class="flex flex-col sm:flex-row justify-start sm:justify-center min-h-screen bg-[#f8fafc] dark:bg-gray-950 relative">
      
      <!-- Mobile Navbar (Top) -->
      <Navbar v-if="!hideNavbar" class="sm:hidden flex-shrink-0" />

      <div class="flex w-full max-w-[1300px] bg-white dark:bg-gray-950 shadow-2xl shadow-slate-200/50 dark:shadow-none min-w-0">
        <!-- Desktop Sidebar -->
        <Sidebar class="hidden sm:flex sticky top-0 h-screen" />

        <!-- Main Content Area -->
        <main
          ref="mainContent"
          class="flex-1 border-x border-slate-100 dark:border-primary-900/20 sm:pb-0 min-w-0"
          :class="[hideNavbar ? '' : 'pb-24 sm:pb-0']"
        >
          <router-view />
        </main>

        <!-- Desktop Right Sidebar -->
        <aside
          class="hidden lg:block w-80 bg-white dark:bg-gray-950 sticky top-0 h-screen overflow-y-auto no-scrollbar"
        >
          <RightSidebar />
        </aside>
      </div>

      <!-- Mobile Bottom Navigation -->
      <MobileBottomNav v-if="!hideNavbar" />
    </div>

    <!-- Auth Pages (Login/Register - no sidebar) -->
    <div v-else class="h-full">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import RightSidebar from "@/components/RightSidebar.vue";
import Navbar from "@/components/Navbar.vue";
import MobileBottomNav from "@/components/MobileBottomNav.vue";
import { useDarkMode } from "@/composables/useDarkMode";
import { useChatStore } from "@/stores/chat";

useDarkMode();

const route = useRoute();
const chatStore = useChatStore();
const mainContent = ref<HTMLElement | null>(null);

// Sohbet sayfasında aktif konuşma varken Navbar'ı gizle
const hideNavbar = computed(() => {
  return route.name === 'Messages' && chatStore.activeConversation;
});

// Sayfa değiştiğinde en üste kaydır
watch(
  () => route.fullPath,
  () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
);

const showMainLayout = computed(() => {
  return (route.meta.layout as string) === "main";
});
</script>

<style>
/* Smooth scroll and mobile tap highlights */
html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}

/* Hide scrollbar for cleaner look on some elements if needed */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
