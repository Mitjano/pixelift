# Plan wdrożenia: Logowanie przez Email i Facebook

## Cel
Rozszerzenie systemu autentykacji o logowanie przez:
1. **Email + Hasło** (credentials)
2. **Facebook OAuth**

Aktualnie: tylko Google OAuth

---

## Faza 1: Przygotowanie infrastruktury

### 1.1 Aktualizacja schematu bazy danych

```prisma
// prisma/schema.prisma

model User {
  // ... istniejące pola
  password      String?           // Hash hasła (bcrypt)
  emailVerified DateTime?         // Data weryfikacji email
  accounts      Account[]         // Powiązane konta OAuth
  verificationTokens VerificationToken[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "oauth" | "credentials"
  provider          String  // "google" | "facebook" | "credentials"
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  id         String   @id @default(cuid())
  identifier String   // email
  token      String   @unique
  expires    DateTime
  type       String   // "email-verification" | "password-reset"

  @@unique([identifier, token])
}
```

### 1.2 Instalacja zależności

```bash
npm install bcryptjs
npm install @types/bcryptjs -D
```

---

## Faza 2: Logowanie przez Email + Hasło

### 2.1 Konfiguracja NextAuth (lib/auth.ts)

```typescript
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Istniejący Google Provider
    GoogleProvider({ ... }),

    // NOWY: Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await getUserByEmail(credentials.email);

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  // ... reszta konfiguracji
});
```

### 2.2 API Endpoint: Rejestracja (app/api/auth/register/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { generateVerificationToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Walidacja
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Sprawdź czy user istnieje
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash hasła
    const hashedPassword = await bcrypt.hash(password, 12);

    // Utwórz użytkownika
    const user = await createUser({
      email,
      name,
      password: hashedPassword,
      role: 'user',
      credits: 3,
      emailVerified: null,
    });

    // Wygeneruj token weryfikacyjny
    const token = await generateVerificationToken(email, 'email-verification');

    // Wyślij email weryfikacyjny
    await sendVerificationEmail({
      email,
      name: name || 'User',
      token,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### 2.3 API Endpoint: Reset hasła

**app/api/auth/forgot-password/route.ts**
```typescript
// Wysyła email z linkiem do resetu hasła
```

**app/api/auth/reset-password/route.ts**
```typescript
// Ustawia nowe hasło po weryfikacji tokenu
```

### 2.4 Komponenty UI

**components/auth/RegisterForm.tsx**
```typescript
// Formularz rejestracji email/hasło
// - Email input
// - Password input (min 8 znaków)
// - Confirm password
// - Name (opcjonalne)
// - Submit button
// - Link do logowania
```

**components/auth/LoginForm.tsx**
```typescript
// Formularz logowania
// - Email input
// - Password input
// - "Zapomniałem hasła" link
// - Submit button
// - Separator "lub"
// - Przyciski social login (Google, Facebook)
```

**components/auth/ForgotPasswordForm.tsx**
```typescript
// Formularz resetu hasła
```

### 2.5 Strony

**app/[locale]/auth/register/page.tsx** - strona rejestracji
**app/[locale]/auth/forgot-password/page.tsx** - zapomniałem hasła
**app/[locale]/auth/reset-password/page.tsx** - nowe hasło

---

## Faza 3: Logowanie przez Facebook

### 3.1 Konfiguracja Facebook App

1. Idź do https://developers.facebook.com/
2. Utwórz nową aplikację (Consumer type)
3. Dodaj produkt "Facebook Login"
4. Skonfiguruj:
   - Valid OAuth Redirect URIs:
     - `https://pixelift.pl/api/auth/callback/facebook`
     - `http://localhost:3000/api/auth/callback/facebook`
   - Deauthorize Callback URL
   - Data Deletion Request URL

### 3.2 Zmienne środowiskowe

```env
# .env.local
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
```

### 3.3 Konfiguracja NextAuth

```typescript
import FacebookProvider from "next-auth/providers/facebook";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({ ... }),
    CredentialsProvider({ ... }),

    // NOWY: Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email,public_profile"
        }
      }
    }),
  ],
});
```

### 3.4 Callback integracji

Zaktualizuj `signIn` callback w auth.ts, żeby obsługiwał Facebook:
```typescript
async signIn({ user, account, profile }) {
  if (account?.provider === 'facebook' || account?.provider === 'google') {
    // Rejestracja/aktualizacja użytkownika OAuth
    await registerOAuthUser(user, account.provider);
  }
  return true;
}
```

---

## Faza 4: UI/UX Updates

### 4.1 Zaktualizuj stronę logowania

```
┌─────────────────────────────────────┐
│         Zaloguj się                 │
├─────────────────────────────────────┤
│  [🔵 Kontynuuj z Google]            │
│  [📘 Kontynuuj z Facebook]          │
├─────────────────────────────────────┤
│           ── lub ──                 │
├─────────────────────────────────────┤
│  Email:    [________________]       │
│  Hasło:    [________________]       │
│                                     │
│  [        Zaloguj się        ]      │
│                                     │
│  Zapomniałeś hasła?                 │
│  Nie masz konta? Zarejestruj się    │
└─────────────────────────────────────┘
```

### 4.2 Tłumaczenia (4 języki)

Dodaj do `messages/[locale]/common.json`:
```json
{
  "auth": {
    "login": "Sign In",
    "register": "Register",
    "forgotPassword": "Forgot password?",
    "resetPassword": "Reset Password",
    "continueWithGoogle": "Continue with Google",
    "continueWithFacebook": "Continue with Facebook",
    "orContinueWith": "or continue with",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "name": "Name",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "verifyEmail": "Please verify your email",
    "checkInbox": "Check your inbox for verification link",
    "passwordMinLength": "Password must be at least 8 characters",
    "passwordsMatch": "Passwords must match",
    "invalidCredentials": "Invalid email or password",
    "emailAlreadyExists": "Email already registered",
    "resetLinkSent": "Password reset link sent to your email"
  }
}
```

---

## Faza 5: Bezpieczeństwo

### 5.1 Rate Limiting

```typescript
// Limity dla auth endpoints
const authLimiter = {
  login: { window: 15 * 60 * 1000, max: 5 },      // 5 prób / 15 min
  register: { window: 60 * 60 * 1000, max: 3 },   // 3 rejestracje / 1h
  forgotPassword: { window: 60 * 60 * 1000, max: 3 }, // 3 resety / 1h
};
```

### 5.2 Walidacja hasła

```typescript
const passwordValidation = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  // opcjonalnie: requireSpecialChar: true
};
```

### 5.3 Token expiration

- Email verification: 24 godziny
- Password reset: 1 godzina
- Session: 30 dni (jak obecnie)

---

## Faza 6: Testowanie

### 6.1 Testy jednostkowe

- `__tests__/api/auth-register.test.ts`
- `__tests__/api/auth-login.test.ts`
- `__tests__/api/auth-reset-password.test.ts`
- `__tests__/components/LoginForm.test.tsx`
- `__tests__/components/RegisterForm.test.tsx`

### 6.2 Testy integracyjne

- `__tests__/integration/email-auth-flow.test.ts`
- `__tests__/integration/facebook-auth-flow.test.ts`

### 6.3 Testy E2E (manualne)

- [ ] Rejestracja email → weryfikacja → logowanie
- [ ] Logowanie Facebook → utworzenie konta → dashboard
- [ ] Reset hasła → nowe hasło → logowanie
- [ ] Próba logowania bez weryfikacji email
- [ ] Próba rejestracji z istniejącym emailem
- [ ] Rate limiting (5 nieudanych prób)

---

## Faza 7: Migracja i deployment

### 7.1 Kolejność wdrożenia

1. **Dzień 1**: Schema DB + migracja
   ```bash
   npx prisma migrate dev --name add_auth_expansion
   ```

2. **Dzień 2**: Backend (API endpoints, lib/auth.ts)

3. **Dzień 3**: Frontend (formularze, strony)

4. **Dzień 4**: Facebook App setup + testy

5. **Dzień 5**: Tłumaczenia + finalne testy

6. **Dzień 6**: Deploy na produkcję

### 7.2 Rollback plan

Jeśli coś pójdzie nie tak:
1. Wyłącz nowe providery w auth.ts (zakomentuj)
2. Rollback migracji: `npx prisma migrate reset` (OSTROŻNIE!)
3. Przywróć poprzednią wersję kodu

---

## Szacowany czas

| Faza | Czas |
|------|------|
| 1. Infrastruktura DB | 2h |
| 2. Email/Password Auth | 6h |
| 3. Facebook OAuth | 3h |
| 4. UI/UX Updates | 4h |
| 5. Bezpieczeństwo | 2h |
| 6. Testowanie | 4h |
| 7. Deployment | 2h |
| **RAZEM** | **~23h** |

---

## Zmienne środowiskowe do dodania

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Email (jeśli jeszcze nie skonfigurowane)
RESEND_API_KEY=
EMAIL_FROM=noreply@pixelift.pl
```

---

## Checklist przed wdrożeniem

- [ ] Facebook App utworzona i zweryfikowana
- [ ] Zmienne środowiskowe na serwerze
- [ ] Migracja bazy danych
- [ ] Testy przechodzą
- [ ] Tłumaczenia kompletne (4 języki)
- [ ] Rate limiting skonfigurowany
- [ ] Email templates gotowe
- [ ] Backup bazy przed migracją

---

*Plan utworzony: 17.12.2024*
