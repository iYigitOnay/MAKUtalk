import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVideoStore = defineStore('video', () => {
  const currentlyPlayingId = ref<string | null>(null);

  const setCurrentlyPlaying = (id: string | null) => {
    currentlyPlayingId.value = id;
  };

  return {
    currentlyPlayingId,
    setCurrentlyPlaying
  };
});
