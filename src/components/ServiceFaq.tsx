'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type FaqItem = { question: string; answer: string };

export default function ServiceFaq({ title, items }: { title: string; items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="font-extrabold text-[20px] text-ink mb-6 tracking-[-0.01em]">{title}</h2>
      <div className="rounded-[16px] border border-line bg-[#FCFDFE] overflow-hidden">
        {items.map((item, index) => {
          const isOpen = open === index;
          const panelId = `service-faq-${index}`;

          return (
            <div key={index} className="border-b border-line last:border-b-0">
              <h3>
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="group w-full flex items-start gap-4 px-6 py-[18px] text-left"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="flex-1 font-semibold text-[14.5px] leading-snug text-ink group-hover:text-blue transition-colors">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.75}
                    className={`shrink-0 mt-0.5 text-mut transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-blue' : ''
                    }`}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 pr-14 text-mut text-[14px] leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
