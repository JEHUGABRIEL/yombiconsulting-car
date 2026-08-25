import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const messages = await getMessages({ locale: params.locale });
  const meta = (messages as any)?.meta;
  return {
    title: meta?.title || 'Cabinet Yo Mbi Consulting',
    description: meta?.description || '',
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  // next-intl v4 : la config (messages, locale, fuseau…) est héritée
  // automatiquement depuis src/i18n/request.ts
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
