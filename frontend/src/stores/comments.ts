import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Comment } from "@/types";

export const useCommentsStore = defineStore("comments", () => {
  const comments = ref<Comment[]>([]);
  const loading = ref(false);
  const lastAddedCommentId = ref<string | null>(null);
  const lastDeletedCommentId = ref<string | null>(null);

  const fetchComments = async (postId: string) => {
    loading.value = true;
    try {
      const response = await apiClient.get<Comment[]>(
        `/comments/post/${postId}`,
      );
      comments.value = response.data;
    } catch (error) {
      console.error("Comments fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createComment = async (postId: string, content: string) => {
    loading.value = true;
    try {
      const response = await apiClient.post<Comment>(
        `/comments/post/${postId}`,
        {
          content,
        },
      );
      comments.value.unshift(response.data);
      lastAddedCommentId.value = response.data.id;
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  const deleteComment = async (commentId: string) => {
    loading.value = true;
    try {
      await apiClient.delete(`/comments/${commentId}`);
      comments.value = comments.value.filter((c) => c.id !== commentId);
      lastDeletedCommentId.value = commentId;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  return {
    comments,
    loading,
    lastAddedCommentId,
    lastDeletedCommentId,
    fetchComments,
    createComment,
    deleteComment,
  };
});
