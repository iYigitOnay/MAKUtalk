<!-- src/App.vue -->
<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300"
  >
    <!-- Main Layout (Sidebar + Content + RightSidebar) -->
    <div v-if="showMainLayout" class="flex justify-center h-screen overflow-hidden bg-[#f8fafc] dark:bg-gray-950">
      <div class="flex w-full max-w-[1300px] bg-white dark:bg-gray-950 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto border-x border-slate-100 dark:border-primary-900/20">
          <router-view />
        </main>

        <!-- Right Sidebar -->
        <aside
          class="hidden lg:block w-80 bg-white dark:bg-gray-950 overflow-y-auto"
        >
          <RightSidebar />
        </aside>
      </div>
    </div>

    <!-- Auth Pages (Login/Register - no sidebar) -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import RightSidebar from "@/components/RightSidebar.vue";
import { useDarkMode } from "@/composables/useDarkMode";

useDarkMode();

const route = useRoute();

const showMainLayout = computed(() => {
  return (route.meta.layout as string) === "main";
});
</script>
