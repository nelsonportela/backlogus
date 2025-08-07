import { onMounted, onUnmounted } from 'vue'

/**
 * Composable to handle dynamic viewport height for mobile browsers
 * Addresses the issue where mobile browser UI (address bar, etc.) 
 * causes viewport height to change when scrolling
 */
export function useViewportHeight() {
  const setViewportHeight = () => {
    // Calculate the actual viewport height
    const vh = window.innerHeight * 0.01
    
    // Set CSS custom property for use in styles
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  const handleResize = () => {
    // Debounce the resize event to avoid excessive calls
    clearTimeout(window.viewportResizeTimeout)
    window.viewportResizeTimeout = setTimeout(setViewportHeight, 100)
  }

  onMounted(() => {
    // Set initial viewport height
    setViewportHeight()
    
    // Listen for viewport changes
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      // Small delay for orientation change to complete
      setTimeout(setViewportHeight, 500)
    })
    
    // Handle iOS Safari specific viewport changes
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', setViewportHeight)
    }
  })

  onUnmounted(() => {
    // Clean up event listeners
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', setViewportHeight)
    
    if ('visualViewport' in window) {
      window.visualViewport.removeEventListener('resize', setViewportHeight)
    }
    
    clearTimeout(window.viewportResizeTimeout)
  })

  return {
    setViewportHeight
  }
}
