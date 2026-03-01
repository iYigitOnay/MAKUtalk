<template>
  <span v-html="formattedText" class="hashtag-container"></span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  text: string;
}

const props = defineProps<Props>();

const formattedText = computed(() => {
  let formatted = props.text;

  // Hashtag'leri linkle
  formatted = formatted.replace(
    /#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+)/g,
    '<a href="/hashtag/$1" class="hashtag-link">#$1</a>',
  );

  // Mention'ları linkle (@username) - Font kalınlığını kaldırdım
  formatted = formatted.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<a href="/profile/$1" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors">@$1</a>',
  );

  // URL'leri linkle
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline break-all">$1</a>',
  );

  return formatted;
});
</script>

<style>
/* 
  v-html ile eklenen sınıflar için stil
*/
.hashtag-link {
  @apply transition-all duration-300 inline-block;
  background: linear-gradient(to right, #2563eb, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hashtag-link:hover {
  @apply opacity-80 underline;
  -webkit-text-fill-color: initial; /* Hoverda altı çizili ve renkli görünmesi için */
  color: #2563eb;
}

.dark .hashtag-link {
  background: linear-gradient(to right, #60a5fa, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark .hashtag-link:hover {
  color: #60a5fa;
}
</style>
