
import { useState, useEffect, useCallback } from 'react';

interface TTSSettings {
  lang?: string;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  volume?: number;
}

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const checkSupport = 'speechSynthesis' in window;
    setIsSupported(checkSupport);

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    if (checkSupport) {
      loadVoices();
      // Some browsers load voices asynchronously.
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup function to stop speech when component unmounts
    return () => {
      if (checkSupport && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, settings: TTSSettings = {}) => {
    if (!isSupported || !text) return;
    
    // Stop any current speech before starting a new one
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (settings.lang) utterance.lang = settings.lang;
    if (settings.voice) utterance.voice = settings.voice;
    utterance.rate = settings.rate ?? 1;
    utterance.volume = settings.volume ?? 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onpause = () => {
      setIsSpeaking(true); // Still "speaking" in a broader sense
      setIsPaused(true);
    };
    utterance.onresume = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking || window.speechSynthesis.paused) return;
    window.speechSynthesis.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking || !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  return { isSpeaking, isPaused, isSupported, voices, speak, pause, resume, cancel };
};
