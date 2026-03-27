<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-10 cursor-zoom-out"
        @click="close"
      >
        <!-- Blurred Background -->
        <div class="absolute inset-0 bg-black/95 backdrop-blur-3xl transition-all duration-500"></div>

        <!-- Video Container (Stop Propagation to prevent closing when clicking the video itself) -->
        <div 
          class="relative w-full h-full sm:h-auto max-w-6xl aspect-video rounded-none sm:rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] z-[1000] animate-in zoom-in-95 duration-500 bg-black flex items-center justify-center cursor-default"
          @click.stop
        >
          <video
            ref="videoRef"
            class="w-full h-full object-contain"
            :src="getImageUrl(videoUrl)"
            :poster="thumbnailUrl ? getImageUrl(thumbnailUrl) : ''"
            controls
            autoplay
            playsinline
          ></video>
        </div>

        <!-- Close Button (Always on Top) -->
        <button 
          @click.stop="close"
          class="absolute top-6 right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[1001] active:scale-90"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  videoUrl: string;
  thumbnailUrl?: string;
  initialTime?: number;
}>();

const emit = defineEmits(['close']);

const videoRef = ref<HTMLVideoElement | null>(null);

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const close = () => {
  const timeAtClose = videoRef.value ? videoRef.value.currentTime : 0;
  if (videoRef.value) videoRef.value.pause();
  emit('close', timeAtClose);
};

// Senkronizasyon: Modal aÃ§Ä±ldÄ±ÄŸÄ±nda videoyu kaldÄ±ÄŸÄ± yerden baÅŸlat
watch(() => props.isOpen, async (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    await nextTick();
    if (videoRef.value && props.initialTime) {
      videoRef.value.currentTime = props.initialTime;
    }
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.modal-fade-enter-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Hide native controls on desktop when needed, or keep for better UX in full screen */
video::-webkit-media-controls-panel {
  background-image: linear-gradient(transparent, rgba(0,0,0,0.7)) !important;
}
</style>
