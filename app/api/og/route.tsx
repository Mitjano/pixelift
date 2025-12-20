import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Tool icons mapping (using emoji as fallback, could be replaced with SVG)
const toolIcons: Record<string, string> = {
  upscaler: '🔍',
  'remove-background': '✂️',
  colorize: '🎨',
  restore: '🔧',
  'object-removal': '🧹',
  'background-generator': '🖼️',
  'ai-background-generator': '🖼️',
  'image-compressor': '📦',
  'image-expand': '↔️',
  'style-transfer': '🎭',
  inpainting: '🖌️',
  reimagine: '✨',
  'structure-control': '🎯',
  'format-converter': '🔄',
  'portrait-relight': '💡',
  'watermark-remover': '🚫',
  'crop-image': '✂️',
  'resize-image': '📐',
  'image-filters': '🎛️',
  collage: '🖼️',
  'logo-maker': '🏷️',
  'text-effects': '✍️',
  'qr-generator': '📱',
  vectorize: '📊',
};

// Tool descriptions
const toolDescriptions: Record<string, { title: string; subtitle: string }> = {
  upscaler: { title: 'AI Image Upscaler', subtitle: 'Enhance images up to 8x resolution' },
  'remove-background': { title: 'Background Remover', subtitle: 'Instant & accurate AI removal' },
  colorize: { title: 'Photo Colorizer', subtitle: 'Add color to B&W photos' },
  restore: { title: 'Image Restore', subtitle: 'Fix old & damaged photos' },
  'object-removal': { title: 'Object Removal', subtitle: 'Remove unwanted elements' },
  'background-generator': { title: 'Background Generator', subtitle: 'Professional product backgrounds' },
  'ai-background-generator': { title: 'AI Background', subtitle: 'Generate stunning backgrounds' },
  'image-compressor': { title: 'Image Compressor', subtitle: 'Reduce file size smartly' },
  'image-expand': { title: 'Image Expand', subtitle: 'Extend images with AI' },
  'style-transfer': { title: 'Style Transfer', subtitle: 'Transform your photos' },
  inpainting: { title: 'AI Inpainting', subtitle: 'Fill & extend seamlessly' },
  reimagine: { title: 'Image Reimagine', subtitle: 'Creative AI variations' },
  'structure-control': { title: 'Structure Control', subtitle: 'Precise depth control' },
  'format-converter': { title: 'Format Converter', subtitle: 'JPG, PNG, WebP & more' },
  'portrait-relight': { title: 'Portrait Relight', subtitle: 'AI lighting adjustment' },
  'watermark-remover': { title: 'Watermark Remover', subtitle: 'Clean removal with AI' },
  'crop-image': { title: 'Crop Image', subtitle: 'Precision cropping tool' },
  'resize-image': { title: 'Resize Image', subtitle: 'Smart dimension control' },
  'image-filters': { title: 'Image Filters', subtitle: 'Professional adjustments' },
  collage: { title: 'Collage Maker', subtitle: 'Beautiful photo layouts' },
  'logo-maker': { title: 'AI Logo Maker', subtitle: 'Professional logos in seconds' },
  'text-effects': { title: 'Text Effects', subtitle: 'Stunning stylized text' },
  'qr-generator': { title: 'QR Generator', subtitle: 'Custom branded QR codes' },
  vectorize: { title: 'Image Vectorizer', subtitle: 'Convert to SVG format' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tool = searchParams.get('tool') || 'default';
  const title = searchParams.get('title');
  const subtitle = searchParams.get('subtitle');

  const toolInfo = toolDescriptions[tool] || {
    title: title || 'Pixelift',
    subtitle: subtitle || 'AI-Powered Image Tools'
  };
  const icon = toolIcons[tool] || '🖼️';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              display: 'flex',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            {toolInfo.title}
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#94a3b8',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {toolInfo.subtitle}
          </p>
        </div>

        {/* Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #22c55e 0%, #a855f7 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '24px', color: 'white', fontWeight: 700 }}>P</span>
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            Pixelift
          </span>
          <span
            style={{
              fontSize: '20px',
              color: '#64748b',
              marginLeft: '8px',
            }}
          >
            pixelift.pl
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
