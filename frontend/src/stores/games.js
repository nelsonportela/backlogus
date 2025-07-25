import { defineStore } from "pinia";
import { gamesApi } from "../services/api.js";
import { useMediaStoreFactory } from "./useMediaStoreFactory";

export const useGamesStore = defineStore("games", () =>
  useMediaStoreFactory(
    {
      search: gamesApi.search,
      getUserItems: gamesApi.getUserGames,
      addItem: gamesApi.addGame,
      updateItem: gamesApi.updateGame,
      removeItem: gamesApi.removeGame,
      getItemDetails: gamesApi.getGameDetails,
      getStats: gamesApi.getStats,
    },
    "game"
  )
);
