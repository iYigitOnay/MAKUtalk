<!-- src/views/Home.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen font-sans relative"
  >
    <!-- TOP TABS (Main Feed vs Academic Feed) - Not sticky anymore to avoid overlap -->
    <div
      class="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-primary-900/30"
    >
      <div class="flex">
        <button
          @click="switchTab('main')"
          class="flex-1 py-4 text-sm font-black transition-all relative outline-none"
          :class="
            activeFeedTab === 'main'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
          "
        >
          ANA AKIŞ
          <div
            v-if="activeFeedTab === 'main'"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"
          ></div>
        </button>
        <button
          @click="switchTab('academic')"
          class="flex-1 py-4 text-sm font-black transition-all relative outline-none flex items-center justify-center gap-2"
          :class="
            activeFeedTab === 'academic'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
          "
        >
          AKADEMİK
          <div
            v-if="activeFeedTab === 'academic'"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-emerald-600 rounded-t-full"
          ></div>
        </button>
      </div>
    </div>

    <!-- MODERATION OVERLAYS -->
    <transition name="fade">
      <div
        v-if="showReportModal"
        class="fixed inset-0 z-[110] bg-white dark:bg-gray-950 flex flex-col"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5"
        >
          <button
            v-if="reportStep === 2"
            @click="reportStep = 1"
            class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div v-else class="w-9"></div>
          <h3
            class="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter"
          >
            Gönderiyi Bildir
          </h3>
          <button
            @click="closeReport"
            class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
          <div v-if="reportStep === 1">
            <button
              v-for="(cat, name) in reportCategories"
              :key="name"
              @click="selectReportCategory(name as string)"
              class="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all flex items-center justify-between group"
            >
              <span class="font-bold text-gray-700 dark:text-gray-300">{{
                name
              }}</span>
              <svg
                class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div v-else class="space-y-2">
            <button
              v-for="sub in reportCategories[selectedCategory]"
              :key="sub"
              @click="submitReport(sub)"
              class="w-full text-left p-4 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:border-blue-900/30 transition-all"
            >
              <span
                class="font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600"
                >{{ sub }}</span
              >
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Post Composer Section -->
    <div
      v-if="
        authStore.isAuthenticated &&
        (activeFeedTab === 'main' || canPostToAcademic)
      "
      class="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-primary-900/30 p-4 transition-all duration-500"
    >
      <div class="flex gap-4">
        <div class="relative group flex-shrink-0">
          <div
            class="p-[2px] rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 shadow-sm transition-transform group-hover:scale-105"
          >
            <img
              v-if="authStore.user?.avatarUrl"
              :src="getImageUrl(authStore.user.avatarUrl)"
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
        <div class="flex-1 min-w-0 relative">
          <textarea
            ref="textareaRef"
            v-model="newPostContent"
            @input="handleInput"
            :placeholder="
              activeFeedTab === 'academic'
                ? 'Duyuru, ders notu veya bilgilendirme paylaşın...'
                : 'Ne Düşünüyorsun?'
            "
            class="w-full text-lg bg-transparent text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none font-medium min-h-[100px] overflow-hidden pt-2.5 pr-12"
            :disabled="postsStore.loading"
            maxlength="750"
          />

          <!-- ... Mentions Modal ... -->
          <div
            v-if="showMentions"
            :style="{ top: mentionPos.y + 'px', left: mentionPos.x + 'px' }"
            class="absolute z-[60] w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
          >
            <div class="max-h-48 overflow-y-auto no-scrollbar">
              <button
                v-for="user in mentionUsers"
                :key="user.id"
                @click="selectMention(user.username)"
                class="w-full flex items-center gap-3 p-2.5 hover:bg-blue-600 hover:text-white transition-colors group text-left"
              >
                <img
                  v-if="user.avatarUrl"
                  :src="getImageUrl(user.avatarUrl)"
                  class="w-7 h-7 rounded-full object-cover border border-white/20"
                />
                <div
                  v-else
                  class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:text-blue-600 transition-colors"
                >
                  {{ user.username.charAt(0).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold truncate">{{
                    user.fullName || user.username
                  }}</span>
                  <span class="text-[10px] opacity-70 truncate"
                    >@{{ user.username }}</span
                  >
                </div>
              </button>
            </div>
          </div>

          <div v-if="selectedImagePreview" class="relative mt-4 group">
            <img
              :src="selectedImagePreview"
              class="w-full max-h-80 object-cover rounded-2xl border border-gray-100 dark:border-primary-900/20 shadow-sm"
            />
            <button
              @click="removeSelectedImage"
              class="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Video Preview -->
          <div v-if="selectedVideoPreview" class="relative mt-4 group">
            <video
              :src="selectedVideoPreview"
              class="w-full max-h-80 object-cover rounded-2xl border border-gray-100 dark:border-primary-900/20 shadow-sm"
              controls
            />
            <button
              @click="removeSelectedVideo"
              class="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            v-if="selectedDocument"
            class="relative mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between"
          >
            <div class="flex items-center gap-3 truncate">
              <svg
                class="w-8 h-8 text-blue-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span
                class="font-semibold text-sm truncate text-gray-700 dark:text-gray-300"
                >{{ selectedDocument.name }}</span
              >
            </div>
            <button
              @click="removeSelectedDocument"
              class="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <transition name="fade">
            <div
              v-if="
                (newPostContent.trim() || selectedImage || selectedDocument) &&
                activeFeedTab === 'main'
              "
              class="relative mt-2 h-24 flex items-center justify-center overflow-hidden -ml-16"
            >
              <div
                ref="composerCategoryRef"
                class="flex items-center gap-6 overflow-x-auto px-[38%] h-full scrollbar-hide snap-x snap-mandatory pt-4 pb-8 scroll-smooth"
                @scroll="handleComposerScroll"
              >
                <!-- Kategori Seçici Sadece Ana Akışta Görünür -->
                <div
                  v-for="(item, index) in allItems"
                  :key="index"
                  class="flex-shrink-0 snap-center composer-item"
                >
                  <button
                    @click="
                      selectedCategoryId = item.id;
                      centerComposerItem(index);
                    "
                    class="flex flex-col items-center gap-1.5 group outline-none"
                  >
                    <div
                      :class="[
                        'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border-2',
                        (item.id === null && !selectedCategoryId) ||
                        selectedCategoryId === item.id
                          ? 'text-white scale-110'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-primary-900/10 text-gray-400 scale-90',
                      ]"
                      :style="
                        (item.id === null && !selectedCategoryId) ||
                        selectedCategoryId === item.id
                          ? {
                              backgroundColor: item.color || '#4f46e5',
                              borderColor: 'rgba(255,255,255,0.2)',
                            }
                          : {}
                      "
                    >
                      <svg
                        v-if="item.id === null"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span
                        v-else
                        class="w-2 h-2 rounded-full"
                        :style="{
                          backgroundColor:
                            selectedCategoryId === item.id
                              ? 'white'
                              : item.color,
                        }"
                      ></span>
                    </div>
                    <span
                      :class="[
                        'text-[9px] font-black tracking-tighter uppercase transition-all duration-300',
                        (item.id === null && !selectedCategoryId) ||
                        selectedCategoryId === item.id
                          ? 'opacity-100'
                          : 'text-gray-400 opacity-70',
                      ]"
                      :style="
                        selectedCategoryId === item.id
                          ? { color: item.color }
                          : {}
                      "
                      >{{ item.name }}</span
                    >
                  </button>
                </div>
              </div>
            </div>
          </transition>

          <div
            class="mt-2 flex items-center justify-between border-t border-gray-50 dark:border-primary-900/5 pt-4"
          >
            <div class="flex items-center gap-2">
              <input
                type="file"
                ref="imageInputRef"
                class="hidden"
                accept="image/*"
                @change="handleImageSelect"
              />
              <button
                @click="imageInputRef?.click()"
                class="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                title="Görsel Ekle"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.414a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <input
                type="file"
                ref="videoInputRef"
                class="hidden"
                accept="video/*"
                @change="handleVideoSelect"
              />
              <button
                @click="videoInputRef?.click()"
                class="p-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                title="Video Ekle"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <!-- Döküman Yükleme Butonu (Sadece Akademik Akışta) -->
              <template v-if="activeFeedTab === 'academic'">
                <input
                  type="file"
                  ref="docInputRef"
                  class="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  @change="handleDocSelect"
                />
                <button
                  @click="docInputRef?.click()"
                  class="p-2.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all"
                  title="Döküman Ekle (PDF, Word, vs.)"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </template>

              <EmojiPicker
                :modelValue="newPostContent"
                @update:modelValue="(e) => (newPostContent += e)"
              />
            </div>

            <div class="flex items-center gap-4">
              <!-- Animated Character Counter -->
              <transition name="scale-fade">
                <div
                  v-if="newPostContent.length > 0"
                  class="flex items-center gap-2"
                >
                  <div
                    class="relative w-6 h-6 flex items-center justify-center"
                  >
                    <svg class="w-full h-full -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="transparent"
                        class="text-gray-100 dark:text-gray-800"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="2.5"
                        fill="transparent"
                        class="transition-all duration-500"
                        :class="
                          newPostContent.length > 750
                            ? 'text-red-500'
                            : newPostContent.length > 650
                              ? 'text-orange-500'
                              : 'text-primary-500'
                        "
                        :stroke-dasharray="63"
                        :stroke-dashoffset="
                          63 - (Math.min(newPostContent.length, 750) / 750) * 63
                        "
                        stroke-linecap="round"
                      />
                    </svg>
                    <span
                      v-if="newPostContent.length > 650"
                      class="absolute text-[8px] font-black"
                      :class="
                        newPostContent.length > 750
                          ? 'text-red-500'
                          : 'text-gray-400'
                      "
                      >{{ 750 - newPostContent.length }}</span
                    >
                  </div>
                  <div
                    v-if="newPostContent.length > 750"
                    class="w-px h-4 bg-gray-200 dark:bg-gray-800"
                  ></div>
                </div>
              </transition>

              <button
                @click="handleCreatePost"
                :disabled="
                  (!newPostContent.trim() && !selectedImage) ||
                  postsStore.loading ||
                  newPostContent.length > 750
                "
                class="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-black rounded-full shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
              >
                PAYLAŞ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ANA KATEGORİ ÇARKI (Artık en üstte sticky: top-0) -->
    <div
      v-if="activeFeedTab === 'main'"
      class="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-primary-900/10 py-3 overflow-hidden"
    >
      <div
        ref="categoryNavRef"
        @scroll="handleCarouselScroll"
        class="flex items-center gap-4 overflow-x-auto px-[20%] sm:px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth h-20"
      >
        <div
          v-for="(item, index) in allItems"
          :key="index"
          class="flex-shrink-0 snap-center carousel-item"
        >
          <button
            @click="
              selectCategory(item.id);
              centerCarouselItem(index);
            "
            :class="[
              'w-28 h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-3',
              (item.id === null && !postsStore.currentCategory) ||
              postsStore.currentCategory === item.id
                ? 'scale-110 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60',
            ]"
            :style="
              (item.id === null && !postsStore.currentCategory) ||
              postsStore.currentCategory === item.id
                ? {
                    backgroundColor: item.color || '#3b82f6',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }
                : {}
            "
          >
            <svg
              v-if="item.id === null"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span
              v-else
              class="w-2 h-2 rounded-full"
              :style="{
                backgroundColor:
                  postsStore.currentCategory === item.id ? 'white' : item.color,
              }"
            ></span>
            <span
              class="text-[10px] font-black uppercase truncate tracking-tight"
              >{{ item.name }}</span
            >
          </button>
        </div>
      </div>
    </div>

    <!-- Feed -->
    <div class="pb-20">
      <div
        v-if="postsStore.loading && !postsStore.posts.length"
        class="flex justify-center items-center h-64"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
        ></div>
      </div>
      <div v-else class="divide-y divide-gray-200 dark:divide-primary-900/20">
        <PostCard
          v-for="post in postsStore.posts"
          :key="post.id"
          :post="post"
          @delete="handleDeletePost"
          @report="handleReportPost"
          @showComments="handleShowComments"
        />
      </div>
    </div>

    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :is-deleting="isDeleting"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />
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
import apiClient from "@/api/client";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const categoriesStore = useCategoriesStore();
const toast = useToast();

function getImageUrl(path: string | undefined) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

const newPostContent = ref("");
const selectedCategoryId = ref<number | null>(null);
const selectedImage = ref<File | null>(null);
const selectedImagePreview = ref<string | null>(null);
const selectedVideo = ref<File | null>(null);
const selectedVideoPreview = ref<string | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const videoInputRef = ref<HTMLInputElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const activeFeedTab = computed({
  get: () => postsStore.activeFeedTab,
  set: (val) => (postsStore.activeFeedTab = val),
});

const switchTab = (tab: 'main' | 'academic') => {
  activeFeedTab.value = tab;
  postsStore.posts = []; // Geçiş yaparken listeyi temizle
  postsStore.resetCategory(); // Kategori filtresini temizle

  if (tab === 'main') {
    postsStore.fetchPosts(authStore.user?.id);
    // Kategori çarkını "Akış"a (ortaya) geri çek
    nextTick(() => {
      const idx = allItems.value.findIndex((i) => i.id === null);
      if (idx !== -1) centerCarouselItem(idx);
    });
  } else {
    postsStore.fetchAcademicPosts(authStore.user?.id);
  }
};


const canPostToAcademic = computed(() => {
  return (
    authStore.user?.role === "ADMIN" || authStore.user?.role === "ACADEMIC"
  );
});

const mentionUsers = ref<any[]>([]);
const showMentions = ref(false);
const mentionPos = ref({ x: 0, y: 0 });

const selectedDocument = ref<File | null>(null);
const docInputRef = ref<HTMLInputElement | null>(null);

const handleDocSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    selectedDocument.value = file;
  }
};

const removeSelectedDocument = () => {
  selectedDocument.value = null;
  if (docInputRef.value) docInputRef.value.value = "";
};

const adjustTextareaHeight = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

const getCursorXY = (el: HTMLTextAreaElement, cursorIndex: number) => {
  const style = window.getComputedStyle(el);
  const mirror = document.createElement("div");
  const copyStyle = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "padding",
    "border",
    "width",
    "boxSizing",
    "whiteSpace",
    "wordBreak",
  ];
  copyStyle.forEach((prop) => {
    (mirror.style as any)[prop] = (style as any)[prop];
  });
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.top = "0";
  mirror.style.left = "0";
  mirror.textContent = el.value.substring(0, cursorIndex);
  const span = document.createElement("span");
  span.textContent = el.value.substring(cursorIndex) || ".";
  mirror.appendChild(span);
  document.body.appendChild(mirror);
  const { offsetLeft: x, offsetTop: y } = span;
  document.body.removeChild(mirror);
  return {
    x: Math.min(x, el.clientWidth - 250),
    y: Math.min(y + 25, el.clientHeight),
  };
};

const handleInput = async (e: any) => {
  adjustTextareaHeight();
  const cursor = e.target.selectionStart;
  const words = e.target.value.substring(0, cursor).split(/\s/);
  const last = words[words.length - 1];

  if (last.startsWith("@")) {
    const q = last.substring(1);
    mentionPos.value = getCursorXY(e.target, cursor - q.length - 1);
    try {
      const res = await apiClient.get(`/users/search-mentions?q=${q}`);
      mentionUsers.value = res.data;
      showMentions.value = mentionUsers.value.length > 0;
    } catch {
      showMentions.value = false;
    }
  } else showMentions.value = false;
};

const selectMention = (u: string) => {
  const lastAt = newPostContent.value.lastIndexOf("@");
  newPostContent.value = newPostContent.value.substring(0, lastAt) + `@${u} `;
  showMentions.value = false;
  nextTick(adjustTextareaHeight);
};

const categoryNavRef = ref<HTMLElement | null>(null);
const composerCategoryRef = ref<HTMLElement | null>(null);

const allItems = computed(() => {
  const cats = categoriesStore.categories;
  const akis = { id: null, name: "Akış", color: "#4f46e5" };
  const mid = Math.ceil(cats.length / 2);
  return [...cats.slice(0, mid), akis, ...cats.slice(mid)];
});

const handleCarouselScroll = () => {
  const el = categoryNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".carousel-item");
  const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const factor = Math.min(
      Math.abs(
        centerX - (item.getBoundingClientRect().left + item.clientWidth / 2),
      ) /
        (el.clientWidth / 2.5),
      1,
    );
    const btn = item.querySelector("button");
    if (btn) {
      btn.style.transform = `scale(${1.15 - factor * 0.3})`;
      btn.style.opacity = (1 - factor * 0.7).toString();
    }
  });
};

const handleComposerScroll = () => {
  const el = composerCategoryRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".composer-item");
  const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const factor = Math.min(
      Math.abs(
        centerX - (item.getBoundingClientRect().left + item.clientWidth / 2),
      ) /
        (el.clientWidth / 2),
      1,
    );
    item.style.transform = `translateY(${Math.pow(factor, 2) * 30}px) scale(${1.15 - factor * 0.25})`;
    item.style.opacity = (1 - factor * 0.4).toString();
  });
};

const centerCarouselItem = (idx: number) => {
  const el = categoryNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".carousel-item")[idx] as HTMLElement;
  if (target)
    el.scrollTo({
      left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2,
      behavior: "smooth",
    });
};

const centerComposerItem = (idx: number) => {
  const el = composerCategoryRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".composer-item")[idx] as HTMLElement;
  if (target)
    el.scrollTo({
      left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2,
      behavior: "smooth",
    });
};

const selectCategory = (id: number | null) => {
  if (id) postsStore.fetchPostsByCategory(id, authStore.user?.id);
  else {
    postsStore.resetCategory();
    postsStore.fetchPosts(authStore.user?.id);
  }
};

const handleImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    // Diğer medyaları temizle
    removeSelectedVideo();
    removeSelectedDocument();
    selectedImage.value = file;
    selectedImagePreview.value = URL.createObjectURL(file);
  }
};

const removeSelectedImage = () => {
  selectedImage.value = null;
  selectedImagePreview.value = null;
  if (imageInputRef.value) imageInputRef.value.value = "";
};

const handleVideoSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Video boyutu 25MB'dan büyük olamaz.");
      return;
    }
    // Diğer medyaları temizle
    removeSelectedImage();
    removeSelectedDocument();
    selectedVideo.value = file;
    selectedVideoPreview.value = URL.createObjectURL(file);
  }
};

const removeSelectedVideo = () => {
  selectedVideo.value = null;
  selectedVideoPreview.value = null;
  if (videoInputRef.value) videoInputRef.value.value = "";
};

const handleCreatePost = async () => {
  if (
    !newPostContent.value.trim() &&
    !selectedImage.value &&
    !selectedVideo.value &&
    !selectedDocument.value
  )
    return;
  try {
    const isAcademicPost =
      activeFeedTab.value === "academic" && canPostToAcademic.value;

    await postsStore.createPost(
      newPostContent.value,
      true,
      isAcademicPost ? undefined : selectedCategoryId.value || undefined,
      selectedImage.value || undefined,
      undefined, // parentId
      isAcademicPost,
      selectedDocument.value || undefined,
      selectedVideo.value || undefined,
    );

    newPostContent.value = "";
    selectedCategoryId.value = null;
    removeSelectedImage();
    removeSelectedVideo();
    removeSelectedDocument();
    nextTick(adjustTextareaHeight);
    toast.success("Paylaşıldı!");
  } catch (err: any) {
    // Store zaten error.response.data'yı fırlattığı için direkt içindeki message'a bakıyoruz
    const msg = err.message || err.response?.data?.message;
    toast.error(Array.isArray(msg) ? msg[0] : msg || "Hata!");
  }
};

const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);
const showDeleteModal = ref(false);
const postIdToDelete = ref<number | null>(null);
const isDeleting = ref(false);

const showReportModal = ref(false);
const reportStep = ref(1);
const selectedCategory = ref("");
const reportCategories: Record<string, string[]> = {
  Nefret: [
    "Hakaretler",
    "Irkçı veya cinsiyetçi klişeler",
    "İnsanlıktan çıkarma",
    "Korku veya ayrımcılığa teşvik",
  ],
  "Taciz ve Rahatsızlık": [
    "Hakaret",
    "İstenmeyen Cinsel İçerik",
    "Hedefli Taciz",
  ],
  "Şiddet içeren konuşma": [
    "Şiddet Tehditleri",
    "Zarar Verme İsteği",
    "Şiddeti Yüceltme",
  ],
  Mahremiyet: [
    "Özel bilgileri paylaşmak",
    "Rızam olmadan özel görüntü paylaşımı",
  ],
  "Yasadışı Davranışlar": [
    "İnsan sömürüsü",
    "Cinsel şiddet",
    "Yasadışı ürün satışı",
  ],
};

const handleDeletePost = (id: number) => {
  postIdToDelete.value = id;
  showDeleteModal.value = true;
};
const handleConfirmDelete = async () => {
  if (postIdToDelete.value === null) return;
  isDeleting.value = true;
  try {
    await postsStore.deletePost(postIdToDelete.value);
    toast.success("Silindi!");
    showDeleteModal.value = false;
  } finally {
    isDeleting.value = false;
  }
};

const handleReportPost = (id: number) => {
  postToReport.value = id;
  showReportModal.value = true;
  reportStep.value = 1;
};
const selectReportCategory = (name: string) => {
  selectedCategory.value = name;
  reportStep.value = 2;
};
const postToReport = ref<number | null>(null);
const submitReport = async (sub: string) => {
  try {
    await apiClient.post("/users/report", {
      reportedPostId: postToReport.value,
      reason: selectedCategory.value,
      subReason: sub,
    });
    toast.warning("Bildirildi.");
  } catch (err: any) {
    const msg = err.response?.data?.message;
    toast.error(Array.isArray(msg) ? msg[0] : msg || "Hata!");
  } finally {
    closeReport();
  }
};
const closeReport = () => {
  showReportModal.value = false;
  postToReport.value = null;
};

const handleShowComments = (id: number) => {
  console.log("Home: Opening comments modal for post:", id);
  selectedPostId.value = id;
  commentsModalOpen.value = true;
};

// CANLI SENKRONÄ°ZASYON: Yan panelden kategori seÃ§ilirse Ã§arkÄ± merkezle
watch(() => postsStore.currentCategory, (newCatId) => {
  const index = allItems.value.findIndex(item => item.id === newCatId);
  if (index !== -1) {
    nextTick(() => {
      centerCarouselItem(index);
    });
  }
}, { immediate: true });

onMounted(() => {
  postsStore.resetCategory();

  // Persist tab logic
  if (activeFeedTab.value === "academic") {
    postsStore.fetchAcademicPosts(authStore.user?.id);
  } else {
    postsStore.fetchPosts(authStore.user?.id);
  }

  categoriesStore.fetchCategories().then(() => {
    setTimeout(() => {
      const idx = allItems.value.findIndex((i) => i.id === null);
      if (idx !== -1) centerCarouselItem(idx);
    }, 300);
  });
});

watch([newPostContent, selectedImage], async ([content, img]) => {
  if (content.trim() || img) {
    await nextTick();
    const idx = allItems.value.findIndex(
      (i) => i.id === selectedCategoryId.value,
    );
    if (idx !== -1) centerComposerItem(idx);
  }
  adjustTextareaHeight();
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.carousel-item,
.composer-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(-45deg);
}
</style>
