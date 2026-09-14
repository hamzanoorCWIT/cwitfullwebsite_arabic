'use client';

import { useState, useEffect } from 'react';
import { normalizeDescriptionHtml } from '@/app/lib/cms-description-html';

export interface Testimonial {
  text: string;
  rating: number; // Number of stars (1-5)
}

interface ClientTestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
}

export default function ClientTestimonials({
  title,
  testimonials,
}: ClientTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 md:w-6 md:h-6 ${
          i < rating ? 'text-[#FFD700]' : 'text-[#4a4a4a]'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ));
  };

  return (
    <section className="w-full mx-auto relative py-20 px-4 md:px-8 bg-black">
      <div className="max-w-[1494px] mx-auto global-section-padding">
        {/* Heading with purple dot */}
        <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#9333ea]"></div>
          <h2 className="text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] xl:text-[28px] 2xl:text-[32px] min-[1440px]:text-[36px] min-[1920px]:text-[40px] font-[350] text-white text-center">
            {title}
          </h2>
        </div>

        {/* Testimonial Slider */}
        <div className="relative">
          {/* Testimonial Content */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="max-w-4xl mx-auto">
                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-6 md:mb-8">
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Testimonial Text */}
                    <p
                      className="text-white text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[24px] 2xl:text-[26px] min-[1440px]:text-[28px] min-[1920px]:text-[30px] font-[350] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] text-center"
                      dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(testimonial.text) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8 md:mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#9333ea] w-8 md:w-10'
                    : 'bg-[#4a4a4a] hover:bg-[#6a6a6a]'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

