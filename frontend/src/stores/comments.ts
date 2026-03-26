import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Comment } from "@/types";
import { usePostsStore } from "./posts";

export const useCommentsStore = defineStore("comments", () => {
  const postsStore = usePostsStore();
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
      const newComment = response.data;
      comments.value.unshift(newComment);
      lastAddedCommentId.value = newComment.id;

      // Global state'i güncelle (Yorum sayısını artır)
      const post = [...postsStore.posts, ...postsStore.searchResults].find(p => p.id === postId);
      const currentCount = post?._count?.comments || 0;
      postsStore.updatePostLocally(postId, {
        _count: {
          comments: currentCount + 1
        }
      });

      return newComment;
    } catch (error: any) {
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  const deleteComment = async (commentId: string) => {
    loading.value = true;
    try {
      // Önce yorumu bulup postId'sini alalım
      const comment = comments.value.find(c => c.id === commentId);
      const postId = comment?.postId;

      await apiClient.delete(`/comments/${commentId}`);
      comments.value = comments.value.filter((c) => c.id !== commentId);
      lastDeletedCommentId.value = commentId;

      // Global state'i güncelle (Yorum sayısını azalt)
      if (postId) {
        const post = [...postsStore.posts, ...postsStore.searchResults].find(p => p.id === postId);
        const currentCount = post?._count?.comments || 0;
        postsStore.updatePostLocally(postId, {
          _count: {
            comments: Math.max(0, currentCount - 1)
          }
        });
      }
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
