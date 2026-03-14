import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { User, Post } from "@/types";
import { useAuthStore } from "./auth";

export const useProfileStore = defineStore("profile", () => {
  const profileUser = ref<User | null>(null);
  const userPosts = ref<Post[]>([]);
  const userReposts = ref<Post[]>([]);
  const userLikedPosts = ref<Post[]>([]);
  
  const loadingProfile = ref(false);
  const loadingPosts = ref(false);

  const authStore = useAuthStore();

  // Kullanıcı profilini username ile getir
  const fetchProfileByUsername = async (username: string) => {
    loadingProfile.value = true;
    try {
      // Eğer kendi profilimize bakıyorsak ve auth.user varsa onu kullan
      if (authStore.user && authStore.user.username === username) {
         // API'den yine de çekelim ki güncel stats (_count) gelsin
         const response = await apiClient.get<User>(`/users/username/${username}`);
         profileUser.value = response.data;
      } else {
         const response = await apiClient.get<User>(`/users/username/${username}`);
         profileUser.value = response.data;
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      profileUser.value = null;
      throw error;
    } finally {
      loadingProfile.value = false;
    }
  };

  // Kullanıcının postlarını, repostlarını ve beğenilerini getir
  const fetchProfileContent = async (userId: number) => {
    loadingPosts.value = true;
    try {
      const [postsRes, repostsRes, likesRes] = await Promise.all([
        apiClient.get<Post[]>(`/users/${userId}/posts`),
        apiClient.get<Post[]>(`/posts/user/${userId}/reposts`),
        apiClient.get<Post[]>(`/posts/user/${userId}/likes`)
      ]);
      
      userPosts.value = postsRes.data;
      userReposts.value = repostsRes.data;
      userLikedPosts.value = likesRes.data;
    } catch (error) {
      console.error("Profile content fetch error:", error);
    } finally {
      loadingPosts.value = false;
    }
  };

  // Profil Verilerini Temizle (Bambaşka bir profile geçerken)
  const clearProfile = () => {
    profileUser.value = null;
    userPosts.value = [];
    userReposts.value = [];
    userLikedPosts.value = [];
  };

  // Takip Etme / Takipten Çıkma anında lokal state güncellemesi
  const updateFollowStateLocally = (isFollowingNow: boolean, isPrivate: boolean) => {
    if (!profileUser.value) return;
    
    if (profileUser.value._count) {
       profileUser.value._count.followers += isFollowingNow ? 1 : -1;
       // Güvenlik: Eksiye düşmemesi için
       profileUser.value._count.followers = Math.max(0, profileUser.value._count.followers);
    }
    
    // Eğer profil gizliyse ve takipten çıktıysak içerikleri gizle
    if (!isFollowingNow && isPrivate) {
       userPosts.value = [];
       userReposts.value = [];
       userLikedPosts.value = [];
    }
  };

  return {
    profileUser,
    userPosts,
    userReposts,
    userLikedPosts,
    loadingProfile,
    loadingPosts,
    fetchProfileByUsername,
    fetchProfileContent,
    clearProfile,
    updateFollowStateLocally
  };
});
