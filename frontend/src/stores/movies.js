import { defineStore } from "pinia";
import { ref } from "vue";
import { moviesApi } from "../services/api.js";

export const useMoviesStore = defineStore("movies", () => {
  const movies = ref([]);
  const searchResults = ref([]);
  const loading = ref(false);
  const searchError = ref(null);

  const searchMovies = async (query) => {
    if (!query.trim()) {
      searchResults.value = [];
      searchError.value = null;
      return;
    }

    loading.value = true;
    searchError.value = null;
    try {
      const response = await moviesApi.search(query);
      searchResults.value = response.data;
    } catch (error) {
      searchResults.value = [];
      searchError.value =
        error.response?.data?.message || "Failed to search movies";
    } finally {
      loading.value = false;
    }
  };

  const getUserMovies = async () => {
    loading.value = true;
    try {
      const response = await moviesApi.getUserMovies();
      movies.value = response.data;
    } catch {
      // Silently fail - errors should be handled by UI components
    } finally {
      loading.value = false;
    }
  };

  const addMovie = async (movieData) => {
    try {
      const response = await moviesApi.addMovie(movieData);
      movies.value.push(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add movie",
      };
    }
  };

  const updateMovieStatus = async (id, status) => {
    try {
      const response = await moviesApi.updateMovie(id, { status });
      const index = movies.value.findIndex((movie) => movie.id === id);
      if (index !== -1) {
        movies.value[index] = response.data;
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update movie status",
      };
    }
  };

  const updateMovieQuickReview = async (id, quickReview) => {
    try {
      const response = await moviesApi.updateMovie(id, { quickReview });
      const index = movies.value.findIndex((movie) => movie.id === id);
      if (index !== -1) {
        movies.value[index] = response.data;
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update movie review",
      };
    }
  };

  const updateMovieDetails = async (id, updateData) => {
    try {
      const response = await moviesApi.updateMovie(id, updateData);
      const index = movies.value.findIndex((movie) => movie.id === id);
      if (index !== -1) {
        movies.value[index] = response.data;
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update movie",
      };
    }
  };

  const removeMovie = async (id) => {
    try {
      await moviesApi.removeMovie(id);
      movies.value = movies.value.filter((movie) => movie.id !== id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to remove movie",
      };
    }
  };

  const getMovieDetails = async (tmdbId) => {
    try {
      const response = await moviesApi.getMovieDetails(tmdbId);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get movie details",
      };
    }
  };

  const getStats = async () => {
    try {
      const response = await moviesApi.getStats();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to get movie statistics",
      };
    }
  };

  return {
    movies,
    searchResults,
    loading,
    searchError,
    searchMovies,
    getUserMovies,
    addMovie,
    updateMovieStatus,
    updateMovieQuickReview,
    updateMovieDetails,
    removeMovie,
    getMovieDetails,
    getStats,
  };
});
