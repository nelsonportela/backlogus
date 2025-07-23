// Composable for status options for all media types
// Usage: import { getStatusOptions } from '@/composables/useStatusOptions'

export function getStatusOptions(mediaType) {
  switch (mediaType) {
    case "game":
      return [
        { value: "want_to_play", label: "Want to Play" },
        { value: "playing", label: "Playing" },
        { value: "completed", label: "Completed" },
        { value: "dropped", label: "Dropped" },
      ];
    case "movie":
      return [
        { value: "watching", label: "Watching" },
        { value: "watched", label: "Watched" },
        { value: "want_to_watch", label: "Want to Watch" },
        { value: "dropped", label: "Dropped" },
      ];
    case "book":
      return [
        { value: "want_to_read", label: "Want to Read" },
        { value: "reading", label: "Reading" },
        { value: "read", label: "Read" },
        { value: "dropped", label: "Dropped" },
      ];
    case "show":
      return [
        { value: "want_to_watch", label: "Want to Watch" },
        { value: "watching", label: "Watching" },
        { value: "watched", label: "Watched" },
        { value: "dropped", label: "Dropped" },
      ];
    default:
      return [
        { value: "want", label: "Want" },
        { value: "current", label: "Current" },
        { value: "completed", label: "Completed" },
      ];
  }
}
