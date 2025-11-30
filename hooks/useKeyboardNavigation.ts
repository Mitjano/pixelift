import { useCallback, useEffect, useRef, useState } from 'react';

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  isOpen: boolean;
  loop?: boolean;
}

export function useKeyboardNavigation({
  itemCount,
  onSelect,
  onEscape,
  isOpen,
  loop = true,
}: UseKeyboardNavigationOptions) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset active index when menu closes
  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((prev) => {
            if (prev < itemCount - 1) return prev + 1;
            return loop ? 0 : prev;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev) => {
            if (prev > 0) return prev - 1;
            if (prev === -1) return itemCount - 1;
            return loop ? itemCount - 1 : prev;
          });
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeIndex >= 0 && onSelect) {
            onSelect(activeIndex);
          }
          break;

        case 'Escape':
          event.preventDefault();
          if (onEscape) {
            onEscape();
          }
          break;

        case 'Tab':
          // Allow normal tab behavior but close menu
          if (onEscape) {
            onEscape();
          }
          break;

        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
      }
    },
    [isOpen, itemCount, activeIndex, onSelect, onEscape, loop]
  );

  // Focus management - scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && containerRef.current) {
      const activeElement = containerRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      ) as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    containerRef,
  };
}
