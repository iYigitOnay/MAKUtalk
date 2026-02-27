<!-- src/views/Home.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen font-sans"
  >
    <!-- Post Composer Section -->
    <div
      v-if="authStore.isAuthenticated"
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-4"
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
        <div class="flex-1 min-w-0">
          <textarea
            v-model="newPostContent"
            placeholder="Ne Düşünüyorsun?"
            class="w-full text-lg bg-transparent text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none font-medium"
            rows="3"
            :disabled="postsStore.loading"
          />

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

          <!-- POST ALANI MERKEZLİ YARIM DAİRE (ARC) -->
          <transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-4 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
          >
            <div v-if="newPostContent.trim() || selectedImage" class="relative mt-2 h-24 flex items-center justify-center overflow-hidden">
              <div 
                ref="composerCategoryRef"
                class="flex items-center gap-6 overflow-x-auto px-[38%] h-full scrollbar-hide snap-x snap-mandatory pt-4 pb-8"
                @scroll="handleComposerScroll"
              >
                <!-- AKIŞ (GRADYANLI) -->
                <button
                  @click="selectedCategoryId = null; centerComposerItem(0)"
                  class="flex-shrink-0 snap-center transition-all duration-300 flex flex-col items-center gap-1.5 group outline-none"
                >
                  <div 
                    :class="[
                      'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border-2',
                      !selectedCategoryId ? 'bg-gradient-to-tr from-blue-600 to-purple-600 border-white/20 text-white scale-110' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-primary-900/10 text-gray-400 scale-90'
                    ]"
                    :style="!selectedCategoryId ? { boxShadow: '0 8px 25px -5px rgba(37, 99, 235, 0.6)' } : {}"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span :class="['text-[10px] font-black tracking-tighter uppercase transition-all duration-300', !selectedCategoryId ? 'text-blue-600 opacity-100' : 'text-gray-400 opacity-70 group-hover:opacity-100']">Akış</span>
                </button>

                <!-- KATEGORİLER -->
                <button
                  v-for="(category, index) in sortedCategories"
                  :key="category.id"
                  @click="selectedCategoryId = category.id; centerComposerItem(index + 1)"
                  class="flex-shrink-0 snap-center transition-all duration-300 flex flex-col items-center gap-1.5 group outline-none"
                >
                  <div 
                    :class="[
                      'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border-2',
                      selectedCategoryId === category.id ? 'scale-110 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-primary-900/10 text-gray-400 scale-90'
                    ]"
                    :style="selectedCategoryId === category.id 
                      ? { backgroundColor: category.color, borderColor: 'rgba(255,255,255,0.2)', boxShadow: `0 8px 20px -5px ${category.color}60` } 
                      : {}"
                  >
                    <span 
                      class="w-2 h-2 rounded-full" 
                      :style="{ backgroundColor: selectedCategoryId === category.id ? 'white' : category.color, boxShadow: selectedCategoryId === category.id ? '0 0 8px white' : 'none' }"
                    ></span>
                  </div>
                  <span :class="['text-[10px] font-black tracking-tighter uppercase transition-all duration-300', selectedCategoryId === category.id ? 'opacity-100' : 'text-gray-400 opacity-70 group-hover:opacity-100']" :style="selectedCategoryId === category.id ? { color: category.color } : {}">
                    {{ category.name }}
                  </span>
                </button>
              </div>
            </div>
          </transition>

          <!-- Footer Actions -->
          <div v-if="newPostContent.trim() || selectedImage" class="mt-2 flex items-center justify-between border-t border-gray-50 dark:border-primary-900/5 pt-4">
            <div class="flex items-center gap-2">
              <input 
                type="file" 
                ref="imageInputRef" 
                class="hidden" 
                accept="image/*" 
                @change="handleImageSelect"
              />
              <button 
                type="button" 
                @click="imageInputRef?.click()"
                class="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                title="Resim Ekle"
              >
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

    <!-- Kategori Filtre Çubuğu -->
    <div class="sticky top-[116px] z-[5] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-primary-900/10">
      <div class="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        <button
          @click="selectCategory(null)"
          :class="[
            'flex-shrink-0 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all',
            !postsStore.currentCategory
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200',
          ]"
        >
          AKIŞ
        </button>
        <button
          v-for="cat in sortedCategories"
          :key="cat.id"
          @click="selectCategory(cat.id)"
          :class="[
            'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2',
            postsStore.currentCategory === cat.id
              ? 'text-white shadow-lg'
              : 'bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-primary-900/10',
          ]"
          :style="postsStore.currentCategory === cat.id ? { backgroundColor: cat.color } : {}"
        >
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: cat.color }"></span>
          {{ cat.name }}
        </button>
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

const newPostContent = ref("");
const selectedCategoryId = ref<number | null>(null);
const selectedImage = ref<File | null>(null);
const selectedImagePreview = ref<string | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu çok büyük (Max 5MB)");
      return;
    }
    selectedImage.value = file;
    selectedImagePreview.value = URL.createObjectURL(file);
  }
};

const removeSelectedImage = () => {
  selectedImage.value = null;
  selectedImagePreview.value = null;
  if (imageInputRef.value) imageInputRef.value.value = "";
};

const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);
const showDeleteModal = ref(false);
const postIdToDelete = ref<number | null>(null);
const isDeleting = ref(false);

const composerCategoryRef = ref<HTMLElement | null>(null);

const sortedCategories = computed(() => {
  const order = ["Genel", "Duyuru", "Etkinlik", "Arıza-Kayıp", "Satılık", "Soru-Cevap"];
  return [...categoriesStore.categories].sort((a, b) => {
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
});

const handleComposerScroll = () => {
  const el = composerCategoryRef.value;
  if (!el) return;

  const items = el.children;
  const containerRect = el.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;

  Array.from(items).forEach((item: any) => {
    const rect = item.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const distanceFromCenter = Math.abs(containerCenterX - itemCenterX);
    
    const factor = Math.min(distanceFromCenter / (el.clientWidth / 1.5), 1);
    
    const translateY = Math.pow(factor, 2) * 35; 
    const scale = 1.15 - (factor * 0.25); 
    const opacity = 1 - (factor * 0.25); 

    item.style.transform = `translateY(${translateY}px) scale(${scale})`;
    item.style.opacity = opacity;
  });
};

const centerComposerItem = (index: number) => {
  const el = composerCategoryRef.value;
  if (!el) return;
  const target = el.children[index] as HTMLElement;
  if (target) {
    const scrollPos = target.offsetLeft - (el.clientWidth / 2) + (target.clientWidth / 2);
    el.scrollTo({ left: scrollPos, behavior: 'smooth' });
  }
};

const selectCategory = (id: number | null) => {
  if (id) postsStore.fetchPostsByCategory(id, authStore.user?.id);
  else { postsStore.resetCategory(); postsStore.fetchPosts(authStore.user?.id); }
};

const handleCreatePost = async () => {
  if (!newPostContent.value.trim() && !selectedImage.value) return;
  try {
    await postsStore.createPost(
      newPostContent.value, 
      true, 
      selectedCategoryId.value || undefined,
      selectedImage.value || undefined
    );
    newPostContent.value = ""; 
    selectedCategoryId.value = null; 
    removeSelectedImage();
    toast.success("Paylaşıldı!");
  } catch { 
    toast.error("Hata!"); 
  }
};

const handleDeletePost = (id: number) => { postIdToDelete.value = id; showDeleteModal.value = true; };
const handleConfirmDelete = async () => {
  if (postIdToDelete.value === null) return;
  isDeleting.value = true;
  try { await postsStore.deletePost(postIdToDelete.value); toast.success("Silindi!"); showDeleteModal.value = false; }
  finally { isDeleting.value = false; }
};
const handleCancelDelete = () => { showDeleteModal.value = false; };
const handleShowComments = (id: number) => { selectedPostId.value = id; commentsModalOpen.value = true; };

onMounted(() => {
  postsStore.resetCategory();
  postsStore.fetchPosts(authStore.user?.id);
  categoriesStore.fetchCategories();
});

watch(newPostContent, async (val) => {
  if (val.trim().length === 1) {
    await nextTick();
    handleComposerScroll();
    centerComposerItem(0);
  }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
