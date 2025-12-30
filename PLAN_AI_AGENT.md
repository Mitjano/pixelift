# AI Agent PRO - Plan Wdrożenia

## Executive Summary

AI Agent PRO to flagowy produkt Pixelift - inteligentny asystent łączący **28 narzędzi do obróbki obrazów** z konwersacyjnym AI. Użytkownik opisuje co chce osiągnąć, a Agent automatycznie planuje i wykonuje operacje.

**USP:** "Powiedz co chcesz, a AI to zrobi" - wszystkie narzędzia Pixelift dostępne przez naturalny język.

---

## 1. Architektura Systemu

### 1.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI AGENT PRO                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER INPUT                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [Obraz] + "Usuń tło, powiększ 4x i dodaj cień"           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ORCHESTRATOR (GPT-4o / Claude)               │   │
│  │                                                           │   │
│  │  1. Analizuje intencję użytkownika                       │   │
│  │  2. Planuje sekwencję narzędzi                           │   │
│  │  3. Szacuje koszt (kredyty)                              │   │
│  │  4. Generuje plan do akceptacji                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PLAN EXECUTION                         │   │
│  │                                                           │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐                │   │
│  │  │ Remove  │ → │ Upscale │ → │  Shadow │                │   │
│  │  │   BG    │   │   4x    │   │  Effect │                │   │
│  │  │ 1 cred  │   │ 2 cred  │   │ 2 cred  │                │   │
│  │  └─────────┘   └─────────┘   └─────────┘                │   │
│  │                                                           │   │
│  │  Progress: ████████░░ 66% - Powiększanie...              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      RESULT                               │   │
│  │                                                           │   │
│  │  [Przetworzony obraz]                                    │   │
│  │                                                           │   │
│  │  ✓ Tło usunięte                                          │   │
│  │  ✓ Powiększono 4x (512→2048px)                           │   │
│  │  ✓ Dodano cień                                           │   │
│  │                                                           │   │
│  │  Użyto: 5 kredytów | Pozostało: 42 kredytów              │   │
│  │                                                           │   │
│  │  [Pobierz PNG] [Pobierz JPG] [Edytuj dalej]              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Komponenty Techniczne

```
/app
  /[locale]
    /ai-agent                    # Nowa strona AI Agent
      /page.tsx                  # Główny UI
      /layout.tsx                # Metadata SEO

/components
  /ai-agent
    /AgentWorkspace.tsx          # Główny kontener
    /AgentChat.tsx               # Panel konwersacji
    /AgentToolbar.tsx            # Quick actions
    /AgentPreview.tsx            # Podgląd obrazu z historią
    /AgentPlanCard.tsx           # Karta planu do akceptacji
    /AgentProgressBar.tsx        # Progress wykonania
    /AgentResultCard.tsx         # Wynik z opcjami
    /AgentSidebar.tsx            # Historia sesji
    /AgentModelSelector.tsx      # Wybór modelu orchestratora

/lib
  /ai-agent
    /orchestrator.ts             # Główna logika planowania
    /tools-registry.ts           # Rejestr wszystkich narzędzi
    /plan-executor.ts            # Wykonywanie planów
    /cost-calculator.ts          # Kalkulacja kosztów
    /types.ts                    # TypeScript types

/app/api
  /ai-agent
    /plan/route.ts               # Generowanie planu
    /execute/route.ts            # Wykonanie planu
    /tools/route.ts              # Lista narzędzi
    /sessions/route.ts           # Historia sesji
    /sessions/[id]/route.ts      # Szczegóły sesji
```

---

## 2. Tools Registry - Wszystkie Narzędzia

### 2.1 Definicja Tool Interface

```typescript
interface AgentTool {
  id: string;
  name: string;
  nameKey: string;              // i18n key
  description: string;
  descriptionKey: string;       // i18n key
  category: ToolCategory;

  // Koszty
  credits: number;
  isDynamic: boolean;           // Czy koszt zależy od parametrów

  // Capabilities
  requiresImage: boolean;       // Wymaga obrazu wejściowego
  outputsImage: boolean;        // Zwraca obraz
  supportsMultiple: boolean;    // Może generować wiele wyników

  // Parametry
  parameters: ToolParameter[];

  // API
  endpoint: string;

  // Dla AI
  aiDescription: string;        // Opis dla modelu AI do tool selection
}

type ToolCategory =
  | 'background'      // Usuwanie/generowanie tła
  | 'enhancement'     // Poprawa jakości
  | 'creative'        // Kreatywne efekty
  | 'product'         // E-commerce
  | 'generation'      // Generowanie od zera
  | 'utility'         // Narzędzia pomocnicze
  | 'video';          // Wideo (przyszłość)
```

### 2.2 Pełna Lista Narzędzi (28 tools)

#### BACKGROUND (4 tools)
| Tool | Credits | AI Description |
|------|---------|----------------|
| `remove-background` | 1 | Removes background from image, keeping main subject |
| `background-generate` | 3 | Generates AI background based on prompt |
| `ai-background-generator` | 3 | Creates professional backgrounds for products |
| `expand-image` | 2 | Extends image beyond original boundaries |

#### ENHANCEMENT (7 tools)
| Tool | Credits | AI Description |
|------|---------|----------------|
| `upscale` | 1-2 | Increases image resolution 2x/4x/8x |
| `denoise` | 1 | Removes noise and grain from images |
| `face-restore` | 2 | Restores and enhances faces |
| `colorize` | 1 | Adds color to black-and-white images |
| `portrait-relight` | 2 | Changes lighting in portraits |
| `product-relight` | 3 | Professional lighting for products |
| `watermark-remover` | 2 | Removes watermarks from images |

#### CREATIVE (5 tools)
| Tool | Credits | AI Description |
|------|---------|----------------|
| `style-transfer` | 3 | Applies artistic style to image |
| `structure-control` | 3 | Transforms image keeping structure |
| `reimagine` | 2-8 | Creates variations of image |
| `inpainting` | 3 | Edits specific parts of image |
| `object-removal` | 2 | Removes unwanted objects |

#### PRODUCT (3 tools)
| Tool | Credits | AI Description |
|------|---------|----------------|
| `product-shot` | 2-8 | Professional e-commerce photos |
| `packshot` | 2 | Clean product on white/custom background |
| `generate-ai-background` | 3 | E-commerce background generation |

#### GENERATION (3 tools)
| Tool | Credits | AI Description |
|------|---------|----------------|
| `ai-image-generate` | 1-7 | Generates image from text description |
| `logo-maker` | 5 | Creates logo designs |
| `text-effects` | 5 | Creates text with visual effects |

#### UTILITY (6 tools) - Darmowe
| Tool | Credits | AI Description |
|------|---------|----------------|
| `crop-image` | 0 | Crops image to specific dimensions |
| `resize-image` | 0 | Resizes image |
| `compress-image` | 0 | Compresses image size |
| `convert-format` | 0 | Converts between formats |
| `qr-generator` | 0 | Generates QR codes |
| `collage` | 0 | Creates photo collages |

---

## 3. Orchestrator - Mózg Systemu

### 3.1 System Prompt dla Orchestratora

```typescript
const ORCHESTRATOR_SYSTEM_PROMPT = `
You are Pixelift AI Agent - an intelligent image editing assistant.

YOUR ROLE:
- Analyze user requests about image editing
- Plan optimal sequence of tools to achieve the goal
- Consider cost efficiency (credits)
- Suggest alternatives when applicable

AVAILABLE TOOLS:
${toolsDescriptionForAI}

RESPONSE FORMAT:
Always respond in JSON:

{
  "understanding": "Brief summary of what user wants",
  "plan": {
    "steps": [
      {
        "tool": "tool-id",
        "reason": "Why this tool",
        "params": { ... },
        "estimatedCredits": 2
      }
    ],
    "totalCredits": 5,
    "estimatedTime": "~30 seconds"
  },
  "alternatives": [
    {
      "description": "Cheaper option",
      "steps": [...],
      "totalCredits": 3,
      "tradeoff": "Lower quality upscale"
    }
  ],
  "questions": [
    "What aspect ratio do you prefer?"
  ],
  "cannotDo": null // or explanation if impossible
}

RULES:
1. Always calculate total credits accurately
2. If user has insufficient credits, suggest cheaper alternatives
3. For vague requests, ask clarifying questions
4. Optimize pipeline order (e.g., remove BG before upscale = faster)
5. Warn about potential quality issues
6. If no image provided but needed, ask for one
`;
```

### 3.2 Orchestrator Implementation

```typescript
// /lib/ai-agent/orchestrator.ts

import { chatCompletionStream } from '@/lib/ai-chat/openrouter';
import { AGENT_TOOLS } from './tools-registry';

interface OrchestrationResult {
  understanding: string;
  plan: ExecutionPlan;
  alternatives?: ExecutionPlan[];
  questions?: string[];
  cannotDo?: string;
}

interface ExecutionPlan {
  steps: PlanStep[];
  totalCredits: number;
  estimatedTime: string;
}

interface PlanStep {
  tool: string;
  reason: string;
  params: Record<string, unknown>;
  estimatedCredits: number;
  dependsOn?: number; // Index of previous step
}

export async function createPlan(
  userMessage: string,
  imageData?: string,
  userCredits: number,
  conversationHistory?: Message[]
): Promise<OrchestrationResult> {

  const toolsDescription = AGENT_TOOLS
    .map(t => `- ${t.id}: ${t.aiDescription} (${t.credits} credits)`)
    .join('\n');

  const systemPrompt = ORCHESTRATOR_SYSTEM_PROMPT
    .replace('${toolsDescriptionForAI}', toolsDescription);

  const messages = [
    ...(conversationHistory || []),
    {
      role: 'user',
      content: imageData
        ? [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: imageData } }
          ]
        : userMessage
    }
  ];

  // Use GPT-4o for best tool understanding
  const response = await chatCompletion({
    model: 'openai/gpt-4o',
    messages,
    systemPrompt,
    temperature: 0.3, // Lower for more consistent planning
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 3.3 Plan Executor

```typescript
// /lib/ai-agent/plan-executor.ts

interface ExecutionProgress {
  currentStep: number;
  totalSteps: number;
  currentTool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: StepResult[];
  error?: string;
}

interface StepResult {
  tool: string;
  success: boolean;
  outputUrl?: string;
  creditsUsed: number;
  processingTime: number;
  error?: string;
}

export async function* executePlan(
  plan: ExecutionPlan,
  initialImage: string | null,
  userId: string,
  onProgress: (progress: ExecutionProgress) => void
): AsyncGenerator<ExecutionProgress> {

  const results: StepResult[] = [];
  let currentImageUrl = initialImage;

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];

    // Emit progress
    yield {
      currentStep: i,
      totalSteps: plan.steps.length,
      currentTool: step.tool,
      status: 'running',
      results
    };

    try {
      // Check credits before each step
      const userCredits = await getUserCredits(userId);
      if (userCredits < step.estimatedCredits) {
        throw new Error('Insufficient credits');
      }

      // Execute tool
      const startTime = Date.now();
      const result = await executeToolAPI(step.tool, {
        ...step.params,
        imageUrl: currentImageUrl,
        userId
      });

      const stepResult: StepResult = {
        tool: step.tool,
        success: true,
        outputUrl: result.url,
        creditsUsed: result.creditsUsed,
        processingTime: Date.now() - startTime
      };

      results.push(stepResult);
      currentImageUrl = result.url; // Chain output to next step

    } catch (error) {
      results.push({
        tool: step.tool,
        success: false,
        creditsUsed: 0,
        processingTime: 0,
        error: error.message
      });

      yield {
        currentStep: i,
        totalSteps: plan.steps.length,
        currentTool: step.tool,
        status: 'failed',
        results,
        error: error.message
      };

      return; // Stop execution on failure
    }
  }

  yield {
    currentStep: plan.steps.length,
    totalSteps: plan.steps.length,
    currentTool: '',
    status: 'completed',
    results
  };
}
```

---

## 4. UI/UX Design

### 4.1 Layout - Desktop

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ◀ Pixelift    AI Agent PRO                    💎 47 credits   [Avatar] │
├─────────────┬───────────────────────────────────────────────────────────┤
│             │                                                           │
│  SESSIONS   │                    WORKSPACE                              │
│             │                                                           │
│  + New      │  ┌─────────────────────────────────────────────────────┐ │
│             │  │                                                     │ │
│  Today      │  │                  IMAGE PREVIEW                      │ │
│  ├─ Logo    │  │                                                     │ │
│  │  edit    │  │              [Before] ↔ [After]                    │ │
│  └─ Product │  │                                                     │ │
│     photo   │  │                   Slider comparison                 │ │
│             │  │                                                     │ │
│  Yesterday  │  └─────────────────────────────────────────────────────┘ │
│  └─ Banner  │                                                           │
│     resize  │  ┌─────────────────────────────────────────────────────┐ │
│             │  │ EXECUTION PIPELINE                                  │ │
│             │  │                                                     │ │
│             │  │  ✓ Remove BG    → ⏳ Upscale 4x   → ○ Add shadow   │ │
│             │  │    (1 credit)      (2 credits)       (2 credits)   │ │
│             │  │                                                     │ │
│             │  │  Progress: ████████░░░░░░░░ 45%                    │ │
│             │  └─────────────────────────────────────────────────────┘ │
│             │                                                           │
├─────────────┴───────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 📎 [Wrzuć obraz lub kliknij]                                     │ │
│  │                                                                   │ │
│  │ Opisz co chcesz zrobić z obrazem...                              │ │
│  │                                                                   │ │
│  │ Quick: [Usuń tło] [Powiększ 2x] [E-commerce] [Logo] [Artystyczne] │ │
│  │                                                          [Wyślij] │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Layout - Mobile

```
┌─────────────────────────────┐
│ ☰  AI Agent PRO    💎 47   │
├─────────────────────────────┤
│                             │
│    ┌─────────────────┐     │
│    │                 │     │
│    │  IMAGE PREVIEW  │     │
│    │   [Before/After]│     │
│    │                 │     │
│    └─────────────────┘     │
│                             │
│  ┌───────────────────────┐ │
│  │ ✓ Remove BG (1 cr)    │ │
│  │ ⏳ Upscale 4x (2 cr)  │ │
│  │ ○ Add shadow (2 cr)   │ │
│  │                       │ │
│  │ ████████░░ 45%        │ │
│  └───────────────────────┘ │
│                             │
├─────────────────────────────┤
│ 📎 │ Wrzuć obraz...   │ ↑  │
├─────────────────────────────┤
│ [Tło] [2x] [E-com] [+]     │
└─────────────────────────────┘
```

### 4.3 Plan Approval Card

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI Agent                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Rozumiem! Chcesz przygotować zdjęcie produktu do sklepu.  │
│                                                             │
│  📋 Plan wykonania:                                         │
│                                                             │
│  1. Usunięcie tła ─────────────────────────── 1 kredyt     │
│     Automatyczne wykrycie produktu                          │
│                                                             │
│  2. Powiększenie 4x ───────────────────────── 2 kredyty    │
│     Z 800px do 3200px, model: Recraft Crisp                │
│                                                             │
│  3. Profesjonalne tło e-commerce ──────────── 3 kredyty    │
│     Białe tło studyjne z delikatnym cieniem                │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│  💰 Razem: 6 kredytów    ⏱️ ~45 sekund                      │
│  📊 Twoje saldo: 47 kredytów → 41 kredytów                 │
│                                                             │
│  💡 Tańsza alternatywa (4 kredyty):                        │
│     Pominięcie upscale - obraz pozostanie 800px            │
│                                                             │
│        [Wykonaj plan]  [Użyj tańszej]  [Modyfikuj]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. API Endpoints

### 5.1 POST /api/ai-agent/plan

Request:
```typescript
{
  message: string;
  image?: string;  // base64 or URL
  sessionId?: string;
  preferences?: {
    maxCredits?: number;
    preferQuality?: boolean;
    outputFormat?: 'png' | 'jpg' | 'webp';
  }
}
```

Response:
```typescript
{
  sessionId: string;
  plan: {
    understanding: string;
    steps: PlanStep[];
    totalCredits: number;
    estimatedTime: string;
  };
  alternatives?: AlternativePlan[];
  questions?: string[];
  cannotDo?: string;
  userCredits: number;
}
```

### 5.2 POST /api/ai-agent/execute

Request:
```typescript
{
  sessionId: string;
  planIndex: number;  // 0 = main plan, 1+ = alternatives
  image: string;      // base64 or URL
}
```

Response (SSE Stream):
```typescript
// Event: progress
data: {
  "type": "progress",
  "step": 1,
  "totalSteps": 3,
  "tool": "remove-background",
  "status": "running",
  "message": "Usuwanie tła..."
}

// Event: step-complete
data: {
  "type": "step-complete",
  "step": 1,
  "tool": "remove-background",
  "outputUrl": "https://...",
  "creditsUsed": 1,
  "processingTime": 2340
}

// Event: complete
data: {
  "type": "complete",
  "finalUrl": "https://...",
  "totalCredits": 6,
  "totalTime": 12500,
  "results": [...]
}

// Event: error
data: {
  "type": "error",
  "step": 2,
  "tool": "upscale",
  "message": "Processing failed",
  "creditsRefunded": 2
}
```

### 5.3 GET /api/ai-agent/sessions

Response:
```typescript
{
  sessions: [
    {
      id: string;
      title: string;
      thumbnail: string;
      toolsUsed: string[];
      creditsUsed: number;
      createdAt: string;
      status: 'completed' | 'failed' | 'in_progress';
    }
  ]
}
```

---

## 6. Database Schema

### 6.1 New Models

```prisma
model AgentSession {
  id            String   @id @default(cuid())
  userId        String
  title         String?
  status        AgentSessionStatus @default(pending)

  // Plan
  plan          Json?    // ExecutionPlan
  selectedPlan  Int      @default(0)

  // Input
  inputImageUrl String?
  userMessage   String

  // Output
  outputImageUrl String?

  // Stats
  totalCredits  Int      @default(0)
  totalTime     Int      @default(0) // ms

  createdAt     DateTime @default(now())
  completedAt   DateTime?

  user          User     @relation(fields: [userId], references: [id])
  steps         AgentSessionStep[]
  messages      AgentMessage[]

  @@index([userId, createdAt])
}

enum AgentSessionStatus {
  pending
  planning
  awaiting_approval
  executing
  completed
  failed
  cancelled
}

model AgentSessionStep {
  id            String   @id @default(cuid())
  sessionId     String
  stepIndex     Int

  tool          String
  params        Json?
  status        StepStatus @default(pending)

  inputUrl      String?
  outputUrl     String?

  creditsUsed   Int      @default(0)
  processingTime Int?    // ms
  error         String?

  startedAt     DateTime?
  completedAt   DateTime?

  session       AgentSession @relation(fields: [sessionId], references: [id])

  @@index([sessionId, stepIndex])
}

enum StepStatus {
  pending
  running
  completed
  failed
  skipped
}

model AgentMessage {
  id            String   @id @default(cuid())
  sessionId     String

  role          String   // user | assistant | system
  content       String

  // For assistant messages
  plan          Json?

  createdAt     DateTime @default(now())

  session       AgentSession @relation(fields: [sessionId], references: [id])

  @@index([sessionId, createdAt])
}
```

---

## 7. Pricing & Monetization

### 7.1 Credit Costs

| Component | Cost | Notes |
|-----------|------|-------|
| Planning (Orchestrator) | 0.5 kredyt | GPT-4o-mini for planning |
| Tool execution | Standard rates | Per tool as defined |
| Re-planning | 0.5 kredyt | If user modifies request |
| Conversation | Free | Follow-up questions |

### 7.2 Premium Features (Future)

- **Agent Pro Mode**: Faster models, priority queue
- **Batch Processing**: Multiple images at once
- **Templates**: Save and reuse workflows
- **API Access**: Use Agent via API
- **White-label**: Custom branding

---

## 8. Implementation Phases

### Phase 1: MVP (2-3 tygodnie)
- [ ] Basic orchestrator with 8 core tools
- [ ] Simple plan/execute flow
- [ ] Single image processing
- [ ] Basic UI without sessions

**Tools in MVP:**
1. remove-background
2. upscale
3. ai-image-generate
4. background-generate
5. crop-image
6. resize-image
7. compress-image
8. colorize

### Phase 2: Full Tools (2 tygodnie)
- [ ] All 28 tools integrated
- [ ] Session history
- [ ] Alternatives suggestion
- [ ] Better error handling

### Phase 3: Polish (1-2 tygodnie)
- [ ] Mobile optimization
- [ ] Before/after slider
- [ ] Progress animations
- [ ] Quick action buttons
- [ ] Keyboard shortcuts

### Phase 4: Advanced (ongoing)
- [ ] Video tools integration
- [ ] Batch processing
- [ ] Workflow templates
- [ ] API access
- [ ] Analytics dashboard

---

## 9. Example Conversations

### Example 1: E-commerce Product

```
User: [zdjęcie produktu] Przygotuj to do sklepu internetowego

Agent: Widzę butelkę perfum na drewnianym stole. Dla e-commerce
       proponuję:

       1. Usuń tło → wyizoluje produkt
       2. Powiększ 2x → lepsza jakość na stronie
       3. Dodaj białe tło studyjne → profesjonalny wygląd

       Koszt: 6 kredytów | Czas: ~40s

       [Wykonaj] [Chcę inne tło] [Więcej opcji]

User: Chcę szare gradientowe tło

Agent: Rozumiem! Zmieniam krok 3:

       3. Szare gradientowe tło → elegancki, premium look

       Koszt bez zmian: 6 kredytów

       [Wykonaj]
```

### Example 2: Old Photo Restoration

```
User: [stare czarno-białe zdjęcie] Odnów to zdjęcie dziadka

Agent: Widzę stare czarno-białe zdjęcie portretowe z lat ~1950.
       Ma widoczne uszkodzenia i jest niewyraźne.

       Plan odnowienia:

       1. Przywróć twarz (CodeFormer) → naprawi szczegóły twarzy
       2. Usuń uszkodzenia (Inpainting) → naprawię rysy/plamy
       3. Dodaj kolory (Colorize) → naturalne kolory
       4. Powiększ 4x (Clarity) → wysoka rozdzielczość

       Koszt: 8 kredytów | Czas: ~90s

       ⚠️ Koloryzacja AI nie zawsze trafia z kolorami ubrań

       [Wykonaj] [Bez koloryzacji - 7 kr]
```

### Example 3: Logo Creation

```
User: Stwórz logo dla kawiarni "Bean Dream"

Agent: Stworzę logo dla kawiarni! Mam kilka pytań:

       1. Jaki styl preferujesz?
          [Minimalistyczny] [Vintage] [Nowoczesny] [Zabawny]

       2. Jakie kolory?
          [Brązy/beże] [Czarno-białe] [Kolorowe] [Nie wiem]

User: Vintage, brązy

Agent: Świetnie! Stworzę vintage logo z motywem kawy.

       Plan:
       1. Generuj logo (Logo Maker) → 3 warianty vintage
       2. Wektoryzuj najlepszy → plik SVG

       Koszt: 8 kredytów (5 + 3) | Czas: ~60s

       [Generuj warianty]
```

---

## 10. Success Metrics

### KPIs to Track

1. **Adoption**
   - Daily/Monthly Active Users
   - Sessions per user
   - Conversion from AI Chat

2. **Engagement**
   - Average session length
   - Tools per session
   - Completion rate

3. **Revenue**
   - Credits spent via Agent
   - Revenue per session
   - % of total revenue

4. **Quality**
   - Plan acceptance rate
   - Re-planning rate
   - Error rate

---

## 11. Competitive Analysis

| Feature | Pixelift Agent | Canva AI | Adobe Firefly | Remove.bg |
|---------|----------------|----------|---------------|-----------|
| Natural language | ✅ | Partial | Partial | ❌ |
| Multi-step workflows | ✅ | ❌ | ❌ | ❌ |
| Tool chaining | ✅ | Manual | Manual | ❌ |
| Cost transparency | ✅ | Hidden | Subscription | Per-image |
| Polish language | ✅ | ❌ | ❌ | ❌ |
| Video support | Planned | ✅ | ❌ | ❌ |

**Unique Value Proposition:**
"Jedyny AI Agent który łączy 28+ narzędzi do obróbki obrazów
w jeden konwersacyjny interfejs - powiedz co chcesz, a AI to zrobi."

---

## Next Steps

1. **Review this plan** - feedback na architekturę
2. **Decide on Phase 1 scope** - które 8 tools na start
3. **Design approval** - UI/UX mockupy
4. **Start implementation** - orchestrator + basic UI

---

*Document version: 1.0*
*Created: 2024-12-30*
*Author: Claude AI Agent*
