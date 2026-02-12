import { useEffect, useRef, useState } from 'react';

interface UseDragToScrollOptions {
  /**
   * Scroll speed multiplier. Higher values = faster scrolling.
   * @default 2
   */
  scrollSpeed?: number;
  /**
   * Whether to enable drag scrolling
   * @default true
   */
  enabled?: boolean;
}

/**
 * Custom hook for enabling drag-to-scroll functionality on horizontal/vertical scrollable containers.
 * Returns ref and event handlers to attach to your scrollable element.
 *
 * @param options - Configuration options for the drag scroll behavior
 * @returns Object containing ref and event handlers for mouse and touch events
 *
 * @example
 * ```tsx
 * const { ref, handlers } = useDragToScroll();
 *
 * return (
 *   <div
 *     ref={ref}
 *     className="overflow-x-auto cursor-grab active:cursor-grabbing"
 *     {...handlers}
 *   >
 *     {items.map(item => <Item key={item.id} />)}
 *   </div>
 * );
 * ```
 */
export function useDragToScroll(options: UseDragToScrollOptions = {}) {
  const { scrollSpeed = 2, enabled = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * scrollSpeed;
      containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      if (!containerRef.current) return;
      setIsDragging(false);
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.userSelect = 'auto';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, scrollLeft, scrollSpeed, enabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled || !containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing';
    containerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    if (!enabled || !containerRef.current) return;
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';
    containerRef.current.style.userSelect = 'auto';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled || !containerRef.current) return;
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * scrollSpeed;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return {
    ref: containerRef,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
    },
  };
}
