import { defineStore } from "pinia";
import { mediaApi } from "@/services/api";
import { ref } from "vue";
import { getStatusOptions } from "@/composables/useStatusOptions";

export const useMediaStore = defineStore("media", () => {
  // Get unified statistics across all media types
  const getStats = async (mediaType = null) => {
    try {
      const response = await mediaApi.getStats(mediaType);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  // Get stats for specific media type
  const getGameStats = async () => {
    return await getStats("games");
  };

  const getMovieStats = async () => {
    return await getStats("movies");
  };

  const getShowStats = async () => {
    return await getStats("shows");
  };

  const getBookStats = async () => {
    return await getStats("books");
  };

  // Media type configuration
  const mediaTypes = {
    games: {
      name: "Games",
      icon: "gamepad",
      statuses: getStatusOptions("game"),
      route: "games",
    },
    movies: {
      name: "Movies",
      icon: "film",
      statuses: getStatusOptions("movie"),
      route: "movies",
    },
    shows: {
      name: "TV Shows",
      icon: "tv",
      statuses: getStatusOptions("show"),
      route: "shows",
    },
    books: {
      name: "Books",
      icon: "book",
      statuses: getStatusOptions("book"),
      route: "books",
    },
  };

  // Get media type configuration
  const getMediaTypeConfig = (mediaType) => {
    return mediaTypes[mediaType] || null;
  };

  // Get all implemented media types
  const getImplementedMediaTypes = () => {
    // Now games, movies, and shows are implemented
    return ["games", "movies", "shows"];
  };

  // Get all planned media types
  const getAllMediaTypes = () => {
    return Object.keys(mediaTypes);
  };

  // --- Sidebar menu options (reactive) ---
  const enabledMenuOptions = ref(["games", "movies", "tv", "books"]);

  function reloadEnabledMenuOptions() {
    if (typeof window === "undefined") return;
    
    // First try to get from localStorage (for immediate access)
    const stored = localStorage.getItem("media_tracker_preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.menu_options)) {
          enabledMenuOptions.value = parsed.menu_options;
          return;
        }
      } catch {
        // Ignore JSON parse errors and continue to default
      }
    }
    
    // Default fallback
    enabledMenuOptions.value = ["games", "movies", "tv", "books"];
  }

  // Initialize on load
  reloadEnabledMenuOptions();

  return {
    // Methods
    getStats,
    getGameStats,
    getMovieStats,
    getShowStats,
    getBookStats,
    getMediaTypeConfig,
    getImplementedMediaTypes,
    getAllMediaTypes,

    // Configuration
    mediaTypes,

    // Sidebar menu options
    enabledMenuOptions,
    reloadEnabledMenuOptions,
  };
});
