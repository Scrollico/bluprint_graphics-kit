<script>
  /**
   * Scrolly component that activates elements when they cross the line
   * Based on The Pudding's Hello Stranger implementation
   */

  let {
    root = null,
    linePosition = 0.5, // Position of the intersection line (0 = top, 1 = bottom)
    showLine = false, // Whether to display the intersection line
    value = $bindable(undefined),
    increments = 1,
  } = $props();

  let nodes = [];
  let container = undefined;
  let scrollListener = null;
  let lineElement = null;

  // Create the visible intersection line
  function createDebugLine() {
    if (!showLine) return;

    // Create a line element if it doesn't exist
    if (!lineElement) {
      lineElement = document.createElement('div');
      lineElement.style.position = 'fixed';
      lineElement.style.left = '0';
      lineElement.style.width = '100%';
      lineElement.style.height = '2px';
      lineElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      lineElement.style.zIndex = '9999';
      lineElement.style.pointerEvents = 'none';

      // Add a marker on the right side
      const marker = document.createElement('div');
      marker.style.position = 'absolute';
      marker.style.right = '0';
      marker.style.top = '-4px';
      marker.style.width = '10px';
      marker.style.height = '10px';
      marker.style.backgroundColor = 'red';
      marker.style.borderRadius = '50%';
      lineElement.appendChild(marker);

      document.body.appendChild(lineElement);
    }
  }

  // Remove the debug line
  function removeDebugLine() {
    if (lineElement) {
      document.body.removeChild(lineElement);
      lineElement = null;
    }
  }

  // Check which element is at the line position
  function checkIntersections() {
    if (!nodes.length) return;

    // Get the viewport dimensions
    const viewportHeight = window.innerHeight;
    const rootEl = root || window;
    const rootRect =
      root ?
        root.getBoundingClientRect()
      : {
          top: 0,
          bottom: viewportHeight,
        };

    // Calculate the intersection line position
    const lineY =
      rootRect.top + (rootRect.bottom - rootRect.top) * linePosition;

    // Update the line position if it's being shown
    if (showLine && lineElement) {
      lineElement.style.top = `${lineY}px`;
    }

    // First try to find a direct intersection
    let foundDirect = false;

    // Check each node to see if it directly intersects the line
    for (let i = 0; i < nodes.length; i++) {
      const rect = nodes[i].getBoundingClientRect();

      // If the element directly overlaps with our line, set it as active
      if (rect.top <= lineY && rect.bottom >= lineY) {
        if (value !== i) {
          value = i;
        }
        foundDirect = true;
        break;
      }
    }

    // If no direct intersection, find the closest element
    if (!foundDirect) {
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < nodes.length; i++) {
        const rect = nodes[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const distance = Math.abs(midY - lineY);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      // Only update if we found a close element
      if (value !== closestIndex) {
        value = closestIndex;
      }
    }
  }

  // Set up scroll and resize handling
  function update() {
    if (!nodes.length) return;

    // Clean up existing listeners
    if (scrollListener) {
      (root || window).removeEventListener('scroll', scrollListener, {
        passive: true,
      });
      window.removeEventListener('resize', scrollListener, { passive: true });
    }

    // Create a new scroll listener with throttling for performance
    let lastScrollTime = 0;
    const scrollThreshold = 16; // ~60fps

    scrollListener = () => {
      const now = Date.now();
      if (now - lastScrollTime > scrollThreshold) {
        lastScrollTime = now;
        requestAnimationFrame(checkIntersections);
      }
    };

    // Add event listeners
    (root || window).addEventListener('scroll', scrollListener, {
      passive: true,
    });
    window.addEventListener('resize', scrollListener, { passive: true });

    // Initial check
    setTimeout(checkIntersections, 50);
  }

  // Main effect for setup and cleanup
  $effect(() => {
    if (container) {
      nodes = Array.from(container.querySelectorAll(':scope > *:not(iframe)'));

      if (nodes.length > 0) {
        update();
      }
    }

    // Show debug line if needed
    if (showLine) {
      createDebugLine();
    }

    // Return cleanup function
    return () => {
      if (scrollListener) {
        (root || window).removeEventListener('scroll', scrollListener, {
          passive: true,
        });
        window.removeEventListener('resize', scrollListener, { passive: true });
      }
      removeDebugLine();
    };
  });

  // Handle showLine changes
  $effect(() => {
    if (showLine) {
      createDebugLine();
    } else {
      removeDebugLine();
    }
  });

  // Handle linePosition changes
  $effect(() => {
    if (nodes.length > 0) {
      checkIntersections();
    }
  });
</script>

<div bind:this={container}>
  <slot />
</div>
