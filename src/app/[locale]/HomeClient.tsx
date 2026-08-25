'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Cabinet from '@/components/Cabinet';
import Formations from '@/components/Formations';
import ValeurAjoutee from '@/components/ValeurAjoutee';
import Partenariats from '@/components/Partenariats';
import Testimonials from '@/components/Testimonials';
import CtaBanner from '@/components/CtaBanner';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';

export default function HomeClient() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Cabinet />
        <Formations />
        <ValeurAjoutee />
        <Partenariats />
        <Testimonials />
        <CtaBanner />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
