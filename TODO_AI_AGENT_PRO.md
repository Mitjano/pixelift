# AI Agent PRO - Lista Zadań do Implementacji

> **Status:** W trakcie planowania
> **Priorytet:** Wysoki - Flagowa funkcja PixeLift
> **Szacowany czas:** 3-4 tygodnie
> **Ocena kompatybilności:** 6.5/10

---

## 📊 Podsumowanie Analizy Kompatybilności

| Komponent | Status | Ocena | Priorytet |
|-----------|--------|-------|-----------|
| OpenRouter Integration | ⚠️ Częściowy | 5/10 | KRYTYCZNY |
| Tool Use/Function Calling | ❌ Brak | 0/10 | KRYTYCZNY |
| Tools Registry | ❌ Brak | 0/10 | WYSOKI |
| Orchestrator Logic | ❌ Brak | 0/10 | KRYTYCZNY |
| Replicate Integration | ✅ Dobry | 8/10 | Średni |
| Credits System | ✅ Doskonały | 9/10 | Niski |
| Database Schema | ✅ Doskonały | 9/10 | Niski |
| API Routes Pattern | ✅ Dobry | 8/10 | Średni |

---

## 🔴 FAZA 1: Fundament (Tydzień 1)

### 1.1 OpenRouter - Tool Calling Support
**Plik:** `lib/ai-chat/openrouter.ts`

- [ ] Dodać interfejs `Tool` dla function calling
  ```typescript
  interface Tool {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: 'object';
        properties: Record<string, any>;
        required: string[];
      };
    };
  }
  ```

- [ ] Rozszerzyć `ChatCompletionOptions` o:
  - [ ] `tools?: Tool[]`
  - [ ] `tool_choice?: 'auto' | 'required' | { type: 'function'; function: { name: string } }`

- [ ] Rozszerzyć `ChatCompletionResponse` o:
  - [ ] `tool_calls` w message
  - [ ] `finish_reason: 'tool_calls'`

- [ ] Zaktualizować `chatCompletion()` o parametry tools
- [ ] Zaktualizować `chatCompletionStream()` o streaming tool calls
- [ ] Dodać parser dla streaming tool calls
- [ ] Dodać testy dla function calling

### 1.2 Tools Registry
**Plik:** `lib/ai-agent/tools-registry.ts` (NOWY)

- [ ] Stworzyć interfejs `AgentTool`:
  ```typescript
  interface AgentTool {
    id: string;
    name: string;
    category: ToolCategory;
    credits: number;
    requiresImage: boolean;
    outputsImage: boolean;
    endpoint: string;
    description: string;
    aiDescription: string;
    parameters: ToolParameter[];
    canFollowTools?: string[];
  }
  ```

- [ ] Zarejestrować wszystkie 28 narzędzi:

  **Background (5 narzędzi):**
  - [ ] `remove-background` - Usuwanie tła (1 kredyt)
  - [ ] `background-generate` - Generowanie tła AI (3 kredyty)
  - [ ] `background-blur` - Rozmycie tła (1 kredyt)
  - [ ] `background-replace` - Zamiana tła (2 kredyty)
  - [ ] `background-white` - Białe tło (1 kredyt)

  **Enhancement (6 narzędzi):**
  - [ ] `upscale` - Powiększanie (1-2 kredyty)
  - [ ] `enhance` - Ogólna poprawa (1 kredyt)
  - [ ] `denoise` - Redukcja szumu (1 kredyt)
  - [ ] `sharpen` - Wyostrzanie (1 kredyt)
  - [ ] `color-correct` - Korekcja kolorów (1 kredyt)
  - [ ] `face-restore` - Restauracja twarzy (2 kredyty)

  **Creative (6 narzędzi):**
  - [ ] `style-transfer` - Transfer stylu (3 kredyty)
  - [ ] `colorize` - Koloryzacja B&W (1 kredyt)
  - [ ] `sketch` - Efekt szkicu (1 kredyt)
  - [ ] `cartoon` - Efekt kreskówki (2 kredyty)
  - [ ] `vintage` - Efekt vintage (1 kredyt)
  - [ ] `hdr` - Efekt HDR (1 kredyt)

  **Product (4 narzędzia):**
  - [ ] `product-shot` - Zdjęcia produktowe (2-8 kredytów)
  - [ ] `model-swap` - Zamiana modela (3 kredyty)
  - [ ] `shadow-add` - Dodawanie cienia (1 kredyt)
  - [ ] `packshot` - Pack shot (2 kredyty)

  **Generation (4 narzędzia):**
  - [ ] `generate` - Generowanie obrazu (2-5 kredytów)
  - [ ] `inpainting` - Inpainting (3 kredyty)
  - [ ] `outpainting` - Rozszerzanie obrazu (2 kredyty)
  - [ ] `variation` - Warianty obrazu (2 kredyty)

  **Utility (3 narzędzia - DARMOWE):**
  - [ ] `compress` - Kompresja (0 kredytów)
  - [ ] `resize` - Zmiana rozmiaru (0 kredytów)
  - [ ] `format-convert` - Konwersja formatu (0 kredytów)

- [ ] Dodać funkcję `getToolById()`
- [ ] Dodać funkcję `getToolsByCategory()`
- [ ] Dodać funkcję `convertToolsToOpenRouterFormat()`
- [ ] Dodać walidację parametrów narzędzi

---

## 🟠 FAZA 2: Core Logic (Tydzień 2)

### 2.1 Orchestrator Module
**Plik:** `lib/ai-agent/orchestrator.ts` (NOWY)

- [ ] Zaprojektować system prompt dla orchestratora
- [ ] Implementować `generatePlan()`:
  - [ ] Analiza intencji użytkownika
  - [ ] Wybór odpowiednich narzędzi
  - [ ] Sekwencjonowanie kroków
  - [ ] Estymacja kosztów

- [ ] Implementować `validatePlan()`:
  - [ ] Sprawdzenie dostępności narzędzi
  - [ ] Walidacja chain-ability
  - [ ] Sprawdzenie limitów kredytów

- [ ] Implementować `generateAlternatives()`:
  - [ ] Tańsze alternatywy
  - [ ] Szybsze alternatywy
  - [ ] Alternatywne podejścia

- [ ] Dodać interfejs `ExecutionPlan`:
  ```typescript
  interface ExecutionPlan {
    understanding: string;
    steps: ExecutionStep[];
    totalCredits: number;
    estimatedTime: number;
    alternatives?: ExecutionPlan[];
  }
  ```

### 2.2 Plan Executor
**Plik:** `lib/ai-agent/plan-executor.ts` (NOWY)

- [ ] Implementować `executePlan()`:
  - [ ] Sekwencyjne wykonanie kroków
  - [ ] Przekazywanie wyników między krokami
  - [ ] Obsługa błędów i retry

- [ ] Implementować `executeStep()`:
  - [ ] Wywołanie API narzędzia
  - [ ] Walidacja wyniku
  - [ ] Aktualizacja stanu

- [ ] Implementować streaming progress:
  - [ ] SSE dla postępu wykonania
  - [ ] Real-time aktualizacje UI

- [ ] Dodać obsługę błędów:
  - [ ] Rollback przy błędzie
  - [ ] Częściowe wyniki
  - [ ] Retry logic

### 2.3 State Manager
**Plik:** `lib/ai-agent/state-manager.ts` (NOWY)

- [ ] Implementować `AgentState`:
  ```typescript
  interface AgentState {
    sessionId: string;
    status: 'planning' | 'executing' | 'completed' | 'failed';
    currentStep: number;
    totalSteps: number;
    results: StepResult[];
    errors: Error[];
  }
  ```

- [ ] Implementować `createSession()`
- [ ] Implementować `updateProgress()`
- [ ] Implementować `getSessionState()`
- [ ] Implementować `cleanupSession()`

---

## 🟡 FAZA 3: API & Database (Tydzień 3)

### 3.1 Database Models
**Plik:** `prisma/schema.prisma`

- [ ] Dodać model `AgentSession`:
  ```prisma
  model AgentSession {
    id              String   @id @default(cuid())
    userId          String
    status          String   // planning | executing | completed | failed
    progress        Int      @default(0)
    userRequest     String   @db.Text
    initialImage    String?
    executionPlan   Json
    results         Json?
    finalImage      String?
    errorMessage    String?
    estimatedCredits Int
    actualCredits   Int?
    createdAt       DateTime @default(now())
    completedAt     DateTime?

    user            User     @relation(...)
    messages        AgentMessage[]
    steps           AgentSessionStep[]
  }
  ```

- [ ] Dodać model `AgentSessionStep`:
  ```prisma
  model AgentSessionStep {
    id          String   @id @default(cuid())
    sessionId   String
    stepNumber  Int
    toolId      String
    status      String   // pending | running | completed | failed
    input       Json
    output      Json?
    creditsUsed Int?
    startedAt   DateTime?
    completedAt DateTime?
    error       String?

    session     AgentSession @relation(...)
  }
  ```

- [ ] Dodać model `AgentMessage`:
  ```prisma
  model AgentMessage {
    id          String   @id @default(cuid())
    sessionId   String
    role        String   // user | assistant | tool | system
    content     String   @db.Text
    toolName    String?
    toolInput   Json?
    toolOutput  Json?
    createdAt   DateTime @default(now())

    session     AgentSession @relation(...)
  }
  ```

- [ ] Uruchomić migrację: `npx prisma migrate dev`
- [ ] Wygenerować klienta: `npx prisma generate`

### 3.2 API Routes
**Katalog:** `app/api/ai-agent/`

- [ ] `POST /api/ai-agent/plan` - Generowanie planu
  - [ ] Walidacja inputu
  - [ ] Sprawdzenie kredytów
  - [ ] Wywołanie orchestratora
  - [ ] Zwrot planu z alternatywami

- [ ] `POST /api/ai-agent/execute` - Wykonanie planu
  - [ ] Walidacja planu
  - [ ] Pre-auth kredytów
  - [ ] Streaming wykonania
  - [ ] Zapis wyników

- [ ] `GET /api/ai-agent/tools` - Lista narzędzi
  - [ ] Wszystkie narzędzia z metadanymi
  - [ ] Filtrowanie po kategorii
  - [ ] Sortowanie

- [ ] `GET /api/ai-agent/sessions` - Lista sesji użytkownika
  - [ ] Paginacja
  - [ ] Filtrowanie po statusie
  - [ ] Sortowanie

- [ ] `GET /api/ai-agent/sessions/[id]` - Szczegóły sesji
  - [ ] Pełny stan sesji
  - [ ] Historia kroków
  - [ ] Wyniki

- [ ] `DELETE /api/ai-agent/sessions/[id]` - Usunięcie sesji

### 3.3 Database Functions
**Plik:** `lib/db.ts` (rozszerzenie)

- [ ] `createAgentSession()`
- [ ] `updateAgentSession()`
- [ ] `getAgentSession()`
- [ ] `getUserAgentSessions()`
- [ ] `createAgentSessionStep()`
- [ ] `updateAgentSessionStep()`
- [ ] `createAgentMessage()`

---

## 🟢 FAZA 4: Frontend (Tydzień 4)

### 4.1 Strona AI Agent
**Plik:** `app/[locale]/ai-agent/page.tsx` (NOWY)

- [ ] Layout strony z nawigacją
- [ ] Integracja z systemem auth
- [ ] Responsive design
- [ ] Loading states

### 4.2 Komponenty UI
**Katalog:** `components/ai-agent/`

- [ ] `AgentChatWindow.tsx` - Główne okno czatu
  - [ ] Lista wiadomości
  - [ ] Input z upload obrazu
  - [ ] Model selector

- [ ] `PlanPreview.tsx` - Podgląd planu wykonania
  - [ ] Lista kroków
  - [ ] Estymacja kosztów
  - [ ] Przyciski akcji

- [ ] `ExecutionProgress.tsx` - Progress wykonania
  - [ ] Progress bar
  - [ ] Aktualny krok
  - [ ] Podgląd wyników pośrednich

- [ ] `ToolCard.tsx` - Karta narzędzia
  - [ ] Ikona i nazwa
  - [ ] Opis
  - [ ] Koszt kredytów

- [ ] `SessionHistory.tsx` - Historia sesji
  - [ ] Lista poprzednich sesji
  - [ ] Podgląd wyników
  - [ ] Akcje (powtórz, usuń)

- [ ] `CostBreakdown.tsx` - Rozbicie kosztów
  - [ ] Koszt per narzędzie
  - [ ] Suma całkowita
  - [ ] Porównanie z alternatywami

### 4.3 Hooks
**Katalog:** `hooks/`

- [ ] `useAgentSession.ts` - Zarządzanie sesją
- [ ] `useAgentPlan.ts` - Generowanie planu
- [ ] `useAgentExecution.ts` - Wykonanie z SSE
- [ ] `useAgentTools.ts` - Lista narzędzi

### 4.4 Nawigacja
**Plik:** `components/Header.tsx`

- [ ] Dodać link "AI Agent" do głównego menu
- [ ] Dodać badge "PRO" lub "NEW"

---

## 🔵 FAZA 5: Polish & Testing (Opcjonalnie)

### 5.1 Testy
- [ ] Unit testy dla orchestratora
- [ ] Unit testy dla plan executora
- [ ] Integration testy API
- [ ] E2E testy UI

### 5.2 Optymalizacje
- [ ] Caching planów
- [ ] Parallel tool execution gdzie możliwe
- [ ] Lazy loading komponentów
- [ ] Image optimization

### 5.3 Analytics
- [ ] Tracking użycia narzędzi
- [ ] Tracking kosztów per użytkownik
- [ ] Tracking błędów
- [ ] Dashboard w admin panel

### 5.4 Dokumentacja
- [ ] README dla AI Agent
- [ ] API documentation
- [ ] User guide

---

## 📝 Notatki Implementacyjne

### Modele AI dla Orchestratora
Rekomendowane modele do testowania:
1. **GPT-4o** - Najlepszy do function calling
2. **Claude Opus 4** - Świetne rozumowanie
3. **Gemini 2.0 Flash** - Szybki i tani

### Przykładowe Prompty Użytkowników
1. "Usuń tło z tego zdjęcia i dodaj profesjonalne tło biurowe"
2. "Popraw jakość tego starego zdjęcia i pokoloruj je"
3. "Zrób upscale 4x i wyostrz szczegóły"
4. "Przygotuj to zdjęcie produktu do sklepu - białe tło, cień, 1000x1000px"

### Rate Limiting
- Max 5 równoległych wykonań per użytkownik
- Max 10 kroków per plan
- Timeout 5 minut per sesję

### Error Handling
- Partial success - zapisuj wyniki pośrednie
- Retry logic - max 3 próby per krok
- Graceful degradation - sugeruj alternatywy

---

## ✅ Checklist Przed Deployem

- [ ] Wszystkie testy przechodzą
- [ ] Migracje bazy danych wykonane
- [ ] Environment variables skonfigurowane
- [ ] Rate limiting włączony
- [ ] Error tracking skonfigurowany
- [ ] Monitoring włączony
- [ ] Dokumentacja zaktualizowana
- [ ] Changelog zaktualizowany

---

*Ostatnia aktualizacja: 2024-12-30*
*Autor: Claude Code*
