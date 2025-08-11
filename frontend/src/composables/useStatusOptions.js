// Composable for status options for all media types
// Maps universal MediaStatus enum values to media-specific display labels
// Usage: import { getStatusOptions } from '@/composables/useStatusOptions'

export function getStatusOptions(mediaType) {
  switch (mediaType) {
    case "game":
      return [
        { value: "BACKLOG", label: "Want to Play" },
        { value: "ACTIVE", label: "Playing" },
        { value: "PAUSED", label: "Paused" },
        { value: "COMPLETED", label: "Completed" },
        { value: "DROPPED", label: "Dropped" },
      ];
    case "movie":
      return [
        { value: "BACKLOG", label: "Want to Watch" },
        { value: "ACTIVE", label: "Watching" },
        { value: "PAUSED", label: "Paused" },
        { value: "COMPLETED", label: "Watched" },
        { value: "DROPPED", label: "Dropped" },
      ];
    case "book":
      return [
        { value: "BACKLOG", label: "Want to Read" },
        { value: "ACTIVE", label: "Reading" },
        { value: "PAUSED", label: "Paused" },
        { value: "COMPLETED", label: "Read" },
        { value: "DROPPED", label: "Dropped" },
      ];
    case "show":
      return [
        { value: "BACKLOG", label: "Want to Watch" },
        { value: "ACTIVE", label: "Watching" },
        { value: "PAUSED", label: "Paused" },
        { value: "COMPLETED", label: "Watched" },
        { value: "DROPPED", label: "Dropped" },
      ];
    default:
      return [
        { value: "BACKLOG", label: "Backlog" },
        { value: "ACTIVE", label: "Active" },
        { value: "PAUSED", label: "Paused" },
        { value: "COMPLETED", label: "Completed" },
        { value: "DROPPED", label: "Dropped" },
      ];
  }
}

/**
 * Gets the display label for a status value for a specific media type
 * @param {string} status - The MediaStatus enum value (ACTIVE, PAUSED, etc.)
 * @param {string} mediaType - The media type (game, movie, book, show)
 * @returns {string} The human-readable label
 */
export function getStatusLabel(status, mediaType) {
  const options = getStatusOptions(mediaType);
  const option = options.find((opt) => opt.value === status);
  return option ? option.label : status;
}

/**
 * Gets all available status values (useful for validation)
 * @returns {string[]} Array of valid MediaStatus enum values
 */
export function getAllStatusValues() {
  return ["ACTIVE", "PAUSED", "COMPLETED", "DROPPED", "BACKLOG"];
}
