import React from 'react';
import type { AccessibilitySettings } from '../types';
import { PlayIcon, StopIcon } from './icons';

interface OutputAreaProps {
  text: string;
  settings: AccessibilitySettings;
  placeholderText: string;
  isSpeaking: boolean;
  onReadAloud: () => void;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ text, settings, placeholderText, isSpeaking, onReadAloud }) => {
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');

  const getLineSpacingClass = () => {
    switch (settings.lineSpacing) {
      case 'normal':
        return 'leading-normal';
      case 'loose':
        return 'leading-loose';
      case 'relaxed':
      default:
        return 'leading-relaxed';
    }
  };

  const textClasses = [
    "text-lg",
    getLineSpacingClass(),
    "transition-all",
    "duration-300",
    settings.isDyslexiaFont ? "font-opendyslexic" : "",
    settings.isHighContrast ? "text-white" : "text-slate-100",
  ].join(" ");
  
  const containerClasses = settings.isHighContrast ? "bg-black" : "bg-slate-800";

  const readAloudButtonClasses = settings.isHighContrast
    ? 'bg-black border border-gray-400 text-gray-200 hover:bg-gray-700'
    : 'bg-slate-700 text-slate-200 hover:bg-slate-600';


  if (!text) {
    return (
      <div className={`flex items-center justify-center h-full p-6 ${containerClasses} rounded-xl border-2 border-dashed ${settings.isHighContrast ? 'border-gray-500' : 'border-slate-600'}`}>
        <p className={`text-center ${settings.isHighContrast ? 'text-gray-400' : 'text-slate-400'}`}>
          {placeholderText}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative p-6 ${containerClasses} rounded-xl`}>
      <div className="absolute top-3 right-3 z-10">
          <button
              onClick={onReadAloud}
              disabled={!text}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${readAloudButtonClasses}`}
              title={isSpeaking ? "Stop reading" : "Read text aloud"}
              aria-label={isSpeaking ? "Stop reading" : "Read text aloud"}
          >
              {isSpeaking ? (
                  <>
                      <StopIcon className="w-5 h-5" />
                      <span>Stop</span>
                  </>
              ) : (
                  <>
                      <PlayIcon className="w-5 h-5" />
                      <span>Read</span>
                  </>
              )}
          </button>
      </div>
      <div className={`${textClasses} space-y-4 pt-10 sm:pt-0`}>
        {paragraphs.map((p, index) => (
          <p 
            key={index}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
};