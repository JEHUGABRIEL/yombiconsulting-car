'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Cabinet from '@/components/Cabinet';
import Terrain from '@/components/Terrain';
import Formations from '@/components/Formations';
import ValeurAjoutee from '@/components/ValeurAjoutee';
import Partenariats from '@/components/Partenariats';
import Actualites from '@/components/Actualites';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import CtaBanner from '@/components/CtaBanner';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';
import type { Service } from '@/data/services';
import type { Formation } from '@/data/formations';
import type { Actualite } from '@/data/actualites';

export default function HomeClient({
  services,
  formations,
  actualites,
}: {
  services: Service[];
  formations: Formation[];
  actualites: Actualite[];
}) {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services items={services} />
        <Cabinet />
        <Terrain />
        <Formations items={formations} />
        <ValeurAjoutee />
        <Partenariats />
        <Actualites items={actualites} />
        <Testimonials />
        <Contact />
        <CtaBanner />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
