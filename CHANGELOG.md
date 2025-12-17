# Changelog

All notable changes to Pixelift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Integration tests for registration, payment, and image processing flows
- Component tests for Dashboard and CopyLinkButton
- Comprehensive README.md documentation
- CONTRIBUTING.md guidelines for contributors

## [1.2.0] - 2024-12-17

### Added
- Missing i18n translations for Portrait Relight and Watermark Remover (ES, FR)
- `/api/user/welcome` endpoint for welcome emails
- TypeScript ESLint rules (`@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`)
- Updated `.env.example` with all required variables

### Fixed
- Next.js security vulnerabilities (GHSA-w37m-7fhw-fmv9, GHSA-mwv6-3258-q52c)
- Replaced vulnerable `xlsx` library with `exceljs`
- CUDA OOM errors in upscale and watermark-remover (reduced pixel limits)
- LoginPrompt using `<a>` instead of Next.js `<Link>`
- `<img>` tags replaced with Next.js `<Image>` in Header

### Changed
- Reduced credit costs for better competitiveness
- Removed unused parameters from API endpoints

### Security
- Fixed HIGH severity Next.js vulnerabilities
- Fixed Prototype Pollution and ReDoS in xlsx library
- Added `@fal-ai/client@1.7.2` dependency

## [1.1.0] - 2024-11-23

### Added
- First comprehensive audit
- API endpoint tests (upscale, stripe, user)
- ImageUploader component tests
- Rate limiting for API endpoints
- Email notifications (welcome, low credits, depleted credits)

### Fixed
- Credit cost inconsistencies across UI components
- Faithful (No AI) upscaling option in ImageUpscaler UI

## [1.0.0] - 2024-11-01

### Added
- Initial release
- Image Upscaler with multiple modes (Product, Portrait, General, Faithful)
- Background Remover
- Object Remover
- Image Colorizer
- Image Restore
- Background Generator
- Image Expander
- Portrait Relight
- Watermark Remover
- Style Transfer
- Inpainting Pro
- Image Compressor (FREE)
- Format Converter (FREE)
- Google OAuth authentication
- Credit-based payment system with Stripe
- Subscription plans (Starter, Pro, Business)
- One-time credit packages
- Multi-language support (EN, PL, ES, FR)
- Admin dashboard
- API with key authentication
- Image sharing functionality
- User dashboard with usage tracking

### Technical
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- PostgreSQL with Prisma ORM
- Redis caching (Upstash)
- NextAuth.js v5 for authentication
- Stripe for payments
- Firebase Storage
- Replicate, fal.ai, GoAPI for AI processing
- Sentry for error monitoring
- Vitest + Testing Library for tests

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.2.0 | 2024-12-17 | Security fixes, i18n updates, ESLint rules |
| 1.1.0 | 2024-11-23 | First audit, API tests, rate limiting |
| 1.0.0 | 2024-11-01 | Initial release with 13+ AI tools |

## Migration Notes

### Upgrading to 1.2.0

1. Update dependencies:
```bash
npm update
```

2. Replace `xlsx` with `exceljs` if using admin export:
```bash
npm uninstall xlsx
npm install exceljs
```

3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Update environment variables per `.env.example`

### Upgrading to 1.1.0

No breaking changes. Run:
```bash
npm install
npx prisma migrate deploy
```
