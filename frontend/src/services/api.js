import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    /* global localStorage */
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      /* global window */
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Games API methods
export const gamesApi = {
  search: (query) => api.get(`/games/search?q=${encodeURIComponent(query)}`),
  getUserGames: () => api.get("/games/user"),
  addGame: (gameData) => api.post("/games", gameData),
  updateGame: (gameId, updateData) => api.patch(`/games/${gameId}`, updateData),
  removeGame: (gameId) => api.delete(`/games/${gameId}`),
  getGameDetails: (igdbId) => api.get(`/games/details/${igdbId}`),
};

// Auth API methods
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

export default api;
