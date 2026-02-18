import type { UseCaseId, Ticket, Priority, Category, Tag } from '../types';

export interface GamiSDK {
  connect: (host: string) => Promise<void>;
  disconnect: () => Promise<void>;
  use_portal: (portal_id: string) => Promise<void>;
  create_thread: () => Promise<{ thread_id: string; token: string }>;
  start_recording: () => Promise<void>;
  pause_recording: () => Promise<void>;
  toggle_recording: () => Promise<void>;
  resume_recording: () => Promise<void>;
  is_recording: () => boolean;
  on: (evt: string, cb: (...args: unknown[]) => void) => symbol;
  off: (ref: symbol) => void;
}

let _instance: GamiSDK | null = null;
const _pendingCallbacks: Array<(gami: GamiSDK) => void> = [];

if (typeof window !== 'undefined') {
  window.addEventListener('gami:init', (evt: Event) => {
    const e = evt as CustomEvent<{ Gami: () => GamiSDK }>;
    _instance = e.detail.Gami();
    _pendingCallbacks.splice(0).forEach(cb => cb(_instance!));
  });
}

export function waitForGami(): Promise<GamiSDK> {
  return new Promise(resolve => {
    if (_instance) {
      resolve(_instance);
    } else {
      _pendingCallbacks.push(resolve);
    }
  });
}

export const PORTAL_IDS: Record<UseCaseId, string> = {
  it_support: import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT,
  ecommerce: import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE,
  saas: import.meta.env.VITE_GAMILAB_PORTAL_SAAS,
  dev_portal: import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL,
};

const validPriorities: Priority[] = ['critical', 'high', 'medium', 'low'];
const validTags: Tag[] = ['urgent', 'recurring', 'first_contact', 'escalation', 'vip_customer', 'workaround_available'];
const stringFields = [
  'device', 'symptoms', 'frequency', 'environment', 'actions_tried', 'impact',
  'order_number', 'problem_type', 'product_description', 'delivery_status',
  'desired_resolution', 'purchase_date', 'feature', 'steps_to_reproduce',
  'request_type', 'description', 'urgency', 'context', 'expected_behavior', 'ideas_needs',
];

export function mapStructToTicket(struct: Record<string, unknown> | null | undefined): Partial<Ticket> {
  if (!struct) return {};
  const result: Partial<Ticket> = {};

  stringFields.forEach(f => {
    if (typeof struct[f] === 'string' && struct[f]) {
      (result as Record<string, unknown>)[f] = struct[f];
    }
  });

  if (typeof struct.priority === 'string' && validPriorities.includes(struct.priority as Priority)) {
    result.priority = struct.priority as Priority;
  }

  if (typeof struct.category === 'string' && struct.category) {
    result.category = struct.category as Category;
  }

  if (Array.isArray(struct.tags)) {
    result.tags = (struct.tags as string[]).filter(t => validTags.includes(t as Tag)) as Tag[];
  }

  return result;
}
