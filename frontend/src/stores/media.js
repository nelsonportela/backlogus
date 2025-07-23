import { defineStore } from "pinia";
import { mediaApi } from "@/services/api";

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

  const getBookStats = async () => {
    return await getStats("books");
  };

  // Media type configuration
  const mediaTypes = {
    games: {
      name: "Games",
      icon: "gamepad",
      statuses: [
        { value: "want_to_play", label: "Want to Play", color: "yellow" },
        { value: "playing", label: "Playing", color: "green" },
        { value: "completed", label: "Completed", color: "purple" },
        { value: "dropped", label: "Dropped", color: "red" },
      ],
      route: "games",
    },
    movies: {
      name: "Movies",
      icon: "film",
      statuses: [
        { value: "want_to_watch", label: "Want to Watch", color: "yellow" },
        { value: "watching", label: "Watching", color: "green" },
        { value: "watched", label: "Watched", color: "purple" },
        { value: "dropped", label: "Dropped", color: "red" },
      ],
      route: "movies",
    },
    books: {
      name: "Books",
      icon: "book",
      statuses: [
        { value: "want_to_read", label: "Want to Read", color: "yellow" },
        { value: "reading", label: "Reading", color: "green" },
        { value: "read", label: "Read", color: "purple" },
        { value: "dropped", label: "Dropped", color: "red" },
      ],
      route: "books",
    },
  };

  // Get media type configuration
  const getMediaTypeConfig = (mediaType) => {
    return mediaTypes[mediaType] || null;
  };

  // Get all implemented media types
  const getImplementedMediaTypes = () => {
    // Now both games and movies are implemented
    return ["games", "movies"];
  };

  // Get all planned media types
  const getAllMediaTypes = () => {
    return Object.keys(mediaTypes);
  };

  return {
    // Methods
    getStats,
    getGameStats,
    getMovieStats,
    getBookStats,
    getMediaTypeConfig,
    getImplementedMediaTypes,
    getAllMediaTypes,

    // Configuration
    mediaTypes,
  };
});
