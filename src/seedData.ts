import { supabase } from './lib/supabase';
import type { Ticket } from './types';

const seedTickets: Omit<Ticket, 'id' | 'created_at'>[] = [
  {
    use_case: 'it_support',
    status: 'new',
    priority: 'critical',
    category: 'hardware',
    tags: ['urgent', 'recurring'],
    device: 'PC gaming avec RTX',
    symptoms: 'Écran noir au lancement de jeux, nécessite redémarrage',
    frequency: 'Systématique depuis hier, 100% des lancements',
    environment: 'Windows 11, drivers mis à jour via GeForce Experience',
    actions_tried: 'Mise à jour drivers, test autre écran',
    impact: 'Activité de streaming impossible',
    language: 'fr',
    raw_transcript: "Ouais bonjour euh... alors voilà j'appelle parce que j'ai un souci avec mon ordinateur, enfin c'est un PC que j'ai acheté chez vous y'a pas longtemps..."
  },
  {
    use_case: 'it_support',
    status: 'in_progress',
    priority: 'high',
    category: 'peripheral',
    tags: ['urgent'],
    device: 'Clavier sans fil (Logitech ou Microsoft, gris)',
    symptoms: 'Touches ne répondent plus',
    frequency: 'Depuis ce matin, hier soir OK',
    environment: 'PC fixe Windows',
    actions_tried: 'Remplacement des piles',
    impact: 'Blocage pour le travail',
    language: 'fr',
    raw_transcript: "Bonjour, c'est pour un clavier. Un clavier sans fil que vous m'avez vendu. Il marche plus..."
  },
  {
    use_case: 'ecommerce',
    status: 'new',
    priority: 'high',
    category: 'delivery',
    tags: ['escalation'],
    order_number: '78432',
    problem_type: 'Colis non reçu malgré statut "livré"',
    product_description: 'Baskets Nike blanches (Air Max ou Air Force)',
    delivery_status: 'Marqué livré sur Colissimo',
    actions_tried: 'Vérifié voisins et local poubelle + Tentative appel Colissimo (abandonné)',
    desired_resolution: 'Réexpédition prioritaire, sinon remboursement',
    purchase_date: 'Mi-novembre (15-16)',
    language: 'fr',
    raw_transcript: "Allô bonjour, oui alors j'ai un problème avec une commande. J'ai commandé des baskets..."
  },
  {
    use_case: 'ecommerce',
    status: 'resolved',
    priority: 'critical',
    category: 'wrong_item',
    tags: ['urgent', 'vip_customer'],
    order_number: '78501',
    problem_type: 'Mauvaise taille reçue (42 au lieu de 44)',
    product_description: 'Mocassins marron',
    delivery_status: 'Reçu lundi',
    desired_resolution: 'Échange taille 44, livraison avant samedi',
    impact: 'Nécessaire pour mariage ce week-end',
    language: 'fr',
    raw_transcript: "Bonjour, voilà j'ai reçu ma commande mais c'est pas la bonne taille..."
  },
  {
    use_case: 'saas',
    status: 'in_progress',
    priority: 'critical',
    category: 'bug',
    tags: ['urgent', 'recurring'],
    feature: 'Export rapports PDF',
    symptoms: 'Plantage après chargement, erreur affichée',
    frequency: 'Quand plus de 100 lignes',
    environment: 'Chrome dernière version, Windows 11 (majoritaire)',
    steps_to_reproduce: 'Rapports → Ventes Q4 → Exporter PDF → timeout ~30s',
    impact: 'Équipe commerciale bloquée, réunion direction demain',
    language: 'fr',
    raw_transcript: "Bonjour, j'appelle parce qu'on a un gros problème avec votre CRM là..."
  },
  {
    use_case: 'dev_portal',
    status: 'new',
    priority: 'critical',
    category: 'bug',
    tags: ['urgent'],
    request_type: 'Bug',
    description: 'Double-clic Sauvegarder crée des doublons',
    context: 'Plusieurs fois cette semaine',
    urgency: 'Urgent (nettoyage manuel coûteux)',
    expected_behavior: 'Bouton grisé ou second clic ignoré',
    language: 'fr',
    raw_transcript: "Salut, je vous contacte pour signaler un bug sur le portail..."
  }
];

export async function seedDatabase() {
  console.log('Seeding database with test tickets...');

  const { data: existingTickets } = await supabase
    .from('tickets')
    .select('id')
    .limit(1);

  if (existingTickets && existingTickets.length > 0) {
    console.log('Database already contains tickets. Skipping seed.');
    return;
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert(seedTickets)
    .select();

  if (error) {
    console.error('Error seeding database:', error);
  } else {
    console.log(`Successfully seeded ${data?.length} tickets`);
  }
}
