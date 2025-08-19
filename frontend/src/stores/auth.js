import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token"));
  const user = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem("token", token.value);

      // Set default axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;

      // Load user profile and preferences after successful login
      try {
        const { useUserStore } = await import("./user.js");
        const userStore = useUserStore();
        await userStore.getProfile();
      } catch (profileError) {
        console.warn("Failed to load user profile after login:", profileError);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/register", {
        email,
        password,
      });

      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem("token", token.value);

      // Set default axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;

      // Load user profile and preferences after successful registration
      try {
        const { useUserStore } = await import("./user.js");
        const userStore = useUserStore();
        await userStore.getProfile();
      } catch (profileError) {
        console.warn("Failed to load user profile after registration:", profileError);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("media_tracker_preferences"); // Clear preferences on logout
    delete axios.defaults.headers.common["Authorization"];
  };

  const initializeAuth = () => {
    if (token.value) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
  };
});
