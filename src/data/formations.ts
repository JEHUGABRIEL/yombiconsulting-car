export interface Formation {
  slug: string;
  title: string;
  category: 'sec' | 'mgmt' | 'ent';
  description: string;
  duration: string;
  format: string;
  objectives: string[];
  public_cible: string;
  image: string;
}

export const formations: Formation[] = [
  {
    slug: 'animateur-hsse',
    title: 'Animateur HSSE',
    category: 'sec',
    description:
      'Former les référents internes qui piloteront la démarche HSSE au quotidien. Ce formation donne les clés pour animer, sensibiliser et faire vivre la culture sécurité dans l\'organisation.',
    duration: '5 jours',
    format: 'Présentiel',
    objectives: [
      'Comprendre le cadre réglementaire et les enjeux HSSE',
      'Savoir animer un comité HSSE',
      'Mettre en place des indicateurs de performance',
      'Conduire des investigations après incident',
    ],
    public_cible: 'Référents HSSE, managers opérationnels',
    image: '/images/formation-formatrice-paperboard.jpeg',
  },
  {
    slug: 'securite-travail',
    title: 'Santé et sécurité au travail',
    category: 'sec',
    description:
      'Les fondamentaux de la prévention des risques professionnels pour tous les acteurs de l\'entreprise. Une formation pratique, adaptée au contexte centrafricain.',
    duration: '3 jours',
    format: 'Présentiel',
    objectives: [
      'Identifier les principaux risques professionnels',
      'Appliquer les règles de sécurité au quotidien',
      'Utiliser correctement les équipements de protection',
      'Participer à la démarche de prévention',
    ],
    public_cible: 'Ensemble du personnel',
    image: '/images/formation-salle-participants.jpeg',
  },
  {
    slug: 'prevention-accidents',
    title: 'Prévention des accidents',
    category: 'sec',
    description:
      'Techniques concrètes pour anticiper les situations à risque et réduire la fréquence et la gravité des accidents de travail.',
    duration: '2 jours',
    format: 'Présentiel',
    objectives: [
      'Analyser les causes racines des accidents',
      'Mettre en place des mesures de prévention',
      'Sensibiliser les équipes aux situations dangereuses',
    ],
    public_cible: 'Encadrants, animateurs sécurité',
    image: '/images/chantier-consignes-securite.jpeg',
  },
  {
    slug: 'port-epi',
    title: 'Port des EPI',
    category: 'sec',
    description:
      'Formation pratique au choix, vérification et utilisation correcte des Équipements de Protection Individuelle.',
    duration: '1 jour',
    format: 'Présentiel',
    objectives: [
      'Connaître les différents types d\'EPI',
      'Sélectionner l\'EPI adapté à chaque risque',
      'Vérifier et entretenir les équipements',
    ],
    public_cible: 'Opérateurs, personnel de terrain',
    image: '/images/chantier-inspection.jpeg',
  },
  {
    slug: 'premiers-secours',
    title: 'Premiers secours',
    category: 'sec',
    description:
      'Gestes de premiers secours en milieu professionnel : réagir efficacement en attendant les secours.',
    duration: '2 jours',
    format: 'Présentiel',
    objectives: [
      'Évaluer une situation d\'urgence',
      'Réaliser les gestes essentiels (RCP, position latérale, etc.)',
      'Utiliser un défibrillateur (DAE)',
      'Gérer un plan d\'urgence interne',
    ],
    public_cible: 'Ensemble du personnel',
    image: '/images/formation-paperboard.jpeg',
  },
  {
    slug: 'gestion-risques-professionnels',
    title: 'Gestion des risques professionnels',
    category: 'sec',
    description:
      'Méthodologie complète d\'évaluation et de traitement des risques professionnels, du repérage au suivi.',
    duration: '3 jours',
    format: 'Présentiel',
    objectives: [
      'Cartographier les risques de l\'entreprise',
      'Utiliser les grilles d\'évaluation des risques',
      'Définir et piloter le plan de prévention',
      'Alimenter le DUERP',
    ],
    public_cible: 'Managers, référents HSSE',
    image: '/images/chantier-inspection-2.jpeg',
  },
  {
    slug: 'management-hsse',
    title: 'Management HSSE',
    category: 'mgmt',
    description:
      'Intégrer la performance HSSE dans les pratiques managériales pour conduire le changement et sécuriser les opérations.',
    duration: '3 jours',
    format: 'Présentiel',
    objectives: [
      'Incarnner la démarche HSSE au niveau managérial',
      'Intégrer la sécurité dans les processus décisionnels',
      'Piloter les indicateurs HSSE',
      'Développer la culture sécurité dans les équipes',
    ],
    public_cible: 'Managers, directeurs d\'établissement',
    image: '/images/formation-participantes-notes.jpeg',
  },
  {
    slug: 'leadership-culture-securite',
    title: 'Leadership et culture sécurité',
    category: 'mgmt',
    description:
      'Développer un leadership orienté sécurité pour transformer durablement les comportements au travail.',
    duration: '2 jours',
    format: 'Présentiel',
    objectives: [
      'Comprendre les leviers du leadership sécurité',
      'Modeler les comportements souhaités',
      'Créer une culture de reporting sans crainte',
      'Valoriser les initiatives sécurité',
    ],
    public_cible: 'Dirigeants, managers, chefs d\'équipe',
    image: '/images/formation-intervenant.jpeg',
  },
  {
    slug: 'environnement-developpement-durable',
    title: 'Environnement et développement durable',
    category: 'mgmt',
    description:
      'Comprendre les enjeux environnementaux et mettre en œuvre une stratégie de développement durable dans votre organisation.',
    duration: '3 jours',
    format: 'Présentiel',
    objectives: [
      'Comprendre le cadre réglementaire environnemental',
      'Évaluer l\'empreinte environnementale',
      'Mettre en place un plan d\'action durable',
      'Sensibiliser les parties prenantes',
    ],
    public_cible: 'Managers, responsables RSE',
    image: '/images/salle-reunion.jpeg',
  },
  {
    slug: 'entrepreneuriat',
    title: 'Entrepreneuriat',
    category: 'ent',
    description:
      'Les clés pour lancer et développer une activité entrepreneuriale réussie, du concept au business plan.',
    duration: '5 jours',
    format: 'Présentiel',
    objectives: [
      'Valider une idée d\'activité',
      'Construire un modèle économique viable',
      'Élaborer un plan d\'affaires',
      'Comprendre les fondamentaux de la gestion',
    ],
    public_cible: 'Porteurs de projets, entrepreneurs',
    image: '/images/formation-formatrice-debout.jpeg',
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    category: 'ent',
    description:
      'Techniques de marketing adaptées au marché centrafricain pour acquérir et fidéliser vos clients.',
    duration: '3 jours',
    format: 'Présentiel',
    objectives: [
      'Comprendre les besoins de votre cible',
      'Définir une stratégie marketing efficace',
      'Maîtriser les canaux de distribution et communication',
      'Mesurer l\'efficacité de vos actions',
    ],
    public_cible: 'Entrepreneurs, responsables commerciaux',
    image: '/images/formation-participante-attentive.jpeg',
  },
  {
    slug: 'gestion-financiere',
    title: 'Gestion financière',
    category: 'ent',
    description:
      'Piloter la santé financière de votre entreprise avec des outils concrets de gestion budgétaire et de trésorerie.',
    duration: '3 jours',
    format: 'Présentiel',
    objectives: [
      'Comprendre les états financiers',
      'Élaborer et suivre un budget',
      'Gérer la trésorerie au quotidien',
      'Prendre des décisions financières éclairées',
    ],
    public_cible: 'Entrepreneurs, gestionnaires',
    image: '/images/salle-reunion-2.jpeg',
  },
];

export const formationsEn: Formation[] = [
  {
    slug: 'animateur-hsse',
    title: 'HSSE coordinator',
    category: 'sec',
    description:
      'Train the internal coordinators who will drive the HSSE approach day to day. This course gives them the keys to lead, raise awareness and keep safety culture alive in the organisation.',
    duration: '5 days',
    format: 'In-person',
    objectives: [
      'Understand the regulatory framework and HSSE challenges',
      'Lead an HSSE committee',
      'Set up performance indicators',
      'Conduct post-incident investigations',
    ],
    public_cible: 'HSSE coordinators, operational managers',
    image: '/images/formation-formatrice-paperboard.jpeg',
  },
  {
    slug: 'securite-travail',
    title: 'Occupational health and safety',
    category: 'sec',
    description:
      'The fundamentals of occupational risk prevention for every player in the company. A practical course adapted to the Central African context.',
    duration: '3 days',
    format: 'In-person',
    objectives: [
      'Identify the main occupational risks',
      'Apply safety rules day to day',
      'Use protective equipment correctly',
      'Take part in the prevention approach',
    ],
    public_cible: 'All staff',
    image: '/images/formation-salle-participants.jpeg',
  },
  {
    slug: 'prevention-accidents',
    title: 'Accident prevention',
    category: 'sec',
    description:
      'Practical techniques to anticipate risky situations and reduce the frequency and severity of workplace accidents.',
    duration: '2 days',
    format: 'In-person',
    objectives: [
      'Analyse the root causes of accidents',
      'Implement prevention measures',
      'Raise team awareness of hazardous situations',
    ],
    public_cible: 'Supervisors, safety coordinators',
    image: '/images/chantier-consignes-securite.jpeg',
  },
  {
    slug: 'port-epi',
    title: 'Use of PPE',
    category: 'sec',
    description:
      'Practical training in choosing, checking and correctly using Personal Protective Equipment.',
    duration: '1 day',
    format: 'In-person',
    objectives: [
      'Know the different types of PPE',
      'Select the PPE suited to each risk',
      'Check and maintain the equipment',
    ],
    public_cible: 'Operators, field staff',
    image: '/images/chantier-inspection.jpeg',
  },
  {
    slug: 'premiers-secours',
    title: 'First aid',
    category: 'sec',
    description:
      'First-aid gestures in the workplace: reacting effectively while waiting for the emergency services.',
    duration: '2 days',
    format: 'In-person',
    objectives: [
      'Assess an emergency situation',
      'Perform the essential gestures (CPR, recovery position, etc.)',
      'Use a defibrillator (AED)',
      'Manage an internal emergency plan',
    ],
    public_cible: 'All staff',
    image: '/images/formation-paperboard.jpeg',
  },
  {
    slug: 'gestion-risques-professionnels',
    title: 'Occupational risk management',
    category: 'sec',
    description:
      "A complete methodology for assessing and treating occupational risks, from identification to follow-up.",
    duration: '3 days',
    format: 'In-person',
    objectives: [
      "Map the company's risks",
      'Use risk assessment grids',
      'Define and steer the prevention plan',
      'Feed the single risk assessment document (DUERP)',
    ],
    public_cible: 'Managers, HSSE coordinators',
    image: '/images/chantier-inspection-2.jpeg',
  },
  {
    slug: 'management-hsse',
    title: 'HSSE management',
    category: 'mgmt',
    description:
      'Embed HSSE performance in management practice to drive change and secure operations.',
    duration: '3 days',
    format: 'In-person',
    objectives: [
      'Embody the HSSE approach at management level',
      'Integrate safety into decision-making processes',
      'Steer HSSE indicators',
      'Develop safety culture within teams',
    ],
    public_cible: 'Managers, site directors',
    image: '/images/formation-participantes-notes.jpeg',
  },
  {
    slug: 'leadership-culture-securite',
    title: 'Safety leadership and culture',
    category: 'mgmt',
    description:
      'Develop safety-oriented leadership to durably transform workplace behaviour.',
    duration: '2 days',
    format: 'In-person',
    objectives: [
      'Understand the drivers of safety leadership',
      'Model the desired behaviours',
      'Create a blame-free reporting culture',
      'Recognise safety initiatives',
    ],
    public_cible: 'Executives, managers, team leaders',
    image: '/images/formation-intervenant.jpeg',
  },
  {
    slug: 'environnement-developpement-durable',
    title: 'Environment and sustainable development',
    category: 'mgmt',
    description:
      'Understand environmental challenges and implement a sustainable development strategy in your organisation.',
    duration: '3 days',
    format: 'In-person',
    objectives: [
      'Understand the environmental regulatory framework',
      'Assess the environmental footprint',
      'Set up a sustainable action plan',
      'Raise stakeholder awareness',
    ],
    public_cible: 'Managers, CSR officers',
    image: '/images/salle-reunion.jpeg',
  },
  {
    slug: 'entrepreneuriat',
    title: 'Entrepreneurship',
    category: 'ent',
    description:
      'The keys to launching and growing a successful business, from concept to business plan.',
    duration: '5 days',
    format: 'In-person',
    objectives: [
      'Validate a business idea',
      'Build a viable business model',
      'Prepare a business plan',
      'Understand the fundamentals of management',
    ],
    public_cible: 'Project owners, entrepreneurs',
    image: '/images/formation-formatrice-debout.jpeg',
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    category: 'ent',
    description:
      'Marketing techniques adapted to the Central African market to win and retain customers.',
    duration: '3 days',
    format: 'In-person',
    objectives: [
      "Understand your target's needs",
      'Define an effective marketing strategy',
      'Master distribution and communication channels',
      'Measure the effectiveness of your actions',
    ],
    public_cible: 'Entrepreneurs, sales managers',
    image: '/images/formation-participante-attentive.jpeg',
  },
  {
    slug: 'gestion-financiere',
    title: 'Financial management',
    category: 'ent',
    description:
      "Steer your company's financial health with practical budgeting and cash-flow tools.",
    duration: '3 days',
    format: 'In-person',
    objectives: [
      'Understand financial statements',
      'Prepare and monitor a budget',
      'Manage day-to-day cash flow',
      'Make informed financial decisions',
    ],
    public_cible: 'Entrepreneurs, finance managers',
    image: '/images/salle-reunion-2.jpeg',
  },
];

export function getFormations(locale: string): Formation[] {
  return locale === 'en' ? formationsEn : formations;
}

export function getFormationBySlug(slug: string, locale = 'fr'): Formation | undefined {
  return getFormations(locale).find((f) => f.slug === slug);
}

export function getFormationsByCategory(category: string, locale = 'fr'): Formation[] {
  const list = getFormations(locale);
  if (category === 'all') return list;
  return list.filter((f) => f.category === category);
}
