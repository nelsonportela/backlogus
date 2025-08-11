/* eslint-env browser */
import { onMounted, onUnmounted } from "vue";

/**
 * Composable to handle dynamic viewport height for mobile browsers
 * Addresses the issue where mobile browser UI (address bar, etc.)
 * causes viewport height to change when scrolling
 */
export function useViewportHeight() {
  let initialHeight = 0;

  const setViewportHeight = () => {
    // Get the current viewport height
    const currentHeight = window.innerHeight;

    // For iOS Safari, we want to use the largest height we've seen
    // to avoid the shrinking when the address bar appears
    if (initialHeight === 0 || currentHeight > initialHeight) {
      initialHeight = currentHeight;
    }

    // Use the maximum height for iOS, current height for others
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const heightToUse = isIOS ? initialHeight : currentHeight;

    // Calculate the actual viewport height
    const vh = heightToUse * 0.01;

    // Set CSS custom property for use in styles
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    // Also set a --real-vh for current height (useful for some cases)
    const realVh = currentHeight * 0.01;
    document.documentElement.style.setProperty("--real-vh", `${realVh}px`);
  };

  const handleResize = () => {
    // For iOS, handle resize immediately for better UX
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setViewportHeight();
    } else {
      // Debounce for other browsers
      clearTimeout(window.viewportResizeTimeout);
      window.viewportResizeTimeout = setTimeout(setViewportHeight, 100);
    }
  };

  const handleOrientationChange = () => {
    // Reset initial height on orientation change
    initialHeight = 0;
    // Delay to allow orientation change to complete
    setTimeout(setViewportHeight, 500);
  };

  const handleVisualViewportChange = () => {
    // For newer browsers with Visual Viewport API
    if (window.visualViewport) {
      const vh = window.visualViewport.height * 0.01;
      document.documentElement.style.setProperty("--real-vh", `${vh}px`);

      // Only update main --vh if this is larger than current
      const currentVh = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--vh")
      );
      if (vh > currentVh) {
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      }
    }
  };

  onMounted(() => {
    // Detect iOS and add class to html element
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      document.documentElement.classList.add("is-ios");
    }

    // Detect mobile device for additional optimizations
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    if (isMobile) {
      document.documentElement.classList.add("is-mobile");
    }

    // Set initial viewport height
    setViewportHeight();

    // Listen for viewport changes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    // Handle iOS Safari and other browsers with Visual Viewport API
    if ("visualViewport" in window) {
      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportChange
      );
    }

    // Additional iOS-specific handling
    if (isIOS) {
      // Handle scroll events on iOS to recalculate on address bar hide/show
      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setViewportHeight();
        }, 150);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      // Store cleanup function for unmount
      window._iosScrollCleanup = () => {
        window.removeEventListener("scroll", handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  });

  onUnmounted(() => {
    // Clean up event listeners
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleOrientationChange);

    if ("visualViewport" in window) {
      window.visualViewport.removeEventListener(
        "resize",
        handleVisualViewportChange
      );
    }

    // iOS-specific cleanup
    if (window._iosScrollCleanup) {
      window._iosScrollCleanup();
      delete window._iosScrollCleanup;
    }

    clearTimeout(window.viewportResizeTimeout);
  });

  return {
    setViewportHeight,
  };
}
