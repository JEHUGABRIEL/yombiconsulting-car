'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-sky">
      <div className="max-w-[860px] mx-auto px-6">
        {/* Heading – stacked above the accordion */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              {t('chip')}
            </span>
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
            <p className="text-mut text-[16px] max-w-[560px] mx-auto">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        {/* Accordion – single column */}
        <ScrollReveal delay={100}>
          <div
            className="bg-white rounded-2xl border border-line overflow-hidden"
            data-stagger
          >
            {items.map((item: any, i: number) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className={`border-b border-line last:border-b-0 ${
                    isOpen ? 'bg-tint/40' : ''
                  } transition-colors duration-300`}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="group w-full flex items-start gap-5 px-6 md:px-8 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`shrink-0 font-extrabold text-[13px] pt-1 tracking-widest transition-colors duration-300 ${
                        isOpen ? 'text-blue' : 'text-mut group-hover:text-blue'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`flex-1 font-bold text-[16px] leading-snug transition-colors duration-300 ${
                        isOpen ? 'text-blue' : 'text-ink'
                      }`}
                    >
                      {item.question}
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'bg-blue border-blue text-white'
                          : 'border-line text-mut group-hover:border-blue group-hover:text-blue'
                      }`}
                    >
                      {isOpen ? <Minus size={15} strokeWidth={1.8} /> : <Plus size={15} strokeWidth={1.8} />}
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 md:px-8 pb-6 pl-[3.75rem] md:pl-[4.25rem] -mt-1 text-mut text-[15px] leading-relaxed max-w-[600px]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
