import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGamesStore } from '@/stores/games';
import { useMoviesStore } from '@/stores/movies';
import { useShowsStore } from '@/stores/shows';

export function useRandomPickers() {
  const router = useRouter();
  const gamesStore = useGamesStore();
  const moviesStore = useMoviesStore();
  const showsStore = useShowsStore();

  // Modal states
  const showRandomGameModal = ref(false);
  const randomGame = ref(null);
  const showRandomMovieModal = ref(false);
  const randomMovie = ref(null);
  const showRandomShowModal = ref(false);
  const randomShow = ref(null);

  const pickRandomItem = async (activeMediaType, stats) => {
    if (activeMediaType === "all") {
      // Pick from any media type based on what's available
      const breakdown = stats.all.mediaBreakdown || { games: 0, movies: 0, shows: 0 };
      const availableTypes = Object.entries(breakdown)
        .filter(([, count]) => count > 0)
        .map(([type]) => type);
      
      if (availableTypes.length === 0) return;
      
      // Randomly select a media type weighted by collection size
      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      
      if (randomType === "games") {
        await pickRandomGame();
      } else if (randomType === "movies") {
        await pickRandomMovie();
      } else if (randomType === "shows") {
        await pickRandomShow();
      }
    } else if (activeMediaType === "games") {
      await pickRandomGame();
    } else if (activeMediaType === "movies") {
      await pickRandomMovie();
    } else if (activeMediaType === "shows") {
      await pickRandomShow();
    }
  };

  const pickRandomGame = async () => {
    try {
      await gamesStore.getUserItems();
      const games = gamesStore.items.filter(
        (game) => game.status === "BACKLOG" || game.status === "ACTIVE"
      );

      if (games.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * games.length);
      randomGame.value = games[randomIndex];
      showRandomGameModal.value = true;
    } catch {
      // Error picking random game - handle gracefully
    }
  };

  const pickRandomMovie = async () => {
    try {
      await moviesStore.getUserItems();
      const movies = moviesStore.items.filter(
        (movie) => movie.status === "BACKLOG" || movie.status === "ACTIVE"
      );

      if (movies.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * movies.length);
      randomMovie.value = movies[randomIndex];
      showRandomMovieModal.value = true;
    } catch {
      // Error picking random movie - handle gracefully
    }
  };

  const pickRandomShow = async () => {
    try {
      await showsStore.getUserItems();
      const shows = showsStore.items.filter(
        (show) => show.status === "BACKLOG" || show.status === "ACTIVE"
      );

      if (shows.length === 0) {
        return;
      }

      const randomIndex = Math.floor(Math.random() * shows.length);
      randomShow.value = shows[randomIndex];
      showRandomShowModal.value = true;
    } catch {
      // Error picking random show - handle gracefully
    }
  };

  const handleStartPlaying = async (game, onStatsRefresh) => {
    try {
      await gamesStore.updateUserGame(game.id, { status: "ACTIVE" });
      showRandomGameModal.value = false;
      // Refresh stats
      if (onStatsRefresh) await onStatsRefresh();
    } catch {
      // Error updating game status - handle gracefully
    }
  };

  const handleStartWatchingMovie = async (movie, onStatsRefresh) => {
    try {
      await moviesStore.updateUserMovie(movie.id, { status: "ACTIVE" });
      showRandomMovieModal.value = false;
      // Refresh stats
      if (onStatsRefresh) await onStatsRefresh();
    } catch {
      // Error updating movie status - handle gracefully
    }
  };

  const handleStartWatchingShow = async (show, onStatsRefresh) => {
    try {
      await showsStore.updateUserShow(show.id, { status: "ACTIVE" });
      showRandomShowModal.value = false;
      // Refresh stats
      if (onStatsRefresh) await onStatsRefresh();
    } catch {
      // Error updating show status - handle gracefully
    }
  };

  const navigateToGames = () => {
    router.push({ name: "games" });
  };

  const navigateToMovies = () => {
    router.push({ name: "movies" });
  };

  const navigateToShows = () => {
    router.push({ name: "tv" });
  };

  return {
    // Modal states
    showRandomGameModal,
    randomGame,
    showRandomMovieModal,
    randomMovie,
    showRandomShowModal,
    randomShow,
    
    // Picker functions
    pickRandomItem,
    pickRandomGame,
    pickRandomMovie,
    pickRandomShow,
    
    // Handler functions
    handleStartPlaying,
    handleStartWatchingMovie,
    handleStartWatchingShow,
    
    // Navigation functions
    navigateToGames,
    navigateToMovies,
    navigateToShows,
  };
}
