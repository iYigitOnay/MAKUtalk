<template>
  <div class="relative inline-block text-left" v-click-outside="close">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-90"
      title="Emoji Ekle"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <!-- Emoji Picker Popover -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-full left-0 mb-4 z-[100] w-72 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        <!-- Header -->
        <div class="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Hızlı Emojiler</p>
        </div>

        <!-- Emoji Grid -->
        <div class="p-3 max-h-64 overflow-y-auto custom-scrollbar grid grid-cols-7 gap-1">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click="selectEmoji(emoji)"
            type="button"
            class="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all hover:scale-125 active:scale-90"
          >
            {{ emoji }}
          </button>
        </div>

        <!-- Footer -->
        <div class="p-2 text-center bg-slate-50/30 dark:bg-white/5">
          <div class="w-8 h-1 bg-slate-200 dark:bg-white/10 rounded-full mx-auto"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  modelValue: string;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const close = () => { isOpen.value = false; };

// Click outside directive (basit versiyon)
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

const emojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "🔥", "✨", "🌟", "⭐", "⚡", "💥", "💯", "💢", "💨", "💦", "💧", "💤", "💬", "👁️", "👍", "👎", "👌", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦾", "🖕", "✍️", "🙏", "🤝", "🤲", "👐", "🙌", "👏", "👂", "👃", "👣"
];

const selectEmoji = (emoji: string) => {
  emit("update:modelValue", emoji);
  // Birçok kullanıcı ard arda emoji eklemek isteyebilir, o yüzden kapatmıyoruz
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}
</style>
