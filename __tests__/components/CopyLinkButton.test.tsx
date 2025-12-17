import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CopyLinkButton from '@/components/shared/CopyLinkButton';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import toast from 'react-hot-toast';

describe('CopyLinkButton', () => {
  const mockImageId = 'test-image-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://pixelift.pl',
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default text', () => {
      render(<CopyLinkButton imageId={mockImageId} />);
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    it('should render with link icon', () => {
      render(<CopyLinkButton imageId={mockImageId} />);
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply default variant classes', () => {
      render(<CopyLinkButton imageId={mockImageId} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-100');
    });

    it('should apply custom accent color green', () => {
      render(<CopyLinkButton imageId={mockImageId} accentColor="green" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-100');
    });

    it('should apply custom accent color purple', () => {
      render(<CopyLinkButton imageId={mockImageId} accentColor="purple" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-purple-100');
    });

    it('should apply custom accent color gray', () => {
      render(<CopyLinkButton imageId={mockImageId} accentColor="gray" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200');
    });

    it('should apply primary variant', () => {
      render(<CopyLinkButton imageId={mockImageId} variant="primary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should apply outline variant', () => {
      render(<CopyLinkButton imageId={mockImageId} variant="outline" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-blue-500');
    });

    it('should apply custom className', () => {
      render(<CopyLinkButton imageId={mockImageId} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Copy functionality', () => {
    it('should copy share URL to clipboard on click', async () => {
      render(<CopyLinkButton imageId={mockImageId} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://pixelift.pl/share/test-image-123'
        );
      });
    });

    it('should show success toast after copying', async () => {
      render(<CopyLinkButton imageId={mockImageId} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Link copied to clipboard!');
      });
    });

    it('should change text to Copied after copying', async () => {
      render(<CopyLinkButton imageId={mockImageId} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should generate correct URL for different imageId', async () => {
      render(<CopyLinkButton imageId="another-image-456" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://pixelift.pl/share/another-image-456'
        );
      });
    });
  });

  describe('Fallback copy mechanism', () => {
    it('should use fallback when clipboard API fails', async () => {
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard not available')),
        },
        writable: true,
        configurable: true,
      });

      // Mock execCommand
      document.execCommand = vi.fn().mockReturnValue(true);

      render(<CopyLinkButton imageId={mockImageId} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        expect(toast.success).toHaveBeenCalledWith('Link copied to clipboard!');
      });
    });
  });

  describe('Button variants with colors', () => {
    it('should render primary green variant', () => {
      render(<CopyLinkButton imageId={mockImageId} variant="primary" accentColor="green" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('text-white');
    });

    it('should render outline purple variant', () => {
      render(<CopyLinkButton imageId={mockImageId} variant="outline" accentColor="purple" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-purple-500');
      expect(button).toHaveClass('text-purple-600');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<CopyLinkButton imageId={mockImageId} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should have button role', () => {
      render(<CopyLinkButton imageId={mockImageId} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
