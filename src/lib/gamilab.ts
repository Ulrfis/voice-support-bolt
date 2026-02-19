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

const DEFAULT_SDK_URL = 'http://gamilab.ch/js/sdk.js';
const SDK_SCRIPT_ID = 'gamilab-sdk-script';

let _instance: GamiSDK | null = null;
let _connected = false;
let _initListener: ((evt: Event) => void) | null = null;

function getSDKUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SDK_URL;
  const params = new URLSearchParams(window.location.search);
  return params.get('sdk') || DEFAULT_SDK_URL;
}

export function loadAndInitSDK(): Promise<GamiSDK> {
  return new Promise((resolve, reject) => {
    if (_initListener) {
      window.removeEventListener('gami:init', _initListener);
      _initListener = null;
    }

    _instance = null;
    _connected = false;

    const oldScript = document.getElementById(SDK_SCRIPT_ID);
    if (oldScript) {
      oldScript.remove();
    }

    _initListener = (evt: Event) => {
      const e = evt as CustomEvent<{ Gami: () => GamiSDK }>;
      _instance = e.detail.Gami();
      _connected = false;
      resolve(_instance);
    };
    window.addEventListener('gami:init', _initListener, { once: true });

    const script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = getSDKUrl();
    script.defer = true;
    script.onerror = () => {
      reject(new Error('Failed to load Gamilab SDK'));
    };
    document.body.appendChild(script);
  });
}

export async function connectGami(host: string): Promise<void> {
  if (!_instance) throw new Error('Gamilab SDK not initialized');
  if (_connected) return;
  await _instance.connect(host);
  _connected = true;
}

export function getGamiInstance(): GamiSDK | null {
  return _instance;
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
