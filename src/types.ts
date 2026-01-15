export type Status = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Tag = 'urgent' | 'recurring' | 'first_contact' | 'escalation' | 'vip_customer' | 'workaround_available';
export type Language = 'fr' | 'en';

export type UseCaseId = 'it_support' | 'ecommerce' | 'saas' | 'dev_portal';

export type CategoryITSupport = 'hardware' | 'software' | 'network' | 'peripheral' | 'other';
export type CategoryEcommerce = 'delivery' | 'product_defect' | 'wrong_item' | 'refund' | 'other';
export type CategorySaaS = 'bug' | 'feature_request' | 'access_issue' | 'performance' | 'other';
export type CategoryDevPortal = 'bug' | 'enhancement' | 'new_feature' | 'documentation' | 'other';

export type Category = CategoryITSupport | CategoryEcommerce | CategorySaaS | CategoryDevPortal;

export interface Ticket {
  id: string;
  created_at: string;
  use_case: UseCaseId;
  status: Status;
  priority: Priority;
  category?: Category;
  tags: Tag[];
  raw_transcript?: string;
  email?: string;
  language: Language;

  device?: string;
  symptoms?: string;
  frequency?: string;
  environment?: string;
  actions_tried?: string;
  impact?: string;

  order_number?: string;
  problem_type?: string;
  product_description?: string;
  delivery_status?: string;
  desired_resolution?: string;
  purchase_date?: string;

  feature?: string;
  steps_to_reproduce?: string;

  request_type?: string;
  description?: string;
  urgency?: string;
  context?: string;
  expected_behavior?: string;
  ideas_needs?: string;
}

export interface UseCase {
  id: UseCaseId;
  icon: string;
  name: { fr: string; en: string };
  context: { fr: string; en: string };
  questions: { fr: string[]; en: string[] };
  categories: Category[];
  requiredFields: string[];
  articles: { fr: string[]; en: string[] };
}

export interface TranscriptExample {
  use_case: UseCaseId;
  pass1: {
    transcript: { fr: string; en: string };
    fields: Partial<Ticket>;
    missingFields: string[];
  };
  pass2: {
    transcript: { fr: string; en: string };
    fields: Partial<Ticket>;
    prompt: { fr: string; en: string };
  };
}

export interface Agent {
  name: string;
  specialty: { fr: string; en: string };
  avatar: string;
}
