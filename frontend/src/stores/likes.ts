import { defineStore } from "pinia";
import apiClient from "@/api/client";
import { usePostsStore } from "./posts";

export const useLikesStore = defineStore("likes", () => {
  const postsStore = usePostsStore();

  const toggleLike = async (postId: string) => {
    console.log(`[LikesStore] toggleLike tetiklendi - PostID: ${postId}`);
    try {
      const response = await apiClient.post(`/likes/${postId}`);
      const { liked, count, targetPostId } = response.data;

      console.log(
        `[LikesStore] Beğeni sonucu: ${liked ? 'BEĞENİLDİ' : 'KALDIRILDI'} | Backend Dönen Sayı: ${count} | Hedef PostID: ${targetPostId}`
      );

      // Backend'in dediği post'u güncelle (redirected original post)
      postsStore.updatePostLocally(targetPostId, {
        isLiked: liked,
        _count: {
          likes: count // Backend'in authoritative sayısını kullan
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(`[LikesStore] Beğeni hatası:`, error);
      throw error.response?.data || error;
    }
  };

  const getPostLikes = async (postId: string) => {
    try {
      const response = await apiClient.get(`/likes/${postId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const checkIfLiked = async (postId: string) => {
    try {
      const response = await apiClient.get(`/likes/${postId}/status`);
      return response.data.liked;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  return {
    toggleLike,
    getPostLikes,
    checkIfLiked,
  };
});
