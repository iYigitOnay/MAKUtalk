<!-- src/App.vue -->
<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"
  >
    <Navbar v-if="showNavbar" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import { useDarkMode } from "@/composables/useDarkMode";

// Dark mode'u App seviyesinde başlat (localStorage okuma burada olur)
useDarkMode();

const route = useRoute();

// Login ve Register sayfalarında Navbar gösterme
const showNavbar = computed(() => {
  return !["login", "register"].includes(route.name as string);
});
</script>
