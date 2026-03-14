import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Post } from "@/types";
import { useProfileStore } from "./profile";
import { useAuthStore } from "./auth";

export const usePostsStore = defineStore("posts", () => {
  const posts = ref<Post[]>([]);
  const myPosts = ref<Post[]>([]);
  const currentCategory = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const authStore = useAuthStore();
  const getProfileStore = () => useProfileStore();

  const fetchPosts = async (currentUserId?: number) => {
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

  const fetchPostsByCategory = async (categoryId: number, currentUserId?: number) => {
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

  const fetchUserReposts = async (userId: number, currentUserId?: number) => {
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>(`/posts/user/${userId}/reposts`, { params });
      return response.data;
    } catch (error) {
      return [];
    }
  };

  const toggleRepost = async (postId: number) => {
    const response = await apiClient.post(`/posts/${postId}/repost`);
    return response.data;
  };

  // Post oluştur (veya Cevap ver)
  const createPost = async (
    content: string,
    published = true,
    categoryId?: number,
    image?: File,
    parentId?: number,
  ) => {
    loading.value = true;
    try {
      const formData = new FormData();
      if (content) formData.append("content", content);
      formData.append("published", String(published));
      if (categoryId) formData.append("categoryId", String(categoryId));
      if (parentId) formData.append("parentId", String(parentId));
      if (image) formData.append("image", image);

      const response = await apiClient.post<Post>("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (!parentId) {
        posts.value.unshift(response.data);
      }
      
      notifyPostCreated();
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Twitter Tarzı Thread Getir
  const fetchThread = async (postId: number, currentUserId?: number) => {
    loading.value = true;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<{ parents: Post[], post: Post, replies: Post[] }>(
        `/posts/${postId}/thread`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Thread fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Post sil
  const deletePost = async (postId: number) => {
    loading.value = true;
    try {
      await apiClient.delete(`/posts/${postId}`);
      
      // 1. Yerel listelerden kaldır
      posts.value = posts.value.filter((p) => p.id !== postId && p.repostId !== postId);
      myPosts.value = myPosts.value.filter((p) => p.id !== postId);
      
      // 2. ProfileStore listelerinden kaldır (Küresel Senkronizasyon)
      const profileStore = getProfileStore();
      profileStore.userPosts = profileStore.userPosts.filter((p) => p.id !== postId);
      profileStore.userReplies = profileStore.userReplies.filter((p) => p.id !== postId);
      profileStore.userReposts = profileStore.userReposts.filter((p) => p.id !== postId && p.repostId !== postId);
      profileStore.userLikedPosts = profileStore.userLikedPosts.filter((p) => p.id !== postId);
      
      // 3. Profil sayacı güncelle
      if (profileStore.profileUser?._count && profileStore.profileUser.id === authStore.user?.id) {
        profileStore.profileUser._count.posts--;
      }

      return true;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  const updatePost = async (postId: number, content: string) => {
    const response = await apiClient.patch(`/posts/${postId}`, { content });
    updatePostLocally(postId, response.data);
    return response.data;
  };

  // Post'u local state'te güncelle (Referans bütünlüğünü koruyarak)
  const updatePostLocally = (postId: number, updates: any) => {
    const updateTarget = (p: Post) => {
      if (p.id === postId) {
        if (updates.isLiked !== undefined) p.isLiked = updates.isLiked;
        if (updates.isReposted !== undefined) p.isReposted = updates.isReposted;
        if (updates.sentiment !== undefined) p.sentiment = updates.sentiment;
        if (updates.sentimentScore !== undefined) p.sentimentScore = updates.sentimentScore;
        
        if (updates._count) {
          p._count = { ...p._count, ...updates._count };
        }
      }
      
      if (p.repostOf && p.repostId === postId) {
        const r = p.repostOf;
        if (updates.isLiked !== undefined) r.isLiked = updates.isLiked;
        if (updates.isReposted !== undefined) r.isReposted = updates.isReposted;
        if (updates.sentiment !== undefined) r.sentiment = updates.sentiment;
        
        if (updates._count) {
          r._count = { ...r._count, ...updates._count };
        }
      }
    };

    posts.value.forEach(updateTarget);
    myPosts.value.forEach(updateTarget);
    
    const profileStore = getProfileStore();
    if (profileStore) {
      profileStore.userPosts.forEach(updateTarget);
      profileStore.userReplies.forEach(updateTarget);
      profileStore.userReposts.forEach(updateTarget);
      profileStore.userLikedPosts.forEach(updateTarget);
    }
  };

  const updateUserInPosts = (userId: number, updates: any) => {
    const updateAuthor = (post: Post) => {
      if (post.authorId === userId) {
        post.author = { ...post.author, ...updates };
      }
      if (post.repostOf && post.repostOf.authorId === userId) {
        post.repostOf.author = { ...post.repostOf.author, ...updates };
      }
      return post;
    };

    posts.value = posts.value.map(updateAuthor);
    myPosts.value = myPosts.value.map(updateAuthor);
    
    const profileStore = getProfileStore();
    if (profileStore) {
      profileStore.userPosts = profileStore.userPosts.map(updateAuthor);
      profileStore.userReplies = profileStore.userReplies.map(updateAuthor);
      profileStore.userReposts = profileStore.userReposts.map(updateAuthor);
      profileStore.userLikedPosts = profileStore.userLikedPosts.map(updateAuthor);
    }
  };

  const refreshSentiment = async (postId: number) => {
    const response = await apiClient.post(`/posts/${postId}/refresh-sentiment`);
    updatePostLocally(postId, response.data);
    return response.data;
  };

  const resetCategory = () => {
    currentCategory.value = null;
  };

  const postCreatedCallbacks: Array<() => void> = [];
  const onPostCreated = (cb: () => void) => {
    postCreatedCallbacks.push(cb);
  };
  const notifyPostCreated = () => {
    postCreatedCallbacks.forEach((cb) => cb());
  };

  return {
    posts,
    myPosts,
    currentCategory,
    loading,
    error,
    fetchPosts,
    fetchPostsByCategory,
    fetchMyPosts,
    fetchUserReposts,
    toggleRepost,
    createPost,
    fetchThread,
    deletePost,
    updatePost,
    updatePostLocally,
    updateUserInPosts,
    refreshSentiment,
    resetCategory,
    onPostCreated,
    notifyPostCreated,
  };
});
