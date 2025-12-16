"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTwitter, FaFacebook, FaLinkedin, FaPinterest, FaLink, FaCheck } from 'react-icons/fa';

export interface SocialShareButtonsProps {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  className?: string;
}

interface ShareButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  hoverColor: string;
}

function ShareButton({ onClick, icon, label, bgColor, hoverColor }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${bgColor} ${hoverColor} text-white transition-colors`}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export default function SocialShareButtons({
  url,
  title = 'Check out this AI-enhanced image!',
  description = 'Created with Pixelift - Free AI Image Processing Tools',
  imageUrl,
  className = '',
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareToTwitter = () => {
    const text = `${title} ${description}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const shareToPinterest = () => {
    const pinterestUrl = imageUrl
      ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(imageUrl)}&description=${encodedDescription}`
      : `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`;
    window.open(pinterestUrl, '_blank', 'width=550,height=420');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Share:</span>

      <ShareButton
        onClick={shareToTwitter}
        icon={<FaTwitter className="w-4 h-4" />}
        label="Share on X (Twitter)"
        bgColor="bg-black"
        hoverColor="hover:bg-gray-800"
      />

      <ShareButton
        onClick={shareToFacebook}
        icon={<FaFacebook className="w-4 h-4" />}
        label="Share on Facebook"
        bgColor="bg-blue-600"
        hoverColor="hover:bg-blue-700"
      />

      <ShareButton
        onClick={shareToLinkedIn}
        icon={<FaLinkedin className="w-4 h-4" />}
        label="Share on LinkedIn"
        bgColor="bg-blue-700"
        hoverColor="hover:bg-blue-800"
      />

      <ShareButton
        onClick={shareToPinterest}
        icon={<FaPinterest className="w-4 h-4" />}
        label="Share on Pinterest"
        bgColor="bg-red-600"
        hoverColor="hover:bg-red-700"
      />

      <ShareButton
        onClick={copyLink}
        icon={copied ? <FaCheck className="w-4 h-4" /> : <FaLink className="w-4 h-4" />}
        label={copied ? 'Copied!' : 'Copy link'}
        bgColor={copied ? 'bg-green-600' : 'bg-gray-600'}
        hoverColor={copied ? 'hover:bg-green-700' : 'hover:bg-gray-700'}
      />
    </div>
  );
}
