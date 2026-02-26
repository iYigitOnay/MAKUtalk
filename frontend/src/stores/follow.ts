import { defineStore } from 'pinia';
import apiClient from '@/api/client';

export const useFollowStore = defineStore('follow', {
  state: () => ({
    loading: false,
    pendingRequests: [] as any[],
  }),
  actions: {
    async toggleFollow(userId: number) {
      const res = await apiClient.post(`/follow/${userId}`);
      return res.data;
    },
    async getFollowers(userId: number) {
      const res = await apiClient.get(`/follow/followers/${userId}`);
      return res.data;
    },
    async getFollowing(userId: number) {
      const res = await apiClient.get(`/follow/following/${userId}`);
      return res.data;
    },
    async checkFollowStatus(userId: number) {
      const res = await apiClient.get(`/follow/check/${userId}`);
      return res.data;
    },
    async fetchPendingRequests() {
      this.loading = true;
      try {
        const res = await apiClient.get('/follow/requests');
        this.pendingRequests = res.data;
      } finally {
        this.loading = false;
      }
    },
    async acceptRequest(requestId: number) {
      await apiClient.post(`/follow/requests/${requestId}/accept`);
      this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
    },
    async rejectRequest(requestId: number) {
      await apiClient.post(`/follow/requests/${requestId}/reject`);
      this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
    }
  }
});
