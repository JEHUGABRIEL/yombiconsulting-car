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
      '/images/formation-formatrice-paperboard.jpeg',
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
      '/images/chantier-inspection-2.jpeg',
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
      '/images/formation-paperboard.jpeg',
  },
];

export const actualitesEn: Actualite[] = [
  {
    slug: 'nouveau-referentiel-iso-45001-2025',
    date: 'Jul 15, 2025',
    category: 'HSSE',
    title: "What's new in ISO 45001:2025",
    excerpt:
      'The ISO 45001 standard was updated in 2025. Discover the main changes and what they mean for your management system.',
    content: [
      'ISO 45001, the international standard for occupational health and safety management systems (OHSMS), underwent a major revision in 2025. The update responds to changes in professional practice and to the new safety challenges organisations face worldwide.',
      'Key changes include stronger leadership involvement, a deeper approach to worker participation, and new requirements for managing emerging risks. The standard now encourages a more proactive safety culture, with more robust performance indicators.',
      'For certified companies or those preparing for certification, the revision means a compliance audit and an update of existing documentation. Our firm supports clients through this transition, from gap analysis to preparing the certification audit.',
    ],
    image: '/images/formation-formatrice-paperboard.jpeg',
  },
  {
    slug: 'securite-chantier-rca',
    date: 'Jun 3, 2025',
    category: 'Safety',
    title: 'Construction site safety in CAR: the current situation',
    excerpt:
      'Our firm analyses the main risks observed on Central African construction sites and proposes concrete prevention actions.',
    content: [
      'Construction sites in the Central African Republic face specific safety challenges. A lack of personal protective equipment, untrained workers and failure to follow safety instructions are the main risk factors identified during our assignments.',
      'Our firm carried out an in-depth study of about a dozen sites in Bangui and the provinces. The findings show that 68% of accidents could have been avoided through simple measures: mandatory PPE, daily safety briefings and appropriate signage.',
      'We recommend setting up a safety committee on every site, training one safety focal point per team, and drawing up a prevention plan specific to each project. Combined with regular monitoring, these measures significantly reduce the number of incidents.',
    ],
    image: '/images/chantier-inspection-2.jpeg',
  },
  {
    slug: 'formation-premiers-secours-gratuite',
    date: 'May 18, 2025',
    category: 'Training',
    title: 'Workplace first-aid training programme',
    excerpt:
      'The firm is launching a free workplace first-aid training session for businesses in Bangui. Limited places.',
    content: [
      'As part of its mission to raise awareness of workplace safety, Yo Mbi Consulting is launching a free workplace first-aid training programme. The initiative is aimed at businesses in Bangui and seeks to strengthen teams\' ability to respond to emergencies.',
      'The course covers essential gestures: CPR, the recovery position, use of the defibrillator (AED), and managing burns and bleeding. It runs over one day and includes realistic simulations to ensure effective learning.',
      'Interested companies can register up to 10 employees per session. The first session will be held on 15 June 2025 at our premises. To book a place, contact us at contact.cmc@gmail.com or on +236 72 11 19 14.',
    ],
    image: '/images/formation-paperboard.jpeg',
  },
];

export function getActualites(locale: string): Actualite[] {
  return locale === 'en' ? actualitesEn : actualites;
}

export function getActualiteBySlug(slug: string, locale = 'fr'): Actualite | undefined {
  return getActualites(locale).find((a) => a.slug === slug);
}
