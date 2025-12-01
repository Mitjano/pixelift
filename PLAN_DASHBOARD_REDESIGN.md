# Dashboard Redesign Plan

## Problem Analysis

Current dashboard has several issues:
1. **Emoji icons** - look unprofessional (🔍, ✂️, 😊, ⚡, 💎, etc.)
2. **Inconsistent grid** - 4 stats, 3 tools, 2 usage cards, 6 quick actions
3. **Too many sections** - Stats, Tools, Recent Activity, Usage Stats, Quick Actions
4. **Outdated styling** - doesn't match modern ToolsShowcase component
5. **Only 3 tools shown** - project has 9 tools available

## Design Reference

Using `ToolsShowcase.tsx` as the design system:
- SVG icons with colored backgrounds
- `rounded-2xl` cards with `backdrop-blur-sm`
- Gradient overlays on hover
- Badge system (NEW, Coming Soon)
- Credits as pills
- Arrow animations on hover

## New Dashboard Structure

### 1. Header Section (simplified)
- Personalized welcome with first name
- Short subtitle

### 2. Stats Row (3 cards, not 4)
- Credits (most important)
- Images Processed
- Current Plan (with upgrade CTA if free)

### 3. AI Tools Grid (main focus - all 9 tools)
- Same design as ToolsShowcase
- 3 columns on desktop
- Shows all available tools with proper icons
- Credits per operation as pills
- "NEW" badges where applicable

### 4. Quick Actions (4 items in horizontal strip)
- Image History
- Billing
- API Keys
- Settings

### 5. Recent Activity (compact)
- Show last 3-5 items only
- Minimalist design

## Files to Modify

1. `app/[locale]/dashboard/page.tsx` - Main redesign

## Implementation Details

### Tools Array (reuse from ToolsShowcase)
```typescript
const tools = [
  { name: 'upscaler', icon: SVG, color: 'green', href: '/tools/upscaler', credits: '1-3' },
  { name: 'bgRemover', icon: SVG, color: 'blue', href: '/tools/remove-background', credits: '1' },
  { name: 'colorize', icon: SVG, color: 'violet', href: '/tools/colorize', credits: '1', badge: 'NEW' },
  { name: 'restore', icon: SVG, color: 'cyan', href: '/tools/restore', credits: '1', badge: 'NEW' },
  { name: 'objectRemoval', icon: SVG, color: 'orange', href: '/tools/object-removal', credits: '2', badge: 'NEW' },
  { name: 'bgGenerator', icon: SVG, color: 'pink', href: '/tools/background-generator', credits: '3', badge: 'NEW' },
  { name: 'compressor', icon: SVG, color: 'teal', href: '/tools/image-compressor', credits: 'Free' },
  { name: 'packshot', icon: SVG, color: 'amber', href: '/tools/packshot-generator', credits: '2' },
  { name: 'expand', icon: SVG, color: 'indigo', href: '/tools/image-expand', credits: '2' },
];
```

### Stats Cards Style
```
- Glass effect: bg-gray-800/50 backdrop-blur-sm
- Border: border border-gray-700/50
- Rounded: rounded-2xl
- Icon: SVG in colored circle background
```

### Quick Actions Style
```
- Horizontal row (4 items)
- Smaller cards with icon + text
- Subtle hover effects
```

## Visual Changes

| Before | After |
|--------|-------|
| Emoji icons | SVG icons in colored circles |
| 4 stat cards | 3 focused stat cards |
| 3 tools | All 9 tools |
| 6 quick actions | 4 essential quick actions |
| Multiple sections | Clean 4-section layout |
