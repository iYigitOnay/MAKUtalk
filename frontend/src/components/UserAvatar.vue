<!-- src/components/UserAvatar.vue -->
<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    :class="[
      size,
      'rounded-full overflow-hidden flex-shrink-0 relative',
      border ? 'border-2 border-white dark:border-gray-950 shadow-sm' : '',
      to ? 'hover:opacity-90 transition-opacity' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <img
      v-if="avatarUrl"
      :src="getImageUrl(avatarUrl)"
      :class="['w-full h-full object-cover', imgClass]"
      loading="lazy"
    />
    <div
      v-else
      :class="[
        'w-full h-full flex items-center justify-center text-white font-black select-none',
        initialsColor,
        initialsClass
      ]"
    >
      {{ initials }}
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  avatarUrl?: string | null;
  username?: string;
  fullName?: string;
  size?: string;
  border?: boolean;
  to?: string;
  imgClass?: string;
  initialsClass?: string;
}>();

defineEmits(['click']);

const initials = computed(() => {
  const name = props.fullName || props.username || '?';
  return name.charAt(0).toUpperCase();
});

const initialsColor = computed(() => {
  const name = props.fullName || props.username || 'user';
  // İsmin toplam karakter değerine göre bir renk seçelim (tutarlılık için)
  const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-emerald-400 to-emerald-600',
    'bg-gradient-to-br from-violet-400 to-violet-600',
    'bg-gradient-to-br from-amber-400 to-amber-600',
    'bg-gradient-to-br from-rose-400 to-rose-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-cyan-400 to-cyan-600'
  ];
  return colors[charSum % colors.length];
});

const getImageUrl = (path: string | undefined | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
</script>
