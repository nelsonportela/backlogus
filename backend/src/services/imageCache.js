import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ImageCacheService {
  constructor() {
    // Create cache directory in backend/cache/images
    this.cacheDir = path.join(__dirname, '../../cache/images');
    this.ensureCacheDir();
    
    // Rate limiting and retry configuration
    this.downloadQueue = [];
    this.activeDownloads = 0;
    this.maxConcurrentDownloads = 3; // Limit concurrent downloads
    this.downloadDelay = 200; // 200ms delay between downloads
  }

  async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  // Generate a safe filename from URL
  getFilenameFromUrl(url) {
    if (!url) return null;
    
    // Extract filename and extension from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);
    
    // Clean filename - remove unsafe characters
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // If no extension, try to determine from URL or default to .jpg
    if (!path.extname(safeName)) {
      return `${safeName}.jpg`;
    }
    
    return safeName;
  }

  // Download and cache an image with retry logic
  async cacheImage(url, customFilename = null, retries = 2) {
    if (!url) return null;

    try {
      const filename = customFilename || this.getFilenameFromUrl(url);
      const filePath = path.join(this.cacheDir, filename);
      
      // Check if already cached
      try {
        await fs.access(filePath);
        return {
          filename,
          path: filePath,
          cached: true
        };
      } catch {
        // File doesn't exist, need to download
      }

      // Download with timeout and retry logic
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'BackLogus/1.0.0 (Image Cache Service)'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();
          await fs.writeFile(filePath, Buffer.from(buffer));

          return {
            filename,
            path: filePath,
            cached: false,
            size: buffer.byteLength
          };
        } catch (error) {
          if (attempt === retries) {
            // Final attempt failed, but don't spam logs for every failure
            if (attempt > 0) {
              console.warn(`Failed to cache image after ${retries + 1} attempts: ${url} - ${error.message}`);
            }
            return null;
          }
          
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      // Silently handle errors to prevent log spam
      return null;
    }
  }

  // Cache multiple images with rate limiting
  async cacheImages(urls) {
    if (!urls || urls.length === 0) return [];
    
    // Use queued downloads instead of parallel Promise.allSettled
    const results = [];
    for (const url of urls) {
      if (url) {
        const result = await this.queueDownload(url);
        if (result) results.push(result);
      }
    }
    
    return results;
  }

  // Get all cached image info for backup
  async getAllCachedImages() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      const imageInfo = await Promise.all(
        imageFiles.map(async (filename) => {
          const filePath = path.join(this.cacheDir, filename);
          const stats = await fs.stat(filePath);
          const buffer = await fs.readFile(filePath);
          
          return {
            filename,
            size: stats.size,
            data: buffer.toString('base64'), // Convert to base64 for JSON storage
            mimeType: this.getMimeTypeFromExtension(filename)
          };
        })
      );

      return imageInfo;
    } catch (error) {
      console.error('Failed to get cached images:', error);
      return [];
    }
  }

  // Restore images from backup
  async restoreImages(imageData) {
    if (!imageData || imageData.length === 0) return;

    try {
      // Ensure cache directory exists
      await this.ensureCacheDir();

      // Clear existing cache
      const existingFiles = await fs.readdir(this.cacheDir);
      await Promise.all(
        existingFiles.map(file => 
          fs.unlink(path.join(this.cacheDir, file))
        )
      );

      // Restore images from backup
      await Promise.all(
        imageData.map(async (image) => {
          const filePath = path.join(this.cacheDir, image.filename);
          const buffer = Buffer.from(image.data, 'base64');
          await fs.writeFile(filePath, buffer);
        })
      );

      console.log(`Restored ${imageData.length} cached images`);
    } catch (error) {
      console.error('Failed to restore images:', error);
    }
  }

  // Get MIME type from file extension
  getMimeTypeFromExtension(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  // Get local file path for a cached image
  getLocalPath(filename) {
    return path.join(this.cacheDir, filename);
  }

  // Rate-limited queue for downloading images
  async queueDownload(url, filename) {
    return new Promise((resolve) => {
      this.downloadQueue.push({ url, filename, resolve });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeDownloads >= this.maxConcurrentDownloads || this.downloadQueue.length === 0) {
      return;
    }

    this.activeDownloads++;
    const { url, filename, resolve } = this.downloadQueue.shift();

    try {
      const result = await this.cacheImage(url, filename);
      resolve(result);
    } catch (error) {
      resolve(null);
    } finally {
      this.activeDownloads--;
      
      // Small delay between downloads to be respectful to servers
      setTimeout(() => {
        this.processQueue();
      }, this.downloadDelay);
    }
  }

  // Convert external URL to local URL, with smart caching
  async getLocalUrl(externalUrl, baseUrl = 'http://localhost:3001') {
    if (!externalUrl) return null;
    const filename = this.getFilenameFromUrl(externalUrl);
    if (!filename) return externalUrl;
    const localPath = this.getLocalPath(filename);
    
    try {
      await fs.access(localPath);
      // File exists, return local URL
      const isDev = process.env.NODE_ENV !== 'production';
      const base = isDev ? `http://localhost:3001` : '';
      return `${base}/images/${filename}`;
    } catch {
      // File doesn't exist, try to cache it (but don't block the response)
      // Use queued download to prevent overwhelming servers
      this.queueDownload(externalUrl, filename).then(result => {
        // Cache result is handled asynchronously, don't block the response
      }).catch(() => {
        // Silently handle cache failures
      });
      
      // Return external URL immediately as fallback
      return externalUrl;
    }
  }

  // Convert multiple URLs to local URLs, with smart batching
  async getLocalUrls(urls, baseUrl = 'http://localhost:3001') {
    if (!Array.isArray(urls)) return urls;
    
    // Process URLs one by one to prevent overwhelming servers
    const results = [];
    for (const url of urls) {
      try {
        const localUrl = await this.getLocalUrl(url, baseUrl);
        results.push(localUrl);
      } catch (error) {
        results.push(url); // Fallback to original URL
      }
    }
    
    return results;
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      let totalSize = 0;
      for (const file of imageFiles) {
        const stats = await fs.stat(path.join(this.cacheDir, file));
        totalSize += stats.size;
      }

      return {
        totalImages: imageFiles.length,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { totalImages: 0, totalSize: 0, totalSizeMB: '0.00' };
    }
  }
}

export default new ImageCacheService();
