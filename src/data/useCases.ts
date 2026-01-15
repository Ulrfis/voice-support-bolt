import type { UseCase } from '../types';

export const useCases: UseCase[] = [
  {
    id: 'it_support',
    icon: '🖥️',
    name: {
      fr: 'PC Expert Support',
      en: 'PC Expert Support'
    },
    context: {
      fr: 'Vendeur de PC gaming',
      en: 'Gaming PC retailer'
    },
    questions: {
      fr: [
        'Quel appareil ou composant pose problème ?',
        'Que se passe-t-il exactement ?',
        'Depuis quand et à quelle fréquence ?'
      ],
      en: [
        'Which device or component has an issue?',
        'What exactly is happening?',
        'Since when and how frequently?'
      ]
    },
    categories: ['hardware', 'software', 'network', 'peripheral', 'other'],
    requiredFields: ['device', 'symptoms', 'frequency'],
    articles: {
      fr: [
        'Comment mettre à jour vos drivers graphiques',
        'Résoudre les problèmes de périphériques Bluetooth',
        'Diagnostic réseau : guide pas à pas'
      ],
      en: [
        'How to update your graphics drivers',
        'Troubleshooting Bluetooth peripheral issues',
        'Network diagnostics: step-by-step guide'
      ]
    }
  },
  {
    id: 'ecommerce',
    icon: '👟',
    name: {
      fr: 'ShoeShop Support',
      en: 'ShoeShop Support'
    },
    context: {
      fr: 'Magasin chaussures en ligne',
      en: 'Online shoe store'
    },
    questions: {
      fr: [
        'Quel est votre numéro de commande ?',
        'Quel problème rencontrez-vous ?',
        'Avez-vous déjà contacté le transporteur ?'
      ],
      en: [
        'What is your order number?',
        'What problem are you experiencing?',
        'Have you already contacted the carrier?'
      ]
    },
    categories: ['delivery', 'product_defect', 'wrong_item', 'refund', 'other'],
    requiredFields: ['order_number', 'problem_type', 'product_description'],
    articles: {
      fr: [
        'Suivre ma commande et signaler un problème de livraison',
        'Procédure de retour et échange',
        'Demander un remboursement'
      ],
      en: [
        'Track my order and report a delivery issue',
        'Return and exchange procedure',
        'Request a refund'
      ]
    }
  },
  {
    id: 'saas',
    icon: '📊',
    name: {
      fr: 'CRM Helper',
      en: 'CRM Helper'
    },
    context: {
      fr: 'Support logiciel CRM',
      en: 'CRM software support'
    },
    questions: {
      fr: [
        'Quelle fonctionnalité est concernée ?',
        'Décrivez le comportement inattendu',
        'Quel est l\'impact sur votre travail ?'
      ],
      en: [
        'Which feature is affected?',
        'Describe the unexpected behavior',
        'What is the impact on your work?'
      ]
    },
    categories: ['bug', 'feature_request', 'access_issue', 'performance', 'other'],
    requiredFields: ['feature', 'symptoms', 'impact'],
    articles: {
      fr: [
        'Résoudre les problèmes d\'export PDF',
        'Gestion des accès utilisateurs',
        'Optimiser les performances du CRM'
      ],
      en: [
        'Troubleshooting PDF export issues',
        'Managing user access',
        'Optimizing CRM performance'
      ]
    }
  },
  {
    id: 'dev_portal',
    icon: '💻',
    name: {
      fr: 'DevPortal Feedback',
      en: 'DevPortal Feedback'
    },
    context: {
      fr: 'Portail client custom',
      en: 'Custom client portal'
    },
    questions: {
      fr: [
        'S\'agit-il d\'un bug, d\'une idée ou d\'une question ?',
        'Décrivez précisément la situation',
        'Quelle est l\'urgence pour vous ?'
      ],
      en: [
        'Is this a bug, an idea, or a question?',
        'Describe the situation precisely',
        'What is the urgency for you?'
      ]
    },
    categories: ['bug', 'enhancement', 'new_feature', 'documentation', 'other'],
    requiredFields: ['request_type', 'description', 'urgency'],
    articles: {
      fr: [
        'Guide de démarrage API',
        'Bonnes pratiques pour signaler un bug',
        'Roadmap et demandes de fonctionnalités'
      ],
      en: [
        'API Getting Started Guide',
        'Best practices for reporting a bug',
        'Roadmap and feature requests'
      ]
    }
  }
];

export const agents = [
  {
    name: 'Sophie M.',
    specialty: {
      fr: 'Support général',
      en: 'General support'
    },
    avatar: 'avatar-1'
  },
  {
    name: 'Thomas R.',
    specialty: {
      fr: 'Technique',
      en: 'Technical'
    },
    avatar: 'avatar-2'
  },
  {
    name: 'Julie L.',
    specialty: {
      fr: 'Escalade',
      en: 'Escalation'
    },
    avatar: 'avatar-3'
  }
];
