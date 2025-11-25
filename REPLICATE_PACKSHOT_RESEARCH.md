# Best Image-to-Image AI Models for Product Packshot Generation on Replicate

**Research Date:** November 25, 2025
**Current Solution:** bria/product-packshot at $0.04/image
**Goal:** Find higher quality alternatives with better value

---

## Executive Summary

After comprehensive research of Replicate's product photography models, I found that **Bria AI's product-packshot remains the best all-in-one solution** for professional packshot generation. However, I identified **3 superior alternatives** that offer better quality or value through a multi-step workflow:

1. **Bria RMBG 2.0 + Custom Composition** - 55% cheaper, higher quality background removal
2. **BiRefNet + Custom Composition** - 96.5% cheaper, excellent edge detection
3. **Recraft AI Remove Background + Composition** - 75% cheaper, AI-content optimized
4. **FLUX Kontext [dev]** - 37.5% cheaper, best for creative transformations
5. **851 Labs Background Remover** - 98.5% cheaper, fastest for simple products

---

## Top 5 Alternatives (Ranked by Quality + Value)

### 1. Bria RMBG 2.0 - BEST QUALITY 🏆

**Model:** `bria/remove-background`
**Type:** Image-to-Image (Background Removal)
**Price:** $0.018/image (55% CHEAPER than product-packshot)

#### Quality Rating: ⭐⭐⭐⭐⭐ (5/5)

**Why It's Better:**
- **State-of-the-art accuracy:** 90% usable results vs 85% for BiRefNet
- **256-level transparency:** Non-binary masks for natural edges
- **Complex backgrounds:** Significantly outperforms alternatives
- **Fine detail preservation:** Hair, fabric, glass handled perfectly
- **Licensed training data:** Safe for commercial use (trained on 15,000+ manually labeled images)

**Key Features:**
- Handles complex backgrounds better than any competitor
- Preserves partial alpha channels from input
- Optional content moderation
- CPU-based processing (predictable costs)

**Input Parameters:**
```typescript
{
  image: string,                    // URI or data URL
  preserve_partial_alpha: boolean,  // default: true
  content_moderation: boolean       // default: false
}
```

**Limitations:**
- **Does NOT include centering/composition** - you need to add custom logic
- Requires additional processing for professional packshot layout

**Code Example:**
```typescript
import Replicate from 'replicate'
import sharp from 'sharp'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

async function generatePackshotV2(imageBuffer: Buffer, backgroundColor: string): Promise<Buffer> {
  // Step 1: Remove background with Bria RMBG 2.0
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  const output = await replicate.run(
    'bria/remove-background',
    {
      input: {
        image: dataUrl,
        preserve_partial_alpha: true,
        content_moderation: false,
      },
    }
  ) as string

  // Download result
  const response = await fetch(output)
  const removedBgBuffer = Buffer.from(await response.arrayBuffer())

  // Step 2: Custom composition with Sharp
  const image = sharp(removedBgBuffer)
  const metadata = await image.metadata()

  // Calculate centered position with proper padding
  const canvasSize = 2000
  const maxProductSize = 1600 // 80% of canvas for product

  // Resize to fit within max size while maintaining aspect ratio
  const scale = Math.min(
    maxProductSize / (metadata.width || 1),
    maxProductSize / (metadata.height || 1)
  )

  const scaledWidth = Math.round((metadata.width || 0) * scale)
  const scaledHeight = Math.round((metadata.height || 0) * scale)

  // Center on canvas
  const left = Math.round((canvasSize - scaledWidth) / 2)
  const top = Math.round((canvasSize - scaledHeight) / 2)

  // Create final packshot
  const finalImage = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: backgroundColor,
    }
  })
  .composite([{
    input: await image
      .resize(scaledWidth, scaledHeight, { fit: 'inside' })
      .toBuffer(),
    left,
    top,
  }])
  .png()
  .toBuffer()

  return finalImage
}

// Usage
const result = await generatePackshotV2(imageBuffer, '#FFFFFF')
```

**Performance:**
- Processing: ~3 seconds
- Total runs: 172.5K+
- Hardware: CPU (consistent, reliable)

---

### 2. BiRefNet - BEST VALUE 💎

**Model:** `men1scus/birefnet`
**Type:** Image-to-Image (High-Resolution Segmentation)
**Price:** $0.0014/second (~$0.0014/image) = **96.5% CHEAPER!**

#### Quality Rating: ⭐⭐⭐⭐☆ (4/5)

**Why It's Better:**
- **Ultra-low cost:** 714 images per $1 vs 25 with Bria packshot
- **High-resolution segmentation:** Handles 4K+ images
- **Bilateral reference:** Advanced edge detection algorithm
- **Open source:** Trained on DIS5K, DUTS, HRSOD datasets
- **Fastest processing:** ~1 second completion

**Key Features:**
- Dichotomous image segmentation (binary masks)
- Trained on multiple benchmark datasets
- Excellent for clean-cut products
- Customizable output resolution

**Input Parameters:**
```typescript
{
  image: string,      // URI
  resolution: string  // Optional: 'WxH' format (e.g., '1024x1024')
}
```

**Limitations:**
- **Binary masks only** (no 256-level transparency like Bria)
- Less effective on complex backgrounds
- Requires custom centering logic

**Code Example:**
```typescript
async function generatePackshotWithBiRefNet(
  imageBuffer: Buffer,
  backgroundColor: string
): Promise<Buffer> {
  // Step 1: Remove background with BiRefNet
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  const output = await replicate.run(
    'men1scus/birefnet',
    {
      input: {
        image: dataUrl,
        resolution: '2000x2000',
      },
    }
  ) as string

  // Step 2: Fetch and compose (same as Bria example above)
  const response = await fetch(output)
  const removedBgBuffer = Buffer.from(await response.arrayBuffer())

  // Apply custom composition logic (see Bria example)
  // ... same Sharp processing ...

  return finalImage
}
```

**Performance:**
- Processing: ~1 second
- Total runs: 3.9M+
- Hardware: Nvidia A100 (80GB)

---

### 3. Recraft AI - AI-CONTENT OPTIMIZED 🎨

**Model:** `recraft-ai/recraft-remove-background`
**Type:** Image-to-Image (Background Removal)
**Price:** $0.01/image (75% CHEAPER)

#### Quality Rating: ⭐⭐⭐⭐☆ (4/5)

**Why It's Better:**
- **Optimized for AI-generated content** AND product photos
- **Precise edge detection:** Preserves fine details
- **Transparent PNG output:** Full alpha channel support
- **Handles translucent materials:** Glass, plastic, etc.
- **Simple API:** Single image input

**Key Features:**
- Tuned for both AI and real product photography
- Automated, consistent results
- No manual masking required
- CPU-based (predictable pricing)

**Input Parameters:**
```typescript
{
  image: File  // PNG, JPG, or WEBP (max 5MB, 16MP, 4096px max dimension)
}
```

**Limitations:**
- **Max 5MB file size** (smaller than Bria)
- **Max 16MP resolution** (may need to downscale large images)
- Requires custom composition for packshot layout

**Code Example:**
```typescript
async function generatePackshotWithRecraft(
  imageBuffer: Buffer,
  backgroundColor: string
): Promise<Buffer> {
  // Validate file size
  const fileSizeMB = imageBuffer.length / (1024 * 1024)
  if (fileSizeMB > 5) {
    // Downscale if needed
    imageBuffer = await sharp(imageBuffer)
      .resize(4096, 4096, { fit: 'inside', withoutEnlargement: true })
      .toBuffer()
  }

  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  const output = await replicate.run(
    'recraft-ai/recraft-remove-background',
    {
      input: {
        image: dataUrl,
      },
    }
  ) as string

  // Fetch and compose
  const response = await fetch(output)
  const removedBgBuffer = Buffer.from(await response.arrayBuffer())

  // Apply custom composition (same as above examples)
  // ...

  return finalImage
}
```

**Performance:**
- Processing: ~3 seconds
- Total runs: 72.9K+
- Hardware: CPU

---

### 4. FLUX Kontext [dev] - CREATIVE EDITING 🎯

**Model:** `black-forest-labs/flux-kontext-dev`
**Type:** Image-to-Image (Instruction-Based Editing)
**Price:** $0.025/image (37.5% CHEAPER)

#### Quality Rating: ⭐⭐⭐⭐⭐ (5/5 for creativity)

**Why It's Better:**
- **Instruction-based editing:** Natural language prompts
- **Product transformation:** Place products in any context
- **Maintains identity:** Preserves product characteristics
- **Text/logo preservation:** Excellent for branded products
- **Multi-image support:** Batch processing

**Key Features:**
- Edit with text prompts (e.g., "white background, centered, product photography")
- Maintains product identity across transformations
- Proper lighting, shadows, perspective adjustments
- Best for creative product visualizations

**Input Parameters:**
```typescript
{
  prompt: string,              // Required: editing instructions
  input_image: File,           // Required: JPEG, PNG, GIF, WEBP
  guidance: number,            // 0-10, default: 2.5
  num_inference_steps: number, // 4-50, default: 28
  aspect_ratio: string,        // '1:1' or 'match_input_image'
  output_format: string,       // 'webp', 'jpg', 'png'
  output_quality: number,      // 0-100, default: 80
  go_fast: boolean,            // default: true
  seed: number                 // Optional: reproducibility
}
```

**Limitations:**
- **Creative focus:** Not designed for standard packshots
- **Longer processing:** ~12-15 seconds
- **H100 GPU required:** More expensive hardware
- May add artistic interpretation

**Code Example:**
```typescript
async function generatePackshotWithFlux(
  imageBuffer: Buffer,
  backgroundColor: string
): Promise<Buffer> {
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  const output = await replicate.run(
    'black-forest-labs/flux-kontext-dev',
    {
      input: {
        prompt: `Professional e-commerce product photography on ${backgroundColor} background. Product centered, clean composition, studio lighting, high quality packshot.`,
        input_image: dataUrl,
        guidance: 3.0,
        num_inference_steps: 28,
        aspect_ratio: '1:1',
        output_format: 'png',
        output_quality: 90,
        go_fast: true,
      },
    }
  ) as string

  const response = await fetch(output)
  return Buffer.from(await response.arrayBuffer())
}
```

**Best Use Cases:**
- Creative product visualizations
- Multiple background variations
- Lifestyle product photography
- Marketing materials with context

**Performance:**
- Processing: ~12-15 seconds
- Hardware: H100 GPU
- More variability in results

---

### 5. 851 Labs - FASTEST & CHEAPEST ⚡

**Model:** `851-labs/background-remover`
**Type:** Image-to-Image (Background Removal)
**Price:** $0.00061/image (98.5% CHEAPER!)

#### Quality Rating: ⭐⭐⭐☆☆ (3/5)

**Why It's Better:**
- **Ultra-fast:** 2-3 seconds processing
- **Ultra-cheap:** 1,639 images per $1
- **Clean edges:** Minimal artifacts
- **Simple API:** Single image input
- **Proven at scale:** 10.8M+ runs

**Key Features:**
- Based on InSPyReNet (ACCV 2022)
- General-purpose background removal
- Multiple output formats (RGBA, solid colors, blur, overlay)
- Adjustable threshold for alpha blending

**Input Parameters:**
```typescript
{
  image: string,           // Required: URI
  threshold: number,       // 0.0-1.0, default: 0.0 (soft alpha)
  reverse: boolean,        // Remove foreground instead
  background_type: string, // 'RGBA', 'map', 'green', 'white', 'blur', etc.
  format: string          // 'png', 'jpg'
}
```

**Limitations:**
- **Lower quality than Bria/BiRefNet** on complex backgrounds
- **Basic edge detection** compared to RMBG 2.0
- **Not specialized** for product photography
- Requires custom composition

**Code Example:**
```typescript
async function generatePackshotWith851Labs(
  imageBuffer: Buffer,
  backgroundColor: string
): Promise<Buffer> {
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  const output = await replicate.run(
    '851-labs/background-remover',
    {
      input: {
        image: dataUrl,
        threshold: 0.0,  // Soft alpha masking
        background_type: 'RGBA',
        format: 'png',
      },
    }
  ) as string

  const response = await fetch(output)
  const removedBgBuffer = Buffer.from(await response.arrayBuffer())

  // Apply custom composition (same as above)
  // ...

  return finalImage
}
```

**Best Use Cases:**
- Simple products on clean backgrounds
- High-volume processing
- Quick previews
- Budget-conscious applications

**Performance:**
- Processing: ~2-3 seconds
- Total runs: 10.8M+
- Hardware: Nvidia T4 GPU

---

## Why NOT Use visoar/product-photo?

**Model:** `visoar/product-photo`
**Price:** $0.10/image (150% MORE EXPENSIVE!)
**Status:** ❌ CURRENTLY OFFLINE

**Issues Identified:**
1. **More expensive** than current Bria solution
2. **Slower:** ~107 seconds vs 5.5 seconds
3. **Unpredictable pricing:** Varies significantly based on inputs
4. **Currently offline** on Replicate
5. **Less documentation** than alternatives
6. **Generates variations** rather than standard packshots

**Verdict:** Not recommended.

---

## Why NOT Use lucataco/remove-bg?

**Model:** `lucataco/remove-bg`
**Price:** $0.00036/image
**Status:** ✅ Online

**Why It's NOT Recommended:**
- **Lower quality** than Bria RMBG 2.0
- **Based on older tracer_b7** technology
- **Less accurate** on complex backgrounds
- **No advantage** over BiRefNet or 851 Labs at similar price point

**Verdict:** Better alternatives exist at similar price points.

---

## Comparison Table

| Model | Price/Image | vs Bria | Quality | Speed | Best For |
|-------|-------------|---------|---------|-------|----------|
| **Bria product-packshot** | $0.040 | Baseline | ⭐⭐⭐⭐☆ | 5.5s | All-in-one packshots |
| **Bria RMBG 2.0** 🏆 | $0.018 | -55% | ⭐⭐⭐⭐⭐ | 3s | High-quality removal |
| **BiRefNet** 💎 | $0.0014 | -96.5% | ⭐⭐⭐⭐☆ | 1s | Budget + volume |
| **Recraft AI** 🎨 | $0.010 | -75% | ⭐⭐⭐⭐☆ | 3s | AI-generated content |
| **FLUX Kontext** 🎯 | $0.025 | -37.5% | ⭐⭐⭐⭐⭐ | 12s | Creative editing |
| **851 Labs** ⚡ | $0.00061 | -98.5% | ⭐⭐⭐☆☆ | 2s | Simple products |
| visoar/product-photo | $0.100 | +150% | ❌ | 107s | ❌ Not recommended |
| lucataco/remove-bg | $0.00036 | -99% | ⭐⭐☆☆☆ | 2s | ⚠️ Better alternatives exist |

---

## Implementation Recommendations

### Option 1: Premium Quality (Recommended)
**Use:** Bria RMBG 2.0 + Custom Composition
**Cost:** $0.018/image (55% savings)
**Quality:** Highest available
**Effort:** Medium (need to implement composition logic)

### Option 2: Best Value
**Use:** BiRefNet + Custom Composition
**Cost:** $0.0014/image (96.5% savings!)
**Quality:** Excellent for most products
**Effort:** Medium (same composition logic)

### Option 3: Keep Current
**Use:** Bria product-packshot
**Cost:** $0.040/image
**Quality:** Very good
**Effort:** Zero (already implemented)

### Option 4: Hybrid Approach
**Logic:**
- Simple products (solid backgrounds) → BiRefNet ($0.0014)
- Complex products (hair, glass, fabric) → Bria RMBG 2.0 ($0.018)
- Creative variations → FLUX Kontext ($0.025)

**Average Cost:** ~$0.008/image (80% savings)
**Quality:** Optimized per product type
**Effort:** High (smart routing logic required)

---

## Complete Implementation Example (Bria RMBG 2.0)

```typescript
// /Users/mch/Documents/pixelift/app/api/generate-packshot-v2/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import sharp from 'sharp'
import { auth } from '@/lib/auth'
import { getUserByEmail, createUsage } from '@/lib/db'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

interface PackshotConfig {
  backgroundColor: string
  canvasSize: number
  productScale: number  // 0.8 = 80% of canvas
}

async function generatePackshotV2(
  imageBuffer: Buffer,
  config: PackshotConfig
): Promise<Buffer> {
  console.log('[Packshot V2] Starting with Bria RMBG 2.0')

  // Step 1: Remove background with Bria RMBG 2.0
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  const output = await replicate.run(
    'bria/remove-background',
    {
      input: {
        image: dataUrl,
        preserve_partial_alpha: true,
        content_moderation: false,
      },
    }
  ) as string

  console.log('[Packshot V2] Background removed, composing packshot')

  // Step 2: Download result
  const response = await fetch(output)
  const removedBgBuffer = Buffer.from(await response.arrayBuffer())

  // Step 3: Compose professional packshot
  const image = sharp(removedBgBuffer)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image metadata')
  }

  // Calculate sizing
  const maxProductSize = Math.round(config.canvasSize * config.productScale)
  const scale = Math.min(
    maxProductSize / metadata.width,
    maxProductSize / metadata.height
  )

  const scaledWidth = Math.round(metadata.width * scale)
  const scaledHeight = Math.round(metadata.height * scale)

  // Center on canvas
  const left = Math.round((config.canvasSize - scaledWidth) / 2)
  const top = Math.round((config.canvasSize - scaledHeight) / 2)

  // Create final packshot
  const finalImage = await sharp({
    create: {
      width: config.canvasSize,
      height: config.canvasSize,
      channels: 4,
      background: config.backgroundColor,
    }
  })
  .composite([{
    input: await image
      .resize(scaledWidth, scaledHeight, {
        fit: 'inside',
        kernel: sharp.kernel.lanczos3,
      })
      .toBuffer(),
    left,
    top,
  }])
  .png({ quality: 95 })
  .toBuffer()

  console.log('[Packshot V2] Packshot generated successfully')
  return finalImage
}

export async function POST(request: NextRequest) {
  try {
    // Authentication & validation (same as current implementation)
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = getUserByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const presetName = (formData.get('preset') as string) || 'white'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // File validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Supported: JPG, PNG, WEBP'
      }, { status: 400 })
    }

    const MAX_SIZE = 30 * 1024 * 1024 // 30MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size: 30MB'
      }, { status: 400 })
    }

    // Get preset config
    const presets: Record<string, PackshotConfig> = {
      white: {
        backgroundColor: '#FFFFFF',
        canvasSize: 2000,
        productScale: 0.8,
      },
      gray: {
        backgroundColor: '#F5F5F5',
        canvasSize: 2000,
        productScale: 0.8,
      },
      beige: {
        backgroundColor: '#F5E6D3',
        canvasSize: 2000,
        productScale: 0.8,
      },
      blue: {
        backgroundColor: '#E3F2FD',
        canvasSize: 2000,
        productScale: 0.8,
      },
    }

    const config = presets[presetName]
    if (!config) {
      return NextResponse.json({ error: 'Invalid preset' }, { status: 400 })
    }

    // Credits check (1 credit for V2 due to lower cost)
    const creditsNeeded = 1
    if (user.credits < creditsNeeded) {
      return NextResponse.json({
        error: 'Insufficient credits',
        required: creditsNeeded,
        available: user.credits,
      }, { status: 402 })
    }

    // Process image
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const finalImage = await generatePackshotV2(buffer, config)

    // Convert to data URL
    const base64 = finalImage.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    // Get dimensions
    const metadata = await sharp(finalImage).metadata()

    // Log usage
    createUsage({
      userId: user.id,
      type: 'packshot_generation_v2',
      creditsUsed: creditsNeeded,
      imageSize: `${file.size} bytes`,
      model: 'bria-rmbg-2.0-custom-composition',
    })

    const newCredits = user.credits - creditsNeeded

    return NextResponse.json({
      success: true,
      packshot: dataUrl,
      preset: presetName,
      dimensions: {
        width: metadata.width || 2000,
        height: metadata.height || 2000,
      },
      creditsRemaining: newCredits,
      model: 'bria-rmbg-2.0',
      savings: '55%',
    })
  } catch (error: any) {
    console.error('[Packshot V2] Error:', error)
    return NextResponse.json({
      error: 'Failed to generate packshot',
      details: error.message,
    }, { status: 500 })
  }
}
```

---

## Testing Recommendations

Before switching from Bria product-packshot:

1. **A/B Test** (100 images):
   - 50 images with Bria product-packshot (current)
   - 50 images with Bria RMBG 2.0 + custom composition
   - Compare quality, edge accuracy, centering

2. **Edge Cases** (20 images):
   - Products with hair/fur
   - Glass/transparent materials
   - Complex fabric textures
   - Products with shadows
   - Very small products
   - Very large products

3. **Performance Test**:
   - Measure average processing time
   - Test with concurrent requests
   - Monitor memory usage

4. **Cost Validation**:
   - Track actual Replicate API costs
   - Include Sharp processing time
   - Calculate break-even point

---

## Migration Path

### Phase 1: Validation (Week 1)
- [ ] Implement Bria RMBG 2.0 + composition in separate endpoint
- [ ] Test with 100 diverse products
- [ ] Compare quality vs current solution
- [ ] Measure actual costs

### Phase 2: Hybrid Rollout (Week 2-3)
- [ ] Implement feature flag: `USE_RMBG_V2`
- [ ] Route 10% of traffic to new endpoint
- [ ] Monitor error rates, quality complaints
- [ ] Gradually increase to 50%, then 100%

### Phase 3: Full Migration (Week 4)
- [ ] Switch all traffic to new endpoint
- [ ] Update documentation
- [ ] Remove old Bria product-packshot code
- [ ] Celebrate 55% cost savings!

---

## Sources

- [Replicate Background Removal Collection](https://replicate.com/collections/remove-backgrounds)
- [Replicate Image Editing Collection](https://replicate.com/collections/image-editing)
- [Bria RMBG 2.0 Benchmarking](https://blog.bria.ai/benchmarking-blog/brias-new-state-of-the-art-remove-background-2.0-outperforms-the-competition)
- [FLUX Kontext Documentation](https://replicate.com/blog/flux-kontext)
- [BiRefNet GitHub](https://github.com/ZhengPeng7/BiRefNet)
- [Replicate Pricing](https://replicate.com/pricing)
- [Product Photography AI Tools 2025](https://medium.com/what-is-the-best-ai/best-ai-tools-for-product-photography-2025-212a3dcad0a8)
- [AI Background Removal 2025 Guide](https://thekowcompany.com/blog/ai-background-removal-for-product-photography)

---

## Final Recommendation

**Switch to Bria RMBG 2.0 + custom composition:**

✅ **55% cost savings** ($0.018 vs $0.040)
✅ **Higher quality** (state-of-the-art accuracy)
✅ **256-level transparency** (better edges)
✅ **Licensed training data** (commercial safe)
✅ **Better complex backgrounds** (90% vs 85% accuracy)

**Implementation effort:** ~4-8 hours for composition logic
**ROI:** Immediate 55% savings on every packshot
**Risk:** Low (Bria is proven, just different model)

---

**Research completed by:** Claude (Anthropic)
**Date:** November 25, 2025
**Status:** Ready for implementation
