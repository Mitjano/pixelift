import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next-intl before importing component
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'welcomeBack': 'Welcome back',
      'manageAccount': 'Manage your account',
      'stats.creditsRemaining': 'Credits remaining',
      'stats.imagesProcessed': 'Images processed',
      'stats.currentPlan': 'Current plan',
      'plans.free': 'Free',
      'tools.title': 'Featured Tools',
      'tools.available': 'Tools available',
      'tools.credits': 'credits',
      'tools.free': 'Free',
      'tools.startUsing': 'Start using',
      'tools.upscaler.name': 'Upscaler',
      'tools.upscaler.description': 'Enlarge images without quality loss',
      'tools.bgRemover.name': 'Background Remover',
      'tools.bgRemover.description': 'Remove background from images',
      'tools.objectRemoval.name': 'Object Removal',
      'tools.objectRemoval.description': 'Remove unwanted objects',
      'tools.colorize.name': 'Colorize',
      'tools.colorize.description': 'Add color to B&W photos',
      'tools.restore.name': 'Restore',
      'tools.restore.description': 'Restore old photos',
      'tools.bgGenerator.name': 'BG Generator',
      'tools.bgGenerator.description': 'Generate backgrounds',
      'tools.compressor.name': 'Compressor',
      'tools.compressor.description': 'Compress images',
      'tools.packshot.name': 'Packshot',
      'tools.packshot.description': 'Product photos',
      'tools.expand.name': 'Expand',
      'tools.expand.description': 'Expand image canvas',
      'tools.inpainting.name': 'Inpainting',
      'tools.inpainting.description': 'Edit with AI',
      'tools.reimagine.name': 'Reimagine',
      'tools.reimagine.description': 'Reimagine images',
      'tools.styleTransfer.name': 'Style Transfer',
      'tools.styleTransfer.description': 'Apply artistic styles',
      'tools.structureControl.name': 'Structure Control',
      'tools.structureControl.description': 'Control image structure',
      'quickActions.title': 'Quick Actions',
      'quickActions.imageHistory': 'Image History',
      'quickActions.billing': 'Billing',
      'quickActions.apiKeys': 'API Keys',
      'quickActions.settings': 'Settings',
      'quickActions.getMoreCredits': 'Get more credits',
      'activity.title': 'Recent Activity',
      'activity.noActivity': 'No activity yet',
      'activity.noActivityDesc': 'Start using tools to see your activity',
      'activity.tryUpscaler': 'Try Upscaler',
      'activity.credits': 'credits',
    };
    return translations[key] || key;
  },
}));

// Mock next-auth with authenticated session
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock WelcomeModal
vi.mock('@/components/WelcomeModal', () => ({
  default: ({ userName, onClose }: { userName: string; onClose: () => void }) => (
    <div data-testid="welcome-modal">
      <span>Welcome {userName}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

import DashboardPage from '@/app/[locale]/dashboard/page';
import { useSession } from 'next-auth/react';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('DashboardPage', () => {
  const mockSession = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  const mockStats = {
    totalImages: 42,
    credits: 100,
    role: 'user',
    toolsAvailable: 13,
    upscalerUsage: { count: 10, credits: 20 },
    bgRemovalUsage: { count: 5, credits: 5 },
    mostUsedTool: 'upscaler',
    recentActivity: [
      { id: '1', type: 'Image Upscaler', creditsUsed: 2, date: '2024-12-15T10:00:00Z' },
      { id: '2', type: 'Background Remover', creditsUsed: 1, date: '2024-12-14T10:00:00Z' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('true'); // Welcome already shown

    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading spinner when session is loading', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<DashboardPage />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();
    });
  });

  describe('Unauthenticated state', () => {
    it('should return null when unauthenticated', () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(<DashboardPage />);

      // Component returns null for unauthenticated
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Authenticated state', () => {
    it('should display welcome message with user name', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
        expect(screen.getByText(/John/)).toBeInTheDocument();
      });
    });

    it('should fetch dashboard stats on mount', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/stats');
      });
    });

    it('should display credits count', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Credits remaining')).toBeInTheDocument();
      });
    });

    it('should display total images processed', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Images processed')).toBeInTheDocument();
      });
    });

    it('should display current plan', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByText('Current plan')).toBeInTheDocument();
      });
    });

    it('should display tools available count', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('13')).toBeInTheDocument();
        expect(screen.getByText('Tools available')).toBeInTheDocument();
      });
    });
  });

  describe('Featured tools', () => {
    it('should display featured tools section', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Featured Tools')).toBeInTheDocument();
      });
    });

    it('should display Upscaler tool', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        const upscalerElements = screen.getAllByText('Upscaler');
        expect(upscalerElements.length).toBeGreaterThan(0);
      });
    });

    it('should display Background Remover tool', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        const bgRemoverElements = screen.getAllByText('Background Remover');
        expect(bgRemoverElements.length).toBeGreaterThan(0);
      });
    });

    it('should display Object Removal tool', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        const objectRemovalElements = screen.getAllByText('Object Removal');
        expect(objectRemovalElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Quick actions', () => {
    it('should display quick actions section', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });
    });

    it('should display Image History action', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Image History')).toBeInTheDocument();
      });
    });

    it('should display Billing action', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Billing')).toBeInTheDocument();
      });
    });

    it('should display API Keys action', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('API Keys')).toBeInTheDocument();
      });
    });

    it('should display Settings action', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Recent activity', () => {
    it('should display recent activity section', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    it('should display activity items when available', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Image Upscaler')).toBeInTheDocument();
      });
    });

    it('should display no activity message when empty', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockStats, recentActivity: [] }),
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('No activity yet')).toBeInTheDocument();
      });
    });
  });

  describe('Low credits warning', () => {
    it('should show get more credits link when credits are low', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockStats, credits: 3 }),
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Get more credits/)).toBeInTheDocument();
      });
    });

    it('should not show warning when credits are sufficient', async () => {
      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Get more credits/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Welcome modal', () => {
    it('should not show welcome modal if already shown', async () => {
      localStorageMock.getItem.mockReturnValue('true');

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('welcome-modal')).not.toBeInTheDocument();
      });
    });

    it('should show welcome modal for new users', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ emailSent: true }),
        });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId('welcome-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      render(<DashboardPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
