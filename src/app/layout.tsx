import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cabinet Yo Mbi Consulting | HSSE & développement des entreprises',
  description: 'Cabinet Yo Mbi Consulting : conseil, formation et accompagnement en Hygiène, Santé, Sécurité, Environnement (HSSE) et développement des entreprises.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
