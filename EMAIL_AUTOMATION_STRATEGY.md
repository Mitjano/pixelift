# Email Automation Strategy - Pixelift

## Executive Summary

This document outlines a comprehensive email automation strategy for Pixelift customer lifecycle management. The goal is to improve user engagement, retention, and conversion through strategic email communication at key touchpoints.

## Current System Status

✅ **Already Implemented:**
- Support ticket created → Email to admin (`support@pixelift.pl`)
- Support ticket reply → Email to user
- Resend integration with lazy initialization
- Professional HTML email templates

❌ **Not Yet Implemented:**
- Registration/welcome emails
- First upload milestone
- Premium purchase confirmation
- Usage limit warnings
- Re-engagement campaigns
- Monthly usage reports

## User Journey Analysis

### Current User Flow

```
1. Landing Page (pixelift.pl)
   ↓
2. Sign Up/Sign In (/auth/signup or /auth/signin)
   → Google OAuth only
   → Auto-creates account on first login
   ↓
3. Dashboard (/dashboard)
   → First visit after registration
   → Shows EnhancedImageUploader component
   ↓
4. Image Upload & Processing
   → Upload image via ImageUploader
   → Configure settings (scale, quality boost, etc.)
   → Generate FREE preview (200x200px)
   → Process with credits (1-2 credits per image)
   ↓
5. Pricing Page (/pricing)
   → Free Plan: 3 credits/month
   → Subscription Plans: 100-1000 credits/month
   → One-Time Payments: 50-1000 credits
   → Enterprise: Custom
   ↓
6. Premium Purchase (NOT YET IMPLEMENTED)
   → No payment endpoint found
   → Pricing buttons are non-functional
   ↓
7. Support Ticket (/support)
   → Create ticket
   → Receive email notification (WORKING)
   → Admin replies
   → User receives email (WORKING)
```

### Identified Email Touchpoints

| #  | Touchpoint | Trigger | Current Status | Priority |
|----|-----------|---------|----------------|----------|
| 1  | **Welcome Email** | User completes Google OAuth signup | ❌ Not implemented | 🔴 High |
| 2  | **First Upload Confirmation** | User uploads first image | ❌ Not implemented | 🟡 Medium |
| 3  | **Preview Generated** | Free preview created | ❌ Not implemented | 🟢 Low |
| 4  | **First Processed Image** | User processes first paid image | ❌ Not implemented | 🟡 Medium |
| 5  | **Credits Running Low** | User has <3 credits remaining | ❌ Not implemented | 🔴 High |
| 6  | **Credits Depleted** | User reaches 0 credits | ❌ Not implemented | 🔴 High |
| 7  | **Premium Purchase Success** | Payment completed | ❌ Not implemented | 🔴 High |
| 8  | **Subscription Renewal** | Monthly/yearly renewal processed | ❌ Not implemented | 🔴 High |
| 9  | **Payment Failed** | Subscription payment fails | ❌ Not implemented | 🔴 High |
| 10 | **Monthly Usage Report** | End of month (for paid users) | ❌ Not implemented | 🟡 Medium |
| 11 | **Inactive User (7 days)** | No login for 7 days | ❌ Not implemented | 🟢 Low |
| 12 | **Inactive User (30 days)** | No login for 30 days | ❌ Not implemented | 🟡 Medium |
| 13 | **Feature Announcement** | New feature released | ❌ Not implemented | 🟢 Low |
| 14 | **Support Ticket Created** | User submits ticket | ✅ **WORKING** | - |
| 15 | **Support Ticket Reply** | Admin replies to ticket | ✅ **WORKING** | - |

## Email Automation Plan

### Phase 1: Transactional Emails (Critical)
**Timeline: Week 1-2 | Priority: HIGH**

These emails are triggered by user actions and are expected immediately.

#### 1.1 Welcome Email
**Trigger:** User completes Google OAuth signup (first session creation)
**Location to add:** `/lib/auth.ts` - in `callbacks.jwt()` when `user` exists (new user)
**Template:** `lib/email.ts` → `sendWelcomeEmail()`

**Content:**
- Welcome message with user's name
- Quick overview of Pixelift features
- "You have 3 free credits" reminder
- Link to dashboard
- Link to pricing page
- Support contact info

**Data needed:**
```typescript
interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  freeCredits: number; // 3
  dashboardUrl: string; // https://pixelift.pl/dashboard
}
```

#### 1.2 First Successful Upload Confirmation
**Trigger:** User processes first paid image (after consuming credits)
**Location to add:** `/app/api/upscale/route.ts` - after successful upscale and credit deduction
**Template:** `sendFirstUploadEmail()`

**Content:**
- Congratulations on first image
- Show before/after comparison (if possible)
- Tips for getting best results
- Reminder of remaining credits
- Link to pricing if credits low

#### 1.3 Credits Running Low Warning
**Trigger:** User's credits drop below 3 (or 20% of their plan)
**Location to add:** `/app/api/upscale/route.ts` - after credit deduction, check remaining
**Template:** `sendCreditsLowEmail()`

**Content:**
- Current credits remaining
- Estimated images left
- Link to pricing page
- Suggest subscription for heavy users

**Smart Logic:**
- Only send once when threshold crossed
- Don't spam if user keeps processing
- Track last warning sent in user data

#### 1.4 Credits Depleted
**Trigger:** User reaches 0 credits
**Location to add:** `/app/api/upscale/route.ts` - when credit check fails (402 response)
**Template:** `sendCreditsDepletedEmail()`

**Content:**
- Your credits are empty
- Show usage summary
- Prominent "Buy Credits" CTA
- Show pricing options
- Free plan resets next month reminder

#### 1.5 Premium Purchase Confirmation
**Trigger:** Payment successfully processed (NEEDS PAYMENT INTEGRATION FIRST)
**Location to add:** `/app/api/payment/webhook` (to be created)
**Template:** `sendPurchaseConfirmationEmail()`

**Content:**
- Thank you for purchase
- Receipt details (amount, plan, credits)
- Credits added to account
- Next billing date (if subscription)
- Invoice download link
- Support contact

### Phase 2: Engagement & Retention Emails
**Timeline: Week 3-4 | Priority: MEDIUM**

These emails keep users engaged and encourage return visits.

#### 2.1 Monthly Usage Report (Paid Users Only)
**Trigger:** Cron job - First day of each month
**Location to add:** New cron endpoint `/app/api/cron/monthly-reports/route.ts`
**Template:** `sendMonthlyUsageReportEmail()`

**Content:**
- Images processed last month
- Credits used vs. remaining
- Top features used
- Cost savings vs. one-time purchases
- Usage trends graph (text-based or image)

**Implementation:**
```typescript
// Run via Vercel Cron or external scheduler
// GET /api/cron/monthly-reports (with auth token)
// Iterate all users with role !== 'user' (paid plans)
// Send report email to each
```

#### 2.2 Inactive User Re-engagement (7 days)
**Trigger:** Cron job - Check users with `lastLoginAt` > 7 days ago
**Location to add:** `/app/api/cron/re-engagement/route.ts`
**Template:** `sendReEngagement7DayEmail()`

**Content:**
- "We miss you" message
- Remind them of free credits waiting
- Show new features since last visit
- Quick value proposition
- Easy login link

#### 2.3 Inactive User Re-engagement (30 days)
**Trigger:** Cron job - Check users with `lastLoginAt` > 30 days ago
**Location to add:** Same cron as above
**Template:** `sendReEngagement30DayEmail()`

**Content:**
- More urgent tone
- Special offer: bonus credits for returning
- Case studies / success stories
- "Your credits expire soon" (if applicable)
- Feedback survey - why did you stop using?

### Phase 3: Marketing & Lifecycle Emails
**Timeline: Week 5+ | Priority: LOW**

These emails are for marketing, announcements, and upselling.

#### 3.1 Feature Announcements
**Trigger:** Manual - Admin creates announcement
**Location to add:** `/app/admin/announcements` (new feature)
**Template:** `sendFeatureAnnouncementEmail()`

**Content:**
- What's new
- How it benefits users
- Demo/screenshot
- Try it now CTA

#### 3.2 Upgrade Nudge (Free → Paid)
**Trigger:** Free user processes >5 images (showing engagement)
**Location to add:** `/app/api/upscale/route.ts` - track image count
**Template:** `sendUpgradeNudgeEmail()`

**Content:**
- You're an active user
- Show how much they could save with subscription
- Calculator: "You processed X images, subscription would save you Y"
- Limited time offer (optional)

#### 3.3 Subscription Renewal Reminder
**Trigger:** 3 days before subscription renewal
**Location to add:** Payment provider webhook or cron
**Template:** `sendRenewalReminderEmail()`

**Content:**
- Your subscription renews in 3 days
- Amount to be charged
- Plan details
- Update payment method link
- Cancel/modify subscription link

## Technical Implementation

### Email Service: Resend
- Already configured ✅
- Free tier: 10,000 emails/month
- 100 emails/day limit
- API key stored in `.env.local`

### Code Structure

```
lib/
  email.ts                    # Email templates and sending functions
  email-scheduler.ts          # NEW: Cron job logic for scheduled emails
  email-tracking.ts           # NEW: Track email sends to prevent duplicates

app/api/
  cron/
    monthly-reports/
      route.ts                # NEW: Monthly usage reports
    re-engagement/
      route.ts                # NEW: Inactive user emails
  payment/
    webhook/
      route.ts                # NEW: Payment provider webhooks

data/
  email_tracking.json         # Track last email sent per user per type
```

### Email Tracking System

To prevent duplicate emails and spam:

```typescript
interface EmailLog {
  userId: string;
  emailType: 'welcome' | 'credits_low' | 'credits_depleted' | 're_engagement_7d' | 're_engagement_30d' | 'first_upload' | 'monthly_report';
  sentAt: string;
  status: 'sent' | 'failed' | 'bounced';
}

// Before sending email:
function shouldSendEmail(userId: string, emailType: string): boolean {
  const logs = getEmailLogs(userId);
  const lastSent = logs.find(log => log.emailType === emailType);

  // Rules:
  // - Welcome: only once ever
  // - Credits low: max once per day
  // - Credits depleted: max once per week
  // - First upload: only once ever
  // - Re-engagement: respect cadence (7d, then 30d, then stop)
  // - Monthly report: once per month

  return checkRules(lastSent, emailType);
}
```

### User Data Schema Updates

Add to `User` interface in `lib/db.ts`:

```typescript
export interface User {
  // ... existing fields
  lastLoginAt?: string;
  firstUploadAt?: string;      // NEW: Track first image upload
  totalImagesProcessed?: number; // NEW: Track total uploads
  emailPreferences?: {          // NEW: User email settings
    marketing: boolean;
    productUpdates: boolean;
    usageReports: boolean;
    transactional: boolean;     // Can't opt out
  };
}
```

## Email Template Design

### Design Principles
1. **Mobile-first**: 80% of emails opened on mobile
2. **Simple layout**: Single column, max 600px width
3. **Clear CTA**: One primary action per email
4. **Brand consistency**: Use Pixelift colors (green-400, blue-500)
5. **Personalization**: Always use user's name
6. **Preview text**: First 50 chars shown in inbox

### Standard Template Structure
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <!-- Header -->
  <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0;">Pixelift</h1>
  </div>

  <!-- Content -->
  <div style="padding: 40px 30px;">
    <h2 style="color: #1f2937; margin-top: 0;">{{ heading }}</h2>
    <p style="color: #4b5563; line-height: 1.6;">{{ content }}</p>

    <!-- CTA Button -->
    <a href="{{ ctaUrl }}"
       style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
              color: white; padding: 14px 28px; text-decoration: none;
              border-radius: 8px; font-weight: 600; margin: 20px 0;">
      {{ ctaText }}
    </a>
  </div>

  <!-- Footer -->
  <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Pixelift - AI Image Upscaling</p>
    <p>
      <a href="https://pixelift.pl" style="color: #10b981;">Website</a> •
      <a href="https://pixelift.pl/support" style="color: #10b981;">Support</a> •
      <a href="{{ unsubscribeUrl }}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</div>
```

## Implementation Priorities

### Week 1: Critical Transactional Emails
- [ ] Welcome email on signup
- [ ] Credits low warning
- [ ] Credits depleted notification
- [ ] Email tracking system

### Week 2: Purchase Flow
- [ ] Payment integration (Stripe/PayPal)
- [ ] Purchase confirmation email
- [ ] Payment failed email
- [ ] Subscription renewal reminder

### Week 3: Engagement
- [ ] First upload confirmation
- [ ] Monthly usage report (cron)
- [ ] Email preference settings in dashboard

### Week 4: Re-engagement
- [ ] 7-day inactive user email
- [ ] 30-day inactive user email
- [ ] Upgrade nudge for active free users

### Week 5+: Marketing
- [ ] Feature announcement system
- [ ] Newsletter template
- [ ] A/B testing for email subject lines

## Success Metrics

Track these metrics in admin panel:

- **Delivery rate**: Emails sent vs. bounced
- **Open rate**: Target >20%
- **Click-through rate**: Target >3%
- **Conversion rate**: Email → Purchase (Target >1%)
- **Unsubscribe rate**: Keep <0.5%

### Email Performance Dashboard

Add to `/app/admin/analytics`:
- Total emails sent (by type)
- Open rates (if Resend provides webhook)
- Revenue attributed to emails
- Most effective email types

## Email Content Examples

### 1. Welcome Email

**Subject:** Welcome to Pixelift - Your 3 free credits are waiting! 🎉

**Preview:** Start upscaling images with AI in seconds. Here's how to get started...

**Body:**
```
Hi [Name],

Welcome to Pixelift! We're excited to help you transform your images with AI-powered upscaling.

Your account comes with 3 free credits to get started. Each credit lets you upscale one image with our advanced AI models.

🚀 Quick Start Guide:
1. Go to your Dashboard
2. Upload an image
3. Choose your settings (we recommend "Quality Boost")
4. Generate a FREE 200x200px preview
5. Download your upscaled image

💡 Pro Tip: Try the FREE preview feature first to test different settings without using credits!

Ready to get started?
[Go to Dashboard →]

Need help? Reply to this email or visit our Support page.

Best regards,
The Pixelift Team
```

### 2. Credits Running Low

**Subject:** [Name], you have 2 credits left

**Preview:** Your Pixelift credits are running low. Top up now to keep processing...

**Body:**
```
Hi [Name],

Just a heads up - you have 2 credits remaining in your Pixelift account.

📊 Your Usage:
- Credits used this month: 8
- Images processed: 8
- Credits remaining: 2

Want to keep processing? Check out our plans:
• Subscription: From $0.05/credit with monthly plans
• One-time: Buy 50-1000 credits (never expire)
• Free plan: Get 3 free credits every month

[View Pricing Options →]

Questions? We're here to help!
```

### 3. First Upload Success

**Subject:** 🎉 Congratulations on your first upscaled image!

**Preview:** Your first AI-enhanced image is ready. Here's what to do next...

**Body:**
```
Hi [Name],

Congratulations! You just processed your first image with Pixelift.

See the difference AI can make? That's just the beginning.

💡 Tips for even better results:
• Use "Portrait" preset for faces
• Try "Landscape" for nature photos
• "Maximum" quality for professional work
• Batch upload to process multiple images

You have [X] credits remaining.

[Process More Images →]

Love the results? We'd love to hear from you! Reply and share your feedback.
```

## GDPR & Compliance

### Required Features

1. **Unsubscribe Link**: Every marketing email must have unsubscribe
2. **Email Preferences**: User dashboard should allow opting out of:
   - Marketing emails
   - Product updates
   - Usage reports
   - (Transactional emails cannot be opted out - payment confirmations, etc.)

3. **Data Retention**:
   - Keep email logs for 90 days
   - Delete unsubscribed users from marketing lists
   - Honor "right to be forgotten" requests

4. **Clear Sender Identity**:
   - From: "Pixelift Support <support@pixelift.pl>"
   - Physical address in footer (if required in Poland)

### Email Preferences Implementation

Add to `/app/dashboard/settings`:

```tsx
<div className="email-preferences">
  <h3>Email Preferences</h3>
  <label>
    <input type="checkbox" checked={user.emailPreferences.marketing} />
    Marketing emails and special offers
  </label>
  <label>
    <input type="checkbox" checked={user.emailPreferences.productUpdates} />
    Product updates and new features
  </label>
  <label>
    <input type="checkbox" checked={user.emailPreferences.usageReports} />
    Monthly usage reports
  </label>
  <p className="text-sm text-gray-400">
    Note: You'll still receive important account emails like purchase confirmations.
  </p>
</div>
```

## Next Steps

1. **Review this strategy** with stakeholder
2. **Prioritize Phase 1** emails (transactional)
3. **Set up email tracking system** (prevent duplicates)
4. **Implement welcome email** first (highest impact)
5. **Add payment integration** to enable purchase emails
6. **Test all emails** with real accounts before production
7. **Monitor metrics** and iterate based on performance

## Questions to Answer

Before implementation, clarify:

- [ ] Which payment provider? (Stripe, PayPal, other?)
- [ ] Domain verification for Resend? (support@pixelift.pl vs. sandbox)
- [ ] Email sending limits acceptable? (100/day free tier)
- [ ] Who monitors email performance? (admin dashboard needed?)
- [ ] A/B testing desired? (requires additional tracking)
- [ ] Newsletter/blog updates planned? (separate system?)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-23
**Author:** Claude Code
**Status:** Draft - Pending Review
