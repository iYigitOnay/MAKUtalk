<template>
  <div 
    class="bg-white dark:bg-[#16181c] rounded-2xl border border-slate-200 dark:border-[#2f3336] overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1d1f23] transition-all group select-none mt-2 mb-1 w-full max-w-[480px] shadow-sm"
    @click.stop="navigateToPost"
  >
    <!-- Üst Kısım: Yazar Bilgisi (Twitter Tarzı) -->
    <div class="p-3 flex items-center gap-2">
      <div class="flex-shrink-0">
        <img v-if="post.author?.avatarUrl" :src="getImageUrl(post.author.avatarUrl)" class="w-5 h-5 rounded-full object-cover" />
        <div v-else class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white uppercase">
          {{ post.author?.username?.charAt(0) }}
        </div>
      </div>
      <div class="flex items-center gap-1 min-w-0">
        <span class="text-[13px] font-bold text-slate-900 dark:text-white truncate">
          {{ post.author?.fullName || post.author?.username }}
        </span>
        <svg v-if="post.author?.isVerified || post.author?.role === 'ADMIN'" class="w-3.5 h-3.5 text-[#1d9bf0] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.58 0-1.13.135-1.624.375C14.352 2.675 13.263 2 12 2s-2.352.675-3.148 1.885c-.494-.24-.1.044-.375-.375C6.75 3.51 5.04 5.29 5.04 7.5c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.58 0 1.13-.135 1.624-.375C9.648 21.325 10.737 22 12 22s2.352-.675 3.148-1.885c.494.24 1.044.375 1.624.375 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.406 4.293l-3.864-3.864 1.414-1.414 2.45 2.448 5.405-5.406 1.414 1.414-6.819 6.822z" />
        </svg>
        <span class="text-[13px] text-slate-500 dark:text-[#71767b] truncate">
          @{{ post.author?.username }}
        </span>
      </div>
    </div>

    <!-- Post Görseli (Büyük ve Net) -->
    <div v-if="post.imageUrl" class="w-full aspect-video overflow-hidden border-y border-slate-100 dark:border-[#2f3336]">
      <img :src="getImageUrl(post.imageUrl)" class="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300" />
    </div>

    <!-- Post İçeriği -->
    <div class="p-3">
      <p class="text-[14px] text-slate-800 dark:text-[#e7e9ea] leading-normal line-clamp-3">
        {{ post.content }}
      </p>
      
      <!-- Alt Bilgi: Site Linki gibi duran şık bölüm -->
      <div class="mt-2 flex items-center gap-1 opacity-60">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span class="text-[11px] font-medium uppercase tracking-tight">makutalk.com</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps<{
  post: any;
}>();

const router = useRouter();

const getImageUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const navigateToPost = () => {
  router.push(`/post/${props.post.id}`);
};
</script>
