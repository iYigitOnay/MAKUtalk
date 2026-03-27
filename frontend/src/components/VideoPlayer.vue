<template>
  <div 
    class="relative group rounded-2xl overflow-hidden bg-gray-950 aspect-video flex items-center justify-center cursor-pointer select-none border border-white/5 shadow-2xl"
    @mouseenter="showControlsTemporarily"
    @mousemove="showControlsTemporarily"
    @mouseleave="handleMouseLeave"
  >
    <!-- Video Element -->
    <video
      ref="videoRef"
      class="w-full h-full object-contain"
      :poster="thumbnailUrl ? getImageUrl(thumbnailUrl) : ''"
      playsinline
      @click.stop="togglePlay"
      @timeupdate="updateProgress"
      @loadedmetadata="onMetadataLoaded"
      @ended="isPlaying = false"
    >
      <source :src="getImageUrl(videoUrl)" type="video/mp4" />
    </video>

    <!-- Professional Center Play Button -->
    <transition name="fade">
      <div 
        v-if="!isPlaying"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div class="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
          <svg class="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </transition>

    <!-- Top Settings Menu (Repositioned to Bottom-up) -->
    <transition name="fade">
      <div 
        v-if="isSettingsOpen" 
        ref="settingsRef"
        class="absolute bottom-16 right-4 w-36 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-200"
        @click.stop
      >
        <div class="p-2 border-b border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Video Ayarları</div>
        
        <!-- Speed Selection -->
        <div class="p-2 text-[9px] font-bold text-white/30 uppercase tracking-wider ml-2">Oynatma Hızı</div>
        <div class="grid grid-cols-2 gap-1 px-2 pb-2">
          <button 
            v-for="speed in [0.5, 1, 1.5, 2]" 
            :key="speed"
            @click="setPlaybackSpeed(speed)"
            class="px-2 py-1.5 text-[10px] font-black rounded-lg transition-all"
            :class="playbackRate === speed ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:bg-white/5'"
          >
            {{ speed === 1 ? '1x' : speed + 'x' }}
          </button>
        </div>

        <div class="h-px bg-white/5 mx-2"></div>

        <!-- Download Action -->
        <button 
          @click="handleDownload"
          class="w-full px-4 py-3 text-[11px] font-black text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group"
        >
          <svg class="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1h16v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          İNDİR
        </button>
      </div>
    </transition>

    <!-- Professional Control Bar -->
    <transition name="control-fade">
      <div 
        v-if="isControlsVisible || !isPlaying || isSettingsOpen"
        class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/20 to-transparent pt-10"
        @click.stop
      >
        <!-- Custom Progress Bar -->
        <div 
          class="relative w-full h-1.5 bg-white/10 rounded-full mb-4 cursor-pointer group/progress overflow-hidden"
          @mousedown="startDragging"
        >
          <div 
            class="absolute top-0 left-0 h-full bg-white transition-all duration-100"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Play/Pause -->
            <button @click="togglePlay" class="text-white hover:scale-110 transition-transform">
              <svg v-if="!isPlaying" class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            <!-- Volume Control (Pro Slider) -->
            <div class="flex items-center group/volume gap-3">
              <button @click="toggleMute" class="text-white/80 hover:text-white transition-colors">
                <svg v-if="volume === 0 || isMuted" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
              
              <div class="w-0 group-hover/volume:w-20 sm:group-hover/volume:w-24 transition-all duration-500 ease-out overflow-hidden flex items-center h-6">
                <div class="relative w-full h-1 bg-white/20 rounded-full flex items-center">
                  <input 
                    type="range" min="0" max="1" step="0.05" 
                    v-model="volume"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @input="onVolumeChange"
                  />
                  <div class="h-full bg-white rounded-full" :style="{ width: `${volume * 100}%` }"></div>
                  <div class="w-2.5 h-2.5 bg-white rounded-full shadow-lg -ml-1"></div>
                </div>
              </div>
            </div>

            <!-- Time Display -->
            <div class="text-[10px] font-black text-white/60 tracking-widest tabular-nums uppercase">
              {{ formatTime(currentTime) }} <span class="mx-1 opacity-30">/</span> {{ formatTime(duration) }}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Settings Toggle -->
            <button 
              ref="settingsBtnRef"
              @click="isSettingsOpen = !isSettingsOpen" 
              class="p-2 text-white/70 hover:text-white transition-all"
              :class="{ 'rotate-45 text-blue-400': isSettingsOpen }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <!-- Fullscreen Icon Only -->
            <button 
              @click="openFullscreen" 
              class="p-2 text-white/70 hover:text-white transition-all hover:scale-110"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <VideoModal 
      :is-open="isModalOpen" 
      :video-url="videoUrl" 
      :thumbnail-url="thumbnailUrl" 
      :initial-time="currentTime"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import VideoModal from './VideoModal.vue';

const props = defineProps<{
  videoUrl: string;
  thumbnailUrl?: string;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(0.7);
const isControlsVisible = ref(false);
const isModalOpen = ref(false);
const isSettingsOpen = ref(false);
const settingsRef = ref<HTMLElement | null>(null);
const settingsBtnRef = ref<HTMLElement | null>(null);

// Click Outside Logic
const handleClickOutside = (event: MouseEvent) => {
  if (
    isSettingsOpen.value && 
    settingsRef.value && 
    !settingsRef.value.contains(event.target as Node) &&
    settingsBtnRef.value &&
    !settingsBtnRef.value.contains(event.target as Node)
  ) {
    isSettingsOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

const playbackRate = ref(1);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
let hideTimeout: any = null;

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const togglePlay = () => {
  if (!videoRef.value) return;
  isPlaying.value ? videoRef.value.pause() : videoRef.value.play();
  isPlaying.value = !isPlaying.value;
  showControlsTemporarily();
};

const toggleMute = () => {
  if (!videoRef.value) return;
  isMuted.value = !isMuted.value;
  videoRef.value.muted = isMuted.value;
  if (!isMuted.value && volume.value === 0) volume.value = 0.5;
};

const onVolumeChange = () => {
  if (!videoRef.value) return;
  videoRef.value.volume = volume.value;
  isMuted.value = Number(volume.value) === 0;
  videoRef.value.muted = isMuted.value;
};

const setPlaybackSpeed = (speed: number) => {
  if (!videoRef.value) return;
  playbackRate.value = speed;
  videoRef.value.playbackRate = speed;
  isSettingsOpen.value = false;
};

const updateProgress = () => {
  if (!videoRef.value) return;
  currentTime.value = videoRef.value.currentTime;
  progress.value = (currentTime.value / duration.value) * 100;
};

const onMetadataLoaded = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
    videoRef.value.volume = volume.value;
  }
};

const formatTime = (seconds: number) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const showControlsTemporarily = () => {
  isControlsVisible.value = true;
  if (hideTimeout) clearTimeout(hideTimeout);
  if (isPlaying.value && !isSettingsOpen.value) {
    hideTimeout = setTimeout(() => {
      isControlsVisible.value = false;
    }, 3000);
  }
};

const handleMouseLeave = () => {
  if (!isSettingsOpen.value) {
    isControlsVisible.value = false;
  }
};

const openFullscreen = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    isPlaying.value = false;
  }
  isModalOpen.value = true;
};

const handleDownload = () => {
  const url = getImageUrl(props.videoUrl);
  const link = document.createElement('a');
  link.href = url;
  link.target = "_blank";
  link.download = `makutalk-video-${Date.now()}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  isSettingsOpen.value = false;
};

const onModalClose = (timeAtClose: number) => {
  isModalOpen.value = false;
  if (videoRef.value && timeAtClose !== undefined) {
    videoRef.value.currentTime = timeAtClose;
  }
};

const startDragging = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement;
  const update = (moveEvent: MouseEvent) => {
    const rect = bar.getBoundingClientRect();
    const pos = (moveEvent.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    if (videoRef.value) {
      videoRef.value.currentTime = clampedPos * duration.value;
    }
  };
  const stop = () => {
    window.removeEventListener('mousemove', update);
    window.removeEventListener('mouseup', stop);
  };
  window.addEventListener('mousemove', update);
  window.addEventListener('mouseup', stop);
  update(e);
};
</script>

<style scoped>
.control-fade-enter-active,
.control-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.control-fade-enter-from,
.control-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
