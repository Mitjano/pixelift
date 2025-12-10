# Plan Wdrożenia Ulepszeń Pixelift

**Ostatnia aktualizacja:** 2024-12-10
**Ocena z audytu:** 7.2/10
**Wersja:** 2.0

---

## Przegląd Faz (Zaktualizowany)

| Faza | Nazwa | Czas | Status | Priorytet |
|------|-------|------|--------|-----------|
| 1 | Infrastruktura Krytyczna | 1-2 tygodnie | 🔴 Do zrobienia | KRYTYCZNY |
| 2 | Testy & Jakość Kodu | 2 tygodnie | 🔴 Do zrobienia | WYSOKI |
| 3 | UX/UI & Wydajność | 2 tygodnie | 🔴 Do zrobienia | ŚREDNI |
| 4 | Dokumentacja | 1-2 tygodnie | 🔴 Do zrobienia | ŚREDNI |

---

## NOWE PRIORYTETY Z AUDYTU (2024-12-10)

### Top 5 Krytycznych Problemów

| # | Problem | Wpływ | Rozwiązanie |
|---|---------|-------|-------------|
| 1 | Rate limiting w pamięci | Nie skaluje się | Przenieść do Redis |
| 2 | Brak CI/CD | Brak safety net | GitHub Actions |
| 3 | 709 TODO/FIXME w kodzie | Tech debt | Przejrzeć i naprawić |
| 4 | Brak testów komponentów | Regresje | Testing Library + Playwright |
| 5 | Brak dokumentacji API | DX | OpenAPI/Swagger |

### Metryki do poprawy

| Metryka | Obecnie | Cel |
|---------|---------|-----|
| Test Coverage | ~5% | 80% |
| TODO/FIXME | 709 | <50 |
| API Documentation | 0% | 100% |
| Lighthouse Performance | ? | >90 |
| Lighthouse Accessibility | ? | >90 |

---

## FAZA 0: Quick Wins (Natychmiast, <2h każde)

### 0.1 Environment Validation
```typescript
// lib/env.ts - Zod validation dla env vars
```
**Status:** 🔴 | **Czas:** 1-2h

### 0.2 API Response Helper
```typescript
// lib/api-response.ts - Standaryzacja responses
```
**Status:** 🔴 | **Czas:** 1-2h

### 0.3 Skeleton Component
```typescript
// components/ui/Skeleton.tsx - Lepszy UX ładowania
```
**Status:** 🔴 | **Czas:** 1-2h

### 0.4 Basic GitHub Actions
```yaml
# .github/workflows/ci.yml - Build check na PR
```
**Status:** 🔴 | **Czas:** 1-2h

---

---

## FAZA 1: Bezpieczeństwo (Tydzień 1)

### 1.1 Nagłówki Bezpieczeństwa
**Plik:** `next.config.ts`
**Priorytet:** 🔴 Krytyczny
**Czas:** 30 min

```typescript
// Dodać do nextConfig:
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self'; connect-src 'self' https://api.replicate.com https://*.firebaseio.com https://*.googleapis.com;"
      },
    ],
  }];
}
```

### 1.2 Rate Limiting na Auth
**Pliki:**
- `app/api/auth/register-user/route.ts`
- `app/api/auth/register-user-internal/route.ts`
**Priorytet:** 🔴 Krytyczny
**Czas:** 15 min

```typescript
import { authLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit';

// Na początku każdej funkcji POST:
const identifier = getClientIdentifier(request);
const { allowed, resetAt } = authLimiter.check(identifier);
if (!allowed) {
  return rateLimitResponse(resetAt);
}
```

### 1.3 CSRF Protection Middleware
**Plik:** `lib/csrf.ts` (nowy)
**Priorytet:** 🟠 Wysoki
**Czas:** 1 godzina

```typescript
// Implementacja:
// 1. Generowanie tokenu CSRF
// 2. Walidacja origin header
// 3. Middleware wrapper dla API routes
```

### 1.4 Limity Rozmiaru Żądań
**Plik:** `lib/api-utils.ts`
**Priorytet:** 🟠 Wysoki
**Czas:** 30 min

```typescript
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

export async function parseRequestBody<T>(request: NextRequest, maxSize = MAX_REQUEST_SIZE): Promise<T> {
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  if (contentLength > maxSize) {
    throw new Error(`Request too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }
  return request.json();
}
```

### 1.5 Walidacja SameSite Cookies
**Plik:** `lib/auth.ts`
**Priorytet:** 🟡 Średni
**Czas:** 15 min

---

## FAZA 2: Stabilność & Testy (Tygodnie 2-3)

### 2.1 Konfiguracja Środowiska Testowego
**Czas:** 2 godziny

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

**Pliki do utworzenia:**
- `vitest.config.ts`
- `vitest.setup.ts`
- `__tests__/` folder structure

### 2.2 Testy Jednostkowe - Priorytet Wysoki

| Plik | Opis | Czas |
|------|------|------|
| `__tests__/lib/validation.test.ts` | Schematy Zod | 2h |
| `__tests__/lib/rate-limit.test.ts` | Rate limiter | 1h |
| `__tests__/lib/db.test.ts` | Operacje CRUD | 3h |
| `__tests__/lib/auth.test.ts` | Autoryzacja | 2h |
| `__tests__/lib/email.test.ts` | Email sending | 1h |

### 2.3 Testy API Routes

| Endpoint | Metody | Czas |
|----------|--------|------|
| `/api/upscale` | POST | 1h |
| `/api/remove-background` | POST | 1h |
| `/api/admin/users` | GET, PATCH | 2h |
| `/api/admin/blog` | GET, POST, PATCH, DELETE | 2h |
| `/api/auth/*` | POST | 2h |

### 2.4 Async I/O w lib/db.ts
**Priorytet:** 🔴 Krytyczny
**Czas:** 4 godziny

```typescript
// Zmiana z:
const data = fs.readFileSync(filePath, 'utf-8');

// Na:
const data = await fs.promises.readFile(filePath, 'utf-8');
```

### 2.5 Error Boundaries
**Pliki:**
- `app/admin/layout.tsx` - dodać ErrorBoundary
- `app/dashboard/layout.tsx` - dodać ErrorBoundary
**Czas:** 1 godzina

---

## FAZA 3: Wydajność (Tydzień 4)

### 3.1 Redis Setup
**Wymagania:**
- Redis server (już jest w docker-compose)
- `ioredis` package

```bash
npm install ioredis
```

**Pliki:**
- `lib/redis.ts` - klient Redis
- `lib/redis-rate-limit.ts` - rate limiting z Redis
- `lib/redis-cache.ts` - cache layer

### 3.2 Redis Rate Limiting
**Czas:** 3 godziny

```typescript
// lib/redis-rate-limit.ts
import Redis from 'ioredis';

export class RedisRateLimiter {
  constructor(private redis: Redis, private windowMs: number, private maxRequests: number) {}

  async check(identifier: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();

    // Implementacja sliding window z Redis
  }
}
```

### 3.3 Redis Cache Layer
**Czas:** 4 godziny

```typescript
// lib/redis-cache.ts
export class RedisCache {
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, value: T, ttl?: number): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
}
```

### 3.4 Image Optimization
**Plik:** `next.config.ts`
**Czas:** 30 min

```typescript
images: {
  remotePatterns: [...],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  minimumCacheTTL: 86400,
}
```

### 3.5 Code Splitting Admin
**Czas:** 2 godziny

```typescript
// Dynamiczne importy dla ciężkich komponentów
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});
```

### 3.6 Parallel Data Loading
**Plik:** `app/admin/page.tsx`
**Czas:** 30 min

```typescript
const [posts, users, usage, transactions] = await Promise.all([
  getAllPosts(),
  getAllUsers(),
  getAllUsage(),
  getAllTransactions(),
]);
```

---

## FAZA 4: Migracja Bazy Danych (Tygodnie 5-6)

### 4.1 Wybór Bazy Danych
**Rekomendacja:** PostgreSQL z Prisma ORM

```bash
npm install prisma @prisma/client
npx prisma init
```

### 4.2 Schemat Bazy Danych
**Plik:** `prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  credits   Int      @default(10)
  status    Status   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  usage        Usage[]
  transactions Transaction[]
  apiKeys      ApiKey[]
  tickets      Ticket[]
}

model Usage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  details   Json?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}

model Transaction {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      TransactionType
  amount    Float
  currency  String   @default("PLN")
  status    TransactionStatus @default(PENDING)
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([status])
}

// ... pozostałe modele
```

### 4.3 Skrypt Migracji Danych
**Plik:** `scripts/migrate-to-postgres.ts`

```typescript
// 1. Odczyt danych z JSON files
// 2. Transformacja do nowego formatu
// 3. Bulk insert do PostgreSQL
// 4. Walidacja integralności
```

### 4.4 Nowy lib/db.ts z Prisma
**Czas:** 8 godzin

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Nowe funkcje z Prisma
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({ data });
}
```

### 4.5 Automatyczne Backupy S3
**Pliki:**
- `lib/backup.ts` - logika backupów
- `scripts/backup-cron.ts` - skrypt cron

```typescript
// Backup flow:
// 1. pg_dump bazy danych
// 2. Kompresja gzip
// 3. Upload do S3 z datą w nazwie
// 4. Cleanup starych backupów (retention policy)
```

---

## FAZA 5: Nowe Funkcje (Ongoing)

### 5.1 Stripe Subscriptions
**Czas:** 1 tydzień

**Komponenty:**
- Stripe Checkout integration
- Webhook handler (`/api/webhooks/stripe`)
- Subscription management UI
- Customer portal integration

**Plany cenowe:**
```typescript
const PLANS = {
  FREE: { credits: 10, price: 0 },
  STARTER: { credits: 100, price: 29 },
  PRO: { credits: 500, price: 79 },
  ENTERPRISE: { credits: -1, price: 299 }, // unlimited
};
```

### 5.2 REST API dla Developerów
**Czas:** 1 tydzień

**Endpointy:**
- `POST /api/v1/upscale`
- `POST /api/v1/remove-background`
- `POST /api/v1/expand`
- `POST /api/v1/compress`
- `GET /api/v1/usage`
- `GET /api/v1/credits`

**Dokumentacja:**
- Swagger/OpenAPI spec
- `/api/docs` - Swagger UI

### 5.3 Bulk Image Processing
**Czas:** 3 dni

```typescript
// POST /api/bulk/upscale
// Request: FormData z wieloma plikami
// Response: Job ID

// GET /api/bulk/status/:jobId
// Response: { status, progress, results }

// Implementacja z Bull queue
```

### 5.4 Historia Obrazów Użytkownika
**Czas:** 2 dni

**UI:**
- `/dashboard/history` - lista przetworzonych obrazów
- Filtry: typ operacji, data
- Download oryginalny/przetworzony
- Ponowne przetwarzanie

**Model:**
```prisma
model ProcessedImage {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  originalUrl  String
  processedUrl String
  operation    String
  metadata     Json?
  createdAt    DateTime @default(now())
  expiresAt    DateTime

  @@index([userId])
}
```

---

## Harmonogram Wdrożenia

```
Tydzień 1:  [FAZA 1] Bezpieczeństwo
            ├── Dzień 1-2: Nagłówki + Rate limiting auth
            ├── Dzień 3-4: CSRF + Limity żądań
            └── Dzień 5: Testowanie + Deploy

Tydzień 2:  [FAZA 2a] Testy - Setup
            ├── Dzień 1: Konfiguracja Vitest
            ├── Dzień 2-3: Testy validation + rate-limit
            └── Dzień 4-5: Testy db + auth

Tydzień 3:  [FAZA 2b] Testy - API + Async
            ├── Dzień 1-2: Testy API routes
            ├── Dzień 3-4: Async I/O migracja
            └── Dzień 5: Error boundaries + Deploy

Tydzień 4:  [FAZA 3] Wydajność
            ├── Dzień 1-2: Redis setup + rate limiting
            ├── Dzień 3: Redis cache
            ├── Dzień 4: Image optimization + code splitting
            └── Dzień 5: Parallel loading + Deploy

Tydzień 5:  [FAZA 4a] PostgreSQL
            ├── Dzień 1: Prisma setup + schemat
            ├── Dzień 2-3: Migracja lib/db.ts
            ├── Dzień 4: Skrypt migracji danych
            └── Dzień 5: Testowanie

Tydzień 6:  [FAZA 4b] PostgreSQL + Backupy
            ├── Dzień 1-2: Testowanie na staging
            ├── Dzień 3: Migracja produkcyjna
            ├── Dzień 4-5: S3 backupy + monitoring

Tydzień 7+: [FAZA 5] Nowe funkcje
            ├── Stripe subscriptions
            ├── REST API + dokumentacja
            ├── Bulk processing
            └── Historia obrazów
```

---

## Wymagania Infrastrukturalne

### Nowe serwisy:
1. **PostgreSQL** - baza danych (DigitalOcean Managed DB lub self-hosted)
2. **Redis** - już w docker-compose
3. **S3/Spaces** - storage dla backupów

### Zmienne środowiskowe do dodania:
```env
# PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/pixelift"

# Redis
REDIS_URL="redis://localhost:6379"

# S3 Backups
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="pixelift-backups"
AWS_S3_REGION="eu-central-1"

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_STARTER=""
STRIPE_PRICE_PRO=""
STRIPE_PRICE_ENTERPRISE=""
```

---

## Metryki Sukcesu

| Metryka | Przed | Cel |
|---------|-------|-----|
| Test coverage | 0% | >80% |
| API response time | ~500ms | <200ms |
| Security headers | 0/6 | 6/6 |
| Rate limit persistence | No | Yes (Redis) |
| Database ACID | No | Yes |
| Automated backups | No | Daily |

---

## Notatki Implementacyjne

### Kompatybilność wsteczna
- API responses zachowują ten sam format
- Migracja DB jest transparentna dla użytkowników
- Stare URL-e działają (redirecty jeśli potrzeba)

### Rollback plan
- Każda faza ma punkt przywrócenia
- JSON backupy zachowane przez 30 dni po migracji
- Feature flags dla nowych funkcji

### Monitoring
- Sentry dla błędów (już skonfigurowane)
- Dodać: response time monitoring
- Dodać: database query performance
- Dodać: Redis hit rate metrics

---

## NOWE PROPOZYCJE FUNKCJI (z audytu 2024-12-10)

### Funkcjonalności użytkownika

| # | Funkcja | Opis | Priorytet |
|---|---------|------|-----------|
| 1 | Before/After Slider | Porównanie przed i po przetworzeniu | WYSOKI |
| 2 | Batch Processing UI | Lepszy interfejs do wielu obrazów | ŚREDNI |
| 3 | Ulubione narzędzia | Zapisywanie w dashboardzie | NISKI |
| 4 | Historia z filtrami | Filtrowanie po typie/dacie | ŚREDNI |
| 5 | Udostępnianie wyników | Publiczne linki jak imgur | NISKI |

### Funkcjonalności biznesowe

| # | Funkcja | Opis | Priorytet |
|---|---------|------|-----------|
| 6 | Team accounts | Konta firmowe z wieloma użytkownikami | ŚREDNI |
| 7 | API usage dashboard | Wykresy użycia API w czasie | WYSOKI |
| 8 | Webhooks dla użytkowników | Powiadomienia o zakończeniu | ŚREDNI |
| 9 | Affiliate program | Program partnerski | NISKI |

### Techniczne ulepszenia

| # | Funkcja | Opis | Priorytet |
|---|---------|------|-----------|
| 10 | PWA | Offline support, instalacja | ŚREDNI |
| 11 | WebSocket updates | Real-time zamiast polling | WYSOKI |
| 12 | Image CDN | Cloudflare Images dla szybkości | ŚREDNI |
| 13 | Design System | Button, Input, Modal components | WYSOKI |

---

## CHECKLISTY DO WYKONANIA

### Przed każdym deployem
- [ ] Testy przechodzą (`npm test`)
- [ ] Build się kompiluje (`npm run build`)
- [ ] Brak nowych błędów TypeScript
- [ ] Sprawdzone na mobile

### Tygodniowy przegląd
- [ ] Sprawdzić Sentry errors
- [ ] Przejrzeć nowe TODO/FIXME
- [ ] Sprawdzić performance metrics
- [ ] Review otwartych issues

### Miesięczny przegląd
- [ ] Security audit (dependencies)
- [ ] Bundle size analysis
- [ ] Lighthouse audit
- [ ] Translation completeness

---

## KONTAKTY I ZASOBY

**Serwer produkcyjny:** 138.68.79.23
**Repozytorium:** https://github.com/Mitjano/upsizer
**Domena:** pixelift.pl

**Usługi zewnętrzne:**
- Firebase (storage, auth)
- Replicate (AI models)
- Stripe (płatności)
- Sentry (monitoring błędów)
- DigitalOcean (hosting)

---

*Dokument aktualizowany po każdym audycie.*
