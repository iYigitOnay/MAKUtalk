import { defineStore } from "pinia";
import { ref } from "vue";

export const useVideoStore = defineStore("video", () => {
  const playbackTimes = ref<Record<string, number>>({});
  const playingStates = ref<Record<string, boolean>>({});

  const setPlaybackTime = (postId: string, time: number) => {
    playbackTimes.value[postId] = time;
  };

  const getPlaybackTime = (postId: string) => {
    return playbackTimes.value[postId] || 0;
  };

  const setPlayingState = (postId: string, isPlaying: boolean) => {
    playingStates.value[postId] = isPlaying;
  };

  const getPlayingState = (postId: string) => {
    return playingStates.value[postId] || false;
  };

  const clearPlaybackTime = (postId: string) => {
    delete playbackTimes.value[postId];
    delete playingStates.value[postId];
  };

  return {
    setPlaybackTime,
    getPlaybackTime,
    setPlayingState,
    getPlayingState,
    clearPlaybackTime,
  };
});
