<!-- src/components/HashtagText.vue -->
<template>
  <span v-html="formattedText" class="hashtag-container" @click="handleLinkClick"></span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

interface Props {
  text: string;
}

const props = defineProps<Props>();
const router = useRouter();

const formattedText = computed(() => {
  if (!props.text) return "";
  let formatted = props.text;

  // XSS Koruması: Önce HTML karakterlerini temizle (v-html kullandığımız için önemli)
  formatted = formatted
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Hashtag'leri linkle
  formatted = formatted.replace(
    /#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+)/g,
    '<a href="/hashtag/$1" data-type="hashtag" data-value="$1" class="hashtag-link">#$1</a>',
  );

  // Mention'ları linkle (@username)
  formatted = formatted.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<a href="/profile/$1" data-type="profile" data-value="$1" class="mention-link text-blue-600 dark:text-blue-400 hover:underline transition-colors">@$1</a>',
  );

  // URL'leri linkle
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline break-all">$1</a>',
  );

  return formatted;
});

// v-html içindeki linklere tıklandığında sayfa yenilenmesini engelle ve router'ı kullan
const handleLinkClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const link = target.closest('a');
  
  if (!link) return;

  const href = link.getAttribute('href');
  const type = link.getAttribute('data-type');
  const value = link.getAttribute('data-value');

  // Eğer harici bir linkse (http ile başlayan), normal davranışı bırak
  if (href && (href.startsWith('http') || link.getAttribute('target') === '_blank')) {
    return;
  }

  // SPA içindeki linkleri yakala
  event.preventDefault();
  
  if (type === 'hashtag' && value) {
    router.push(`/hashtag/${value}`);
  } else if (type === 'profile' && value) {
    router.push(`/profile/${value}`);
  } else if (href) {
    router.push(href);
  }
};
</script>

<style>
.hashtag-link {
  @apply transition-all duration-300 inline-block font-bold;
  background: linear-gradient(to right, #2563eb, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hashtag-link:hover {
  @apply opacity-80 underline;
  -webkit-text-fill-color: initial;
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

.mention-link {
  cursor: pointer;
}
</style>
