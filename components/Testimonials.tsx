'use client';

import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Professional Photographer',
    company: 'Mitchell Studios',
    image: null,
    initials: 'SM',
    color: 'from-pink-500 to-rose-500',
    rating: 5,
    text: "Pixelift has completely transformed my workflow. I can now upscale old client photos to print-quality resolution in seconds. The AI preserves details I thought were lost forever.",
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'E-commerce Manager',
    company: 'TechStyle Co.',
    image: null,
    initials: 'MC',
    color: 'from-blue-500 to-cyan-500',
    rating: 5,
    text: "We process thousands of product images monthly. Pixelift's batch capabilities and consistent quality have cut our editing time by 70%. The packshot generator is a game-changer.",
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Digital Artist',
    company: 'Freelance',
    image: null,
    initials: 'ER',
    color: 'from-purple-500 to-violet-500',
    rating: 5,
    text: "As an illustrator, I need tools that understand artistic intent. Pixelift's AI upscaling maintains the integrity of my artwork while adding incredible detail. Simply amazing!",
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Marketing Director',
    company: 'Brandify Agency',
    image: null,
    initials: 'DP',
    color: 'from-green-500 to-emerald-500',
    rating: 5,
    text: "Our agency switched from expensive desktop software to Pixelift. The cloud-based approach means our team can work from anywhere, and the results are consistently professional.",
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Content Creator',
    company: '500K+ Followers',
    image: null,
    initials: 'LT',
    color: 'from-orange-500 to-amber-500',
    rating: 5,
    text: "I use Pixelift daily for my social media content. The background remover is so precise, and the image expander helps me create perfect aspect ratios for every platform.",
  },
  {
    id: 6,
    name: 'James Wilson',
    role: 'Real Estate Agent',
    company: 'Premier Properties',
    image: null,
    initials: 'JW',
    color: 'from-teal-500 to-cyan-500',
    rating: 5,
    text: "Property photos make or break a listing. Pixelift helps me enhance smartphone photos to professional quality. My listings now look like they were shot by a pro photographer.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="text-sm font-semibold text-green-400">Customer Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Loved by <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Creators</span> Worldwide
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of professionals who trust Pixelift for their image enhancement needs
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-8 md:gap-16 mb-16 flex-wrap">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              50K+
            </div>
            <div className="text-gray-400 mt-1">Images Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              10K+
            </div>
            <div className="text-gray-400 mt-1">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              4.9/5
            </div>
            <div className="text-gray-400 mt-1">Average Rating</div>
          </div>
        </div>

        {/* Featured Testimonial (Large) */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-full transition-all hover:scale-110"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-full transition-all hover:scale-110"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Testimonial Card */}
            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 md:p-12">
              {/* Quote Icon */}
              <div className="absolute top-6 right-8 text-green-500/20">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className="relative">
                {/* Rating */}
                <div className="mb-6">
                  <StarRating rating={testimonials[currentIndex].rating} />
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 min-h-[120px]">
                  "{testimonials[currentIndex].text}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonials[currentIndex].color} flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonials[currentIndex].initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">{testimonials[currentIndex].name}</div>
                    <div className="text-gray-400">{testimonials[currentIndex].role}</div>
                    <div className="text-green-400 text-sm">{testimonials[currentIndex].company}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-green-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Grid of smaller testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group p-6 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-green-500/50 transition-all duration-300 ${
                index === currentIndex ? 'ring-2 ring-green-500/30' : ''
              }`}
            >
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-300 mt-4 mb-6 line-clamp-3">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{testimonial.name}</div>
                  <div className="text-gray-500 text-xs">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
