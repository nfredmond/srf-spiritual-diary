import { useCallback, useEffect, useRef, useState } from 'react';

const SETTINGS_KEY = 'srf-speech-settings';

interface SpeechSettings {
  voiceURI: string | null;
  rate: number;
}

function readSettings(): SpeechSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { voiceURI: null, rate: 1 };
    const parsed = JSON.parse(raw);
    const rate = typeof parsed.rate === 'number' && parsed.rate > 0 ? parsed.rate : 1;
    const voiceURI = typeof parsed.voiceURI === 'string' ? parsed.voiceURI : null;
    return { voiceURI, rate };
  } catch {
    return { voiceURI: null, rate: 1 };
  }
}

function writeSettings(settings: SpeechSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettingsState] = useState<SpeechSettings>(() =>
    supported ? readSettings() : { voiceURI: null, rate: 1 },
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const refresh = () => setVoices(synth.getVoices());
    refresh();
    synth.addEventListener('voiceschanged', refresh);
    return () => {
      synth.removeEventListener('voiceschanged', refresh);
      synth.cancel();
    };
  }, [supported]);

  const updateSettings = useCallback((next: Partial<SpeechSettings>) => {
    setSettingsState((prev) => {
      const merged = { ...prev, ...next };
      writeSettings(merged);
      return merged;
    });
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text.trim()) return;
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.rate;
      if (settings.voiceURI) {
        const voice = synth.getVoices().find((v) => v.voiceURI === settings.voiceURI);
        if (voice) utterance.voice = voice;
      }
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      utteranceRef.current = utterance;
      setSpeaking(true);
      synth.speak(utterance);
    },
    [supported, settings.rate, settings.voiceURI],
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speaking, speak, stop],
  );

  return {
    supported,
    speaking,
    voices,
    settings,
    updateSettings,
    speak,
    stop,
    toggle,
  };
}
