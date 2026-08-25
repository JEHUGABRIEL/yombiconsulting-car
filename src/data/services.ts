export interface Service {
  slug: string;
  title: string;
  description: string;
  list: string[];
  subject: string;
  image: string;
}

export const services: Service[] = [
  {
    slug: 'conseil-management-hsse',
    title: 'Conseil & management HSSE',
    description:
      'Nous structurons votre démarche de prévention, du comité HSSE à la culture sécurité. Du diagnostic initial à la mise en place d\'un système de management durable, nous vous accompagnons à chaque étape.',
    list: [
      'Conseil en entreprise et formation des animateurs HSSE',
      'Mise en œuvre de la norme ISO 45001:2018',
      'Mise en place et renforcement des Comités HSSE',
      'Culture sécurité et prévention',
    ],
    subject: 'Conseil & audit HSSE',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&fit=crop',
  },
  {
    slug: 'risques-professionnels-duerp',
    title: 'Risques professionnels & DUERP',
    description:
      'Identifier, évaluer et hiérarchiser vos risques professionnels, document unique à l\'appui. Nous réalisons un état des lieux complet et vous fournissons les outils pour piloter la prévention.',
    list: [
      'Élaboration du DUERP',
      'Analyse et évaluation des risques professionnels',
      'Audits et inspections HSSE',
    ],
    subject: 'Conseil & audit HSSE',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80&fit=crop',
  },
  {
    slug: 'procedures-plans-urgence',
    title: 'Procédures & plans d\'urgence',
    description:
      'Des consignes claires et des plans d\'urgence éprouvés, connus de toutes vos équipes. Nous élaborons et testons les procédures qui font la différence en situation critique.',
    list: [
      'Élaboration de procédures',
      'Élaboration de plans d\'urgence',
      'Sensibilisation au port des EPI',
    ],
    subject: 'Conseil & audit HSSE',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80&fit=crop',
  },
  {
    slug: 'environnement',
    title: 'Environnement',
    description:
      'Déchets, impacts, climat : nous rendons votre empreinte environnementale pilotable. Des solutions concrètes pour réduire votre impact et conformer vos activités aux exigences réglementaires.',
    list: [
      'Gestion environnementale',
      'Gestion des déchets',
      'Évaluation des impacts environnementaux',
      'Plans de gestion environnementale et sociale',
      'Sensibilisation au changement climatique',
    ],
    subject: 'Environnement',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80&fit=crop',
  },
  {
    slug: 'developpement-entreprises',
    title: 'Développement des entreprises',
    description:
      'Business model, organisation, financement : structurer la croissance de votre activité. Nous vous aidons à poser les fondations d\'une entreprise performante et pérenne.',
    list: [
      'Fiscalité, marketing et finance',
      'Organisation et gestion',
      'Business Model Canvas',
      'Élaboration de plans d\'affaires',
    ],
    subject: 'Développement d\'entreprise',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fit=crop',
  },
  {
    slug: 'coaching-pme',
    title: 'Coaching & PME',
    description:
      'Un accompagnement dans la durée pour les entrepreneurs et les petites entreprises. Un interlocuteur dédié qui comprend vos enjeux et vous aide à franchir les étapes clés.',
    list: [
      'Coaching des entrepreneurs',
      'Accompagnement des PME',
      'Suivi après formation',
    ],
    subject: 'Développement d\'entreprise',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&fit=crop',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
