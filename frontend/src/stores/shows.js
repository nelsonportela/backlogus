import { defineStore } from "pinia";
import { showsApi } from "../services/api.js";
import { useMediaStoreFactory } from "./useMediaStoreFactory";

export const useShowsStore = defineStore("shows", () =>
  useMediaStoreFactory(
    {
      search: showsApi.search,
      getUserItems: showsApi.getUserShows,
      addItem: showsApi.addShow,
      updateItem: showsApi.updateShow,
      removeItem: showsApi.removeShow,
      getItemDetails: showsApi.getShowDetails,
      getStats: showsApi.getStats,
    },
    "show"
  )
);
