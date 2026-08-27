<template>
  <div
    :class="[
      'relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full select-none',
      sizeClasses[size] || size,
      customClass,
    ]"
    :style="
      !user?.avatarUrl
        ? { background: getAvatarColor(user?.id || user?.username) }
        : {}
    "
  >
    <!-- Profil Resmi Varsa -->
    <img
      v-if="user?.avatarUrl"
      :src="getImageUrl(user.avatarUrl)"
      :alt="user.username"
      class="w-full h-full object-cover"
      @error="onImageError"
    />

    <!-- Yoksa BaÅŸ Harfler -->
    <span
      v-else
      class="font-black text-white uppercase tracking-tighter"
      :style="{ fontSize: fontSizeMap[size] || '1rem' }"
    >
      {{ getInitials(user?.fullName || user?.username) }}
    </span>

    <!-- Overlay Shadow for Depth (Only for initials) -->
    <div
      v-if="!user?.avatarUrl"
      class="absolute inset-0 bg-black/5 pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  user?: {
    id?: string | number;
    username?: string;
    fullName?: string;
    avatarUrl?: string | null;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | string;
  customClass?: string;
}>();

const sizeClasses: Record<string, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
  "2xl": "w-24 h-24",
  profile: "w-20 h-20 sm:w-32 sm:h-32",
};

const fontSizeMap: Record<string, string> = {
  xs: "9px",
  sm: "11px",
  md: "14px",
  lg: "16px",
  xl: "22px",
  "2xl": "32px",
  profile: "56px sm:40px",
};

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const getInitials = (name: string | undefined) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (seed: string | number | undefined) => {
  if (!seed) return "#64748b"; // Default slate

  const colors = [
    "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", // Indigo
    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // Pink
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // Amber
    "linear-gradient(135deg, #10b981 0%, #047857 100%)", // Emerald
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // Blue
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Violet
    "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", // Rose
    "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)", // Cyan
    "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)", // Orange
    "linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)", // Teal
  ];

  // Deterministic Hash (KullanÄ±cÄ± ID'sinden hep aynÄ± rengi seÃ§er)
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const onImageError = (e: Event) => {
  // Resim yÃ¼klenemezse (404 vb) resmi gizle ve harfleri gÃ¶ster
  if (props.user) {
    (e.target as HTMLImageElement).style.display = "none";
    // Not: Bu basit hata yÃ¶netimi geliÅŸtirilebilir
  }
};
</script>
