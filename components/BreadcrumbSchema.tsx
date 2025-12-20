'use client';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbSchema component for SEO
 * Renders JSON-LD structured data for breadcrumb navigation
 *
 * Usage:
 * <BreadcrumbSchema items={[
 *   { name: 'Home', url: 'https://pixelift.pl' },
 *   { name: 'Tools', url: 'https://pixelift.pl/tools' },
 *   { name: 'Upscaler', url: 'https://pixelift.pl/tools/upscaler' },
 * ]} />
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
  );
}

/**
 * Helper to generate tool page breadcrumbs
 */
export function getToolBreadcrumbs(toolName: string, toolSlug: string, locale: string = 'en'): BreadcrumbItem[] {
  const baseUrl = 'https://pixelift.pl';
  return [
    { name: 'Home', url: `${baseUrl}/${locale}` },
    { name: 'Tools', url: `${baseUrl}/${locale}/tools` },
    { name: toolName, url: `${baseUrl}/${locale}/tools/${toolSlug}` },
  ];
}

export default BreadcrumbSchema;
