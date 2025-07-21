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
