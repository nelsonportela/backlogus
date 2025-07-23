// Unified media image cache utility
// Usage: await cacheAllMediaImages(mediaType, mediaData)
import imageCacheService from './imageCache.js'

/**
 * Extracts all image URLs for a given media type and media data object.
 * Supports: game, movie, show, book (extend as needed)
 * Returns a flat array of URLs (no nulls).
 */
function extractImageUrls(mediaType, mediaData) {
  if (!mediaData) return [];
  let urls = [];
  switch (mediaType) {
    case 'game':
      urls = [
        mediaData.cover_url || mediaData.coverUrl,
        mediaData.banner_url || mediaData.bannerUrl,
        ...(mediaData.artworks || []),
        ...(mediaData.screenshots || [])
      ];
      break;
    case 'movie':
      urls = [
        mediaData.cover_url || mediaData.coverUrl,
        mediaData.backdrop_url || mediaData.backdropUrl,
        mediaData.poster_url || mediaData.posterUrl
      ];
      break;
    case 'show':
      urls = [
        mediaData.cover_url || mediaData.coverUrl,
        mediaData.backdrop_url || mediaData.backdropUrl,
        mediaData.poster_url || mediaData.posterUrl
      ];
      break;
    case 'book':
      urls = [
        mediaData.cover_url || mediaData.coverUrl,
        mediaData.image_url || mediaData.imageUrl
      ];
      break;
    default:
      urls = [
        mediaData.cover_url || mediaData.coverUrl,
        mediaData.image_url || mediaData.imageUrl
      ];
  }
  return urls.flat().filter(Boolean);
}

/**
 * Caches all images for a media item, given its type and data.
 * Returns a Promise that resolves when all images are cached (or attempted).
 */
export async function cacheAllMediaImages(mediaType, mediaData) {
  const urls = extractImageUrls(mediaType, mediaData);
  if (urls.length > 0) {
    try {
      await imageCacheService.cacheImages(urls);
    } catch (err) {
      // Log but don't throw
      console.warn('Failed to cache some media images:', err);
    }
  }
}
