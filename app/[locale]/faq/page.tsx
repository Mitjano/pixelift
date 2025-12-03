'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 transition text-left"
      >
        <span className="font-medium text-white">{item.question}</span>
        {isOpen ? (
          <FaChevronUp className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-900/50 text-gray-300">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations('faqPage');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('categories.all') },
    { id: 'general', label: t('categories.general') },
    { id: 'pricing', label: t('categories.pricing') },
    { id: 'technical', label: t('categories.technical') },
    { id: 'account', label: t('categories.account') },
  ];

  const faqItems: FAQItem[] = [
    // General
    {
      question: t('questions.whatIsPixelift.question'),
      answer: t('questions.whatIsPixelift.answer'),
      category: 'general',
    },
    {
      question: t('questions.howDoesItWork.question'),
      answer: t('questions.howDoesItWork.answer'),
      category: 'general',
    },
    {
      question: t('questions.whatFormats.question'),
      answer: t('questions.whatFormats.answer'),
      category: 'general',
    },
    {
      question: t('questions.maxFileSize.question'),
      answer: t('questions.maxFileSize.answer'),
      category: 'general',
    },
    // Pricing
    {
      question: t('questions.isFree.question'),
      answer: t('questions.isFree.answer'),
      category: 'pricing',
    },
    {
      question: t('questions.whatAreCredits.question'),
      answer: t('questions.whatAreCredits.answer'),
      category: 'pricing',
    },
    {
      question: t('questions.refunds.question'),
      answer: t('questions.refunds.answer'),
      category: 'pricing',
    },
    // Technical
    {
      question: t('questions.imageQuality.question'),
      answer: t('questions.imageQuality.answer'),
      category: 'technical',
    },
    {
      question: t('questions.processingTime.question'),
      answer: t('questions.processingTime.answer'),
      category: 'technical',
    },
    {
      question: t('questions.apiAccess.question'),
      answer: t('questions.apiAccess.answer'),
      category: 'technical',
    },
    // Account
    {
      question: t('questions.dataPrivacy.question'),
      answer: t('questions.dataPrivacy.answer'),
      category: 'account',
    },
    {
      question: t('questions.deleteAccount.question'),
      answer: t('questions.deleteAccount.answer'),
      category: 'account',
    },
  ];

  const filteredItems = activeCategory === 'all'
    ? faqItems
    : faqItems.filter(item => item.category === activeCategory);

  // Generate JSON-LD structured data for FAQ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === category.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Items */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <FAQAccordion
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('stillHaveQuestions.title')}</h2>
          <p className="text-gray-400 mb-6">{t('stillHaveQuestions.subtitle')}</p>
          <Link
            href="/support"
            className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition"
          >
            {t('stillHaveQuestions.contactSupport')}
          </Link>
        </div>
      </section>
    </div>
  );
}
