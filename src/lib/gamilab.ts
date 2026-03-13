import type { UseCaseId, Language, Ticket, Priority, Category, Tag } from '../types';

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

const DEFAULT_SDK_URL = 'https://gamilab.ch/js/sdk.js';
const SDK_SCRIPT_ID = 'gamilab-sdk-script';

let _sdkPromise: Promise<GamiSDK> | null = null;
let _sdkInstance: GamiSDK | null = null;

function getSDKUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SDK_URL;
  const params = new URLSearchParams(window.location.search);
  return params.get('sdk') || DEFAULT_SDK_URL;
}

export function loadAndInitSDK(): Promise<GamiSDK> {
  if (_sdkInstance) return Promise.resolve(_sdkInstance);
  if (_sdkPromise) return _sdkPromise;

  _sdkPromise = new Promise<GamiSDK>((resolve, reject) => {
    window.addEventListener('gami:init', (evt: Event) => {
      const e = evt as CustomEvent<{ Gami: () => GamiSDK }>;
      _sdkInstance = e.detail.Gami();
      resolve(_sdkInstance);
    }, { once: true });

    const existing = document.getElementById(SDK_SCRIPT_ID);
    if (existing) {
      _sdkPromise = null;
      reject(new Error('SDK script already in DOM but instance not available'));
      return;
    }

    const script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = getSDKUrl();
    script.defer = true;
    script.onerror = () => {
      _sdkPromise = null;
      reject(new Error('Failed to load Gamilab SDK'));
    };
    document.body.appendChild(script);
  });

  return _sdkPromise;
}

export async function connectGami(host: string, gami: GamiSDK): Promise<void> {
  await gami.connect(host);
}

const PORTAL_IDS_BY_LANG: Record<Language, Record<UseCaseId, string>> = {
  fr: {
    it_support: import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT,
    ecommerce: import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE,
    saas: import.meta.env.VITE_GAMILAB_PORTAL_SAAS,
    dev_portal: import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL,
  },
  en: {
    it_support: import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT_EN,
    ecommerce: import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE_EN,
    saas: import.meta.env.VITE_GAMILAB_PORTAL_SAAS_EN,
    dev_portal: import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL_EN,
  },
};

export function getPortalId(useCaseId: UseCaseId, lang: Language): string {
  return PORTAL_IDS_BY_LANG[lang]?.[useCaseId] || PORTAL_IDS_BY_LANG.fr[useCaseId];
}

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
