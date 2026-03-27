<template>
  <div
    class="relative group rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center cursor-pointer select-none border border-white/5 shadow-2xl"
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
      @enterpictureinpicture="isPiP = true"
      @leavepictureinpicture="isPiP = false"
    >
      <source :src="getImageUrl(videoUrl)" type="video/mp4" />
    </video>

    <!-- Top Settings Menu -->
    <transition name="fade">
      <div
        v-if="isSettingsOpen"
        ref="settingsRef"
        class="absolute bottom-16 right-4 w-36 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-200"
        @click.stop
      >
        <div
          class="p-2 border-b border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center"
        >
          Video Ayarları
        </div>
        <div
          class="p-2 text-[9px] font-bold text-white/30 uppercase tracking-wider ml-2"
        >
          Oynatma Hızı
        </div>
        <div class="grid grid-cols-2 gap-1 px-2 pb-2">
          <button
            v-for="speed in [0.5, 1, 1.5, 2]"
            :key="speed"
            @click="setPlaybackSpeed(speed)"
            class="px-2 py-1.5 text-[10px] font-black rounded-lg transition-all"
            :class="
              playbackRate === speed
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:bg-white/5'
            "
          >
            {{ speed === 1 ? "1x" : speed + "x" }}
          </button>
        </div>
        <div class="h-px bg-white/5 mx-2"></div>
        <button
          @click="handleDownload"
          class="w-full px-4 py-3 text-[11px] font-black text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group"
        >
          <DownloadIcon
            class="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform"
          />
          İndir
        </button>
      </div>
    </transition>

    <!-- Professional Control Bar -->
    <transition name="control-fade">
      <div
        v-if="isControlsVisible || !isPlaying || isSettingsOpen"
        class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/10 to-transparent pt-12"
        @click.stop
      >
        <!-- Twitter Style Dynamic Progress Bar -->
        <div
          class="relative w-full mb-4 cursor-pointer group/progress flex items-center h-4"
          @mousedown="startDragging"
        >
          <div
            class="relative w-full h-0.5 bg-white/20 rounded-full group-hover/progress:h-1.5 transition-all duration-200 overflow-hidden"
          >
            <div
              class="absolute top-0 left-0 h-full bg-white"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <!-- Knob: Perfectly centered above the bar -->
          <div
            class="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10"
            :style="{ left: `calc(${progress}% - 6px)` }"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Play/Pause -->
            <button
              @click="togglePlay"
              class="text-white hover:opacity-80 transition-all active:scale-90"
            >
              <PlayIcon v-if="!isPlaying" class="w-6 h-6 fill-current" />
              <PauseIcon v-else class="w-6 h-6 fill-current" />
            </button>

            <!-- Volume Control -->
            <div class="flex items-center group/volume gap-3">
              <button
                @click="toggleMute"
                class="text-white/80 hover:text-white transition-colors"
              >
                <VolumeXIcon v-if="volume === 0 || isMuted" class="w-5 h-5" />
                <Volume2Icon v-else class="w-5 h-5" />
              </button>
              <div
                class="w-0 group-hover/volume:w-20 sm:group-hover/volume:w-24 transition-all duration-500 ease-out overflow-hidden flex items-center h-6"
              >
                <div
                  class="relative w-full h-1 bg-white/20 rounded-full flex items-center"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    v-model="volume"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @input="onVolumeChange"
                  />
                  <div
                    class="h-full bg-white rounded-full"
                    :style="{ width: `${volume * 100}%` }"
                  ></div>
                  <div
                    class="w-2.5 h-2.5 bg-white rounded-full shadow-lg -ml-1"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Time Display -->
            <div
              class="text-[10px] font-black text-white/60 tracking-widest tabular-nums uppercase"
            >
              {{ formatTime(currentTime) }}
              <span class="mx-1 opacity-30">/</span> {{ formatTime(duration) }}
            </div>
          </div>

          <!-- Right Side Controls -->
          <div class="flex items-center gap-1 sm:gap-2">
            <!-- Picture-in-Picture -->
            <button
              v-if="supportsPiP"
              @click="togglePiP"
              class="p-2 text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
              title="Pencere Ä°Ã§inde Oynat"
            >
              <PiPIcon class="w-5 h-5" />
            </button>

            <!-- Settings -->
            <button
              ref="settingsBtnRef"
              @click="isSettingsOpen = !isSettingsOpen"
              class="p-2 text-white/70 hover:text-white transition-all active:scale-90"
              :class="{ 'rotate-45 text-blue-400': isSettingsOpen }"
            >
              <SettingsIcon class="w-5 h-5" />
            </button>

            <!-- Fullscreen -->
            <button
              @click="openFullscreen"
              class="p-2 text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
            >
              <FullscreenIcon class="w-5 h-5" />
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import VideoModal from "./VideoModal.vue";
import { useVideoStore } from "@/stores/video";
import {
  Play as PlayIcon,
  Pause as PauseIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Settings as SettingsIcon,
  Maximize as FullscreenIcon,
  PictureInPicture2 as PiPIcon,
  Download as DownloadIcon,
} from "lucide-vue-next";

const props = defineProps<{
  videoUrl: string;
  thumbnailUrl?: string;
}>();

const videoStore = useVideoStore();
const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(0.7);
const isControlsVisible = ref(false);
const isModalOpen = ref(false);
const isSettingsOpen = ref(false);
const isPiP = ref(false);
const supportsPiP = ref(false);
const settingsRef = ref<HTMLElement | null>(null);
const settingsBtnRef = ref<HTMLElement | null>(null);

// Global sync: Stop if another video starts
watch(
  () => videoStore.currentlyPlayingId,
  (newId) => {
    if (newId !== props.videoUrl && isPlaying.value) {
      pauseVideo();
    }
  },
);

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
  window.addEventListener("click", handleClickOutside);
  supportsPiP.value = !!document.pictureInPictureEnabled;
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
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
  isPlaying.value ? pauseVideo() : playVideo();
  showControlsTemporarily();
};

const playVideo = () => {
  if (!videoRef.value) return;
  videoRef.value.play();
  isPlaying.value = true;
  videoStore.setCurrentlyPlaying(props.videoUrl);
};

const pauseVideo = () => {
  if (!videoRef.value) return;
  videoRef.value.pause();
  isPlaying.value = false;
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

const togglePiP = async () => {
  if (!videoRef.value) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoRef.value.requestPictureInPicture();
    }
  } catch (error) {
    console.error("PiP HatasÄ±:", error);
  }
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
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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
  const link = document.createElement("a");
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
  const rect = bar.getBoundingClientRect();
  const update = (moveEvent: MouseEvent) => {
    const pos = (moveEvent.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    if (videoRef.value) {
      videoRef.value.currentTime = clampedPos * duration.value;
    }
  };
  const stop = () => {
    window.removeEventListener("mousemove", update);
    window.removeEventListener("mouseup", stop);
  };
  window.addEventListener("mousemove", update);
  window.addEventListener("mouseup", stop);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Range input removal of native appearance for volume */
input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
}
input[type="range"]:focus {
  outline: none;
}
</style>
