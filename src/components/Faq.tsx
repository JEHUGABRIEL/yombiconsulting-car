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
        <ScrollReveal>
          <div className="mb-10">
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-3">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
            <p className="text-mut text-[15.5px] max-w-[560px]">{t('description')}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="bg-[#FCFDFE] border border-line rounded-[16px] overflow-hidden">
            {items.map((item: any, i: number) => {
              const isOpen = openIndex === i;
              const panelId = `faq-panel-${i}`;
              return (
                <div key={i} className="border-b border-line last:border-b-0">
                  <h3>
                    <button
                      onClick={() => toggle(i)}
                      className="group w-full flex items-start gap-4 px-6 md:px-8 py-[22px] text-left"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span className="flex-1 font-semibold text-[15.5px] leading-snug text-ink group-hover:text-blue transition-colors">
                        {item.question}
                      </span>
                      <span
                        className={`shrink-0 mt-px inline-flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
                          isOpen
                            ? 'border-blue bg-blue text-white'
                            : 'border-line-2 text-mut group-hover:border-blue group-hover:text-blue'
                        }`}
                      >
                        {isOpen ? (
                          <Minus size={14} strokeWidth={2} />
                        ) : (
                          <Plus size={14} strokeWidth={2} />
                        )}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 md:px-8 pb-6 pr-14 text-mut text-[14.5px] leading-relaxed">
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
