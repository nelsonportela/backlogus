import { ref } from "vue";

// Generic API composable for common patterns
export function useApi() {
  const loading = ref(false);
  const error = ref(null);

  const execute = async (apiCall, onSuccess = null, onError = null) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiCall();
      if (onSuccess) {
        onSuccess(response.data);
      }
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      if (onError) {
        onError(err);
      }
      return {
        success: false,
        error: error.value,
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    execute,
  };
}

// Specific games API composable
export function useGamesApi() {
  const api = useApi();

  const searchGames = async (query, onSuccess) => {
    const { gamesApi } = await import("../services/api.js");
    return api.execute(() => gamesApi.search(query), onSuccess);
  };

  const getUserGames = async (onSuccess) => {
    const { gamesApi } = await import("../services/api.js");
    return api.execute(() => gamesApi.getUserGames(), onSuccess);
  };

  const addGame = async (gameData, onSuccess) => {
    const { gamesApi } = await import("../services/api.js");
    return api.execute(() => gamesApi.addGame(gameData), onSuccess);
  };

  const updateGame = async (gameId, updateData, onSuccess) => {
    const { gamesApi } = await import("../services/api.js");
    return api.execute(
      () => gamesApi.updateGame(gameId, updateData),
      onSuccess,
    );
  };

  const removeGame = async (gameId, onSuccess) => {
    const { gamesApi } = await import("../services/api.js");
    return api.execute(() => gamesApi.removeGame(gameId), onSuccess);
  };

  const getGameDetails = async (igdbId, onSuccess) => {
    const { gamesApi } = await import("../services/api.js");
    return api.execute(() => gamesApi.getGameDetails(igdbId), onSuccess);
  };

  return {
    ...api,
    searchGames,
    getUserGames,
    addGame,
    updateGame,
    removeGame,
    getGameDetails,
  };
}
