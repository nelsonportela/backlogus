import { defineStore } from "pinia";
import { moviesApi } from "../services/api.js";
import { useMediaStoreFactory } from "./useMediaStoreFactory";

export const useMoviesStore = defineStore("movies", () =>
  useMediaStoreFactory(
    {
      search: moviesApi.search,
      getUserItems: moviesApi.getUserMovies,
      addItem: moviesApi.addMovie,
      updateItem: moviesApi.updateMovie,
      removeItem: moviesApi.removeMovie,
      getItemDetails: moviesApi.getMovieDetails,
      getStats: moviesApi.getStats,
    },
    "movie"
  )
);
