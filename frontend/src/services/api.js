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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Games API methods
export const gamesApi = {
  search: (query) => api.get(`/games/search?q=${encodeURIComponent(query)}`),
  getUserGames: () => api.get("/games/user"),
  addGame: (gameData) => api.post("/games", gameData),
  updateGame: (gameId, updateData) => api.patch(`/games/${gameId}`, updateData),
  removeGame: (gameId) => api.delete(`/games/${gameId}`),
  getGameDetails: (igdbId) => api.get(`/games/details/${igdbId}`),
  getStats: () => api.get("/games/stats"),
};

// Movies API methods
export const moviesApi = {
  search: (query) => api.get(`/movies/search?q=${encodeURIComponent(query)}`),
  getUserMovies: () => api.get("/movies/user"),
  addMovie: (movieData) => api.post("/movies", movieData),
  updateMovie: (movieId, updateData) =>
    api.patch(`/movies/${movieId}`, updateData),
  removeMovie: (movieId) => api.delete(`/movies/${movieId}`),
  getMovieDetails: (tmdbId) => api.get(`/movies/details/${tmdbId}`),
  getStats: () => api.get("/movies/stats"),
};

// Media API methods (unified across all media types)
export const mediaApi = {
  getStats: (mediaType = null) => {
    const params = mediaType ? `?mediaType=${mediaType}` : "";
    return api.get(`/media/stats${params}`);
  },
};

// Auth API methods
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

// User API methods
export const userApi = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (userData) => api.patch("/user/profile", userData),
  changePassword: (passwordData) => api.patch("/user/password", passwordData),
  getApiCredentials: () => api.get("/user/api-credentials"),
  saveApiCredentials: (provider, credentials) =>
    api.put(`/user/api-credentials/${provider}`, credentials),
  deleteApiCredentials: (provider) =>
    api.delete(`/user/api-credentials/${provider}`),
};

export default api;
