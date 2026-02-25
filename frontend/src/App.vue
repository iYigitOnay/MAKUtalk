<!-- src/App.vue -->
<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300"
  >
    <!-- Main Layout (Sidebar + Content + RightSidebar) -->
    <div v-if="showMainLayout" class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <Sidebar />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>

      <!-- Right Sidebar -->
      <aside
        class="hidden lg:block w-80 border-l border-gray-200 dark:border-primary-900/30 bg-white dark:bg-gray-950 overflow-y-auto"
      >
        <RightSidebar />
      </aside>
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
