"use client";

import { SocialShareButtons } from '@/components/shared';

interface SharePageClientProps {
  shareUrl: string;
  imageUrl: string;
}

export default function SharePageClient({ shareUrl, imageUrl }: SharePageClientProps) {
  return (
    <SocialShareButtons
      url={shareUrl}
      title="Check out this AI-enhanced image!"
      description="Created with Pixelift - Free AI Image Processing Tools"
      imageUrl={imageUrl}
    />
  );
}
