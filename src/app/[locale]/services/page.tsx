'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Shield, AlertTriangle, FileText, Leaf, TrendingUp, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { services } from '@/data/services';

const iconMap: Record<string, React.ReactNode> = {
  'conseil-management-hsse': <Shield size={28} strokeWidth={1.5} />,
  'risques-professionnels-duerp': <AlertTriangle size={28} strokeWidth={1.5} />,
  'procedures-plans-urgence': <FileText size={28} strokeWidth={1.5} />,
  'environnement': <Leaf size={28} strokeWidth={1.5} />,
  'developpement-entreprises': <TrendingUp size={28} strokeWidth={1.5} />,
  'coaching-pme': <Users size={28} strokeWidth={1.5} />,
};

export default function ServicesPage() {
  const t = useTranslations('services');

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <span className="chip inline-flex items-center gap-2 bg-white/10 text-blue-soft text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-soft" />
              {t('chip')}
            </span>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h1>
            <p className="text-white/70 text-[17px] max-w-[560px]">
              {t('description')}
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group block bg-sky rounded-[20px] p-8 hover:shadow-[0_16px_40px_rgba(13,36,70,.1)] transition-all duration-300 border border-line hover:border-blue/20"
                >
                  <div className="w-14 h-14 rounded-[14px] bg-tint text-blue flex items-center justify-center mb-6 group-hover:bg-blue group-hover:text-white transition-all duration-300">
                    {iconMap[service.slug]}
                  </div>
                  <h2 className="font-bold text-[19px] text-ink mb-3 leading-snug">
                    {service.title}
                  </h2>
                  <p className="text-mut text-[14.5px] leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-blue text-[14px] font-bold group-hover:gap-3 transition-all">
                    {t('details')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
