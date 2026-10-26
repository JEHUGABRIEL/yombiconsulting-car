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
    image: '/images/chantier-consignes-securite.jpeg',
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
    image: '/images/chantier-inspection.jpeg',
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
    image: '/images/chantier-inspection-2.jpeg',
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
    image: '/images/salle-reunion.jpeg',
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
    image: '/images/formation-intervenant.jpeg',
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
    image: '/images/formation-participantes-notes.jpeg',
  },
];

export const servicesEn: Service[] = [
  {
    slug: 'conseil-management-hsse',
    title: 'HSSE consulting & management',
    description:
      'We structure your prevention approach, from the HSSE committee to safety culture. From the initial diagnosis to a lasting management system, we support you at every step.',
    list: [
      'Business consulting and training of HSSE coordinators',
      'Implementation of the ISO 45001:2018 standard',
      'Setting up and strengthening HSSE committees',
      'Safety culture and prevention',
    ],
    subject: 'HSSE consulting & audit',
    image: '/images/chantier-consignes-securite.jpeg',
  },
  {
    slug: 'risques-professionnels-duerp',
    title: 'Occupational risks & risk assessment',
    description:
      'Identify, assess and prioritise your occupational risks using a single risk assessment document. We carry out a full review and give you the tools to steer prevention.',
    list: [
      'Single risk assessment document (DUERP)',
      'Analysis and assessment of occupational risks',
      'HSSE audits and inspections',
    ],
    subject: 'HSSE consulting & audit',
    image: '/images/chantier-inspection.jpeg',
  },
  {
    slug: 'procedures-plans-urgence',
    title: 'Procedures & emergency plans',
    description:
      'Clear instructions and tested emergency plans, known to all your teams. We draft and test the procedures that make the difference in a critical situation.',
    list: [
      'Drafting procedures',
      'Drafting emergency plans',
      'PPE awareness and correct use',
    ],
    subject: 'HSSE consulting & audit',
    image: '/images/chantier-inspection-2.jpeg',
  },
  {
    slug: 'environnement',
    title: 'Environment',
    description:
      'Waste, impacts, climate: we make your environmental footprint manageable. Practical solutions to reduce your impact and align your activities with regulatory requirements.',
    list: [
      'Environmental management',
      'Waste management',
      'Environmental impact assessment',
      'Environmental and social management plans',
      'Climate change awareness',
    ],
    subject: 'Environment',
    image: '/images/salle-reunion.jpeg',
  },
  {
    slug: 'developpement-entreprises',
    title: 'Business development',
    description:
      'Business model, organisation, financing: structuring your growth. We help you lay the foundations of a high-performing, sustainable company.',
    list: [
      'Tax, marketing and finance',
      'Organisation and management',
      'Business Model Canvas',
      'Business plan development',
    ],
    subject: 'Business development',
    image: '/images/formation-intervenant.jpeg',
  },
  {
    slug: 'coaching-pme',
    title: 'Coaching & SMEs',
    description:
      'Long-term support for entrepreneurs and small businesses. A dedicated contact who understands your challenges and helps you clear the key milestones.',
    list: [
      'Entrepreneur coaching',
      'SME support',
      'Post-training follow-up',
    ],
    subject: 'Business development',
    image: '/images/formation-participantes-notes.jpeg',
  },
];

export function getServices(locale: string): Service[] {
  return locale === 'en' ? servicesEn : services;
}

export function getServiceBySlug(slug: string, locale = 'fr'): Service | undefined {
  return getServices(locale).find((s) => s.slug === slug);
}
