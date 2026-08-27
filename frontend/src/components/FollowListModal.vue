<!-- src/components/FollowListModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div @click="$emit('close')" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-white/5">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
        <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          {{ type === 'followers' ? 'Takipçiler' : 'Takip Edilenler' }}
        </h3>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
          <component :is="LucideIcons.X" class="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <!-- List -->
      <div class="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
        <div v-if="loading" class="py-10 text-center">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        
        <div v-else-if="users.length === 0" class="py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
          Henüz kimse yok
        </div>

        <div v-else class="space-y-1">
          <div 
            v-for="user in users" 
            :key="user.id"
            @click="navigateToProfile(user.username)"
            class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group"
          >
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <img 
                v-if="user.avatarUrl" 
                :src="getImageUrl(user.avatarUrl)" 
                class="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all"
              />
              <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 text-left">
              <div class="font-black text-gray-900 dark:text-white truncate">
                {{ user.fullName || user.username }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 font-bold">
                @{{ user.username }}
              </div>
            </div>

            <!-- Arrow Icon -->
            <component :is="LucideIcons.ChevronRight" class="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/client';
import * as LucideIcons from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  userId: string;
  type: 'followers' | 'following';
}>();

const emit = defineEmits(['close']);
const router = useRouter();

const users = ref<any[]>([]);
const loading = ref(false);

const fetchUsers = async () => {
  if (!props.userId) return;
  loading.value = true;
  try {
    const endpoint = props.type === 'followers' 
      ? `/follow/followers/${props.userId}` 
      : `/follow/following/${props.userId}`;
    
    const response = await apiClient.get(endpoint);
    // Backend'den gelen veri yapısı { follower: user } veya { following: user } şeklinde
    users.value = response.data.map((item: any) => 
      props.type === 'followers' ? item.follower : item.following
    );
  } catch (error) {
    console.error('Follow list fetch error:', error);
  } finally {
    loading.value = false;
  }
};

const navigateToProfile = (username: string) => {
  emit('close');
  router.push(`/profile/${username}`);
};

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

watch(() => [props.isOpen, props.userId, props.type], () => {
  if (props.isOpen) {
    fetchUsers();
  } else {
    users.value = [];
  }
});
</script>
