import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('speakWord', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does not throw when window.speechSynthesis is undefined', async () => {
    // In jsdom, speechSynthesis is not defined by default
    const { speakWord } = await import('../sounds');
    expect(() => speakWord('hello')).not.toThrow();
  });

  it('calls cancel() before speaking', async () => {
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: mockSpeak, cancel: mockCancel },
      writable: true,
      configurable: true,
    });

    // Stub SpeechSynthesisUtterance as a class
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        rate = 1;
        pitch = 1;
        lang = '';
        constructor(text: string) {
          this.text = text;
        }
      }
    );

    const { speakWord } = await import('../sounds');
    speakWord('hello');

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    // cancel must be called before speak
    const cancelOrder = mockCancel.mock.invocationCallOrder[0];
    const speakOrder = mockSpeak.mock.invocationCallOrder[0];
    expect(cancelOrder).toBeLessThan(speakOrder);

    vi.unstubAllGlobals();
  });

  it('creates SpeechSynthesisUtterance with correct properties', async () => {
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: mockSpeak, cancel: mockCancel },
      writable: true,
      configurable: true,
    });

    // Mock SpeechSynthesisUtterance as a class
    const utteranceInstances: Record<string, unknown>[] = [];
    class MockUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      lang = '';
      constructor(text: string) {
        this.text = text;
        utteranceInstances.push(this);
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);

    const { speakWord } = await import('../sounds');
    speakWord('elephant');

    expect(utteranceInstances).toHaveLength(1);
    expect(utteranceInstances[0].text).toBe('elephant');
    expect(utteranceInstances[0].rate).toBe(0.75);
    expect(utteranceInstances[0].pitch).toBe(1.0);
    expect(utteranceInstances[0].lang).toBe('en-GB');

    vi.unstubAllGlobals();
  });
});

describe('playSound', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does not throw when AudioContext is unavailable (no window)', async () => {
    // In jsdom, AudioContext may not exist. Simulate server environment.
    const originalWindow = globalThis.window;
    // @ts-expect-error - temporarily remove window to simulate SSR
    delete globalThis.window;

    const { playSound } = await import('../sounds');
    expect(() => playSound('success')).not.toThrow();

    globalThis.window = originalWindow;
  });

  it('handles all valid sound names without throwing', async () => {
    // Mock AudioContext for jsdom using a class
    const mockOscillator = {
      type: '',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockFilter = {
      type: '',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockBufferSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockBuffer = {
      getChannelData: vi.fn(() => new Float32Array(44100)),
    };

    class MockAudioContext {
      currentTime = 0;
      state: AudioContextState = 'running';
      sampleRate = 44100;
      destination = {};
      createOscillator = vi.fn(() => ({ ...mockOscillator }));
      createGain = vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }));
      createBiquadFilter = vi.fn(() => ({ ...mockFilter }));
      createBufferSource = vi.fn(() => ({ ...mockBufferSource }));
      createBuffer = vi.fn(() => ({ ...mockBuffer }));
      resume = vi.fn();
    }

    vi.stubGlobal('AudioContext', MockAudioContext);

    const { playSound } = await import('../sounds');

    const soundNames = ['success', 'click', 'achievement', 'pop', 'whoosh', 'splash'] as const;
    for (const name of soundNames) {
      expect(() => playSound(name)).not.toThrow();
    }

    vi.unstubAllGlobals();
  });

  it('handles the suspended state by calling resume', async () => {
    const mockResume = vi.fn();

    class MockSuspendedAudioContext {
      currentTime = 0;
      state: AudioContextState = 'suspended';
      sampleRate = 44100;
      destination = {};
      createOscillator = vi.fn(() => ({
        type: '',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }));
      createGain = vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }));
      createBiquadFilter = vi.fn(() => ({
        type: '',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }));
      createBufferSource = vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }));
      createBuffer = vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(44100)),
      }));
      resume = mockResume;
    }

    vi.stubGlobal('AudioContext', MockSuspendedAudioContext);

    const { playSound } = await import('../sounds');
    playSound('click');

    expect(mockResume).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
