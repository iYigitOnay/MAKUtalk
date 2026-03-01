<!-- src/App.vue -->
<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300"
  >
    <!-- Main Layout (Sidebar + Content + RightSidebar) -->
    <div v-if="showMainLayout" class="flex flex-col sm:flex-row justify-center h-screen overflow-hidden bg-[#f8fafc] dark:bg-gray-950">
      
      <!-- Mobile Navbar (Top) -->
      <Navbar class="sm:hidden flex-shrink-0" />

      <div class="flex w-full max-w-[1300px] bg-white dark:bg-gray-950 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <!-- Desktop Sidebar -->
        <Sidebar class="hidden sm:flex" />

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto border-x border-slate-100 dark:border-primary-900/20 pb-20 sm:pb-0">
          <router-view />
        </main>

        <!-- Desktop Right Sidebar -->
        <aside
          class="hidden lg:block w-80 bg-white dark:bg-gray-950 overflow-y-auto"
        >
          <RightSidebar />
        </aside>
      </div>

      <!-- Mobile Bottom Navigation -->
      <MobileBottomNav />
    </div>

    <!-- Auth Pages (Login/Register - no sidebar) -->
    <div v-else class="h-full">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import RightSidebar from "@/components/RightSidebar.vue";
import Navbar from "@/components/Navbar.vue";
import MobileBottomNav from "@/components/MobileBottomNav.vue";
import { useDarkMode } from "@/composables/useDarkMode";

useDarkMode();

const route = useRoute();

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
