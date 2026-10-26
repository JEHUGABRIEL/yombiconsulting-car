'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-start">
          <ScrollReveal>
            <div className="lg:sticky lg:top-[110px]">
              <h2 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] tracking-[-0.03em] mb-4">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
              <p className="text-mut text-[15px] leading-[1.7] max-w-[360px]">
                {t('description')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="border-t border-line">
              {items.map((item: any, i: number) => {
                const isOpen = openIndex === i;
                const panelId = `faq-panel-${i}`;
                return (
                  <div key={i} className="border-b border-line">
                    <h3>
                      <button
                        onClick={() => toggle(i)}
                        className="group w-full flex items-start gap-5 py-5 text-left"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                      >
                        <span className="flex-1 font-semibold text-[15.5px] leading-snug text-ink group-hover:text-blue transition-colors">
                          {item.question}
                        </span>
                        <ChevronDown
                          size={18}
                          strokeWidth={1.9}
                          className={`shrink-0 mt-0.5 text-mut transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-blue' : ''
                          }`}
                        />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-6 pr-10 text-mut text-[14.5px] leading-[1.7]">
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
      </div>
    </section>
  );
}
