# Pixelift - Production Deployment Guide

## Krok 1: Przygotowanie Firebase & Google OAuth

### 1.1 Firebase Console (https://console.firebase.google.com)

1. Utwórz nowy projekt Firebase (lub użyj istniejącego)
2. Włącz **Firestore Database** (tryb production)
3. Dodaj kolekcję: `apiKeys` (będzie tworzona automatycznie)
4. Pobierz konfigurację:
   - **Project Settings > General** → skopiuj Firebase Config
   - **Project Settings > Service Accounts** → **Generate new private key**

### 1.2 Google Cloud Console (https://console.cloud.google.com)

1. Przejdź do projektu Firebase
2. **APIs & Services > Credentials**
3. Kliknij **Create Credentials > OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs:
   ```
   https://twoja-domena.com/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google (dla testów lokalnych)
   ```
6. Skopiuj **Client ID** i **Client Secret**

---

## Krok 2: Konfiguracja Redis

### Opcja A: Upstash Redis (Darmowy tier - POLECANE)

1. Zarejestruj się: https://upstash.com
2. Create Database → wybierz region (Europe)
3. Skopiuj **REDIS_URL** (format: `rediss://...`)

### Opcja B: DigitalOcean Managed Redis

1. Create → Databases → Redis
2. Plan: Basic ($15/mo)
3. Skopiuj connection string

---

## Krok 3: Deployment na DigitalOcean

### Opcja A: DigitalOcean App Platform (Zalecane - łatwiejsze)

#### 3.1 Połącz GitHub repository

1. Wypchnij kod do GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Pixelift Enterprise API"
   git branch -M main
   git remote add origin https://github.com/twoj-username/pixelift.git
   git push -u origin main
   ```

2. DigitalOcean → **Create > Apps**
3. Wybierz GitHub repository
4. Konfiguruj 2 komponenty:

**Web Service (Next.js):**
- Name: `pixelift-web`
- Build Command: `npm run build`
- Run Command: `npm start`
- Environment Variables: (dodaj wszystkie z kroku 4)
- HTTP Port: 3000
- Plan: Basic ($5/mo)

**Worker (Background Jobs):**
- Name: `pixelift-worker`
- Build Command: `npm install && npm run build`
- Run Command: `npm run worker:prod`
- Environment Variables:
  - `REDIS_URL`
  - `REPLICATE_API_TOKEN`
- Plan: Basic ($5/mo)

#### 3.2 Deploy

Kliknij **Create Resources** → App Platform automatycznie zbuduje i wdroży aplikację.

---

### Opcja B: Droplet + Docker (Bardziej kontroli)

#### 3.1 Utwórz Droplet

1. DigitalOcean → **Create > Droplets**
2. Image: **Docker** (One-Click App)
3. Plan: Basic ($6/mo - 1GB RAM)
4. Region: Frankfurt / Amsterdam
5. Add SSH key
6. Create Droplet

#### 3.2 Deploy z Docker Compose

SSH do dropleta:
```bash
ssh root@twoj-droplet-ip
```

Sklonuj repozytorium:
```bash
git clone https://github.com/twoj-username/pixelift.git
cd pixelift
```

Stwórz `.env` z wszystkimi zmiennymi (krok 4).

Uruchom:
```bash
docker-compose up -d
```

Sprawdź logi:
```bash
docker-compose logs -f
```

---

## Krok 4: Zmienne środowiskowe (Produkcja)

Skopiuj te zmienne do **DigitalOcean App Platform > Settings > Environment Variables**:

```bash
# Next.js
NEXTAUTH_SECRET=WYGENERUJ_Z_openssl_rand_-base64_32
NEXTAUTH_URL=https://twoja-domena.com

# Replicate API
REPLICATE_API_TOKEN=r8_twoj_token_z_replicate_com

# Redis (z Upstash lub DigitalOcean)
REDIS_URL=rediss://default:haslo@endpoint.upstash.io:6379

# Firebase Client SDK (publiczne)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pixelift.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pixelift
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pixelift.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123

# Firebase Admin SDK (PRYWATNE - nie commituj!)
FIREBASE_ADMIN_PROJECT_ID=pixelift
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@pixelift.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# Google OAuth
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz123

# Opcjonalnie: Webhook signature verification
WEBHOOK_SECRET=WYGENERUJ_Z_openssl_rand_-base64_32
```

---

## Krok 5: Konfiguracja Domeny

### 5.1 Dodaj Custom Domain w DigitalOcean

1. App Platform → Settings → Domains
2. Dodaj domenę: `pixelift.pl` i `www.pixelift.pl`
3. Skopiuj CNAME records

### 5.2 Konfiguruj DNS u swojego providera

Dodaj rekordy DNS:
```
Type    Name    Value
CNAME   @       twoja-app.ondigitalocean.app
CNAME   www     twoja-app.ondigitalocean.app
```

DigitalOcean automatycznie wygeneruje SSL (Let's Encrypt).

---

## Krok 6: Testowanie

### 6.1 Test Logowania

1. Otwórz: `https://pixelift.pl`
2. Kliknij "Sign In with Google"
3. Zaloguj się kontem Google
4. Sprawdź czy w Firebase Firestore pojawiła się kolekcja `users`

### 6.2 Test API Dashboard

1. Przejdź do: `https://pixelift.pl/dashboard/api`
2. Kliknij "Create New Key"
3. Wypełnij formularz (nazwa, plan, environment)
4. Skopiuj wygenerowany klucz API

### 6.3 Test Enterprise API

```bash
curl -X POST https://pixelift.pl/api/v1/upscale \
  -H "Authorization: Bearer pk_live_TWOJ_KLUCZ" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "scale": 2,
    "enhance_face": false
  }'
```

Odpowiedź powinna zwrócić `job_id`.

Sprawdź status:
```bash
curl https://pixelift.pl/api/v1/jobs/JOB_ID \
  -H "Authorization: Bearer pk_live_TWOJ_KLUCZ"
```

---

## Krok 7: Monitoring

### 7.1 Sprawdź Worker Logs

App Platform:
```
Settings > Runtime Logs > pixelift-worker
```

Powinieneś zobaczyć:
```
✅ Worker started successfully!
🔄 Processing job job_123456
✅ Job job_123456 completed in 18.5s
```

### 7.2 Sprawdź Redis

Upstash Dashboard:
- Data Browser → sprawdź klucze `ratelimit:*`, `bull:*`

---

## Krok 8: Odblokowywanie Autentykacji

Po skonfigurowaniu Firebase i Google OAuth, odblokuj sprawdzanie sesji:

### W `app/dashboard/api/page.tsx`:
Usuń linijki 32-36, odkomentuj:
```typescript
const { data: session, status } = useSession();

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/auth/signin");
  }
}, [status, router]);

useEffect(() => {
  if (status === "authenticated") {
    fetchApiKeys();
  }
}, [status]);
```

### W `app/api/v1/keys/route.ts`:
Odkomentuj linijki 20-24 i 88-92:
```typescript
const session = await getServerSession(authOptions);
if (!session || !session.user) {
  return NextResponse.json({ ... }, { status: 401 });
}
const userId = session.user.id;
```

Usuń: `const userId = "demo-user-123";`

---

## Koszty miesięczne

| Usługa | Koszt |
|--------|-------|
| App Platform (Web) | $5/mo |
| App Platform (Worker) | $5/mo |
| Upstash Redis | **Darmowy** |
| Replicate API | ~$50/mo (10k obrazków) |
| **Razem** | **~$60/mo** |

**Przychód z 10 klientów Professional @ $299/mo = $2,990/mo**
**Zysk: ~$2,930/mo** 💰

---

## Wsparcie

- Dokumentacja API: `https://pixelift.pl/api/v1/docs`
- Email: sales@pixelift.pl
- GitHub Issues

---

**Gotowe do wdrożenia! 🚀**
