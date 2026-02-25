import { defineStore } from "pinia";
import apiClient from "@/api/client";

export const useFollowStore = defineStore("follow", () => {
  const toggleFollow = async (userId: number) => {
    try {
      const response = await apiClient.post(`/follow/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const getFollowers = async (userId: number) => {
    try {
      const response = await apiClient.get(`/follow/followers/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const getFollowing = async (userId: number) => {
    try {
      const response = await apiClient.get(`/follow/following/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const checkIfFollowing = async (userId: number) => {
    try {
      const response = await apiClient.get(`/follow/check/${userId}`);
      return response.data.following;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  return {
    toggleFollow,
    getFollowers,
    getFollowing,
    checkIfFollowing,
  };
});
