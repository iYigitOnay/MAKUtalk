import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { User, Post } from "@/types";
import { useAuthStore } from "./auth";

export const useProfileStore = defineStore("profile", () => {
  const profileUser = ref<User | null>(null);
  const userPosts = ref<Post[]>([]);
  const userReplies = ref<Post[]>([]);
  const userReposts = ref<Post[]>([]);
  const userLikedPosts = ref<Post[]>([]);
  
  const loadingProfile = ref(false);
  const loadingPosts = ref(false);

  const authStore = useAuthStore();

  // Kullanıcı profilini username ile getir
  const fetchProfileByUsername = async (username: string) => {
    loadingProfile.value = true;
    try {
      const response = await apiClient.get<User>(`/users/username/${username}`, {
        params: { currentUserId: authStore.user?.id }
      });
      profileUser.value = response.data;
      return response.data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      profileUser.value = null;
      throw error;
    } finally {
      loadingProfile.value = false;
    }
  };

  // Kullanıcının postlarını, yanıtlarını, repostlarını ve beğenilerini getir
  const fetchProfileContent = async (userId: string) => {
    loadingPosts.value = true;
    try {
      const [postsRes, repliesRes, repostsRes, likesRes] = await Promise.all([
        apiClient.get<Post[]>(`/users/${userId}/posts`, { params: { currentUserId: authStore.user?.id } }),
        apiClient.get<Post[]>(`/users/${userId}/replies`, { params: { currentUserId: authStore.user?.id } }),
        apiClient.get<Post[]>(`/posts/user/${userId}/reposts`, { params: { currentUserId: authStore.user?.id } }),
        apiClient.get<Post[]>(`/posts/user/${userId}/likes`, { params: { currentUserId: authStore.user?.id } })
      ]);
      
      userPosts.value = postsRes.data;
      userReplies.value = repliesRes.data;
      userReposts.value = repostsRes.data;
      userLikedPosts.value = likesRes.data;
    } catch (error) {
      console.error("Profile content fetch error:", error);
    } finally {
      loadingPosts.value = false;
    }
  };

  // Profil Verilerini Temizle
  const clearProfile = () => {
    profileUser.value = null;
    userPosts.value = [];
    userReplies.value = [];
    userReposts.value = [];
    userLikedPosts.value = [];
  };

  // Takip Etme / Takipten Çıkma anında lokal state güncellemesi
  const updateFollowStateLocally = (isFollowingNow: boolean, isPrivate: boolean) => {
    if (!profileUser.value) return;
    
    if (profileUser.value._count) {
       profileUser.value._count.followers += isFollowingNow ? 1 : -1;
       profileUser.value._count.followers = Math.max(0, profileUser.value._count.followers);
    }
    
    if (!isFollowingNow && isPrivate) {
       userPosts.value = [];
       userReplies.value = [];
       userReposts.value = [];
       userLikedPosts.value = [];
    }
  };

  // ADMIN & PROFILE ACTIONS
  const blockUser = async (userId: string) => {
    const res = await apiClient.post(`/users/${userId}/block`);
    if (profileUser.value && profileUser.value.id === userId) {
      profileUser.value.isBlocked = !profileUser.value.isBlocked;
    }
    return res.data;
  };

  const banUser = async (userId: string) => {
    const res = await apiClient.post(`/users/${userId}/ban`);
    if (profileUser.value && profileUser.value.id === userId) {
      profileUser.value.isBanned = !profileUser.value.isBanned;
    }
    return res.data;
  };

  const deleteUser = async (userId: string) => {
    await apiClient.delete(`/users/${userId}`);
    if (profileUser.value && profileUser.value.id === userId) {
      clearProfile();
    }
  };

  const fetchAllBadges = async () => {
    const res = await apiClient.get("/users/badges/all");
    return res.data;
  };

  const toggleBadge = async (userId: string, badgeId: string) => {
    const res = await apiClient.post(`/users/${userId}/badges/${badgeId}`);
    return res.data; // { assigned: boolean }
  };

  const reportUser = async (data: { reportedUserId?: string, reportedPostId?: string, reportedCommentId?: string, reason: string, subReason?: string }) => {
    const res = await apiClient.post("/users/report", data);
    return res.data;
  };

  return {
    profileUser,
    userPosts,
    userReplies,
    userReposts,
    userLikedPosts,
    loadingProfile,
    loadingPosts,
    fetchProfileByUsername,
    fetchProfileContent,
    clearProfile,
    updateFollowStateLocally,
    blockUser,
    banUser,
    deleteUser,
    fetchAllBadges,
    toggleBadge,
    reportUser
  };
});
