import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  restoreFocusOnDeactivate?: boolean;
}

export function useFocusTrap({
  isActive,
  onEscape,
  restoreFocusOnDeactivate = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when trap activates
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isActive]);

  // Restore focus when trap deactivates
  useEffect(() => {
    if (!isActive && restoreFocusOnDeactivate && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isActive, restoreFocusOnDeactivate]);

  // Focus first focusable element when trap activates
  useEffect(() => {
    if (isActive && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (focusableElements.length > 0) {
        // Small delay to ensure modal is fully rendered
        requestAnimationFrame(() => {
          focusableElements[0].focus();
        });
      }
    }
  }, [isActive]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift+Tab from first element -> go to last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab from last element -> go to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isActive, onEscape]
  );

  // Prevent focus from leaving the container
  useEffect(() => {
    if (!isActive) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        event.stopPropagation();
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [isActive]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isActive]);

  return {
    containerRef,
    handleKeyDown,
  };
}
