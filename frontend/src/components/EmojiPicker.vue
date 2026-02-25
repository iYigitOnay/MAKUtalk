<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200 group hover:scale-110"
      title="Emoji Ekle"
    >
      <span class="text-xl">😊</span>
    </button>

    <!-- Emoji Picker Dropdown -->
    <div
      v-if="isOpen"
      class="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-primary-900/30 rounded-lg shadow-lg p-3 grid grid-cols-8 gap-2 w-64 max-h-64 overflow-y-auto z-50"
    >
      <button
        v-for="emoji in emojis"
        :key="emoji"
        @click="selectEmoji(emoji)"
        type="button"
        class="text-xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
      >
        {{ emoji }}
      </button>
    </div>
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

const emojis = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😚",
  "😙",
  "🥲",
  "😋",
  "😛",
  "😜",
  "🤪",
  "😝",
  "🤑",
  "🤗",
  "🤭",
  "🤫",
  "🤔",
  "🤐",
  "🤨",
  "😐",
  "😑",
  "😶",
  "😏",
  "😒",
  "🙄",
  "😬",
  "🤥",
  "😌",
  "😔",
  "😪",
  "🤤",
  "😴",
  "😷",
  "🤒",
  "🤕",
  "🤢",
  "🤮",
  "🤮",
  "🤧",
  "🤎",
  "🤍",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👌",
  "🤝",
  "🤲",
  "🤛",
  "🤜",
  "✈️",
  "🚀",
  "🎯",
  "🎪",
  "🎨",
  "🎭",
  "🎬",
  "🎤",
  "🎧",
  "⚽",
  "🏀",
  "🏈",
  "⚾",
  "🎾",
  "🎮",
  "🎲",
  "🍕",
  "🍝",
  "🍔",
  "🍟",
  "🌭",
  "🍿",
  "🥤",
  "☕",
  "🍷",
  "⭐",
  "✨",
  "❇️",
  "💫",
  "🌟",
  "🎆",
  "🎇",
  "🎉",
];

const selectEmoji = (emoji: string) => {
  emit("update:modelValue", `${emoji}`);
  isOpen.value = false;
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Dark mode scrollbar */
::-webkit-scrollbar-thumb {
  background: #cbd5e0;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-thumb {
    background: #4b5563;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #5a6574;
  }
}
</style>
