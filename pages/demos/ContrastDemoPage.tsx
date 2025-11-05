import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '../../components/icons';

// Define Theme types and data
type Theme = {
  key: string;
  name: string;
  styles: {
    bg: string;
    text: string;
    border: string;
    placeholder: string;
    ring: string;
  };
};

const themes: Theme[] = [
  {
    key: 'light',
    name: 'Light',
    styles: {
      bg: 'bg-white',
      text: 'text-slate-800',
      border: 'border-slate-300',
      placeholder: 'placeholder-slate-400',
      ring: 'focus:ring-blue-500',
    },
  },
  {
    key: 'dark',
    name: 'Dark',
    styles: {
      bg: 'bg-slate-800',
      text: 'text-slate-200',
      border: 'border-slate-600',
      placeholder: 'placeholder-slate-500',
      ring: 'focus:ring-blue-400',
    },
  },
  {
    key: 'high-contrast',
    name: 'High Contrast',
    styles: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-white',
      placeholder: 'placeholder-gray-400',
      ring: 'focus:ring-yellow-400',
    },
  },
  {
    key: 'soft',
    name: 'Soft Contrast',
    styles: {
      bg: 'bg-amber-50', // Sepia-like background
      text: 'text-stone-800',
      border: 'border-amber-200',
      placeholder: 'placeholder-stone-500',
      ring: 'focus:ring-orange-500',
    },
  },
];


const InteractiveContrastDemo: React.FC = () => {
    // State to hold the current theme key, loaded from localStorage or defaulted.
    const [activeTheme, setActiveTheme] = useState<string>(() => {
        try {
            const savedTheme = localStorage.getItem('includify-contrast-theme');
            return savedTheme && themes.some(t => t.key === savedTheme) ? savedTheme : 'dark';
        } catch {
            return 'dark';
        }
    });

    const [customText, setCustomText] = useState("This is some sample text to see how contrast affects readability. Type your own text here to see the changes in real-time. The quick brown fox jumps over the lazy dog.");

    // Effect to save the active theme to localStorage whenever it changes.
    useEffect(() => {
        try {
            localStorage.setItem('includify-contrast-theme', activeTheme);
        } catch (e) {
            console.error("Failed to save theme to localStorage:", e);
        }
    }, [activeTheme]);

    const currentTheme = themes.find(t => t.key === activeTheme) || themes[0];
    const textareaClasses = `w-full p-4 text-lg rounded-lg shadow-inner border-2 resize-none transition-colors duration-300 focus:outline-none focus:ring-2 ${currentTheme.styles.bg} ${currentTheme.styles.text} ${currentTheme.styles.border} ${currentTheme.styles.placeholder} ${currentTheme.styles.ring}`;

    return (
        <div className="bg-slate-800 p-6 rounded-xl">
            <p className="text-center text-slate-300 mb-6 max-w-2xl mx-auto">
                Switch between color themes to find the one that offers the best reading comfort for you. Your preference will be saved for your next visit.
            </p>
            
            {/* Theme Selector Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
                {themes.map(theme => (
                    <button
                        key={theme.key}
                        onClick={() => setActiveTheme(theme.key)}
                        className={`font-semibold py-2 px-5 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                            activeTheme === theme.key
                                ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-400 hover:bg-slate-600'
                        }`}
                        aria-pressed={activeTheme === theme.key}
                    >
                        {theme.name}
                    </button>
                ))}
            </div>

            {/* Live-editable Textbox */}
            <div>
                <label htmlFor="contrast-textarea" className="block text-sm font-medium text-slate-300 mb-2">
                    Live Preview & Editor
                </label>
                <textarea
                    id="contrast-textarea"
                    rows={10}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className={textareaClasses}
                    placeholder="Type here to see the effect..."
                />
            </div>
        </div>
    );
};


export const ContrastDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 mt-4">Contrast Adjustment Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Apply different color themes to improve text readability and reduce visual strain. Type in the editor to see real-time changes.</p>
            </header>
            <div className="p-0 md:p-2 rounded-xl">
                <InteractiveContrastDemo />
            </div>
        </div>
    );
};