'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SavoirFaire from '@/components/SavoirFaire';
import ImageBand from '@/components/ImageBand';
import Cabinet from '@/components/Cabinet';
import Terrain from '@/components/Terrain';
import Formations from '@/components/Formations';
import ValeurAjoutee from '@/components/ValeurAjoutee';
import Partenariats from '@/components/Partenariats';
import Ressources from '@/components/Ressources';
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
        <SavoirFaire items={services} />
        <Cabinet />
        <Terrain />
        <Formations items={formations} />
        <div className="relative">
          <ImageBand />
          <ValeurAjoutee />
        </div>
        <Partenariats />
        <Ressources />
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
