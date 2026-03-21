import type { UseCaseId, Language, Ticket, Priority, Category, Tag } from '../types';
import { pushLog } from './debugLog';

export interface GamiSDK {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  use_portal: (config: { portal_id: number; token: string }) => Promise<void>;
  create_thread: () => Promise<{ thread_id: string; token: string }>;
  resume_thread: (thread_id: string) => Promise<{ thread_id: string; token: string }>;
  start_recording: () => Promise<void>;
  pause_recording: () => Promise<void>;
  toggle_recording: () => Promise<void>;
  resume_recording: () => Promise<void>;
  is_recording: () => boolean;
  append_delta: (verb: string, path: string, value: string) => Promise<void>;
  extract: () => Promise<void>;
  set_auto_extract: (val: boolean) => Promise<void>;
  is_extracting: () => boolean;
  get_state: (key: string) => unknown;
  on: (evt: string, cb: (...args: unknown[]) => void) => symbol;
  off: (ref: symbol) => void;
}

const DEFAULT_SDK_URL = 'https://gamilab.ch/js/sdk.js';
const SDK_SCRIPT_ID = 'gamilab-sdk-script';

let _sdkPromise: Promise<GamiSDK> | null = null;
let _sdkInstance: GamiSDK | null = null;
let _initChain: Promise<void> = Promise.resolve();
let _currentSessionId = 0;

function getSDKUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_SDK_URL;
  const params = new URLSearchParams(window.location.search);
  return params.get('sdk') || DEFAULT_SDK_URL;
}

const _debugEnabled = new URLSearchParams(window.location.search).has('debug');

function wrapSDK(raw: GamiSDK): GamiSDK {
  if (!_debugEnabled) return raw;

  type AsyncMethodName = 'connect' | 'disconnect' | 'use_portal' | 'create_thread' | 'resume_thread'
    | 'start_recording' | 'pause_recording' | 'toggle_recording' | 'resume_recording'
    | 'append_delta' | 'extract' | 'set_auto_extract';

  const asyncMethods: AsyncMethodName[] = [
    'connect', 'disconnect', 'use_portal', 'create_thread', 'resume_thread',
    'start_recording', 'pause_recording', 'toggle_recording', 'resume_recording',
    'append_delta', 'extract', 'set_auto_extract',
  ];

  const wrapper: GamiSDK = Object.create(raw);

  asyncMethods.forEach((name) => {
    wrapper[name] = async (...args: unknown[]): Promise<unknown> => {
      pushLog('out', 'sdk-call', name, args.length ? args : undefined);
      try {
        const result = await (raw[name] as (...a: unknown[]) => Promise<unknown>)(...args);
        pushLog('in', 'sdk-call', `${name} OK`, result ?? undefined);
        return result;
      } catch (err) {
        pushLog('error', 'sdk-call', `${name} FAIL`, err);
        throw err;
      }
    };
  });

  wrapper.is_recording = (): boolean => {
    return raw.is_recording();
  };

  wrapper.is_extracting = (): boolean => {
    return raw.is_extracting();
  };

  wrapper.get_state = (key: string): unknown => {
    return raw.get_state(key);
  };

  wrapper.on = (evt: string, cb: (...args: unknown[]) => void): symbol => {
    pushLog('out', 'sdk-event', `on("${evt}")`, 'registering');
    const wrappedCb = (...args: unknown[]) => {
      pushLog('in', 'sdk-event', evt, args.length === 1 ? args[0] : args);
      cb(...args);
    };
    return raw.on(evt, wrappedCb);
  };

  wrapper.off = (ref: symbol): void => {
    pushLog('out', 'sdk-event', 'off', String(ref));
    raw.off(ref);
  };

  return wrapper;
}

export function loadAndInitSDK(): Promise<GamiSDK> {
  if (_sdkInstance) return Promise.resolve(_sdkInstance);
  if (_sdkPromise) return _sdkPromise;

  _sdkPromise = new Promise<GamiSDK>((resolve, reject) => {
    const handleInit = (evt: Event) => {
      const e = evt as CustomEvent<{ Gami: () => GamiSDK }>;
      const raw = e.detail.Gami();
      _sdkInstance = wrapSDK(raw);
      pushLog('system', 'lifecycle', 'SDK initialized', _debugEnabled ? 'with instrumentation' : 'raw');
      resolve(_sdkInstance);
    };

    window.addEventListener('gami:init', handleInit, { once: true });

    const existing = document.getElementById(SDK_SCRIPT_ID);
    if (existing) {
      return;
    }

    const script = document.createElement('script');
    script.id = SDK_SCRIPT_ID;
    script.src = getSDKUrl();
    script.defer = true;
    script.onerror = () => {
      window.removeEventListener('gami:init', handleInit);
      _sdkPromise = null;
      reject(new Error('Failed to load Gamilab SDK'));
    };
    document.body.appendChild(script);
  });

  return _sdkPromise;
}

export interface SessionHandle {
  gami: GamiSDK;
  sessionId: number;
  isStale: () => boolean;
}

export function initSession(
  useCaseId: UseCaseId,
  lang: Language,
  onPhase: (phase: string) => void,
): { promise: Promise<SessionHandle>; cancel: () => void } {
  const sessionId = ++_currentSessionId;
  let cancelled = false;

  const cancel = () => { cancelled = true; };
  const isStale = () => cancelled || sessionId !== _currentSessionId;

  const promise = new Promise<SessionHandle>((resolve, reject) => {
    _initChain = _initChain
      .catch(() => {})
      .then(async () => {
        if (isStale()) { reject(new Error('cancelled')); return; }

        onPhase('loading_sdk');
        const gami = await loadAndInitSDK();
        if (isStale()) { reject(new Error('cancelled')); return; }

        onPhase('connecting');
        await gami.connect();
        if (isStale()) { reject(new Error('cancelled')); return; }

        const portalConfig = getPortalConfig(useCaseId, lang);
        onPhase('joining_portal');
        await gami.use_portal(portalConfig);
        if (isStale()) { reject(new Error('cancelled')); return; }

        onPhase('creating_thread');
        const threadInfo = await gami.create_thread();
        console.log('[Gamilab] thread →', threadInfo.thread_id);
        if (isStale()) { reject(new Error('cancelled')); return; }

        onPhase('registering_events');
        await gami.set_auto_extract(true);
        if (isStale()) { reject(new Error('cancelled')); return; }

        onPhase('ready');
        resolve({ gami, sessionId, isStale });
      })
      .catch((err) => {
        if (!isStale()) reject(err);
      });
  });

  return { promise, cancel };
}

export function invalidateSession(): void {
  _currentSessionId++;
}

interface PortalConfig {
  portal_id: number;
  token: string;
}

const PORTAL_CONFIGS_BY_LANG: Record<Language, Record<UseCaseId, PortalConfig>> = {
  fr: {
    it_support: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT_TOKEN,
    },
    ecommerce: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE_TOKEN,
    },
    saas: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_SAAS_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_SAAS_TOKEN,
    },
    dev_portal: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL_TOKEN,
    },
  },
  en: {
    it_support: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT_EN_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_IT_SUPPORT_EN_TOKEN,
    },
    ecommerce: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE_EN_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_ECOMMERCE_EN_TOKEN,
    },
    saas: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_SAAS_EN_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_SAAS_EN_TOKEN,
    },
    dev_portal: {
      portal_id: Number(import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL_EN_ID),
      token: import.meta.env.VITE_GAMILAB_PORTAL_DEV_PORTAL_EN_TOKEN,
    },
  },
};

export function getPortalConfig(useCaseId: UseCaseId, lang: Language): PortalConfig {
  return PORTAL_CONFIGS_BY_LANG[lang]?.[useCaseId] || PORTAL_CONFIGS_BY_LANG.fr[useCaseId];
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
