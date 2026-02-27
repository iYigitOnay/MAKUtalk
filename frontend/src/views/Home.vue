<!-- src/views/Home.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen font-sans"
  >
    <!-- Post Composer Section -->
    <div
      v-if="authStore.isAuthenticated"
      class="sticky top-0 z-40 backdrop-blur bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-4"
    >
      <div class="flex gap-4">
        <!-- Avatar -->
        <div class="relative group flex-shrink-0">
          <div class="p-[2px] rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 shadow-sm transition-transform group-hover:scale-105">
            <img
              v-if="authStore.user?.avatarUrl"
              :src="authStore.user.avatarUrl"
              :alt="authStore.user.username"
              class="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-950"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white font-black"
            >
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>

        <!-- Composer Area -->
        <div class="flex-1 min-w-0 relative">
          <textarea
            v-model="newPostContent"
            @input="handleInput"
            placeholder="Ne Düşünüyorsun?"
            class="w-full text-lg bg-transparent text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none font-medium"
            rows="3"
            :disabled="postsStore.loading"
          />

          <!-- MENTION ÖNERİ LİSTESİ -->
          <div 
            v-if="showMentions"
            class="absolute z-[100] left-0 top-full mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              v-for="u in mentionUsers"
              :key="u.id"
              @click="selectMention(u.username)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
            >
              <img v-if="u.avatarUrl" :src="u.avatarUrl" class="w-8 h-8 rounded-full object-cover" />
              <div v-else class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">{{ u.username.charAt(0).toUpperCase() }}</div>
              <div class="text-left">
                <p class="text-sm font-black text-gray-900 dark:text-white leading-none">@{{ u.username }}</p>
                <p v-if="u.fullName" class="text-[10px] text-gray-400 font-medium mt-1">{{ u.fullName }}</p>
              </div>
            </button>
          </div>

          <!-- Resim Önizleme Alanı -->
          <div v-if="selectedImagePreview" class="relative mt-4 group">
            <img :src="selectedImagePreview" class="w-full max-h-80 object-cover rounded-2xl border border-gray-100 dark:border-primary-900/20 shadow-sm" />
            <button 
              @click="removeSelectedImage"
              class="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- POST ALANI KATEGORİ ÇARKI (COMPOSER) -->
          <transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            @after-enter="initComposerScroll"
          >
            <div v-if="newPostContent.trim() || selectedImage" class="relative mt-2 h-24 flex items-center justify-center overflow-hidden -ml-16">
              <div 
                ref="composerCategoryRef"
                class="flex items-center gap-6 overflow-x-auto px-[38%] h-full scrollbar-hide snap-x snap-mandatory pt-4 pb-8 scroll-smooth"
                @scroll="handleComposerScroll"
              >
                <div
                  v-for="(item, index) in allItems"
                  :key="`comp-${item.id}-${index}`"
                  class="flex-shrink-0 snap-center composer-item"
                >
                  <button
                    @click="selectedCategoryId = item.id; centerComposerItem(index)"
                    class="flex flex-col items-center gap-1.5 group outline-none"
                  >
                    <div 
                      :class="[
                        'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border-2',
                        ((item.id === null && !selectedCategoryId) || selectedCategoryId === item.id)
                          ? 'text-white scale-110'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-primary-900/10 text-gray-400 scale-90'
                      ]"
                      :style="((item.id === null && !selectedCategoryId) || selectedCategoryId === item.id)
                        ? { backgroundColor: item.color, borderColor: 'rgba(255,255,255,0.2)', boxShadow: `0 8px 25px -5px ${item.color}60` } 
                        : {}"
                    >
                      <svg v-if="item.id === null" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <span v-else class="w-2 h-2 rounded-full" :style="{ backgroundColor: selectedCategoryId === item.id ? 'white' : item.color }"></span>
                    </div>
                    <span :class="['text-[9px] font-black tracking-tighter uppercase transition-all duration-300', ((item.id === null && !selectedCategoryId) || selectedCategoryId === item.id) ? 'opacity-100' : 'text-gray-400 opacity-70']" :style="selectedCategoryId === item.id ? { color: item.color } : {}">
                      {{ item.name }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </transition>

          <!-- Footer Actions -->
          <div v-if="newPostContent.trim() || selectedImage" class="mt-2 flex items-center justify-between border-t border-gray-50 dark:border-primary-900/5 pt-4">
            <div class="flex items-center gap-2">
              <input type="file" ref="imageInputRef" class="hidden" accept="image/*" @change="handleImageSelect" />
              <button type="button" @click="imageInputRef?.click()" class="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all" title="Resim Ekle">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
              <EmojiPicker :modelValue="newPostContent" @update:modelValue="(e) => (newPostContent += e)" />
            </div>
            
            <button
              @click="handleCreatePost"
              :disabled="(!newPostContent.trim() && !selectedImage) || postsStore.loading"
              class="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-black rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {{ postsStore.loading ? "..." : "PAYLAŞ" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- KATEGORİ ÇARKI (SABİT & MERKEZ ODAKLI) -->
    <div class="sticky top-[116px] z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-primary-900/10 py-3 overflow-hidden">
      <div 
        ref="categoryNavRef"
        @scroll="handleCarouselScroll"
        class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth h-20"
      >
        <div
          v-for="(item, index) in allItems"
          :key="`nav-${item.id}-${index}`"
          class="flex-shrink-0 snap-center carousel-item"
        >
          <button
            @click="selectCategory(item.id); centerCarouselItem(index)"
            :class="[
              'w-28 h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-3',
              (item.id === null && !postsStore.currentCategory) || postsStore.currentCategory === item.id
                ? 'scale-110 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60'
            ]"
            :style="((item.id === null && !postsStore.currentCategory) || postsStore.currentCategory === item.id)
              ? { backgroundColor: item.color || '#3b82f6', borderColor: 'rgba(255,255,255,0.3)', boxShadow: `0 10px 20px -5px ${item.color || '#3b82f6'}80` } 
              : {}"
          >
            <div v-if="item.id === null" class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span class="text-[10px] font-black uppercase tracking-tight">Akış</span>
            </div>
            <div v-else class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: postsStore.currentCategory === item.id ? 'white' : item.color }"></span>
              <span class="text-[10px] font-black uppercase truncate leading-none tracking-tight">{{ item.name }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Posts Feed -->
    <div class="pb-20">
      <div v-if="postsStore.loading && !postsStore.posts.length" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      <div v-else-if="!postsStore.posts.length" class="flex flex-col items-center justify-center h-64 text-center border-b border-gray-200 dark:border-primary-900/30 p-8">
        <p class="text-gray-500 dark:text-gray-400 font-black italic uppercase tracking-widest">Henüz paylaşım yok</p>
      </div>
      <div v-else class="divide-y divide-gray-200 dark:divide-primary-900/20">
        <PostCard v-for="post in postsStore.posts" :key="post.id" :post="post" @delete="handleDeletePost" @showComments="handleShowComments" />
      </div>
    </div>

    <CommentsModal :is-open="commentsModalOpen" :post-id="selectedPostId" @close="commentsModalOpen = false" />
    <DeleteConfirmModal :is-open="showDeleteModal" :is-deleting="isDeleting" @confirm="handleConfirmDelete" @cancel="handleCancelDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useCategoriesStore } from "@/stores/categories";
import { useToast } from "vue-toastification";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import EmojiPicker from "@/components/EmojiPicker.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const categoriesStore = useCategoriesStore();
const toast = useToast();
import apiClient from "@/api/client";

const newPostContent = ref("");
const selectedCategoryId = ref<number | null>(null);
const selectedImage = ref<File | null>(null);
const selectedImagePreview = ref<string | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);

// MENTION STATE
const mentionUsers = ref<any[]>([]);
const showMentions = ref(false);
const mentionQuery = ref("");

const handleInput = async (e: any) => {
  const text = e.target.value;
  const cursorPosition = e.target.selectionStart;
  
  // İmlecin önündeki son kelimeyi bul
  const textBeforeCursor = text.substring(0, cursorPosition);
  const words = textBeforeCursor.split(/\s/);
  const lastWord = words[words.length - 1];

  if (lastWord.startsWith('@')) {
    const query = lastWord.substring(1);
    if (query.length >= 1) {
      try {
        const res = await apiClient.get(`/users/search-mentions?q=${query}`);
        mentionUsers.value = res.data;
        showMentions.value = mentionUsers.value.length > 0;
      } catch (err) {
        showMentions.value = false;
      }
    } else {
      showMentions.value = false;
    }
  } else {
    showMentions.value = false;
  }
};

const selectMention = (username: string) => {
  const text = newPostContent.value;
  const cursorPosition = document.querySelector('textarea')?.selectionStart || 0;
  const textBeforeCursor = text.substring(0, cursorPosition);
  const textAfterCursor = text.substring(cursorPosition);
  
  const lastAtPos = textBeforeCursor.lastIndexOf('@');
  const newText = textBeforeCursor.substring(0, lastAtPos) + `@${username} ` + textAfterCursor;
  
  newPostContent.value = newText;
  showMentions.value = false;
  nextTick(() => {
    document.querySelector('textarea')?.focus();
  });
};

const categoryNavRef = ref<HTMLElement | null>(null);
const composerCategoryRef = ref<HTMLElement | null>(null);

// MERKEZİ SIRALAMA (Sol 3, Akış, Sağ 3)
const allItems = computed(() => {
  const cats = sortedCategories.value;
  const akis = { id: null, name: 'Akış', color: '#4f46e5' };
  const mid = Math.ceil(cats.length / 2);
  return [...cats.slice(0, mid), akis, ...cats.slice(mid)];
});

const sortedCategories = computed(() => {
  const order = ["Genel", "Duyuru", "Etkinlik", "Arıza-Kayıp", "Satılık", "Soru-Cevap"];
  return [...categoriesStore.categories].sort((a, b) => {
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
});

// COMPOSER SCROLL & ANIMATION
const handleComposerScroll = () => {
  const el = composerCategoryRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.composer-item');
  const containerRect = el.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;

  items.forEach((item: any) => {
    const rect = item.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const diff = Math.abs(containerCenterX - itemCenterX);
    const factor = Math.min(diff / (el.clientWidth / 1.8), 1);
    
    const translateY = Math.pow(factor, 2) * 35;
    const scale = 1.15 - (factor * 0.25);
    const opacity = 1 - (factor * 0.4);

    item.style.transform = `translateY(${translateY}px) scale(${scale})`;
    item.style.opacity = opacity.toString();
  });
};

const centerComposerItem = (index: number) => {
  const el = composerCategoryRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.composer-item');
  const target = items[index] as HTMLElement;
  if (target) {
    const scrollPos = target.offsetLeft - (el.clientWidth / 2) + (target.clientWidth / 2);
    el.scrollTo({ left: scrollPos, behavior: 'smooth' });
  }
};

const initComposerScroll = () => {
  nextTick(() => {
    const targetId = selectedCategoryId.value;
    const targetIndex = allItems.value.findIndex(i => i.id === targetId);
    if (targetIndex !== -1) centerComposerItem(targetIndex);
    handleComposerScroll();
  });
};

// NAV SCROLL & ANIMATION
const handleCarouselScroll = () => {
  const el = categoryNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.carousel-item');
  const containerCenterX = el.getBoundingClientRect().left + el.clientWidth / 2;

  items.forEach((item: any) => {
    const itemCenterX = item.getBoundingClientRect().left + item.clientWidth / 2;
    const factor = Math.min(Math.abs(containerCenterX - itemCenterX) / (el.clientWidth / 2.5), 1);
    const scale = 1.15 - (factor * 0.3);
    const opacity = 1 - (factor * 0.7);
    const btn = item.querySelector('button');
    if (btn) { btn.style.transform = `scale(${scale})`; btn.style.opacity = opacity.toString(); }
  });
};

const centerCarouselItem = (index: number) => {
  const el = categoryNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.carousel-item');
  const target = items[index] as HTMLElement;
  if (target) {
    const scrollPos = target.offsetLeft - (el.clientWidth / 2) + (target.clientWidth / 2);
    el.scrollTo({ left: scrollPos, behavior: 'smooth' });
  }
};

const selectCategory = (id: number | null) => {
  if (id) postsStore.fetchPostsByCategory(id, authStore.user?.id);
  else { postsStore.resetCategory(); postsStore.fetchPosts(authStore.user?.id); }
};

const handleWheelScroll = (e: WheelEvent) => {
  if (!categoryNavRef.value) return;
  if (e.deltaY !== 0) { e.preventDefault(); categoryNavRef.value.scrollLeft += e.deltaY * 1.2; }
};

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    if (input.files[0].size > 5 * 1024 * 1024) { toast.error("Max 5MB!"); return; }
    selectedImage.value = input.files[0];
    selectedImagePreview.value = URL.createObjectURL(input.files[0]);
  }
};

const removeSelectedImage = () => {
  selectedImage.value = null; selectedImagePreview.value = null;
  if (imageInputRef.value) imageInputRef.value.value = "";
};

const handleCreatePost = async () => {
  if (!newPostContent.value.trim() && !selectedImage.value) return;
  try {
    await postsStore.createPost(newPostContent.value, true, selectedCategoryId.value || undefined, selectedImage.value || undefined);
    newPostContent.value = ""; selectedCategoryId.value = null; removeSelectedImage();
    toast.success("Paylaşıldı!");
  } catch { toast.error("Hata!"); }
};

const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);
const showDeleteModal = ref(false);
const postIdToDelete = ref<number | null>(null);
const isDeleting = ref(false);

const handleDeletePost = (id: number) => { postIdToDelete.value = id; showDeleteModal.value = true; };
const handleConfirmDelete = async () => {
  if (postIdToDelete.value === null) return;
  isDeleting.value = true;
  try { await postsStore.deletePost(postIdToDelete.value); toast.success("Silindi!"); showDeleteModal.value = false; }
  finally { isDeleting.value = false; }
};
const handleShowComments = (id: number) => { selectedPostId.value = id; commentsModalOpen.value = true; };

onMounted(() => {
  postsStore.resetCategory();
  postsStore.fetchPosts(authStore.user?.id);
  categoriesStore.fetchCategories().then(() => {
    setTimeout(() => {
      const akisIndex = allItems.value.findIndex(i => i.id === null);
      if (akisIndex !== -1) centerCarouselItem(akisIndex);
    }, 300);
  });
});

watch([newPostContent, selectedImage], async ([content, img], [oldContent, oldImg]) => {
  const isNowVisible = !!(content.trim() || img);
  const wasVisible = !!(oldContent?.trim() || oldImg);
  
  if (isNowVisible && !wasVisible) {
    await nextTick();
    if (composerCategoryRef.value) initComposerScroll();
  }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.carousel-item, .composer-item { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
</style>
