import { getTranslations, setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FormationsExplorer from '@/components/FormationsExplorer';
import { getPublicFormations } from '@/lib/content';

export const revalidate = 60;

export default async function FormationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('formations');
  const items = await getPublicFormations(locale);

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/formation-salle-participants.jpeg')" }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-3">
              {t('title')} <span className="text-blue-soft">{t('titleHighlight')}</span>{' '}
              {t('titleSuffix')}
            </h1>
            <p className="text-white/70 text-[16.5px] max-w-[560px]">{t('description')}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <FormationsExplorer items={items} />

            <p className="mt-12 text-mut text-[14.5px]">
              {t('note')}{' '}
              <a href="/#contact" className="text-blue font-semibold hover:underline">
                {t('noteLink')}
              </a>
              {t('noteSuffix')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
