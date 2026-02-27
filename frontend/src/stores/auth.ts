import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/api/client";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  
  // KRITIK: ID'yi number olarak garanti et
  const userId = computed(() => user.value?.id ? Number(user.value.id) : null);

  // Initialize - localStorage'dan token ve user'ı yükle
  const initialize = () => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      token.value = storedToken;
      try {
        const parsedUser = JSON.parse(storedUser);
        // ID'yi number'a çevir
        user.value = {
          ...parsedUser,
          id: Number(parsedUser.id),
        };
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      }
    }
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials,
      );
      const { access_token, user: userData } = response.data;

      token.value = access_token;
      // ID'yi number olarak kaydet
      user.value = {
        ...userData,
        id: Number(userData.id),
      };

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user.value));

      return user.value;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    loading.value = true;
    try {
      const response = await apiClient.post<User>("/users/register", data);
      return response.data;
    } catch (error: any) {
      console.error("Register error:", error);
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Logout - SOCKET TEMİZLİĞİ EKLENDİ
  const logout = () => {
    // 1. Socket disconnect et (eğer varsa)
    if (window.socket && window.socket.connected) {
      console.log("🔌 Disconnecting socket on logout...");
      window.socket.disconnect();
      window.socket = null;
    }

    // 2. State temizle
    user.value = null;
    token.value = null;

    // 3. LocalStorage temizle
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // 4. Axios default header temizle
    delete apiClient.defaults.headers.common["Authorization"];
  };

  // Profile Update - Canlı güncelleme için
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
      localStorage.setItem("user", JSON.stringify(user.value));
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    userId, // Export et
    initialize,
    login,
    register,
    logout,
    updateUser,
  };
});
