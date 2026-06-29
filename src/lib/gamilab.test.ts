import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdkMock = {
  connect: vi.fn(async () => {}),
  disconnect: vi.fn(async () => {}),
  use_portal: vi.fn(async () => {}),
  create_thread: vi.fn(async () => ({ thread_id: 'thread-123', token: 'token-123' })),
  resume_thread: vi.fn(async () => ({ thread_id: 'thread-123', token: 'token-123' })),
  start_recording: vi.fn(async () => {}),
  pause_recording: vi.fn(async () => {}),
  toggle_recording: vi.fn(async () => {}),
  resume_recording: vi.fn(async () => {}),
  is_recording: vi.fn(() => false),
  set_auto_extract: vi.fn(async () => {}),
  is_extracting: vi.fn(() => false),
  get_state: vi.fn(() => undefined),
  on: vi.fn(() => Symbol('listener')),
  off: vi.fn(() => {}),
};

function dispatchSdkInit() {
  window.dispatchEvent(new CustomEvent('gami:init', {
    detail: {
      Gami: () => sdkMock,
    },
  }));
}

async function initSdk() {
  await vi.waitFor(() => {
    expect(document.getElementById('gamilab-sdk-script')).not.toBeNull();
  });
  dispatchSdkInit();
}

describe('initSession', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
  });

  it('fails fast with the missing English ecommerce portal token before opening a portal', async () => {
    vi.stubEnv('VITE_GAMILAB_PORTAL_ECOMMERCE_EN_TOKEN', '');
    const gamilab = await import('./gamilab');
    const phases: string[] = [];
    const { promise } = gamilab.initSession('ecommerce', 'en', (phase) => {
      phases.push(phase);
    });

    await initSdk();

    await expect(promise).rejects.toThrow('[Gamilab] Missing portal embed token: VITE_GAMILAB_PORTAL_ECOMMERCE_EN_TOKEN');
    expect(phases).toEqual(['loading_sdk', 'connecting', 'joining_portal']);
    expect(sdkMock.connect).toHaveBeenCalledTimes(1);
    expect(sdkMock.use_portal).not.toHaveBeenCalled();
    expect(sdkMock.create_thread).not.toHaveBeenCalled();
  });

  it('continues startup when set_auto_extract is unavailable after thread creation', async () => {
    vi.stubEnv('VITE_GAMILAB_PORTAL_IT_SUPPORT_TOKEN', 'test-token-1234');
    sdkMock.set_auto_extract.mockRejectedValueOnce(new Error('missing'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const gamilab = await import('./gamilab');
    const phases: string[] = [];
    const { promise } = gamilab.initSession('it_support', 'fr', (phase) => {
      phases.push(phase);
    });

    await initSdk();

    const session = await promise;

    expect(session.gami).toBe(sdkMock);
    expect(phases).toEqual([
      'loading_sdk',
      'connecting',
      'joining_portal',
      'creating_thread',
      'registering_events',
      'ready',
    ]);
    expect(sdkMock.use_portal).toHaveBeenCalledWith('33', expect.any(String));
    expect(sdkMock.create_thread).toHaveBeenCalledTimes(1);
    expect(sdkMock.set_auto_extract).toHaveBeenCalledWith(true);
    expect(warnSpy).toHaveBeenCalledWith('[Gamilab] set_auto_extract not available:', expect.any(Error));

    warnSpy.mockRestore();
    logSpy.mockRestore();
  });
});
