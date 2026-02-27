<template>
  <span v-html="formattedText"></span>
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
    '<a href="/hashtag/$1" class="text-rose-600 dark:text-rose-500 font-bold hover:underline">#$1</a>',
  );

  // Mention'ları linkle (@username)
  formatted = formatted.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<a href="/profile/$1" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">@$1</a>',
  );

  // URL'leri linkle
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline">$1</a>',
  );

  return formatted;
});
</script>
