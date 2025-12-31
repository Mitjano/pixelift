/**
 * AI Agent State Manager
 *
 * Zarządza stanem sesji agenta:
 * - Przechowywanie sesji w pamięci (dla prototypu)
 * - Przechowywanie w bazie danych (dla produkcji)
 * - Przechowywanie obrazów i wyników
 * - Historia operacji
 */

import type { AgentSession, AgentStep } from './orchestrator';
import type { ToolExecutionResult } from './tools';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Stan obrazu w sesji
 */
export interface ImageState {
  id: string;
  url: string;
  originalUrl?: string;
  format: string;
  width: number;
  height: number;
  size: number;
  createdAt: Date;
  source: 'upload' | 'generated' | 'processed';
  metadata?: Record<string, unknown>;
}

/**
 * Pełny stan sesji z dodatkowymi danymi
 */
export interface FullSessionState extends AgentSession {
  images: Map<string, ImageState>;
  toolResults: Map<string, ToolExecutionResult>;
  lastActivity: Date;
}

/**
 * Opcje zapisu sesji
 */
export interface SaveSessionOptions {
  saveToDatabase?: boolean;
  includeImages?: boolean;
}

/**
 * Provider storage dla sesji
 */
export interface SessionStorageProvider {
  save(sessionId: string, state: FullSessionState): Promise<void>;
  load(sessionId: string): Promise<FullSessionState | null>;
  delete(sessionId: string): Promise<void>;
  listByUser(userId: string): Promise<string[]>;
}

// ============================================================================
// IN-MEMORY STORAGE (dla prototypu)
// ============================================================================

class InMemoryStorage implements SessionStorageProvider {
  private sessions: Map<string, FullSessionState> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  async save(sessionId: string, state: FullSessionState): Promise<void> {
    this.sessions.set(sessionId, state);

    // Aktualizuj mapę użytkownik -> sesje
    const userSet = this.userSessions.get(state.userId) || new Set();
    userSet.add(sessionId);
    this.userSessions.set(state.userId, userSet);
  }

  async load(sessionId: string): Promise<FullSessionState | null> {
    return this.sessions.get(sessionId) || null;
  }

  async delete(sessionId: string): Promise<void> {
    const state = this.sessions.get(sessionId);
    if (state) {
      const userSet = this.userSessions.get(state.userId);
      if (userSet) {
        userSet.delete(sessionId);
      }
    }
    this.sessions.delete(sessionId);
  }

  async listByUser(userId: string): Promise<string[]> {
    const userSet = this.userSessions.get(userId);
    return userSet ? Array.from(userSet) : [];
  }

  // Metody pomocnicze dla in-memory storage
  getSessionCount(): number {
    return this.sessions.size;
  }

  clearAll(): void {
    this.sessions.clear();
    this.userSessions.clear();
  }

  // Automatyczne czyszczenie starych sesji
  cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, state] of this.sessions) {
      if (now - state.lastActivity.getTime() > maxAgeMs) {
        this.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ============================================================================
// STATE MANAGER CLASS
// ============================================================================

export class StateManager {
  private storage: SessionStorageProvider;
  private activeSessions: Map<string, FullSessionState> = new Map();

  constructor(storage?: SessionStorageProvider) {
    this.storage = storage || new InMemoryStorage();
  }

  /**
   * Utwórz nową sesję
   */
  createSession(session: AgentSession): FullSessionState {
    const fullState: FullSessionState = {
      ...session,
      images: new Map(),
      toolResults: new Map(),
      lastActivity: new Date(),
    };

    this.activeSessions.set(session.sessionId, fullState);
    return fullState;
  }

  /**
   * Pobierz aktywną sesję
   */
  getSession(sessionId: string): FullSessionState | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Załaduj sesję z storage
   */
  async loadSession(sessionId: string): Promise<FullSessionState | null> {
    // Najpierw sprawdź aktywne sesje
    const active = this.activeSessions.get(sessionId);
    if (active) {
      return active;
    }

    // Załaduj z storage
    const loaded = await this.storage.load(sessionId);
    if (loaded) {
      this.activeSessions.set(sessionId, loaded);
    }
    return loaded;
  }

  /**
   * Zapisz sesję
   */
  async saveSession(sessionId: string, options?: SaveSessionOptions): Promise<void> {
    const state = this.activeSessions.get(sessionId);
    if (!state) {
      throw new Error(`Session ${sessionId} not found`);
    }

    state.lastActivity = new Date();
    state.updatedAt = new Date();

    if (options?.saveToDatabase !== false) {
      await this.storage.save(sessionId, state);
    }
  }

  /**
   * Aktualizuj stan sesji
   */
  updateSession(sessionId: string, updates: Partial<AgentSession>): FullSessionState | null {
    const state = this.activeSessions.get(sessionId);
    if (!state) {
      return null;
    }

    Object.assign(state, updates, {
      lastActivity: new Date(),
      updatedAt: new Date(),
    });

    return state;
  }

  /**
   * Dodaj krok do sesji
   */
  addStep(sessionId: string, step: AgentStep): void {
    const state = this.activeSessions.get(sessionId);
    if (state) {
      state.steps.push(step);
      state.lastActivity = new Date();
    }
  }

  /**
   * Dodaj obraz do sesji
   */
  addImage(sessionId: string, image: ImageState): void {
    const state = this.activeSessions.get(sessionId);
    if (state) {
      state.images.set(image.id, image);
      state.lastActivity = new Date();
    }
  }

  /**
   * Pobierz obraz z sesji
   */
  getImage(sessionId: string, imageId: string): ImageState | null {
    const state = this.activeSessions.get(sessionId);
    return state?.images.get(imageId) || null;
  }

  /**
   * Pobierz wszystkie obrazy z sesji
   */
  getImages(sessionId: string): ImageState[] {
    const state = this.activeSessions.get(sessionId);
    return state ? Array.from(state.images.values()) : [];
  }

  /**
   * Dodaj wynik narzędzia
   */
  addToolResult(sessionId: string, toolCallId: string, result: ToolExecutionResult): void {
    const state = this.activeSessions.get(sessionId);
    if (state) {
      state.toolResults.set(toolCallId, result);
      state.lastActivity = new Date();
    }
  }

  /**
   * Pobierz wynik narzędzia
   */
  getToolResult(sessionId: string, toolCallId: string): ToolExecutionResult | null {
    const state = this.activeSessions.get(sessionId);
    return state?.toolResults.get(toolCallId) || null;
  }

  /**
   * Usuń sesję
   */
  async deleteSession(sessionId: string): Promise<void> {
    this.activeSessions.delete(sessionId);
    await this.storage.delete(sessionId);
  }

  /**
   * Lista sesji użytkownika
   */
  async getUserSessions(userId: string): Promise<string[]> {
    return this.storage.listByUser(userId);
  }

  /**
   * Wyczyść nieaktywne sesje z pamięci
   */
  cleanupInactiveSessions(maxInactiveMs: number = 30 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, state] of this.activeSessions) {
      if (now - state.lastActivity.getTime() > maxInactiveMs) {
        this.activeSessions.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Pobierz statystyki
   */
  getStats(): {
    activeSessions: number;
    totalImages: number;
    totalSteps: number;
  } {
    let totalImages = 0;
    let totalSteps = 0;

    for (const state of this.activeSessions.values()) {
      totalImages += state.images.size;
      totalSteps += state.steps.length;
    }

    return {
      activeSessions: this.activeSessions.size,
      totalImages,
      totalSteps,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let stateManagerInstance: StateManager | null = null;

/**
 * Pobierz instancję StateManager (singleton)
 */
export function getStateManager(): StateManager {
  if (!stateManagerInstance) {
    stateManagerInstance = new StateManager();
  }
  return stateManagerInstance;
}

/**
 * Resetuj StateManager (dla testów)
 */
export function resetStateManager(): void {
  stateManagerInstance = null;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { InMemoryStorage };
