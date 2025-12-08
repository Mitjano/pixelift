# Content Hub v2 - Zintegrowany System SEO & Content Creation

## Wizja Projektu

Połączenie Tag Recommender, Content Ideas Generator i Content Editor w jeden spójny moduł **Content Hub**, który:
1. Generuje wysokojakościowe słowa kluczowe i frazy SEO
2. Analizuje konkurencję i SERP przed pisaniem
3. Na ich podstawie tworzy artykuły z pomocą Claude AI
4. Automatycznie optymalizuje treść (SEO score loop)
5. Generuje obrazki z AI (Flux/SDXL)
6. Automatycznie tłumaczy i publikuje na wszystkich wersjach językowych (en, pl, es, fr)
7. Monitoruje pozycje i odświeża stare artykuły
8. Repurposuje content na social media

---

## Architektura Content Hub v2

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              CONTENT HUB v2                                        │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │  STEP 1  │──▶│  STEP 2  │──▶│  STEP 3  │──▶│  STEP 4  │──▶│  STEP 5  │        │
│  │ Research │   │ Planning │   │ Writing  │   │ Optimize │   │ Publish  │        │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│       │              │              │              │              │               │
│       ▼              ▼              ▼              ▼              ▼               │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │• Keywords│   │• SERP    │   │• Claude  │   │• SEO     │   │• Trans   │        │
│  │• Volume  │   │  Analysis│   │  Writer  │   │  Score   │   │• Images  │        │
│  │• Clusters│   │• Compet. │   │• Images  │   │• Auto-fix│   │• Social  │        │
│  │• Priority│   │• Brief   │   │• FAQ     │   │• Links   │   │• Schedule│        │
│  │• Bank    │   │• Calendar│   │• Schema  │   │• Quality │   │• Notify  │        │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│                                                                                    │
│  ════════════════════════════════════════════════════════════════════════════    │
│                                                                                    │
│  POST-PUBLISH LOOP:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐     │
│  │  Monitor Positions → Alert (drop) → Refresh Content → Re-publish        │     │
│  │         ↑                                                    │          │     │
│  │         └────────────────────────────────────────────────────┘          │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                                                                                    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## STEP 1: Keyword Research (Ulepszony Tag Recommender)

### Obecny stan:
- Generuje tagi z OpenAI GPT-4o-mini
- Google Suggest integration
- Scoring tagów

### Nowe funkcje:
1. **Keyword Clusters** - grupowanie słów kluczowych po intencji i temacie
2. **Content Gap Analysis** - jakich słów brakuje vs konkurencja
3. **Keyword Bank** - zapisywanie słów kluczowych do bazy (Prisma)
4. **Priority Queue** - kolejka słów do wykorzystania w artykułach
5. **Competitor Keyword Spy** - analiza słów kluczowych konkurencji
6. **Keyword Trends** - śledzenie trendów wyszukiwań w czasie
7. **SERP Features Detection** - wykrywanie featured snippets, PAA, images

### Nowy model Prisma:

```prisma
model KeywordBank {
  id              String   @id @default(cuid())
  keyword         String
  locale          String   // en, pl, es, fr
  searchVolume    Int?
  difficulty      Int?     // 0-100
  cpc             Float?
  intent          String?  // informational, transactional, commercial, navigational
  cluster         String?  // grupa tematyczna
  status          String   @default("new") // new, planned, used, archived
  priority        Int      @default(0) // 0-100
  source          String?  // tag_recommender, manual, competitor_analysis
  relatedKeywords String[] // powiązane słowa
  serpFeatures    String[] // featured_snippet, people_also_ask, images, videos
  trend           String?  // rising, stable, falling
  lastChecked     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  usedInArticles  ArticleKeyword[]

  @@unique([keyword, locale])
  @@index([locale, status])
  @@index([cluster])
  @@index([priority])
}

model KeywordCluster {
  id          String   @id @default(cuid())
  name        String
  description String?
  locale      String
  parentId    String?  // hierarchia klastrów
  keywords    String[] // lista keyword IDs
  createdAt   DateTime @default(now())

  @@unique([name, locale])
}
```

---

## STEP 2: Content Planning (Ulepszony Ideas Generator)

### Obecny stan:
- Generuje pomysły na artykuły
- Tworzy outline
- Questions research

### Nowe funkcje:
1. **Content Calendar** - planowanie publikacji z timezone support
2. **Article Queue** - kolejka artykułów do napisania z priorytetami
3. **Automated Topic Selection** - AI wybiera najlepsze tematy z Keyword Bank
4. **Content Brief** - szczegółowy brief dla Claude AI
5. **SERP Analysis** - analiza TOP 10 przed pisaniem (avg. word count, headings, FAQ)
6. **Competitor Content Spy** - analiza struktury artykułu konkurenta
7. **A/B Title Generator** - generowanie wariantów tytułów do testowania
8. **Content Gap Finder** - co pokrywa konkurencja czego my nie mamy

### Nowy model Prisma:

```prisma
model ContentPlan {
  id                String   @id @default(cuid())
  title             String
  titleVariants     String[] // A/B testing variants
  slug              String
  targetKeyword     String
  secondaryKeywords String[]
  contentType       String   // blog, knowledge, tutorial, comparison, case-study
  targetLocale      String   // główny język (en)
  status            String   @default("planned") // planned, writing, review, published, archived
  priority          Int      @default(0)
  outline           Json?    // struktura artykułu
  brief             Json?    // szczegółowy brief dla AI
  serpAnalysis      Json?    // analiza TOP 10 wyników
  competitorUrls    String[] // URLe konkurencji do analizy
  estimatedWords    Int?
  actualWords       Int?
  scheduledFor      DateTime?
  scheduledTimezone String?  // np. "Europe/Warsaw"
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  keywords        ArticleKeyword[]
  articles        Article[]
}

model ArticleKeyword {
  id            String      @id @default(cuid())
  keywordId     String
  contentPlanId String
  isPrimary     Boolean     @default(false)
  keyword       KeywordBank @relation(fields: [keywordId], references: [id])
  contentPlan   ContentPlan @relation(fields: [contentPlanId], references: [id])

  @@unique([keywordId, contentPlanId])
}

model SerpSnapshot {
  id            String   @id @default(cuid())
  keyword       String
  locale        String
  results       Json     // top 10 results with metadata
  avgWordCount  Int?
  commonHeadings String[]
  commonQuestions String[]
  featuredSnippet Json?
  createdAt     DateTime @default(now())

  @@index([keyword, locale])
}
```

---

## STEP 3: Article Creation (Claude AI Writer)

### Kluczowa funkcja - pisanie artykułów przez Claude

**Flow:**
1. Pobierz Content Plan z briefem
2. Wyślij do Claude API z odpowiednim promptem
3. Claude generuje pełny artykuł w Markdown
4. Artykuł trafia do edytora do review
5. Admin może edytować lub zatwierdzić

### Claude Integration:

```typescript
// lib/content-hub/claude-writer.ts

interface ArticleBrief {
  title: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  outline: ArticleOutline;
  contentType: 'blog' | 'knowledge' | 'tutorial';
  targetWordCount: number;
  tone: 'professional' | 'friendly' | 'technical';
  locale: string;
  internalLinksToInclude: string[];
  competitorInsights?: string;
}

async function generateArticle(brief: ArticleBrief): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: buildArticlePrompt(brief)
    }]
  });

  return response.content[0].text;
}
```

### Prompt Template:

```typescript
function buildArticlePrompt(brief: ArticleBrief): string {
  return `
You are an expert content writer for Pixelift, an AI-powered image editing platform.

Write a comprehensive ${brief.contentType} article in ${brief.locale} language.

## Article Details:
- Title: ${brief.title}
- Primary Keyword: ${brief.targetKeyword}
- Secondary Keywords: ${brief.secondaryKeywords.join(', ')}
- Target Word Count: ${brief.targetWordCount}
- Tone: ${brief.tone}

## Outline to Follow:
${JSON.stringify(brief.outline, null, 2)}

## Requirements:
1. Write in ${brief.locale} language ONLY
2. Include the primary keyword naturally 3-5 times
3. Use secondary keywords throughout the article
4. Structure with proper H2 and H3 headings
5. Include a compelling introduction with a hook
6. Add practical examples and tips
7. Include internal links: ${brief.internalLinksToInclude.join(', ')}
8. End with a clear call-to-action for Pixelift
9. Add FAQ section with 3-5 questions (for schema.org)
10. Format in Markdown

## Brand Voice:
- Pixelift is professional but approachable
- Focus on practical benefits for users
- Emphasize AI capabilities and time-saving
- Target audience: photographers, e-commerce, marketers

Write the complete article now:
`;
}
```

### Nowy model Prisma:

```prisma
model Article {
  id              String   @id @default(cuid())
  contentPlanId   String?
  locale          String
  title           String
  slug            String
  content         String   @db.Text
  excerpt         String?
  featuredImage   String?
  metaTitle       String?
  metaDescription String?
  author          String   @default("Pixelift Team")
  categories      String[]
  tags            String[]
  status          String   @default("draft") // draft, review, published
  contentType     String   // blog, knowledge
  wordCount       Int?
  seoScore        Int?
  aiGenerated     Boolean  @default(false)
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Translation tracking
  sourceArticleId String?  // ID artykułu źródłowego (en)
  isTranslation   Boolean  @default(false)

  contentPlan     ContentPlan? @relation(fields: [contentPlanId], references: [id])
  sourceArticle   Article?     @relation("Translations", fields: [sourceArticleId], references: [id])
  translations    Article[]    @relation("Translations")

  @@unique([slug, locale])
}
```

---

## STEP 4: Optimize & Quality Gates (NOWY!)

### Automatyczna optymalizacja artykułu

Po wygenerowaniu artykułu przez Claude, system automatycznie:

1. **SEO Score Check** - oblicza wynik SEO (target: 80+)
2. **Auto-Optimization Loop** - jeśli score < 80, Claude poprawia słabe sekcje
3. **Internal Linking** - automatycznie wstawia linki do powiązanych artykułów
4. **Quality Gates** - sprawdzenia przed publikacją

### Quality Gates Checklist:

```typescript
interface QualityGates {
  // Wymagane do publikacji
  minWordCount: 1500;
  minSeoScore: 75;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  hasFeaturedImage: boolean;
  hasInternalLinks: number; // min 3
  hasExternalLinks: number; // min 1
  hasFaqSection: boolean;

  // Opcjonalne ale zalecane
  hasTableOfContents: boolean;
  hasImages: number; // min 2
  keywordDensity: { min: 0.5, max: 2.5 }; // %
  readabilityScore: number; // Flesch > 60

  // Bezpieczeństwo
  plagiarismCheck: boolean; // porównanie z innymi artykułami
  brandVoiceScore: number; // spójność z tonem marki
  factCheckFlags: string[]; // potencjalne błędy do weryfikacji
}
```

### Auto-fix Flow:

```typescript
async function optimizeArticle(articleId: string): Promise<OptimizationResult> {
  const article = await getArticle(articleId);
  let currentScore = await calculateSeoScore(article);
  let iterations = 0;
  const maxIterations = 3;

  while (currentScore.total < 80 && iterations < maxIterations) {
    // Znajdź najsłabsze obszary
    const weakAreas = findWeakAreas(currentScore);

    // Claude poprawia te obszary
    const improvedContent = await claudeImprove(article, weakAreas);

    // Zapisz i przelicz
    await updateArticle(articleId, improvedContent);
    currentScore = await calculateSeoScore(improvedContent);
    iterations++;
  }

  // Dodaj internal links
  const withLinks = await addInternalLinks(article);

  // Sprawdź quality gates
  const gatesResult = await checkQualityGates(withLinks);

  return {
    finalScore: currentScore,
    iterations,
    qualityGates: gatesResult,
    readyToPublish: gatesResult.passed
  };
}
```

### Internal Linking Intelligence:

```typescript
async function addInternalLinks(article: Article): Promise<Article> {
  // Znajdź powiązane artykuły
  const relatedArticles = await findRelatedArticles(article.content, article.locale);

  // Claude sugeruje gdzie wstawić linki
  const linkedContent = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `
Add internal links to this article naturally.

Available articles to link:
${relatedArticles.map(a => `- ${a.title}: ${a.url}`).join('\n')}

Article content:
${article.content}

Rules:
1. Add 3-5 internal links naturally in the text
2. Use descriptive anchor text (not "click here")
3. Link only where contextually relevant
4. Don't over-link (max 1 link per 300 words)

Return the article with links added in Markdown format.
`
    }]
  });

  return { ...article, content: linkedContent.content[0].text };
}
```

### Nowy model Prisma:

```prisma
model ArticleOptimization {
  id              String   @id @default(cuid())
  articleId       String
  initialScore    Int
  finalScore      Int
  iterations      Int
  improvements    Json     // co zostało poprawione
  qualityGates    Json     // wyniki quality gates
  internalLinks   String[] // dodane linki
  createdAt       DateTime @default(now())
}
```

---

## STEP 5: Auto-Translate & Publish (rozszerzony)

### Flow:
1. Artykuł zatwierdzony w języku angielskim (głównym)
2. System automatycznie tłumaczy na pl, es, fr
3. **AI Image Generation** - generowanie featured image z Flux/SDXL
4. Tłumaczenia trafiają do review lub auto-publish
5. **Scheduled Publishing** - publikacja o określonej godzinie per locale
6. **Social Media Repurposing** - generowanie postów na social media
7. **Update Old Articles** - dodanie linków do nowego artykułu w starych

### Translation Service:

```typescript
// lib/content-hub/translator.ts

async function translateArticle(
  articleId: string,
  targetLocales: string[]
): Promise<TranslationResult[]> {
  const sourceArticle = await getArticle(articleId);
  const results: TranslationResult[] = [];

  for (const locale of targetLocales) {
    const translated = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: buildTranslationPrompt(sourceArticle, locale)
      }]
    });

    // Save translation
    const translatedArticle = await saveTranslation({
      ...sourceArticle,
      locale,
      content: translated.content[0].text,
      sourceArticleId: articleId,
      isTranslation: true,
      status: 'review' // or 'published' for auto-publish
    });

    results.push({ locale, articleId: translatedArticle.id });
  }

  return results;
}
```

### Translation Prompt:

```typescript
function buildTranslationPrompt(article: Article, targetLocale: string): string {
  const localeNames = {
    pl: 'Polish',
    es: 'Spanish',
    fr: 'French',
    en: 'English'
  };

  return `
Translate the following article to ${localeNames[targetLocale]}.

## Translation Guidelines:
1. Maintain the same structure and formatting
2. Keep all Markdown syntax intact
3. Translate naturally, not word-by-word
4. Adapt idioms and expressions to target language
5. Keep brand name "Pixelift" unchanged
6. Keep technical terms if commonly used in target language
7. Maintain SEO-friendly keyword placement
8. Keep internal links URLs unchanged

## Original Article (${article.locale}):

Title: ${article.title}

${article.content}

---

Provide the complete translated article in ${localeNames[targetLocale]}:
`;
}
```

### AI Image Generation:

```typescript
// lib/content-hub/image-generator.ts

interface ImageGenerationRequest {
  articleTitle: string;
  articleSummary: string;
  style: 'professional' | 'creative' | 'minimal' | 'photo-realistic';
  aspectRatio: '16:9' | '1:1' | '4:3';
}

async function generateFeaturedImage(request: ImageGenerationRequest): Promise<string> {
  // Generuj prompt dla obrazka na podstawie artykułu
  const imagePrompt = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `
Create an image generation prompt for a blog article featured image.

Article: ${request.articleTitle}
Summary: ${request.articleSummary}
Style: ${request.style}

Requirements:
- Professional, clean design suitable for blog
- No text in the image
- Relevant to the article topic
- Brand colors: purple/violet tones

Return ONLY the image prompt, nothing else.
`
    }]
  });

  // Użyj istniejącego API do generowania obrazka (Flux/SDXL)
  const response = await fetch('/api/ai-image/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: imagePrompt.content[0].text,
      aspectRatio: request.aspectRatio,
      model: 'flux-pro'
    })
  });

  const { imageUrl } = await response.json();
  return imageUrl;
}
```

### Social Media Repurposing:

```typescript
// lib/content-hub/social-repurpose.ts

interface SocialContent {
  twitter: {
    thread: string[];      // max 280 chars each
    singlePost: string;
  };
  linkedin: {
    post: string;          // longer format
  };
  facebook: {
    post: string;
  };
  newsletter: {
    snippet: string;       // email teaser
    subject: string;
  };
}

async function generateSocialContent(article: Article): Promise<SocialContent> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `
Generate social media content for this article.

Title: ${article.title}
URL: https://pixelift.pl/blog/${article.slug}
Summary: ${article.excerpt}

Generate:
1. Twitter/X thread (5-7 tweets, max 280 chars each, with emojis)
2. Twitter/X single post (catchy, with link)
3. LinkedIn post (professional, 1-3 paragraphs)
4. Facebook post (engaging, with question)
5. Newsletter snippet (teaser to click)
6. Email subject line (compelling)

Return as JSON with this structure:
{
  "twitter": { "thread": [...], "singlePost": "..." },
  "linkedin": { "post": "..." },
  "facebook": { "post": "..." },
  "newsletter": { "snippet": "...", "subject": "..." }
}
`
    }],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.content[0].text);
}
```

### Scheduled Publishing:

```typescript
// lib/content-hub/scheduler.ts

interface PublishSchedule {
  articleId: string;
  locales: {
    locale: string;
    scheduledAt: Date;
    timezone: string;
    status: 'scheduled' | 'published' | 'failed';
  }[];
  socialPosts: {
    platform: 'twitter' | 'linkedin' | 'facebook';
    scheduledAt: Date;
    content: string;
    status: 'scheduled' | 'posted' | 'failed';
  }[];
}

// Optymalne godziny publikacji per locale
const OPTIMAL_PUBLISH_TIMES = {
  en: { hour: 9, timezone: 'America/New_York' },      // 9 AM EST
  pl: { hour: 10, timezone: 'Europe/Warsaw' },        // 10 AM CET
  es: { hour: 10, timezone: 'Europe/Madrid' },        // 10 AM CET
  fr: { hour: 10, timezone: 'Europe/Paris' },         // 10 AM CET
};

async function schedulePublication(
  articleId: string,
  baseDate: Date,
  options: { autoSocial: boolean }
): Promise<PublishSchedule> {
  const schedule: PublishSchedule = {
    articleId,
    locales: [],
    socialPosts: []
  };

  // Zaplanuj publikację dla każdego locale
  for (const [locale, config] of Object.entries(OPTIMAL_PUBLISH_TIMES)) {
    const publishDate = new Date(baseDate);
    publishDate.setHours(config.hour, 0, 0, 0);

    schedule.locales.push({
      locale,
      scheduledAt: publishDate,
      timezone: config.timezone,
      status: 'scheduled'
    });
  }

  // Zaplanuj posty social media (30 min po publikacji)
  if (options.autoSocial) {
    const socialContent = await generateSocialContent(await getArticle(articleId));
    const socialDelay = 30 * 60 * 1000; // 30 minut

    schedule.socialPosts = [
      {
        platform: 'twitter',
        scheduledAt: new Date(baseDate.getTime() + socialDelay),
        content: socialContent.twitter.singlePost,
        status: 'scheduled'
      },
      {
        platform: 'linkedin',
        scheduledAt: new Date(baseDate.getTime() + socialDelay + 3600000), // +1h
        content: socialContent.linkedin.post,
        status: 'scheduled'
      }
    ];
  }

  await saveSchedule(schedule);
  return schedule;
}
```

### Nowe modele Prisma dla publikacji:

```prisma
model PublishSchedule {
  id          String   @id @default(cuid())
  articleId   String
  locale      String
  scheduledAt DateTime
  timezone    String
  status      String   @default("scheduled") // scheduled, published, failed, cancelled
  publishedAt DateTime?
  error       String?
  createdAt   DateTime @default(now())

  @@index([status, scheduledAt])
}

model SocialPost {
  id          String   @id @default(cuid())
  articleId   String
  platform    String   // twitter, linkedin, facebook
  content     String   @db.Text
  scheduledAt DateTime
  status      String   @default("scheduled") // scheduled, posted, failed
  postedAt    DateTime?
  postUrl     String?  // URL do posta po opublikowaniu
  error       String?
  createdAt   DateTime @default(now())

  @@index([status, scheduledAt])
}
```

---

## STEP 6: Content Refresh & Monitoring (NOWY!)

### Monitorowanie pozycji artykułów

System automatycznie monitoruje pozycje artykułów i alertuje gdy spadają.

### Content Refresh Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT REFRESH LOOP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Monitor ──▶ Alert ──▶ Analyze ──▶ Refresh ──▶ Re-publish       │
│     │                                              │             │
│     └──────────────────────────────────────────────┘             │
│                                                                  │
│  1. Cron sprawdza pozycje co tydzień                            │
│  2. Alert gdy pozycja spadła > 5 miejsc                         │
│  3. AI analizuje co się zmieniło (konkurencja)                  │
│  4. Claude aktualizuje artykuł                                  │
│  5. Re-publikacja z nową datą                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Refresh Analysis:

```typescript
// lib/content-hub/refresh-analyzer.ts

interface RefreshAnalysis {
  articleId: string;
  currentPosition: number;
  previousPosition: number;
  positionDelta: number;
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    type: 'content' | 'keywords' | 'structure' | 'freshness';
    suggestion: string;
  }[];
  competitorChanges: {
    url: string;
    change: string;  // "new content", "updated", "new competitor"
  }[];
  suggestedUpdates: string[];
}

async function analyzeForRefresh(articleId: string): Promise<RefreshAnalysis> {
  const article = await getArticle(articleId);
  const keyword = article.targetKeyword;

  // Pobierz aktualne SERP
  const currentSerp = await analyzeSERP(keyword, article.locale);

  // Porównaj z poprzednim
  const previousSerp = await getLastSerpSnapshot(keyword, article.locale);

  // AI analizuje różnice
  const analysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `
Analyze why this article might be losing rankings.

Our Article:
- Title: ${article.title}
- Published: ${article.publishedAt}
- Word count: ${article.wordCount}
- Current position: ${article.currentPosition}
- Previous position: ${article.previousPosition}

Current TOP 5 competitors:
${currentSerp.results.slice(0, 5).map((r, i) => `
${i + 1}. ${r.title}
   URL: ${r.url}
   Word count: ~${r.wordCount}
   Last updated: ${r.lastModified || 'unknown'}
`).join('')}

Provide:
1. Top 3 reasons why we might be losing position
2. Specific content updates to make
3. New sections or topics to add
4. Keywords to better optimize for

Return as JSON.
`
    }]
  });

  return JSON.parse(analysis.content[0].text);
}

async function refreshArticle(articleId: string): Promise<Article> {
  const analysis = await analyzeForRefresh(articleId);
  const article = await getArticle(articleId);

  // Claude aktualizuje artykuł
  const refreshedContent = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `
Update this article to improve its SEO rankings.

Current Article:
${article.content}

Required Updates:
${analysis.suggestedUpdates.map(u => `- ${u}`).join('\n')}

New Topics to Cover:
${analysis.recommendations.filter(r => r.type === 'content').map(r => `- ${r.suggestion}`).join('\n')}

Guidelines:
1. Keep the same structure and tone
2. Add new relevant information
3. Update any outdated facts
4. Add new FAQ questions if relevant
5. Maintain all existing internal links
6. Mark what's new with subtle updates (don't add "Updated 2024" banners)

Return the complete updated article in Markdown.
`
    }]
  });

  // Zapisz nową wersję
  const updatedArticle = await updateArticle(articleId, {
    content: refreshedContent.content[0].text,
    updatedAt: new Date(),
    version: article.version + 1
  });

  return updatedArticle;
}
```

### Article Versioning:

```prisma
model ArticleVersion {
  id          String   @id @default(cuid())
  articleId   String
  version     Int
  content     String   @db.Text
  changes     String?  // opis zmian
  wordCount   Int
  seoScore    Int?
  createdAt   DateTime @default(now())
  createdBy   String   // "ai_refresh" | "manual" | userId

  @@unique([articleId, version])
  @@index([articleId])
}

model ContentAlert {
  id          String   @id @default(cuid())
  articleId   String
  type        String   // position_drop, competitor_update, content_stale
  severity    String   // high, medium, low
  message     String
  data        Json?    // dodatkowe dane
  status      String   @default("new") // new, acknowledged, resolved, ignored
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  @@index([status, severity])
}
```

---

## UI Design - Content Hub Dashboard

### Nowa strona: `/app/[locale]/admin/content-hub/page.tsx`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Content Hub                                                    [+ New]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Keywords   │ │  Planning   │ │   Writing   │ │  Published  │           │
│  │     127     │ │     12      │ │      3      │ │     45      │           │
│  │   in bank   │ │   planned   │ │ in progress │ │   articles  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  TABS: [Keyword Bank] [Content Queue] [Article Editor] [Translations]       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  [Current Tab Content]                                               │  │
│  │                                                                       │  │
│  │  - Keyword Bank: lista słów z filtrowaniem, bulk actions            │  │
│  │  - Content Queue: kolejka artykułów do napisania                    │  │
│  │  - Article Editor: edytor z AI writer integration                   │  │
│  │  - Translations: status tłumaczeń per artykuł                       │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sub-pages:

1. **`/admin/content-hub`** - Dashboard z overview i alertami
2. **`/admin/content-hub/keywords`** - Keyword Bank management
3. **`/admin/content-hub/planning`** - Content Calendar & Queue
4. **`/admin/content-hub/write`** - AI Article Writer
5. **`/admin/content-hub/write/[id]`** - Edit specific article
6. **`/admin/content-hub/translations`** - Translation management
7. **`/admin/content-hub/social`** - Social media posts queue
8. **`/admin/content-hub/refresh`** - Content refresh alerts & queue
9. **`/admin/content-hub/analytics`** - Content performance analytics

---

## API Routes Structure

```
/app/api/content-hub/
├── keywords/
│   ├── route.ts                  # GET list, POST add keyword
│   ├── [id]/route.ts             # GET, PUT, DELETE single keyword
│   ├── bulk/route.ts             # Bulk operations
│   ├── import/route.ts           # Import from Tag Recommender
│   ├── clusters/route.ts         # Get/create keyword clusters
│   └── analyze/route.ts          # Analyze keyword (volume, difficulty, SERP)
├── planning/
│   ├── route.ts                  # GET queue, POST create plan
│   ├── [id]/route.ts             # GET, PUT, DELETE plan
│   ├── generate/route.ts         # AI generate content plan from keyword
│   ├── calendar/route.ts         # Calendar view data
│   ├── serp/route.ts             # SERP analysis for keyword
│   └── competitor/route.ts       # Analyze competitor content
├── articles/
│   ├── route.ts                  # GET list, POST create
│   ├── [id]/route.ts             # GET, PUT, DELETE article
│   ├── [id]/generate/route.ts    # Generate article with Claude
│   ├── [id]/optimize/route.ts    # Run SEO optimization loop
│   ├── [id]/translate/route.ts   # Translate to other locales
│   ├── [id]/publish/route.ts     # Publish article
│   ├── [id]/refresh/route.ts     # Refresh/update existing article
│   ├── [id]/image/route.ts       # Generate featured image
│   └── [id]/versions/route.ts    # Get article versions
├── social/
│   ├── route.ts                  # GET scheduled posts, POST create
│   ├── [id]/route.ts             # GET, PUT, DELETE post
│   ├── generate/route.ts         # Generate social content from article
│   └── publish/route.ts          # Publish to platform
├── schedule/
│   ├── route.ts                  # GET schedules, POST create
│   └── [id]/route.ts             # Manage schedule
├── alerts/
│   ├── route.ts                  # GET alerts
│   └── [id]/route.ts             # Acknowledge/resolve alert
├── analytics/
│   ├── route.ts                  # Overall content analytics
│   ├── articles/route.ts         # Per-article performance
│   └── keywords/route.ts         # Keyword performance
└── stats/route.ts                # Content Hub statistics
```

---

## Workflow - Od Keyword do Published Article

### Pełny flow:

```
1. KEYWORD RESEARCH
   └─▶ Admin wchodzi na Tag Recommender
   └─▶ Wpisuje temat (np. "background removal")
   └─▶ System generuje 50+ słów kluczowych
   └─▶ Admin wybiera najlepsze (np. 10)
   └─▶ Klik "Add to Keyword Bank" ───▶ Zapisane w DB

2. CONTENT PLANNING
   └─▶ Admin wchodzi na Content Hub
   └─▶ Widzi Keyword Bank z priorytetami
   └─▶ Wybiera keyword "how to remove background from image"
   └─▶ Klik "Create Content Plan"
   └─▶ System (Claude) generuje:
       - Sugerowany tytuł
       - Outline (H2, H3)
       - Secondary keywords
       - Estimated word count
       - Content brief
   └─▶ Admin zatwierdza lub edytuje
   └─▶ Plan zapisany w kolejce

3. ARTICLE WRITING
   └─▶ Admin wchodzi na Content Queue
   └─▶ Widzi listę zaplanowanych artykułów
   └─▶ Wybiera artykuł do napisania
   └─▶ Klik "Generate with Claude AI"
   └─▶ Claude generuje pełny artykuł (~2000 słów)
   └─▶ Artykuł pojawia się w edytorze
   └─▶ Admin może:
       - Edytować treść
       - Regenerować sekcje
       - Sprawdzić SEO score
       - Dodać obrazki
   └─▶ Klik "Save as Draft" lub "Submit for Review"

4. REVIEW & PUBLISH
   └─▶ Artykuł w statusie "review"
   └─▶ Admin sprawdza finalnie
   └─▶ Klik "Publish" ───▶ Opublikowany (en)
   └─▶ System automatycznie:
       - Tłumaczy na pl, es, fr
       - Zapisuje tłumaczenia jako "review" lub auto-publish
   └─▶ Admin może przejrzeć tłumaczenia
   └─▶ Klik "Publish All" ───▶ Wszystkie wersje live

5. POST-PUBLISH
   └─▶ Artykuł widoczny na /blog i /knowledge
   └─▶ Keyword status zmienia się na "used"
   └─▶ Tracking: views, engagement
   └─▶ SEO monitoring: pozycje w Google
```

---

## Implementacja - Fazy

### Faza 1: Keyword Bank & Clusters (MVP) - 3-4 dni
- [ ] Dodać modele `KeywordBank`, `KeywordCluster` do Prisma
- [ ] API routes dla keywords CRUD + bulk operations
- [ ] UI: Keyword Bank page z filtrowaniem i sortowaniem
- [ ] Integracja z Tag Recommender ("Add to Bank" button)
- [ ] Keyword clustering (AI grupowanie po tematach)
- [ ] Import/export keywords (CSV)

### Faza 2: Content Planning & SERP Analysis (MVP) - 3-4 dni
- [ ] Dodać modele `ContentPlan`, `SerpSnapshot` do Prisma
- [ ] API routes dla planning
- [ ] SERP analysis endpoint (analiza TOP 10)
- [ ] AI endpoint: generate content plan from keyword
- [ ] Competitor content analysis
- [ ] UI: Content Queue page
- [ ] UI: Content Calendar view (drag & drop scheduling)

### Faza 3: Claude AI Writer (MVP) - 4-5 dni
- [ ] Dodać model `Article` do Prisma
- [ ] Integracja z Claude API (Anthropic SDK)
- [ ] Article generation endpoint z customowym promptem
- [ ] UI: Article Writer page z preview
- [ ] Section regeneration feature
- [ ] SEO score integration (real-time)
- [ ] A/B title variants generation

### Faza 4: Optimization & Quality Gates (MVP) - 2-3 dni
- [ ] Auto-optimization loop (score < 80 → improve)
- [ ] Quality gates checklist
- [ ] Internal linking intelligence
- [ ] Plagiarism check (similarity to existing articles)
- [ ] UI: Optimization panel w edytorze

### Faza 5: Translation System (MVP) - 2-3 dni
- [ ] Translation endpoint z Claude
- [ ] UI: Translation management page
- [ ] Auto-translate on publish option
- [ ] Translation review workflow
- [ ] Batch translation (wszystkie języki naraz)

### Faza 6: Publish & Schedule - 2-3 dni
- [ ] Scheduled publishing z timezone support
- [ ] Publish queue management
- [ ] Auto-publish translations
- [ ] UI: Schedule calendar

### Faza 7: AI Image Generation - 1-2 dni
- [ ] Integration z istniejącym AI Image API
- [ ] Auto-generate featured image from article
- [ ] Image style presets
- [ ] UI: Image generator w edytorze

### Faza 8: Social Media Repurposing - 2-3 dni
- [ ] Social content generation (Twitter, LinkedIn, Facebook)
- [ ] Social posts queue
- [ ] Scheduled posting (integration z Buffer/native APIs)
- [ ] UI: Social media dashboard

### Faza 9: Content Refresh & Monitoring - 2-3 dni
- [ ] Content alerts system (position drops)
- [ ] Refresh analysis AI
- [ ] Article refresh/update endpoint
- [ ] Article versioning
- [ ] UI: Alerts dashboard

### Faza 10: Analytics & Dashboard - 2 dni
- [ ] Content Hub main dashboard
- [ ] Content performance analytics
- [ ] Keyword performance tracking
- [ ] ROI metrics (effort vs results)
- [ ] Export reports

---

## Priority Matrix

| Funkcja | Priority | Effort | Impact | MVP? |
|---------|----------|--------|--------|------|
| Keyword Bank | HIGH | Medium | High | Yes |
| Content Planning | HIGH | Medium | High | Yes |
| Claude AI Writer | HIGH | High | Very High | Yes |
| Auto-Optimization | HIGH | Medium | High | Yes |
| Translation | HIGH | Medium | High | Yes |
| Scheduled Publish | MEDIUM | Low | Medium | No |
| AI Images | MEDIUM | Low | Medium | No |
| Social Repurposing | MEDIUM | Medium | Medium | No |
| Content Refresh | MEDIUM | Medium | High | No |
| Analytics | LOW | Medium | Medium | No |

**MVP (Fazy 1-5): ~14-19 dni**
**Full Version (wszystkie fazy): ~24-32 dni**

---

## Techniczne Wymagania

### Claude API Setup:

```typescript
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Environment Variables:

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

### Package Installation:

```bash
npm install @anthropic-ai/sdk
```

---

## Migracja z Obecnego Systemu

### Co zostaje:
- Tag Recommender UI (rozszerzony o "Add to Bank")
- Content Ideas Generator (integracja z Content Hub)
- Blog system (artykuły teraz w Prisma + JSON backup)
- Knowledge base (integracja z Content Hub)

### Co się zmienia:
- Nowy unified Content Hub dashboard
- Artykuły przechowywane w Prisma (nie tylko JSON)
- Automatyczne tłumaczenia
- Claude AI zamiast tylko OpenAI

### Backward Compatibility:
- Istniejące artykuły JSON pozostają
- Nowe artykuły w Prisma z sync do JSON
- Stopniowa migracja

---

## Koszty i Limity

### Claude API Pricing (estimate):
- Claude Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Artykuł 2000 słów: ~3000 tokens output = ~$0.05
- Tłumaczenie: ~3000 tokens = ~$0.05
- Pełny artykuł + 3 tłumaczenia: ~$0.20

### Rate Limits:
- Implement queue system for bulk operations
- Max 5 concurrent article generations
- Translation batching

---

## Podsumowanie

Content Hub v2 połączy:
1. **Tag Recommender** → Keyword Bank z clusterami i analizą
2. **Content Ideas** → Content Planning z SERP Analysis
3. **Content Editor** → Claude AI Writer z auto-optymalizacją
4. **Manual Translation** → Auto-Translation na 4 języki
5. **Manual Images** → AI Image Generation
6. **Manual Social** → Auto Social Media Repurposing
7. **Static Content** → Content Refresh Loop

### Rezultat: **Pełen pipeline content marketingu z AI**

```
Keyword Research → SERP Analysis → Content Brief → AI Writing →
Auto-Optimize → Quality Gates → AI Images → Translate →
Schedule → Publish → Social Posts → Monitor → Refresh Loop
```

### ROI Estimate:

| Metryka | Manual | Content Hub v2 |
|---------|--------|----------------|
| Czas na artykuł | 4-6h | 30-60 min |
| Czas na tłumaczenia (3 langs) | 3-4h | 5 min |
| Czas na social posts | 1h | 2 min |
| Artykułów / tydzień | 2-3 | 10-15 |
| Koszt per artykuł | $50-100 (copywriter) | ~$0.50 (API) |

### Estimated Implementation:

- **MVP (Fazy 1-5):** 14-19 dni roboczych
- **Full Version (Fazy 1-10):** 24-32 dni roboczych

### Gotowy do implementacji?

Plan jest kompletny. Zaczynam od **Fazy 1: Keyword Bank** gdy dasz zielone światło.

---

## Status Implementacji

- [x] Plan zatwierdzony
- [ ] Faza 1: Keyword Bank & Clusters
- [ ] Faza 2: Content Planning
- [ ] Faza 3: Claude AI Writer
- [ ] Faza 4: Optimization
- [ ] Faza 5: Translation
- [ ] Faza 6-10: Extended Features
