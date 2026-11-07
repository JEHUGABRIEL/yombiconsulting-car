'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Quote, Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/** Section entièrement consacrée aux commentaires laissés par les clients. */
export default function Testimonials() {
  const t = useTranslations('testimonials');
  const tc = useTranslations('commentaires');
  const items = t.raw('items') as {
    name: string;
    role: string;
    text: string;
    rating?: number;
  }[];

  return (
    <section id="commentaires" className="py-20 bg-[#F1F5FB]">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-[640px] mb-10">
            <p className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-blue mb-3">
              {tc('chip')}
            </p>
            <h2 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] tracking-[-0.03em]">
              {tc('title')} <span className="text-blue">{tc('titleHighlight')}</span>
            </h2>
            <p className="text-mut text-[15.5px] leading-[1.7] mt-4">{tc('description')}</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-stagger>
          {items.map((item, index) => (
            <ScrollReveal key={item.name + index} className="h-full">
              <figure className="h-full bg-[#FCFDFE] border border-line rounded-[20px] p-6 sm:p-7 flex flex-col">
                <Quote size={22} className="text-blue/25" strokeWidth={1.75} />

                <blockquote className="text-ink text-[16px] sm:text-[16.5px] leading-[1.7] mt-4">
                  {item.text}
                </blockquote>

                <figcaption className="mt-auto pt-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-tint text-blue font-bold text-[12.5px] flex items-center justify-center">
                    {item.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink">{item.name}</span>
                    <span className="block text-[12.5px] text-mut truncate">{item.role}</span>
                  </span>
                  <span className="ml-auto flex items-center gap-0.5" aria-label={`${item.rating ?? 5}/5`}>
                    {Array.from({ length: item.rating ?? 5 }).map((_, star) => (
                      <Star key={star} size={13} className="star-filled" fill="currentColor" strokeWidth={0} />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={120}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-mut text-[14.5px]">{tc('ctaText')}</p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[14px] font-semibold btn btn-primary"
            >
              {tc('cta')}
              <ArrowRight size={18} strokeWidth={1.75} />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
