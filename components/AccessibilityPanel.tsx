import React, { useMemo, useEffect } from 'react';
import type { AccessibilitySettings } from '../types';
import { PlayIcon, StopIcon, HighContrastIcon, FontIcon, FocusIcon, LineSpacingIcon } from './icons';

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onSettingsChange: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  textToRead: string;
  onTTSUse?: () => void;
  // New props for lifted state
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, settings?: { lang?: string; voice?: SpeechSynthesisVoice; rate?: number; volume?: number; }) => void;
  cancel: () => void;
}

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isHighContrast: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isActive, onClick, icon, label, isHighContrast }) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full justify-center";
  
  let activeClasses = "bg-blue-500 text-white shadow-sm";
  let inactiveClasses = "bg-slate-700 text-slate-200 hover:bg-slate-600";
  
  if (isHighContrast) {
      activeClasses = "bg-yellow-400 text-black shadow-sm";
      inactiveClasses = "bg-black border border-white text-white hover:bg-gray-800";
  }
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  textToRead, 
  onTTSUse,
  isSpeaking,
  voices,
  speak,
  cancel
}) => {
  const availableLanguages = useMemo(() => {
    if (!voices.length) return [];
    const langSet = new Set(voices.map(v => v.lang));
    return Array.from(langSet).sort().map((lang: string) => {
      try {
        const langName = new Intl.DisplayNames(['en'], { type: 'language' }).of(lang.split('-')[0]);
        return { code: lang, name: `${langName} (${lang})` };
      } catch {
        return { code: lang, name: lang };
      }
    });
  }, [voices]);

  const voicesForLanguage = useMemo(() => {
    return voices.filter(v => v.lang === settings.ttsLanguage);
  }, [voices, settings.ttsLanguage]);

  useEffect(() => {
    if (voicesForLanguage.length > 0) {
      const currentVoiceIsValid = voicesForLanguage.some(v => v.voiceURI === settings.ttsVoiceURI);
      if (!currentVoiceIsValid) {
        const defaultVoice = voicesForLanguage.find(v => v.default) || voicesForLanguage[0];
        if (defaultVoice) {
          onSettingsChange(prev => ({ ...prev, ttsVoiceURI: defaultVoice.voiceURI }));
        }
      }
    }
  }, [voicesForLanguage, settings.ttsVoiceURI, onSettingsChange]);

  const handleToggle = (key: keyof AccessibilitySettings) => {
    onSettingsChange(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, ttsLanguage: e.target.value, ttsVoiceURI: null });
    if (isSpeaking) cancel();
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, ttsVoiceURI: e.target.value });
    if (isSpeaking) cancel();
  };
  
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, ttsRate: parseFloat(e.target.value) });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, ttsVolume: parseFloat(e.target.value) });
  };


  const handleTTS = () => {
    if (isSpeaking) {
      cancel();
    } else {
      onTTSUse?.();
      const selectedVoice = voices.find(v => v.voiceURI === settings.ttsVoiceURI);
      speak(textToRead, { 
        lang: settings.ttsLanguage, 
        voice: selectedVoice,
        rate: settings.ttsRate,
        volume: settings.ttsVolume,
      });
    }
  };

  const ttsButtonClasses = settings.isHighContrast
    ? isSpeaking
      ? 'bg-yellow-500 text-black hover:bg-yellow-600'
      : 'bg-yellow-400 text-black hover:bg-yellow-500'
    : isSpeaking
      ? 'bg-amber-500 hover:bg-amber-600 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white';
  
  const disabledClasses = settings.isHighContrast
    ? 'disabled:bg-black disabled:border disabled:border-gray-500 disabled:text-gray-500'
    : 'disabled:bg-slate-600';
  
  const selectClasses = settings.isHighContrast
    ? 'bg-black border-white text-white focus:ring-yellow-400'
    : 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500';

  const rangeClasses = settings.isHighContrast
    ? 'accent-yellow-400 bg-gray-700'
    : 'accent-blue-500 bg-slate-600';

  return (
    <div className={`p-4 rounded-xl space-y-4 ${settings.isHighContrast ? 'bg-black border border-white' : 'bg-slate-800'}`}>
      <h3 className="text-lg font-semibold text-white">Accessibility Tools</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ToggleButton
            isActive={settings.isDyslexiaFont}
            onClick={() => handleToggle('isDyslexiaFont')}
            icon={<FontIcon className="w-5 h-5" />}
            label="Dyslexia Font"
            isHighContrast={settings.isHighContrast}
          />
          <ToggleButton
            isActive={settings.isHighContrast}
            onClick={() => handleToggle('isHighContrast')}
            icon={<HighContrastIcon className="w-5 h-5" />}
            label="High Contrast"
            isHighContrast={settings.isHighContrast}
          />
          <ToggleButton
            isActive={settings.isFocusMode}
            onClick={() => handleToggle('isFocusMode')}
            icon={<FocusIcon className="w-5 h-5" />}
            label="Focus Mode"
            isHighContrast={settings.isHighContrast}
          />
        </div>
        <div>
            <label htmlFor="line-spacing-select" className={`flex items-center gap-2 text-sm font-medium ${settings.isHighContrast ? 'text-white' : 'text-slate-200'} mb-1`}>
              <LineSpacingIcon className="w-5 h-5" />
              <span>Line Spacing</span>
            </label>
            <select
              id="line-spacing-select"
              value={settings.lineSpacing}
              onChange={(e) => onSettingsChange({ ...settings, lineSpacing: e.target.value as 'normal' | 'relaxed' | 'loose' })}
              className={`border text-sm rounded-lg block w-full p-2.5 ${selectClasses}`}
            >
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed (Default)</option>
              <option value="loose">Loose</option>
            </select>
          </div>
      </div>


      <div className={`border-t ${settings.isHighContrast ? 'border-white' : 'border-slate-700'} pt-4`}>
        <h4 className={`text-md font-semibold ${settings.isHighContrast ? 'text-white' : 'text-slate-200'} mb-3`}>Text to Speech</h4>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleTTS}
            disabled={!textToRead}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed ${ttsButtonClasses} ${disabledClasses}`}
          >
            {isSpeaking ? (
              <>
                <StopIcon className="w-5 h-5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label htmlFor="tts-language" className={`block text-xs font-medium ${settings.isHighContrast ? 'text-gray-300' : 'text-slate-300'} mb-1`}>Language</label>
                    <select
                        id="tts-language"
                        value={settings.ttsLanguage}
                        onChange={handleLanguageChange}
                        className={`border text-sm rounded-lg block w-full p-2.5 ${selectClasses}`}
                    >
                        {availableLanguages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="tts-voice" className={`block text-xs font-medium ${settings.isHighContrast ? 'text-gray-300' : 'text-slate-300'} mb-1`}>Voice</label>
                    <select
                        id="tts-voice"
                        value={settings.ttsVoiceURI ?? ''}
                        onChange={handleVoiceChange}
                        disabled={voicesForLanguage.length === 0}
                        className={`border text-sm rounded-lg block w-full p-2.5 ${selectClasses}`}
                    >
                        {voicesForLanguage.map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} {voice.default ? ' (Default)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="tts-rate" className={`block text-xs font-medium ${settings.isHighContrast ? 'text-gray-300' : 'text-slate-300'} mb-1`}>
                    Speed ({settings.ttsRate.toFixed(1)}x)
                </label>
                <input
                    id="tts-rate"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.ttsRate}
                    onChange={handleRateChange}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${rangeClasses}`}
                />
            </div>
             <div>
                <label htmlFor="tts-volume" className={`block text-xs font-medium ${settings.isHighContrast ? 'text-gray-300' : 'text-slate-300'} mb-1`}>
                    Volume ({(settings.ttsVolume * 100).toFixed(0)}%)
                </label>
                <input
                    id="tts-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.ttsVolume}
                    onChange={handleVolumeChange}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${rangeClasses}`}
                />
            </div>
        </div>
      </div>
    </div>
  );
};