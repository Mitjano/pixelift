export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pixelift",
    "url": "https://pixelift.pl",
    "logo": "https://pixelift.pl/logo.png",
    "description": "Professional AI-powered image tools including image upscaling, background removal, packshot generation, and image expansion",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@pixelift.pl",
      "availableLanguage": ["English", "Polish"]
    },
    "sameAs": [
      // Add your social media profiles here
      // "https://twitter.com/pixelift",
      // "https://facebook.com/pixelift"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Pixelift",
    "alternateName": "Pixelift AI Image Tools",
    "url": "https://pixelift.pl",
    "description": "Professional AI-powered image tools. Upscale images up to 8x, remove backgrounds, generate packshots, and expand images with AI.",
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pixelift.pl/?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Pixelift",
    "applicationCategory": "MultimediaApplication",
    "applicationSubCategory": "Image Processing",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "2.0",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "1099.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "offerCount": "10"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "10000",
      "reviewCount": "2500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "AI Image Upscaling up to 8x",
      "Background Removal with BRIA RMBG 2.0",
      "Packshot Generator with AI Backgrounds",
      "Image Expansion (Outpainting) with FLUX",
      "Image Compression",
      "Face Enhancement with GFPGAN",
      "Real-ESRGAN Technology",
      "Fast Processing (5-20 seconds)",
      "Multiple Output Resolutions",
      "PNG and JPG Export",
      "No Watermarks",
      "GDPR Compliant"
    ]
  };

  // FAQ Schema for better SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does AI image upscaling work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI uses Real-ESRGAN and GFPGAN neural networks to analyze your image and intelligently add detail while enlarging. Unlike simple interpolation, AI understands image content and creates realistic details that match the original style."
        }
      },
      {
        "@type": "Question",
        "name": "What image formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pixelift supports JPG, PNG, and WebP formats for input. You can export results as high-quality PNG or JPG files. Maximum file size is 30MB."
        }
      },
      {
        "@type": "Question",
        "name": "How much does Pixelift cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New users get 3 free credits. We offer subscription plans starting at $7.99/month for 100 credits, or pay-as-you-go options starting at $6.99 for 15 credits. Yearly subscriptions save up to 70%."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We use 256-bit SSL encryption. Your images are automatically deleted after 1 hour. We're GDPR compliant and never share your data with third parties."
        }
      },
      {
        "@type": "Question",
        "name": "What tools are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pixelift offers 5 AI tools: Image Upscaler (up to 8x), Background Remover, Image Compressor, Packshot Generator, and Image Expand (outpainting). Face Restoration is coming soon."
        }
      }
    ]
  };

  // Service Schema for each tool - all 24 tools
  const allTools = [
    { name: "AI Image Upscaler", slug: "upscaler", description: "Enhance and enlarge images up to 8x resolution using Real-ESRGAN and GFPGAN AI models", serviceType: "Image Enhancement" },
    { name: "Background Remover", slug: "remove-background", description: "Remove backgrounds from images instantly with BRIA RMBG 2.0 AI technology", serviceType: "Background Removal" },
    { name: "Photo Colorizer", slug: "colorize", description: "Automatically colorize black and white photos using AI technology", serviceType: "Photo Colorization" },
    { name: "Image Restore", slug: "restore", description: "Remove noise, artifacts and restore old or damaged photos with AI", serviceType: "Image Restoration" },
    { name: "Object Removal", slug: "object-removal", description: "Remove unwanted objects, people, or blemishes from images using AI inpainting", serviceType: "Object Removal" },
    { name: "AI Background Generator", slug: "background-generator", description: "Generate professional AI backgrounds for product photos and portraits", serviceType: "Background Generation" },
    { name: "Image Compressor", slug: "image-compressor", description: "Reduce file size while maintaining quality using smart compression algorithms", serviceType: "Image Compression" },
    { name: "Image Expand", slug: "image-expand", description: "Extend your images with AI-generated content using FLUX outpainting technology", serviceType: "Image Expansion" },
    { name: "Style Transfer", slug: "style-transfer", description: "Transform yourself into any scene while preserving your face identity with InstantID", serviceType: "Style Transfer" },
    { name: "AI Inpainting", slug: "inpainting", description: "Fill and extend images with AI-generated content seamlessly", serviceType: "AI Inpainting" },
    { name: "Image Reimagine", slug: "reimagine", description: "Generate creative variations of your images with FLUX Redux AI", serviceType: "Image Variation" },
    { name: "Structure Control", slug: "structure-control", description: "Generate images with precise depth and edge control using ControlNet", serviceType: "Controlled Generation" },
    { name: "Format Converter", slug: "format-converter", description: "Convert images between formats: JPG, PNG, WebP, GIF, BMP, TIFF", serviceType: "Format Conversion" },
    { name: "Portrait Relight", slug: "portrait-relight", description: "Change portrait lighting direction and intensity with AI", serviceType: "Portrait Lighting" },
    { name: "Watermark Remover", slug: "watermark-remover", description: "Remove watermarks and text overlays from images using AI", serviceType: "Watermark Removal" },
    { name: "Crop Image", slug: "crop-image", description: "Crop and frame your images with precision controls", serviceType: "Image Cropping" },
    { name: "Resize Image", slug: "resize-image", description: "Change image dimensions while maintaining aspect ratio", serviceType: "Image Resizing" },
    { name: "Image Filters", slug: "image-filters", description: "Apply professional filters, adjust brightness, contrast, and saturation", serviceType: "Image Filters" },
    { name: "Collage Maker", slug: "collage", description: "Create beautiful photo collages with customizable layouts", serviceType: "Collage Creation" },
    { name: "AI Logo Maker", slug: "logo-maker", description: "Create professional logos in seconds with AI-powered generation", serviceType: "Logo Design" },
    { name: "Text Effects", slug: "text-effects", description: "Create stunning stylized text art with AI effects", serviceType: "Text Effects" },
    { name: "QR Code Generator", slug: "qr-generator", description: "Create customizable QR codes with your logo and brand colors", serviceType: "QR Code Generation" },
    { name: "Image Vectorizer", slug: "vectorize", description: "Convert raster images to scalable SVG vector format", serviceType: "Vectorization" },
  ];

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Pixelift AI Tools",
    "description": "Professional AI-powered image processing tools",
    "numberOfItems": allTools.length,
    "itemListElement": allTools.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": tool.name,
        "description": tool.description,
        "url": `https://pixelift.pl/tools/${tool.slug}`,
        "provider": {
          "@type": "Organization",
          "name": "Pixelift"
        },
        "serviceType": tool.serviceType
      }
    }))
  };

  // Pricing Schema
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "Pixelift Pricing",
    "url": "https://pixelift.pl/pricing",
    "priceCurrency": "USD",
    "eligibleQuantity": {
      "@type": "QuantitativeValue",
      "minValue": 15,
      "maxValue": 30000,
      "unitText": "credits"
    }
  };

  // How-To Schema for main tool
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Upscale Images with AI",
    "description": "Learn how to enhance and enlarge your images up to 8x resolution using Pixelift's AI upscaler",
    "totalTime": "PT1M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload your image",
        "text": "Drag and drop your image or click to browse. Supports JPG, PNG, and WebP up to 30MB.",
        "url": "https://pixelift.pl/tools/upscaler"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Choose upscale settings",
        "text": "Select your desired resolution (2x, 4x, or 8x) and choose a preset like Portrait, Landscape, or Art.",
        "url": "https://pixelift.pl/tools/upscaler"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Process and download",
        "text": "Click 'Upscale Image' and wait 5-20 seconds for AI processing. Download your enhanced image in PNG or JPG format.",
        "url": "https://pixelift.pl/tools/upscaler"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}
