# Pixelift - Plan Rozwoju

## Zakończone (14.12.2024)

### Copy Link / Share Feature
- [x] Dodać ikonę 'link' do ActionButton
- [x] Utworzyć komponent CopyLinkButton
- [x] Eksportować CopyLinkButton z barrel file
- [x] Utworzyć stronę /share/[id] z OG meta tagami
- [x] Dodać tłumaczenia (en, pl)
- [x] Zintegrować z ImageUpscaler
- [x] Zintegrować z BackgroundRemover
- [x] Wdrożyć na produkcję

---

## Do Zrobienia

### 1. Rozszerzyć Copy Link na pozostałe narzędzia

**Priorytet: Wysoki**

Narzędzia wymagające modyfikacji API (muszą zapisywać obrazy do bazy):

- [ ] **ImageExpander** (`/api/expand-image`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **PackshotGenerator** (`/api/generate-packshot`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **ObjectRemover** (`/api/object-removal`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **ImageColorizer** (`/api/colorize`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **ImageDenoiser** (`/api/denoise`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **StyleTransfer** (`/api/style-transfer`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **ImageReimagine** (`/api/reimagine`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **InpaintingPro** (`/api/inpainting`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

- [ ] **StructureControl** (`/api/structure-control`)
  - Dodać zapis do ProcessedImagesDB
  - Zwracać imageId w response
  - Dodać CopyLinkButton do komponentu

---

### 2. Social Share Buttons

**Priorytet: Średni**

- [ ] Dodać przyciski udostępniania na stronie /share/[id]:
  - Facebook Share
  - Twitter/X Share
  - Pinterest Pin
  - LinkedIn Share
  - WhatsApp Share
  - Copy Link (już jest przez CopyLinkButton)

- [ ] Utworzyć komponent `SocialShareButtons`
- [ ] Dodać intent URLs dla każdej platformy

---

### 3. Analytics dla Share

**Priorytet: Średni**

- [ ] Śledzić kliknięcia w linki share
- [ ] Dodać pole `shareCount` do ProcessedImage schema
- [ ] Endpoint do inkrementacji licznika
- [ ] Dashboard z statystykami udostępnień

---

### 4. Ulepszenia UX Share Page

**Priorytet: Niski**

- [ ] Dodać informację o narzędziu użytym do przetworzenia
- [ ] Before/After comparison na share page
- [ ] Galeria ostatnich publicznych obrazów
- [ ] QR code do share link

---

### 5. Inne usprawnienia Pixelift

**Priorytet: Do ustalenia**

- [ ] Batch processing - przetwarzanie wielu obrazów naraz
- [ ] History page - historia wszystkich przetworzonych obrazów
- [ ] Favorites - oznaczanie ulubionych
- [ ] Folders - organizacja obrazów w foldery
- [ ] API rate limiting dashboard
- [ ] Webhook notifications

---

## Notatki techniczne

### Wzorzec dodawania Copy Link do narzędzia

1. **Modyfikacja API route** (`/api/[tool]/route.ts`):
```typescript
import { ProcessedImagesDB } from '@/lib/processed-images-db';
import { ImageProcessor } from '@/lib/image-processor';

// Po przetworzeniu obrazu:
const processedPath = await ImageProcessor.saveFile(resultBuffer, filename, 'processed');

const imageRecord = await ProcessedImagesDB.create({
  userId: user.email,
  originalPath,
  processedPath,
  originalFilename: file.name,
  fileSize: file.size,
  width,
  height,
  isProcessed: true,
});

// W response dodać:
return NextResponse.json({
  // ... existing fields
  imageId: imageRecord.id,
});
```

2. **Modyfikacja komponentu** (`/components/[Tool].tsx`):
```typescript
import { CopyLinkButton } from './shared';

// W result interface dodać:
interface ProcessingResult {
  imageId: string;
  // ... existing fields
}

// W sekcji Actions dodać:
<CopyLinkButton imageId={result.imageId} accentColor="[tool-color]" />
```

### Pliki kluczowe

- `/components/shared/CopyLinkButton.tsx` - komponent przycisku
- `/components/shared/ActionButton.tsx` - ikona 'link'
- `/app/[locale]/share/[id]/page.tsx` - strona udostępniania
- `/lib/processed-images-db.ts` - baza danych obrazów
- `/lib/image-processor.ts` - przetwarzanie i zapis obrazów

---

## Kontakt

Projekt: Pixelift
Repo: https://github.com/Mitjano/upsizer
Produkcja: https://pixelift.pl
