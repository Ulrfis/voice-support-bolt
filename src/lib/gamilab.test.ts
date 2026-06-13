import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MockSdk = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  use_portal: ReturnType<typeof vi.fn>;
  create_thread: ReturnType<typeof vi.fn>;
  resume_thread: ReturnType<typeof vi.fn>;
  start_recording: ReturnType<typeof vi.fn>;
  pause_recording: ReturnType<typeof vi.fn>;
  toggle_recording: ReturnType<typeof vi.fn>;
  resume_recording: ReturnType<typeof vi.fn>;
  is_recording: ReturnType<typeof vi.fn>;
  set_auto_extract: ReturnType<typeof vi.fn>;
  is_extracting: ReturnType<typeof vi.fn>;
  get_state: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

function createMockSdk(): MockSdk {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    use_portal: vi.fn().mockResolvedValue(undefined),
    create_thread: vi.fn().mockResolvedValue({ thread_id: 'thread-1', token: 'token-1' }),
    resume_thread: vi.fn().mockResolvedValue({ thread_id: 'thread-1', token: 'token-1' }),
    start_recording: vi.fn().mockResolvedValue(undefined),
    pause_recording: vi.fn().mockResolvedValue(undefined),
    toggle_recording: vi.fn().mockResolvedValue(undefined),
    resume_recording: vi.fn().mockResolvedValue(undefined),
    is_recording: vi.fn().mockReturnValue(false),
    set_auto_extract: vi.fn().mockResolvedValue(undefined),
    is_extracting: vi.fn().mockReturnValue(false),
    get_state: vi.fn(),
    on: vi.fn().mockReturnValue(Symbol('event-ref')),
    off: vi.fn(),
  };
}

function installSdkLoader(mockSdk: MockSdk) {
  const appendChild = document.body.appendChild.bind(document.body);

  vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
    const result = appendChild(node);
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('gami:init', {
        detail: { Gami: () => mockSdk },
      }));
    });
    return result;
  });
}

describe('initSession', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('passes the portal token to use_portal and enables auto extraction', async () => {
    vi.stubEnv('VITE_GAMILAB_PORTAL_IT_SUPPORT_ID', '99');
    vi.stubEnv('VITE_GAMILAB_PORTAL_IT_SUPPORT_TOKEN', 'tok_12345678');

    const mockSdk = createMockSdk();
    installSdkLoader(mockSdk);

    const { initSession } = await import('./gamilab');
    const phases: string[] = [];

    const { promise } = initSession('it_support', 'fr', (phase) => {
      phases.push(phase);
    });

    const handle = await promise;

    expect(handle.gami).toBe(mockSdk);
    expect(mockSdk.connect).toHaveBeenCalledTimes(1);
    expect(mockSdk.use_portal).toHaveBeenCalledWith('99', 'tok_12345678');
    expect(mockSdk.create_thread).toHaveBeenCalledTimes(1);
    expect(mockSdk.set_auto_extract).toHaveBeenCalledWith(true);
    expect(phases).toEqual([
      'loading_sdk',
      'connecting',
      'joining_portal',
      'creating_thread',
      'registering_events',
      'ready',
    ]);
  });

  it('rejects fast when the portal token is missing', async () => {
    vi.stubEnv('VITE_GAMILAB_PORTAL_IT_SUPPORT_ID', '99');
    vi.stubEnv('VITE_GAMILAB_PORTAL_IT_SUPPORT_TOKEN', '');

    const mockSdk = createMockSdk();
    installSdkLoader(mockSdk);

    const { initSession } = await import('./gamilab');
    const phases: string[] = [];

    const { promise } = initSession('it_support', 'fr', (phase) => {
      phases.push(phase);
    });

    await expect(promise).rejects.toThrow('[Gamilab] Missing portal embed token: VITE_GAMILAB_PORTAL_IT_SUPPORT_TOKEN');
    expect(mockSdk.connect).toHaveBeenCalledTimes(1);
    expect(mockSdk.use_portal).not.toHaveBeenCalled();
    expect(mockSdk.set_auto_extract).not.toHaveBeenCalled();
    expect(phases).toEqual([
      'loading_sdk',
      'connecting',
      'joining_portal',
    ]);
  });
});
