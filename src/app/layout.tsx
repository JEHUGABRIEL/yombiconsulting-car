import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { serializeJsonLd } from '@/lib/safeJsonLd';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cabinet Yo Mbi Consulting | HSSE & développement des entreprises',
  description: 'Cabinet Yo Mbi Consulting : conseil, formation et accompagnement en Hygiène, Santé, Sécurité, Environnement (HSSE) et développement des entreprises.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cabinet Yo Mbi Consulting',
  url: 'https://yombiconsulting.com',
  logo: 'https://yombiconsulting.com/logo.png',
  description:
    'Cabinet de conseil, de formation et d\'accompagnement en Hygiène, Santé, Sécurité, Environnement (HSSE) et développement des entreprises.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5e arrondissement, avenue du Lieutenant Koudoukou',
    addressLocality: 'Bangui',
    addressCountry: 'CF',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+236-72-11-19-14',
    contactType: 'customer service',
    email: 'contact.cmc@gmail.com',
  },
  sameAs: [
    'https://wa.me/23672111914',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') ?? undefined;

  return (
    <html lang="fr" nonce={nonce}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
