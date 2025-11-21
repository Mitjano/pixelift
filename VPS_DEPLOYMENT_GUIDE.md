# 🚀 Pixelift - VPS Deployment Guide (DigitalOcean Droplet)

## ✅ Twój serwer:

- **IP:** 138.68.79.23
- **System:** Ubuntu 22.04 LTS
- **RAM:** 2 GB
- **Dysk:** 25 GB
- **Region:** Frankfurt (FRA1)

---

## 🎯 Deployment w 3 krokach (5-10 minut)

### Krok 1: Połącz się z serwerem

**Na Windowsie (PowerShell lub CMD):**
```powershell
ssh root@138.68.79.23
```

Gdy poprosi o hasło, wpisz: `0PRIngless`

**Gotowe!** Jesteś teraz na serwerze. ✅

---

### Krok 2: Pobierz i uruchom skrypt deployment

Skopiuj i wklej **całą** komendę (naciśnij Enter):

```bash
curl -fsSL https://raw.githubusercontent.com/Mitjano/upsizer/claude/continue-upsizer-work-01HbnsgYa3p9oNhVnsNY9XCH/deploy-digitalocean-vps.sh -o deploy.sh && sudo bash deploy.sh
```

**Co ten skrypt robi?**
- ✅ Instaluje Node.js 20.x
- ✅ Instaluje Redis (local)
- ✅ Instaluje PM2 (process manager)
- ✅ Instaluje Nginx (web server)
- ✅ Klonuje Twoje repozytorium
- ✅ Instaluje dependencies
- ✅ Buduje aplikację
- ✅ Uruchamia aplikację + worker

**Czas trwania:** ~5-7 minut

⚠️ **WAŻNE:** W pewnym momencie skrypt poprosi Cię o edycję `.env.local`.

Gdy zobaczysz:
```
⚠️ IMPORTANT: Edit /var/www/upsizer/.env.local and fill in your values!
Press ENTER after you've edited .env.local file...
```

**NIE naciskaj jeszcze ENTER!** Przejdź do Kroku 3. ⬇️

---

### Krok 3: Skonfiguruj zmienne środowiskowe

#### Opcja A: Interaktywny setup (ŁATWIEJSZE ✅)

Otwórz **nowe okno** PowerShell/CMD i połącz się ponownie:
```bash
ssh root@138.68.79.23
```

Następnie uruchom:
```bash
cd /var/www/upsizer
bash setup-env.sh
```

Skrypt zapyta Cię o każdą wartość krok po kroku:
- Firebase API Key
- Replicate API Token
- itp.

Po zakończeniu, **wróć do pierwszego okna** i naciśnij ENTER.

---

#### Opcja B: Ręczna edycja (dla zaawansowanych)

```bash
nano /var/www/upsizer/.env.local
```

Wypełnij wszystkie wartości (lista poniżej ⬇️).

Zapisz: `Ctrl + O`, `Enter`, `Ctrl + X`

Wróć do pierwszego okna i naciśnij ENTER.

---

### Gotowe! 🎉

Po zakończeniu skryptu zobaczysz:
```
🎉 Deployment completed successfully!
🌐 Your application is now running at: http://138.68.79.23
```

**Otwórz przeglądarkę i wejdź na:**
```
http://138.68.79.23
```

---

## 📋 Lista wymaganych zmiennych środowiskowych

### Firebase Client SDK (6 zmiennych)

Pobierz z: **Firebase Console → Project Settings → General → Your apps → SDK setup**

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pixelift-ed3df.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pixelift-ed3df
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pixelift-ed3df.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456...:web:abc...
```

---

### Firebase Admin SDK (3 zmienne)

Pobierz z: **Firebase Console → Project Settings → Service Accounts → Generate New Private Key**

```
FIREBASE_ADMIN_PROJECT_ID=pixelift-ed3df
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbavc@pixelift-ed3df.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

---

### Replicate API

Pobierz z: https://replicate.com/account/api-tokens

```
REPLICATE_API_TOKEN=r8_abc123...
```

---

### Redis

**Już skonfigurowane!** Skrypt zainstalował Redis lokalnie.

```
REDIS_URL=redis://localhost:6379
```

Jeśli wolisz Upstash (cloud), zmień na:
```
REDIS_URL=redis://default:ARU4AAImcDI2NGJkZTljNjNjYzk0MzdmYWQ5NDVlODBjMGRjYzkwYnAyNTQzMg@obliging-shrimp-5432.upstash.io:6379
```

---

### NextAuth

**Automatycznie wygenerowane** przez `setup-env.sh`!

Jeśli edytujesz ręcznie:
```bash
# Wygeneruj secret:
openssl rand -base64 32

# Dodaj do .env.local:
NEXTAUTH_SECRET=<wygenerowany_secret>
NEXTAUTH_URL=http://138.68.79.23
```

---

## 🛠️ Przydatne komendy

### Sprawdź status aplikacji
```bash
pm2 status
```

### Zobacz logi
```bash
pm2 logs
```

### Restartuj aplikację
```bash
pm2 restart all
```

### Zatrzymaj aplikację
```bash
pm2 stop all
```

### Sprawdź Redis
```bash
redis-cli ping
# Powinno zwrócić: PONG
```

### Sprawdź Nginx
```bash
systemctl status nginx
```

### Restart serwera
```bash
reboot
```

Po restarcie wszystko uruchomi się automatycznie (PM2, Redis, Nginx). ✅

---

## 🐛 Troubleshooting

### Problem: "Connection refused" na http://138.68.79.23

**Fix:**
```bash
# Sprawdź czy aplikacja działa
pm2 status

# Jeśli nie działa, uruchom:
pm2 restart all

# Sprawdź logi błędów:
pm2 logs
```

---

### Problem: "Firebase permission denied"

**Przyczyna:** Brak/błędne zmienne Firebase w `.env.local`

**Fix:**
```bash
cd /var/www/upsizer
bash setup-env.sh
pm2 restart all
```

---

### Problem: "Redis connection failed"

**Fix:**
```bash
# Sprawdź Redis
redis-cli ping

# Jeśli nie odpowiada:
systemctl restart redis-server

# Sprawdź czy działa:
systemctl status redis-server
```

---

### Problem: Jobs stuck in "pending" (Background Remover nie działa)

**Przyczyna:** Worker nie działa

**Fix:**
```bash
# Sprawdź status workera
pm2 status

# Jeśli pixelift-worker jest stopped:
pm2 restart pixelift-worker

# Zobacz logi workera:
pm2 logs pixelift-worker
```

---

## 🔒 Dodatkowe: SSL/HTTPS z Let's Encrypt (opcjonalne)

Jeśli masz domenę (np. pixelift.pl):

### 1. Skieruj domenę na serwer

W panelu domeny dodaj rekord A:
```
Type: A
Name: @
Value: 138.68.79.23
TTL: 3600
```

### 2. Zainstaluj Certbot

```bash
apt-get install -y certbot python3-certbot-nginx
```

### 3. Uzyskaj certyfikat SSL

```bash
certbot --nginx -d twoja-domena.pl
```

### 4. Zaktualizuj NEXTAUTH_URL

```bash
nano /var/www/upsizer/.env.local
```

Zmień:
```
NEXTAUTH_URL=https://twoja-domena.pl
```

Restart:
```bash
pm2 restart all
```

**Gotowe!** Masz HTTPS. 🔒✅

---

## 💰 Koszty miesięczne

| Serwis | Koszt |
|--------|-------|
| DigitalOcean Droplet (2GB) | $12/mies |
| Redis (lokalny) | $0 |
| Replicate API | ~$50/mies |
| **TOTAL** | **~$62/mies** |

---

## 📞 Pomoc

Jeśli coś nie działa:
1. Sprawdź logi: `pm2 logs`
2. Sprawdź status: `pm2 status`
3. Sprawdź Nginx: `systemctl status nginx`
4. Sprawdź Redis: `redis-cli ping`

---

## 🎉 Gotowy?

**Uruchom deployment:**
```bash
ssh root@138.68.79.23
curl -fsSL https://raw.githubusercontent.com/Mitjano/upsizer/claude/continue-upsizer-work-01HbnsgYa3p9oNhVnsNY9XCH/deploy-digitalocean-vps.sh -o deploy.sh && sudo bash deploy.sh
```

**Powodzenia! 🚀**
