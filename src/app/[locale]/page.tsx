import { setRequestLocale } from 'next-intl/server';
import HomeClient from './HomeClient';

export default async function Home({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <HomeClient />;
}
