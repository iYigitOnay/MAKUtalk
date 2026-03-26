import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Post } from "@/types";
import { useProfileStore } from "./profile";
import { useAuthStore } from "./auth";

export const usePostsStore = defineStore("posts", () => {
  const posts = ref<Post[]>([]);
  const myPosts = ref<Post[]>([]);
  const searchResults = ref<Post[]>([]);
  const currentCategory = ref<string | null>(null);
  const currentThread = ref<{ parents: Post[], post: Post | null, replies: Post[] }>({ parents: [], post: null, replies: [] });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const sharePost = ref<Post | null>(null);
  const isShareModalOpen = ref(false);
  const activeFeedTab = ref<'main' | 'academic'>('main');

  const openShareModal = (post: Post) => {
    sharePost.value = post;
    isShareModalOpen.value = true;
  };

  const closeShareModal = () => {
    isShareModalOpen.value = false;
    setTimeout(() => { sharePost.value = null; }, 300);
  };

  const authStore = useAuthStore();
  const getProfileStore = () => useProfileStore();

  const fetchPosts = async (currentUserId?: string) => {
    loading.value = true;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>("/posts", { params });
      posts.value = response.data;
    } catch (err) {
      error.value = "Gönderiler yüklenemedi.";
    } finally {
      loading.value = false;
    }
  };

  const fetchAcademicPosts = async (currentUserId?: string) => {
    loading.value = true;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>("/posts/academic", { params });
      posts.value = response.data;
    } catch (err) {
      error.value = "Akademik gönderiler yüklenemedi.";
    } finally {
      loading.value = false;
    }
  };

  const fetchBookmarks = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get<Post[]>("/posts/bookmarks");
      posts.value = response.data;
    } catch (err) {
      error.value = "Kaydedilenler yüklenemedi.";
    } finally {
      loading.value = false;
    }
  };

  const fetchPostsByCategory = async (categoryId: string, currentUserId?: string) => {
    loading.value = true;
    currentCategory.value = categoryId;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>(`/posts/category/${categoryId}`, { params });
      posts.value = response.data;
    } catch (err) {
      error.value = "Kategori gönderileri yüklenemedi.";
    } finally {
      loading.value = false;
    }
  };

  const fetchMyPosts = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get<Post[]>("/posts/my-posts");
      myPosts.value = response.data;
    } catch (err) {
      error.value = "Gönderileriniz yüklenemedi.";
    } finally {
      loading.value = false;
    }
  };

  const toggleRepost = async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/repost`);
    const isRepostedNow = response.data.reposted;
    
    // MEVCUT POSTU BUL VE SAYACI TUM LISTELERDE GUNCELLE
    const existingPost = [...posts.value, ...searchResults.value, ...myPosts.value].find(p => p.id === postId || (p.repostId === postId));
    const currentCount = existingPost?.repostOf ? existingPost.repostOf._count?.reposts : existingPost?._count?.reposts;
    
    updatePostLocally(postId, {
      isReposted: isRepostedNow,
      _count: {
        reposts: isRepostedNow 
          ? (currentCount || 0) + 1 
          : Math.max(0, (currentCount || 0) - 1)
      }
    });
    return response.data;
  };

  const toggleBookmark = async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/bookmark`);
    const isBookmarkedNow = response.data.bookmarked;
    updatePostLocally(postId, { isBookmarked: isBookmarkedNow });
    return response.data;
  };

  const togglePin = async (postId: string) => {
    try {
      const response = await apiClient.patch(`/posts/${postId}/pin`);
      const isPinnedNow = response.data.isPinned;
      
      // Eğer bu post sabitlendiyse, diğer tüm postların isPinned değerini kapat (çünkü tek pin sınırı var)
      if (isPinnedNow) {
        const resetPins = (list: Post[]) => list.forEach(p => { if (p.authorId === response.data.authorId) p.isPinned = false; });
        [posts.value, myPosts.value, searchResults.value].forEach(resetPins);
        const profileStore = getProfileStore();
        if (profileStore) {
          [profileStore.userPosts, profileStore.userReplies, profileStore.userReposts].forEach(resetPins);
        }
      }

      updatePostLocally(postId, { isPinned: isPinnedNow });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const createPost = async (
    content: string,
    published = true,
    categoryId?: string,
    image?: File,
    parentId?: string,
    isAcademic: boolean = false,
    document?: File,
  ) => {
    loading.value = true;
    try {
      const formData = new FormData();
      if (content) formData.append("content", content);
      formData.append("published", String(published));
      if (categoryId) formData.append("categoryId", categoryId);
      if (parentId) formData.append("parentId", parentId);
      if (isAcademic) formData.append("isAcademic", String(isAcademic));
      if (image) formData.append("image", image);
      if (document) formData.append("document", document);

      const response = await apiClient.post<Post>("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (!parentId) {
        posts.value.unshift(response.data);
      } else {
        // Eger bu bir yanitsa, parent postun reply sayacini her yerde artir
        const parent = [...posts.value, ...searchResults.value].find(p => p.id === parentId);
        updatePostLocally(parentId, {
          _count: {
            replies: (parent?._count?.replies || 0) + 1
          }
        });
      }
      
      notifyPostCreated();
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  const fetchThread = async (postId: string, currentUserId?: string) => {
    loading.value = true;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<{ parents: Post[], post: Post, replies: Post[] }>(
        `/posts/${postId}/thread`,
        { params }
      );
      currentThread.value = response.data;
      return response.data;
    } catch (error) {
      console.error("Thread fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deletePost = async (postId: string) => {
    loading.value = true;
    try {
      await apiClient.delete(`/posts/${postId}`);
      
      const filterFn = (p: Post) => p.id !== postId && p.repostId !== postId;
      posts.value = posts.value.filter(filterFn);
      myPosts.value = myPosts.value.filter(filterFn);
      searchResults.value = searchResults.value.filter(filterFn);
      
      // Update currentThread if we are deleting from it
      currentThread.value.replies = currentThread.value.replies.filter(filterFn);
      currentThread.value.parents = currentThread.value.parents.filter(filterFn);
      
      const profileStore = getProfileStore();
      if (profileStore) {
        profileStore.userPosts = profileStore.userPosts.filter(filterFn);
        profileStore.userReplies = profileStore.userReplies.filter(filterFn);
        profileStore.userReposts = profileStore.userReposts.filter(filterFn);
        profileStore.userLikedPosts = profileStore.userLikedPosts.filter(filterFn);
        
        if (profileStore.profileUser?._count && profileStore.profileUser.id === authStore.user?.id) {
          profileStore.profileUser._count.posts = Math.max(0, profileStore.profileUser._count.posts - 1);
        }
      }

      return true;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  const updatePostLocally = (postId: string, updates: any) => {
    const updateTarget = (p: Post) => {
      // 1. ASIL POST GUNCELLEME
      if (p.id === postId) {
        if (updates.isLiked !== undefined) p.isLiked = updates.isLiked;
        if (updates.isReposted !== undefined) p.isReposted = updates.isReposted;
        if (updates.isBookmarked !== undefined) p.isBookmarked = updates.isBookmarked;
        if (updates.isPinned !== undefined) p.isPinned = updates.isPinned;
        if (updates.sentiment !== undefined) p.sentiment = updates.sentiment;
        if (updates.sentimentScore !== undefined) p.sentimentScore = updates.sentimentScore;
        if (updates._count) p._count = { ...p._count, ...updates._count };
      }
      
      // 2. REPOST WRAPPER'I GUNCELLEME (İçindeki post orijinalse)
      if (p.repostOf && p.repostId === postId) {
        const r = p.repostOf;
        if (updates.isLiked !== undefined) { r.isLiked = updates.isLiked; p.isLiked = updates.isLiked; }
        if (updates.isReposted !== undefined) { r.isReposted = updates.isReposted; p.isReposted = updates.isReposted; }
        if (updates.isBookmarked !== undefined) { r.isBookmarked = updates.isBookmarked; p.isBookmarked = updates.isBookmarked; }
        if (updates.isPinned !== undefined) { r.isPinned = updates.isPinned; p.isPinned = updates.isPinned; }
        if (updates.sentiment !== undefined) r.sentiment = updates.sentiment;
        if (updates._count) { r._count = { ...r._count, ...updates._count }; p._count = { ...p._count, ...updates._count }; }
      }

      // 3. PARENT (Reply) GUNCELLEME
      if (p.parent && p.parentId === postId) {
        if (updates.isLiked !== undefined) p.parent.isLiked = updates.isLiked;
        if (updates.isReposted !== undefined) p.parent.isReposted = updates.isReposted;
        if (updates.isBookmarked !== undefined) p.parent.isBookmarked = updates.isBookmarked;
        if (updates.isPinned !== undefined) p.parent.isPinned = updates.isPinned;
        if (updates._count) p.parent._count = { ...p.parent._count, ...updates._count };
      }
    };

    [posts.value, myPosts.value, searchResults.value].forEach(list => list.forEach(updateTarget));
    
    // GUNCELLEMEYI CURRENT THREAD'E DE UYGULA
    if (currentThread.value.post) updateTarget(currentThread.value.post);
    currentThread.value.parents.forEach(updateTarget);
    currentThread.value.replies.forEach(updateTarget);

    const profileStore = getProfileStore();
    if (profileStore) {
      [profileStore.userPosts, profileStore.userReplies, profileStore.userReposts, profileStore.userLikedPosts].forEach(list => list.forEach(updateTarget));
    }
  };

  const updateUserInPosts = (userId: string, updates: any) => {
    const updateAuthor = (p: Post) => {
      // Direkt yazar ise
      if (p.authorId === userId) { p.author = { ...p.author, ...updates }; }
      // Repost edilen orijinal postun yazarı ise
      if (p.repostOf && p.repostOf.authorId === userId) { p.repostOf.author = { ...p.repostOf.author, ...updates }; }
      // Thread'deki üst postun yazarı ise
      if (p.parent && p.parent.authorId === userId) { p.parent.author = { ...p.parent.author, ...updates }; }
      return p;
    };

    [posts.value, myPosts.value, searchResults.value].forEach(list => list.forEach(updateAuthor));
    
    // GUNCELLEMEYI CURRENT THREAD'E DE UYGULA
    if (currentThread.value.post) updateAuthor(currentThread.value.post);
    currentThread.value.parents.forEach(updateAuthor);
    currentThread.value.replies.forEach(updateAuthor);

    const profileStore = getProfileStore();
    if (profileStore) {
      [profileStore.userPosts, profileStore.userReplies, profileStore.userReposts, profileStore.userLikedPosts].forEach(list => list.forEach(updateAuthor));
    }
  };

  const refreshSentiment = async (postId: string) => {
    const response = await apiClient.post(`/posts/${postId}/refresh-sentiment`);
    updatePostLocally(postId, response.data);
    return response.data;
  };

  const resetCategory = () => {
    currentCategory.value = null;
  };

  const postCreatedCallbacks: Array<() => void> = [];
  const onPostCreated = (cb: () => void) => postCreatedCallbacks.push(cb);
  const notifyPostCreated = () => postCreatedCallbacks.forEach((cb) => cb());

  return {
    posts, myPosts, searchResults, currentCategory, currentThread, loading, error, activeFeedTab,
    fetchPosts, fetchAcademicPosts, fetchBookmarks, fetchPostsByCategory, fetchMyPosts, toggleRepost, toggleBookmark, togglePin, createPost,
    fetchThread, deletePost, updatePostLocally, updateUserInPosts, refreshSentiment,
    resetCategory, onPostCreated, sharePost, isShareModalOpen, openShareModal, closeShareModal
  };
});
