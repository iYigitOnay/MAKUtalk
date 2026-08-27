<template>
  <Teleport to="body">
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-8 cursor-zoom-out"
        @click="$emit('close')"
      >
        <!-- Close Button -->
        <button 
          @click.stop="$emit('close')"
          class="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 z-[210]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image Container -->
        <div class="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-300" @click.stop>
          <img 
            :src="imageUrl" 
            class="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] select-none pointer-events-auto cursor-default border border-white/5"
            @click.stop
          />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps<{
  isOpen: boolean;
  imageUrl: string;
}>();

const emit = defineEmits(['close']);

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => window.addEventListener('keydown', handleEsc));
onUnmounted(() => window.removeEventListener('keydown', handleEsc));
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
