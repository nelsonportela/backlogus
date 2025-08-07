<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Smart Recommendations
      </h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ getRecommendationsSubtitle() }}
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Continue Playing/Watching -->
      <div
        v-if="shouldShowContinuePlaying"
        class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
        <div class="flex items-center mb-2">
          <svg
            class="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="font-medium text-green-800 dark:text-green-200">{{
            getContinueSectionTitle()
          }}</span>
        </div>
        <p class="text-sm text-green-700 dark:text-green-300 mb-2">
          {{ getContinuePlayingMessage() }}
        </p>
        <button
          v-if="currentlyPlaying.length > 0"
          @click="$emit('continue-randomly')"
          class="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
          Pick one for me →
        </button>
        <span v-else class="text-green-500 dark:text-green-400 text-sm italic">
          {{ getEmptyStateMessage() }}
        </span>
      </div>

      <!-- Backlog Suggestion -->
      <div
        v-if="backlogCount > 0"
        class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
        <div class="flex items-center mb-2">
          <svg
            class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path
              d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
          <span class="font-medium text-yellow-800 dark:text-yellow-200"
            >Tackle Your Backlog</span
          >
        </div>
        <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
          {{ backlogCount }} item{{ backlogCount !== 1 ? "s" : "" }} waiting for
          you
        </p>
        <button
          @click="$emit('tackle-backlog')"
          class="text-yellow-600 dark:text-yellow-400 text-sm font-medium hover:underline">
          Start something new →
        </button>
      </div>

      <!-- Discovery Suggestion -->
      <div
        class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div class="flex items-center mb-2">
          <svg
            class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <span class="font-medium text-blue-800 dark:text-blue-200"
            >Discover New</span
          >
        </div>
        <p class="text-sm text-blue-700 dark:text-blue-300 mb-2">
          {{ getDiscoveryMessage() }}
        </p>
        <button
          @click="$emit('navigate-to-discover')"
          class="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
          Explore now →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useMediaTypes } from "@/composables/useMediaTypes";

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
  activeMediaType: {
    type: String,
    required: true,
  },
});

defineEmits(["continue-randomly", "tackle-backlog", "navigate-to-discover"]);

const { getMediaConfig } = useMediaTypes();

// Determine if we should show the "Continue Playing" section
const shouldShowContinuePlaying = computed(() => {
  // Show for all media types (games use "playing", movies/shows use "watching")
  return true; // Always show, but content will be contextual
});

// Smart Recommendations computed properties
const currentlyPlaying = computed(() => {
  const currentStats = props.stats[props.activeMediaType] || props.stats.all;

  if (props.activeMediaType === "games") {
    // For games specifically, filter for "playing" status
    return (currentStats.recentActivity || []).filter(
      (activity) => activity.status === "playing"
    );
  } else if (
    props.activeMediaType === "movies" ||
    props.activeMediaType === "shows"
  ) {
    // For movies/shows specifically, filter for "watching" status
    return (currentStats.recentActivity || []).filter(
      (activity) => activity.status === "watching"
    );
  } else if (props.activeMediaType === "all") {
    // For all media types, filter for playing/watching/reading statuses
    return (currentStats.recentActivity || []).filter(
      (activity) =>
        activity.status === "playing" ||
        activity.status === "watching" ||
        activity.status === "reading"
    );
  } else {
    // Default fallback
    return (currentStats.recentActivity || []).filter(
      (activity) =>
        activity.status === "playing" ||
        activity.status === "watching" ||
        activity.status === "reading"
    );
  }
});

const getContinuePlayingMessage = () => {
  if (currentlyPlaying.value.length === 0) {
    if (props.activeMediaType === "games") {
      return "No games currently being played";
    } else if (props.activeMediaType === "movies") {
      return "No movies currently being watched";
    } else if (props.activeMediaType === "shows") {
      return "No TV shows currently being watched";
    } else if (props.activeMediaType === "all") {
      return "No media currently in progress";
    } else {
      return "Nothing currently in progress";
    }
  }

  const count = currentlyPlaying.value.length;
  if (props.activeMediaType === "games") {
    return `${count} game${count !== 1 ? "s" : ""} in progress`;
  } else if (props.activeMediaType === "movies") {
    return `${count} movie${count !== 1 ? "s" : ""} being watched`;
  } else if (props.activeMediaType === "shows") {
    return `${count} show${count !== 1 ? "s" : ""} being watched`;
  } else if (props.activeMediaType === "all") {
    return `${count} item${count !== 1 ? "s" : ""} in progress`;
  } else {
    return `${count} item${count !== 1 ? "s" : ""} in progress`;
  }
};

const getContinueSectionTitle = () => {
  if (props.activeMediaType === "games") {
    return "Continue Playing";
  } else if (
    props.activeMediaType === "movies" ||
    props.activeMediaType === "shows"
  ) {
    return "Continue Watching";
  } else {
    return "Continue Progress";
  }
};

const getEmptyStateMessage = () => {
  if (props.activeMediaType === "games") {
    return "Start playing a game to see progress here";
  } else if (props.activeMediaType === "movies") {
    return "Start watching a movie to see progress here";
  } else if (props.activeMediaType === "shows") {
    return "Start watching a show to see progress here";
  } else {
    return "Start something new to see progress here";
  }
};

const backlogCount = computed(() => {
  const currentStats = props.stats[props.activeMediaType] || props.stats.all;
  if (props.activeMediaType === "all") {
    // Sum all "want to" statuses across media types
    const gameStats = props.stats.games.statusDistribution || {};
    const movieStats = props.stats.movies.statusDistribution || {};
    const showStats = props.stats.shows.statusDistribution || {};

    return (
      (gameStats.want_to_play || 0) +
      (movieStats.want_to_watch || 0) +
      (showStats.want_to_watch || 0)
    );
  } else {
    const statusDist = currentStats.statusDistribution || {};
    return (
      statusDist.want_to_play ||
      statusDist.want_to_watch ||
      statusDist.want_to_read ||
      0
    );
  }
});

const getRecommendationsSubtitle = () => {
  if (props.activeMediaType === "all") return "Based on all your activity";
  const config = getMediaConfig(props.activeMediaType);
  return `Based on your ${config?.name?.toLowerCase() || "media"} activity`;
};

const getDiscoveryMessage = () => {
  if (props.activeMediaType === "all") {
    return "Explore trending across all media types";
  }
  const config = getMediaConfig(props.activeMediaType);
  const mediaName = config?.name?.toLowerCase() || "content";
  return `Find trending ${mediaName}`;
};
</script>
