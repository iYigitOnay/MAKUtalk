import { defineStore } from 'pinia';
import apiClient from '@/api/client';

export const useCampusStore = defineStore('campus', {
  state: () => ({
    analytics: null as any,
    loading: false,
    interval: 'day',
  }),
  actions: {
    async fetchAnalytics(interval: string) {
      this.loading = true;
      this.interval = interval;
      try {
        const res = await apiClient.get(`/campus/analytics?interval=${interval}`);
        this.analytics = res.data;
      } catch (error) {
        console.error('Analiz verisi alınamadı:', error);
      } finally {
        this.loading = false;
      }
    },
    getAvatarUrl(path: string) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      // API prefix'ini (genelde /api) temizleyerek ana domaine ulaşalım
      baseUrl = baseUrl.replace(/\/api$/, "").replace(/\/$/, "");
      
      const cleanPath = path.replace(/^\//, "");
      if (cleanPath.startsWith("uploads/")) return `${baseUrl}/${cleanPath}`;
      return `${baseUrl}/uploads/avatars/${cleanPath}`;
    }
  }
});
