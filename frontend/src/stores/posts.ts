import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Post } from "@/types";

export const usePostsStore = defineStore("posts", () => {
  const posts = ref<Post[]>([]);
  const myPosts = ref<Post[]>([]);
  const loading = ref(false);
  const currentCategory = ref<number | null>(null);

  // Tüm postları getir
  const fetchPosts = async (currentUserId?: number) => {
    loading.value = true;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>("/posts", { params });
      posts.value = response.data;
    } catch (error) {
      console.error("Posts fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Kategoriye göre postları getir
  const fetchPostsByCategory = async (categoryId: number, currentUserId?: number) => {
    loading.value = true;
    currentCategory.value = categoryId;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>(
        `/posts/category/${categoryId}`,
        {
          params,
        },
      );
      posts.value = response.data;
    } catch (error) {
      console.error("Posts by category fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Kendi postlarını getir
  const fetchMyPosts = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get<Post[]>("/posts/my-posts");
      myPosts.value = response.data;
    } catch (error) {
      console.error("My posts fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Kullanıcının repostlarını getir (Remakü Sekmesi için)
  const fetchUserReposts = async (userId: number, currentUserId?: number) => {
    loading.value = true;
    try {
      const params = currentUserId ? { currentUserId } : {};
      const response = await apiClient.get<Post[]>(`/posts/user/${userId}/reposts`, { params });
      return response.data;
    } catch (error) {
      console.error("User reposts fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Repost İşlemi (Remakü)
  const toggleRepost = async (postId: number) => {
    try {
      const response = await apiClient.post<{ reposted: boolean; post?: Post; message: string }>(
        `/posts/${postId}/repost`
      );
      return response.data;
    } catch (error) {
      console.error("Toggle repost error:", error);
      throw error;
    }
  };

  // Post oluştur
  const createPost = async (
    content: string,
    published = true,
    categoryId?: number,
  ) => {
    loading.value = true;
    try {
      const response = await apiClient.post<Post>("/posts", {
        content,
        published,
        categoryId,
      });
      posts.value.unshift(response.data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Post sil
  const deletePost = async (postId: number) => {
    loading.value = true;
    try {
      await apiClient.delete(`/posts/${postId}`);
      posts.value = posts.value.filter((p) => p.id !== postId);
      myPosts.value = myPosts.value.filter((p) => p.id !== postId);
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Post güncelle
  const updatePost = async (
    postId: number,
    content: string,
    categoryId?: number,
  ) => {
    loading.value = true;
    try {
      const response = await apiClient.patch<Post>(`/posts/${postId}`, {
        content,
        categoryId,
      });
      const index = posts.value.findIndex((p) => p.id === postId);
      if (index !== -1) posts.value[index] = response.data;

      const myIndex = myPosts.value.findIndex((p) => p.id === postId);
      if (myIndex !== -1) myPosts.value[myIndex] = response.data;

      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Post'u local state'te güncelle (tüm eşleşmeleri bul ve güncelle)
  const updatePostLocally = (postId: number, updates: any, arrays: Post[][] = [posts.value, myPosts.value]) => {
    const updateInArray = (arr: Post[]) => {
      if (!arr) return;
      arr.forEach((p, index) => {
        if (p.id === postId || p.repostId === postId) {
          if (p.id === postId) {
            const newCount = updates._count ? { ...p._count, ...updates._count } : p._count;
            arr[index] = { ...p, ...updates, _count: newCount };
          } else if (p.repostOf && p.repostId === postId) {
            const newInnerCount = updates._count ? { ...p.repostOf._count, ...updates._count } : p.repostOf._count;
            arr[index] = { 
              ...p,
              repostOf: { ...p.repostOf, ...updates, _count: newInnerCount }
            };
          }
        }
      });
    };
    arrays.forEach(updateInArray);
  };

  // Kategori filtresini sıfırla
  const resetCategory = () => {
    currentCategory.value = null;
  };

  return {
    posts,
    myPosts,
    loading,
    currentCategory,
    fetchPosts,
    fetchPostsByCategory,
    fetchMyPosts,
    fetchUserReposts,
    toggleRepost,
    createPost,
    deletePost,
    updatePost,
    updatePostLocally,
    resetCategory,
  };
});
