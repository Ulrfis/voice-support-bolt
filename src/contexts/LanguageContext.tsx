import { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    appTitle: 'Voice Support Demo',
    appSubtitle: 'Décrivez votre problème à voix haute, nous le structurons pour vous',
    selectUseCase: 'Sélectionnez votre cas d\'usage',
    steps: '3 étapes • ~2 minutes',
    step1: 'Parlez',
    step2: 'Vérifiez',
    step3: 'Envoyez',
    back: 'Retour',
    next: 'Suivant',
    testPass1: '▶ Test Passe 1',
    testPass2: '▶ Test Passe 2',
    completeVoice: '🎤 Compléter',
    validate: '✓ Valider',
    send: 'Envoyer',
    sendWithEmail: 'Envoyer + email',
    detectedAnswers: '✓ Réponses détectées',
    remainingQuestions: '❓ Questions restantes',
    recording: 'Enregistrement en cours...',
    processing: 'Traitement...',
    transcription: 'Transcription',
    ticketCreated: 'Ticket créé avec succès !',
    ticketNumber: 'Numéro de ticket',
    availableAgents: 'Agents disponibles',
    estimatedTime: 'Temps estimé',
    minutes: 'min',
    usefulArticles: 'Articles utiles',
    emailPlaceholder: 'Votre email (optionnel)',
    viewAllTickets: 'Voir tous les tickets',
    backoffice: 'Back-office',
    dashboard: 'Tableau de bord',
    allTickets: 'Tous les tickets',
    status: 'Statut',
    priority: 'Priorité',
    category: 'Catégorie',
    tags: 'Tags',
    created: 'Créé le',
    actions: 'Actions',
    view: 'Voir',
    edit: 'Modifier',
    delete: 'Supprimer',
    export: 'Exporter CSV',
    filter: 'Filtrer',
    search: 'Rechercher...',
    ticketDetails: 'Détails du ticket',
    close: 'Fermer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    requiredField: 'Champ obligatoire',
    optionalField: 'Optionnel',
    poweredBy: 'Propulsé par Audiogami',
    statusNew: 'Nouveau',
    statusInProgress: 'En cours',
    statusWaitingCustomer: 'En attente client',
    statusResolved: 'Résolu',
    statusClosed: 'Fermé',
    priorityCritical: 'Critique',
    priorityHigh: 'Haute',
    priorityMedium: 'Moyenne',
    priorityLow: 'Basse',
    allComplete: 'Toutes les informations sont complètes !',
    someFieldsMissing: 'Certains champs sont encore à compléter',
    reviewAndEdit: 'Vérifiez et modifiez les informations extraites',
    confirmationMessage: 'Votre demande a été enregistrée. Un agent va prendre en charge votre ticket sous peu.',
    progressLabel: 'Progression'
  },
  en: {
    appTitle: 'Voice Support Demo',
    appSubtitle: 'Describe your problem out loud, we structure it for you',
    selectUseCase: 'Select your use case',
    steps: '3 steps • ~2 minutes',
    step1: 'Speak',
    step2: 'Review',
    step3: 'Send',
    back: 'Back',
    next: 'Next',
    testPass1: '▶ Test Pass 1',
    testPass2: '▶ Test Pass 2',
    completeVoice: '🎤 Complete',
    validate: '✓ Validate',
    send: 'Send',
    sendWithEmail: 'Send + email',
    detectedAnswers: '✓ Detected answers',
    remainingQuestions: '❓ Remaining questions',
    recording: 'Recording...',
    processing: 'Processing...',
    transcription: 'Transcription',
    ticketCreated: 'Ticket created successfully!',
    ticketNumber: 'Ticket number',
    availableAgents: 'Available agents',
    estimatedTime: 'Estimated time',
    minutes: 'min',
    usefulArticles: 'Useful articles',
    emailPlaceholder: 'Your email (optional)',
    viewAllTickets: 'View all tickets',
    backoffice: 'Back-office',
    dashboard: 'Dashboard',
    allTickets: 'All tickets',
    status: 'Status',
    priority: 'Priority',
    category: 'Category',
    tags: 'Tags',
    created: 'Created',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    export: 'Export CSV',
    filter: 'Filter',
    search: 'Search...',
    ticketDetails: 'Ticket details',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    requiredField: 'Required field',
    optionalField: 'Optional',
    poweredBy: 'Powered by Audiogami',
    statusNew: 'New',
    statusInProgress: 'In Progress',
    statusWaitingCustomer: 'Waiting Customer',
    statusResolved: 'Resolved',
    statusClosed: 'Closed',
    priorityCritical: 'Critical',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',
    allComplete: 'All information is complete!',
    someFieldsMissing: 'Some fields still need to be completed',
    reviewAndEdit: 'Review and edit the extracted information',
    confirmationMessage: 'Your request has been registered. An agent will handle your ticket shortly.',
    progressLabel: 'Progress'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
