import { setRequestLocale } from 'next-intl/server';
import HomeClient from './HomeClient';
import { getPublicActualites, getPublicFormations, getPublicServices } from '@/lib/content';

export const revalidate = 60;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [services, formations, actualites] = await Promise.all([
    getPublicServices(locale),
    getPublicFormations(locale),
    getPublicActualites(locale),
  ]);

  return (
    <HomeClient services={services} formations={formations} actualites={actualites} />
  );
}
