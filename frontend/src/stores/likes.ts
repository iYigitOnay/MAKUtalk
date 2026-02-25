import { defineStore } from "pinia";
import apiClient from "@/api/client";

export const useLikesStore = defineStore("likes", () => {
  const toggleLike = async (postId: number) => {
    try {
      const response = await apiClient.post(`/likes/post/${postId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const getPostLikes = async (postId: number) => {
    try {
      const response = await apiClient.get(`/likes/post/${postId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const checkIfLiked = async (postId: number) => {
    try {
      const response = await apiClient.get(`/likes/post/${postId}/check`);
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
