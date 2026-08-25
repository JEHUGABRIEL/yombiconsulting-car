import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cabinet Yo Mbi Consulting | HSSE & développement des entreprises',
  description: 'Cabinet Yo Mbi Consulting : conseil, formation et accompagnement en Hygiène, Santé, Sécurité, Environnement (HSSE) et développement des entreprises.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
      <body>{children}</body>
    </html>
  );
}
