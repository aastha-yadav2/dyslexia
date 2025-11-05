import React, { useMemo } from 'react';
import type { AccessibilitySettings } from '../types';
import { useTTS } from '../hooks/useTTS';
import { XIcon, PlayIcon, StopIcon, FontIcon, HighContrastIcon } from './icons';

interface FocusModeViewProps {
  text: string;
  settings: AccessibilitySettings;
  // FIX: Changed the type to React.Dispatch<React.SetStateAction<AccessibilitySettings>> to correctly type the state setter prop.
  onSettingsChange: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  onExit: () => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; isActive?: boolean; children: React.ReactNode, label: string }> = ({ onClick, isActive = false, children, label }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900";
    const activeClasses = "bg-blue-500 text-white";
    const inactiveClasses = "bg-slate-700 text-slate-200 hover:bg-slate-600";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} aria-label={label}>
            {children}
        </button>
    );
};

export const FocusModeView: React.FC<FocusModeViewProps> = ({ text, settings, onSettingsChange, onExit }) => {
    const { isSpeaking, voices, speak, cancel } = useTTS();

    const selectedVoice = useMemo(() => {
        return voices.find(v => v.voiceURI === settings.ttsVoiceURI);
    }, [voices, settings.ttsVoiceURI]);

    const handleTTS = () => {
        if (isSpeaking) {
            cancel();
        } else {
            speak(text, {
                lang: settings.ttsLanguage,
                voice: selectedVoice,
                rate: settings.ttsRate,
                volume: settings.ttsVolume,
            });
        }
    };

    const handleToggle = (key: keyof AccessibilitySettings) => {
        onSettingsChange({ ...settings, [key]: !settings[key] });
    };

    const containerClasses = [
        'fixed inset-0 z-50 transition-colors duration-300 overflow-y-auto',
        settings.isHighContrast ? 'bg-black text-white' : 'bg-slate-900 text-slate-200'
    ].join(' ');

    const textClasses = [
        'text-xl md:text-2xl leading-loose',
        settings.isDyslexiaFont ? 'font-opendyslexic' : ''
    ].join(' ');

    const paragraphs = text.split('\n').filter(p => p.trim() !== '');

    return (
        <div className={containerClasses}>
            <main className="max-w-3xl mx-auto px-6 py-24 pb-32">
                <article className={textClasses}>
                    {paragraphs.length > 0 ? paragraphs.map((p, i) => (
                        <p key={i} className="mb-8">{p}</p>
                    )) : (
                        <p className="text-slate-500 italic">No text to display in focus mode.</p>
                    )}
                </article>
            </main>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl rounded-full p-2 flex items-center gap-2 border border-slate-700">
                <ToolbarButton onClick={onExit} label="Exit Focus Mode">
                    <XIcon className="w-5 h-5" /> Exit
                </ToolbarButton>
                <div className="w-px h-6 bg-slate-600"></div>
                <ToolbarButton onClick={handleTTS} label={isSpeaking ? "Stop Reading" : "Read Aloud"}>
                    {isSpeaking ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </ToolbarButton>
                <ToolbarButton onClick={() => handleToggle('isDyslexiaFont')} isActive={settings.isDyslexiaFont} label="Toggle Dyslexia Font">
                    <FontIcon className="w-5 h-5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => handleToggle('isHighContrast')} isActive={settings.isHighContrast} label="Toggle High Contrast">
                    <HighContrastIcon className="w-5 h-5" />
                </ToolbarButton>
            </div>
        </div>
    );
};