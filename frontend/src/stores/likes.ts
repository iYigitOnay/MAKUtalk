import { defineStore } from "pinia";
import apiClient from "@/api/client";
import { usePostsStore } from "./posts";

export const useLikesStore = defineStore("likes", () => {
  const postsStore = usePostsStore();

  const toggleLike = async (postId: string) => {
    try {
      const response = await apiClient.post(`/likes/${postId}`);
      const { liked, count } = response.data;

      // Global state'i güncelle
      postsStore.updatePostLocally(postId, {
        isLiked: liked,
        _count: {
          likes: count,
        },
      });

      return response.data;
    } catch (error: any) {
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
