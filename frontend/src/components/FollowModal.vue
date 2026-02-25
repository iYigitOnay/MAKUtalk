<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[70vh] flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-primary-900/30"
      >
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-900 dark:text-gray-50"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Users List -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="!users.length" class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">Henüz kimse yok.</p>
        </div>

        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 transition"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
            >
              <span
                class="text-primary-700 dark:text-primary-400 font-semibold"
              >
                {{ user.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ user.fullName || user.username }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                @{{ user.username }}
              </p>
            </div>
          </div>

          <router-link
            :to="`/user/${user.id}`"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
          >
            Profil
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

interface Props {
  isOpen: boolean;
  users: User[];
  title: string;
}

defineProps<Props>();
defineEmits<{
  close: [];
}>();
</script>
