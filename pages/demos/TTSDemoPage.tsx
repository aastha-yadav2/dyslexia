import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PlayIcon, StopIcon, PauseIcon, ArrowLeftIcon } from '../../components/icons';
import { useTTS } from '../../hooks/useTTS';

const InteractiveTTSDemo: React.FC = () => {
  const [text, setText] = useState('Type or paste the text you want to listen to…');
  const [language, setLanguage] = useState('en-US');
  const [voiceURI, setVoiceURI] = useState<string | undefined>();
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  const { isSpeaking, isPaused, voices, speak, pause, resume, cancel, isSupported } = useTTS();

  const availableLanguages = useMemo(() => {
    const langSet = new Set(voices.map(v => v.lang));
    return Array.from(langSet).sort().map((lang: string) => {
        try {
            const langName = new Intl.DisplayNames(['en'], { type: 'language' }).of(lang.split('-')[0]);
            return { code: lang, name: langName ? `${langName} (${lang})` : lang };
        } catch {
            return { code: lang, name: lang };
        }
    });
  }, [voices]);
  
  const voicesForLanguage = useMemo(() => {
    return voices.filter(v => v.lang === language);
  }, [voices, language]);

  const selectedVoice = useMemo(() => {
    return voices.find(v => v.voiceURI === voiceURI);
  }, [voices, voiceURI]);
  
  const handleSpeak = useCallback(() => {
    speak(text, { lang: language, voice: selectedVoice, rate, volume });
  }, [text, language, selectedVoice, rate, volume, speak]);

  useEffect(() => {
    const defaultVoice = voicesForLanguage.find(v => v.default) || voicesForLanguage[0];
    if (defaultVoice) {
      setVoiceURI(defaultVoice.voiceURI);
    } else {
      setVoiceURI(undefined);
    }
  }, [language, voicesForLanguage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.code === 'Space' && text.trim()) {
        e.preventDefault();
        if (isSpeaking) {
          isPaused ? resume() : pause();
        } else {
          handleSpeak();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, isPaused, text, resume, pause, handleSpeak]);

  const getStatusMessage = () => {
    if (!isSupported) return "Text-to-Speech is not supported in this browser.";
    if (isPaused) return 'Paused.';
    if (isSpeaking) return `Speaking...`;
    return 'Ready to speak.';
  };

  if (!isSupported) {
    return <div className="text-center p-8 bg-amber-500/20 text-amber-200 rounded-lg">Text-to-Speech is not supported by your browser.</div>
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full p-4 text-lg text-slate-100 bg-slate-800/50 border border-slate-600 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Type or paste the text you want to listen to…"
      />
      
      <div className="grid md:grid-cols-2 gap-4 my-4">
        <div>
          <label htmlFor="tts-language" className="block text-sm font-medium text-slate-300 mb-1">Language</label>
          <select id="tts-language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md">
            {availableLanguages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tts-voice" className="block text-sm font-medium text-slate-300 mb-1">Voice</label>
          <select id="tts-voice" value={voiceURI} onChange={e => setVoiceURI(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md" disabled={voicesForLanguage.length === 0}>
            {voicesForLanguage.map(voice => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {`${voice.name} ${voice.localService ? '(Device)' : ''} ${voice.default ? '— Default' : ''}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 my-4">
        <div>
          <label htmlFor="tts-speed" className="block text-sm font-medium text-slate-300 mb-1">Speech Speed ({rate.toFixed(1)}x)</label>
          <input id="tts-speed" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div>
          <label htmlFor="tts-volume" className="block text-sm font-medium text-slate-300 mb-1">Volume ({(volume * 100).toFixed(0)}%)</label>
          <input id="tts-volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-full accent-blue-500" />
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-6">
        <button 
          onClick={handleSpeak} 
          disabled={!text.trim() || (isSpeaking && !isPaused)}
          aria-label="Play text aloud"
          className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          <PlayIcon className="w-5 h-5" /> Speak
        </button>
        <button 
          onClick={isPaused ? resume : pause} 
          disabled={!isSpeaking}
          aria-label={isPaused ? "Resume text reading" : "Pause text reading"}
          className="bg-amber-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          <PauseIcon className="w-5 h-5" /> {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button 
          onClick={cancel} 
          disabled={!isSpeaking && !isPaused}
          aria-label="Stop text reading"
          className="bg-rose-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors hover:bg-rose-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          <StopIcon className="w-5 h-5" /> Stop
        </button>
      </div>
      
      <div className="text-center text-sm text-slate-300 mt-4 p-2 bg-slate-700/50 rounded h-8 flex items-center justify-center">
        {getStatusMessage()}
      </div>
    </div>
  );
};


export const TTSDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 text-neon mt-4">Text-to-Speech Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Listen to any text read aloud. Adjust the language, voice, speed, and volume to fit your preferences.</p>
            </header>
            <div className="p-0 md:p-2 rounded-xl">
                <InteractiveTTSDemo />
            </div>
        </div>
    );
};