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
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fit=crop',
  },
];

export function getFormationBySlug(slug: string): Formation | undefined {
  return formations.find((f) => f.slug === slug);
}

export function getFormationsByCategory(category: string): Formation[] {
  if (category === 'all') return formations;
  return formations.filter((f) => f.category === category);
}

export const categoryLabels: Record<string, string> = {
  sec: 'Santé & sécurité',
  mgmt: 'Management & environnement',
  ent: 'Entrepreneuriat',
};
