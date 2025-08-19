import { defineStore } from "pinia";
import { ref } from "vue";
import { userApi } from "../services/api.js";

export const useUserStore = defineStore("user", () => {
  const profile = ref(null);
  const apiCredentials = ref([]);
  const loading = ref(false);

  const getProfile = async () => {
    loading.value = true;
    try {
      const response = await userApi.getProfile();
      profile.value = response.data;
      
      // Sync preferences to localStorage for immediate access
      if (profile.value.preferences) {
        localStorage.setItem(
          "media_tracker_preferences",
          JSON.stringify(profile.value.preferences)
        );
        
        // Notify media store to reload menu options
        const { useMediaStore } = await import("./media.js");
        const mediaStore = useMediaStore();
        mediaStore.reloadEnabledMenuOptions();
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch profile",
      };
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await userApi.updateProfile(userData);
      profile.value = { ...profile.value, ...response.data };
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await userApi.changePassword(passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to change password",
      };
    }
  };

  const getApiCredentials = async () => {
    try {
      const response = await userApi.getApiCredentials();
      apiCredentials.value = response.data;
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch API credentials",
      };
    }
  };

  const saveApiCredentials = async (provider, credentials) => {
    try {
      const response = await userApi.saveApiCredentials(provider, credentials);
      // Update local state
      const existingIndex = apiCredentials.value.findIndex(
        (cred) => cred.api_provider === provider
      );

      if (existingIndex >= 0) {
        apiCredentials.value[existingIndex] = response.data;
      } else {
        apiCredentials.value.push(response.data);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to save API credentials",
      };
    }
  };

  const deleteApiCredentials = async (provider) => {
    try {
      const response = await userApi.deleteApiCredentials(provider);
      // Remove from local state
      apiCredentials.value = apiCredentials.value.filter(
        (cred) => cred.provider !== provider
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to delete API credentials",
      };
    }
  };

  const createBackup = async () => {
    try {
      const response = await userApi.createBackup();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create backup",
      };
    }
  };

  const importBackup = async (file) => {
    try {
      const response = await userApi.importBackup(file);
      // Refresh profile after successful import
      await getProfile();
      await getApiCredentials();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to import backup",
      };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await userApi.updatePreferences(preferences);
      
      // Update local profile
      if (profile.value) {
        profile.value.preferences = response.data;
      }
      
      // Sync to localStorage
      localStorage.setItem(
        "media_tracker_preferences",
        JSON.stringify(response.data)
      );
      
      // Notify media store to reload menu options
      const { useMediaStore } = await import("./media.js");
      const mediaStore = useMediaStore();
      mediaStore.reloadEnabledMenuOptions();
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update preferences",
      };
    }
  };

  return {
    profile,
    apiCredentials,
    loading,
    getProfile,
    updateProfile,
    changePassword,
    getApiCredentials,
    saveApiCredentials,
    deleteApiCredentials,
    createBackup,
    importBackup,
    updatePreferences,
  };
});
