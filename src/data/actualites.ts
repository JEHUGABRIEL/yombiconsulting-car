export interface Actualite {
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
}

export const actualites: Actualite[] = [
  {
    slug: 'nouveau-referentiel-iso-45001-2025',
    date: '15 juil. 2025',
    category: 'HSSE',
    title: 'Les nouveautés du référentiel ISO 45001:2025',
    excerpt:
      'La norme ISO 45001 a été mise à jour en 2025. Découvrez les principaux changements et ce qu\'ils impliquent pour votre système de management.',
    content: [
      'La norme ISO 45001, référentiel international pour les systèmes de management de la santé et de la sécurité au travail (SMSS), a fait l\'objet d\'une révision majeure en 2025. Cette mise à jour répond aux évolutions des pratiques professionnelles et aux nouveaux défis sécuritaires rencontrés par les organisations à travers le monde.',
      'Parmi les principaux changements, on note le renforcement de l\'implication de la direction, une approche plus poussée de la participation des travailleurs, et l\'intégration de nouvelles exigences liées à la gestion des risques émergents. La norme encourage désormais une culture sécurité plus proactive, avec des indicateurs de performance plus robustes.',
      'Pour les entreprises certifiées ou en cours de préparation, cette révision implique un audit de conformité et une mise à jour de la documentation existante. Notre cabinet accompagne ses clients dans cette transition, depuis l\'analyse d\'écarts jusqu\'à la préparation de l\'audit de certification.',
    ],
    image:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&fit=crop',
  },
  {
    slug: 'securite-chantier-rca',
    date: '3 juin 2025',
    category: 'Sécurité',
    title: 'Sécurité sur les chantiers en RCA : état des lieux',
    excerpt:
      'Notre cabinet analyse les principaux risques observés sur les chantiers centrafricains et propose des actions concrètes de prévention.',
    content: [
      'Les chantiers de construction en République centrafricaine font face à des défis sécuritaires spécifiques. Le manque d\'équipements de protection individuelle, l\'absence de formation des ouvriers et le non-respect des consignes de sécurité constituent les principaux facteurs de risque identifiés lors de nos interventions.',
      'Notre cabinet a réalisé une étude approfondie sur une douzaine de chantiers à Bangui et en province. Les résultats montrent que 68 % des accidents auraient pu être évités par des mesures simples : port obligatoire des EPI, briefings sécurité quotidiens et signalisation adaptée.',
      'Nous recommandons la mise en place de comités sécurité sur chaque chantier, la formation d\'un référent sécurité par équipe, et l\'établissement d\'un plan de prévention spécifique à chaque projet. Ces mesures, combinées à un suivi régulier, permettent de réduire significativement le nombre d\'incidents.',
    ],
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80&fit=crop',
  },
  {
    slug: 'formation-premiers-secours-gratuite',
    date: '18 mai 2025',
    category: 'Formation',
    title: 'Programme de formation aux premiers secours en entreprise',
    excerpt:
      'Le cabinet lance une session de formation gratuite aux gestes de premiers secours pour les entreprises de Bangui. Places limitées.',
    content: [
      'Dans le cadre de sa mission de sensibilisation à la sécurité au travail, le Cabinet Yo Mbi Consulting lance un programme de formation gratuite aux premiers secours en entreprise. Cette initiative s\'adresse aux entreprises de Bangui et vise à renforcer les compétences des équipes face aux situations d\'urgence.',
      'La formation couvre les gestes essentiels : RCP, position latérale de sécurité, utilisation du défibrillateur (DAE), gestion des brûlures et des hémorragies. Elle se déroule sur une journée et comprend des mises en situation réelles pour garantir l\'efficacité des apprentissages.',
      'Les entreprises intéressées peuvent inscrire jusqu\'à 10 collaborateurs par session. La première session se tiendra le 15 juin 2025 dans nos locaux. Pour réserver une place, contactez-nous à contact.cmc@gmail.com ou au +236 72 11 19 14.',
    ],
    image:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80&fit=crop',
  },
];

export function getActualiteBySlug(slug: string): Actualite | undefined {
  return actualites.find((a) => a.slug === slug);
}
