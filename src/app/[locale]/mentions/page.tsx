'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MentionsPage() {
  const t = useTranslations('mentions');

  const sections = [
    { key: 'editor', textKey: 'editorText' },
    { key: 'data', textKey: 'dataText' },
    { key: 'responsibility', textKey: 'responsibilityText' },
  ];

  return (
    <>
      <Header />
      <main className="pt-[80px] min-h-[60vh]">
        <section className="py-16 bg-white">
          <div className="max-w-[800px] mx-auto px-6">
            <h1 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-12">
              {t('title')}
            </h1>

            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.key}>
                  <h2 className="font-bold text-[18px] text-ink mb-3">
                    {t(section.key)}
                  </h2>
                  <p className="text-mut text-[15.5px] leading-relaxed">
                    {t(section.textKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
