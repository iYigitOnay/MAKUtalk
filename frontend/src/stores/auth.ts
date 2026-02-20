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
  const isAuthenticated = computed(() => !!token.value);

  // Initialize - localStorage'dan token ve user'ı yükle
  const initialize = () => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
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
      user.value = userData;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (error: any) {
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
      throw error.response?.data || error;
    } finally {
      loading.value = false;
    }
  };

  // Logout
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
  };
});
