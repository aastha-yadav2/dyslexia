import React, { useState } from 'react';
import { ArrowLeftIcon } from '../../components/icons';

const InteractiveDyslexiaFontDemo: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [fontSize, setFontSize] = useState(18);
    const [lineSpacing, setLineSpacing] = useState(1.6);
    const [customText, setCustomText] = useState("The quick brown fox jumps over the lazy dog. This is a longer sentence to demonstrate how the font looks with more text. Adjust the sliders below to see how font size and line spacing can improve readability and reduce visual strain.");

    const previewStyle = {
        fontSize: `${fontSize}px`,
        lineHeight: lineSpacing,
    };
    
    const previewClasses = [
        "w-full h-full p-4 text-slate-100 bg-slate-700/50 border border-slate-600 rounded-lg shadow-inner overflow-y-auto whitespace-pre-wrap",
        isEnabled ? "font-opendyslexic" : ""
    ].join(" ");

    const textareaClasses = "w-full h-full p-4 text-slate-100 bg-slate-700/50 border border-slate-600 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none";

    return (
        <div className="bg-slate-800 p-6 rounded-xl">
            <p className="text-center text-slate-300 mb-6 max-w-2xl mx-auto">
                Switch to a font optimized for readers with dyslexia. Type in the box below to see how your text looks with improved letter distinction and spacing to enhance readability.
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
                <label htmlFor="dyslexia-toggle" className="font-semibold text-slate-100">
                    Enable Dyslexia-Friendly Font
                </label>
                <button
                    id="dyslexia-toggle"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 ${
                        isEnabled ? 'bg-blue-500' : 'bg-slate-500'
                    }`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 min-h-[250px] md:min-h-[300px]">
                <div>
                    <label htmlFor="dyslexia-input" className="block text-sm font-medium text-slate-300 mb-2">
                        Your Text
                    </label>
                    <textarea
                        id="dyslexia-input"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className={textareaClasses}
                        placeholder="Type your text here..."
                    />
                </div>
                <div>
                    <label htmlFor="dyslexia-preview" className="block text-sm font-medium text-slate-300 mb-2">
                        Live Preview
                    </label>
                    <div
                        id="dyslexia-preview"
                        className={previewClasses}
                        style={previewStyle}
                        aria-live="polite"
                    >
                       {customText || <span className="text-slate-400">Preview appears here...</span>}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-700">
                <div>
                    <label htmlFor="font-size-slider" className="block text-sm font-medium text-slate-300 mb-1">
                        Font Size ({fontSize}px)
                    </label>
                    <input
                        id="font-size-slider"
                        type="range"
                        min="14"
                        max="32"
                        step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-blue-500"
                        aria-label="Adjust font size"
                    />
                </div>
                <div>
                    <label htmlFor="line-spacing-slider" className="block text-sm font-medium text-slate-300 mb-1">
                        Line Spacing ({lineSpacing.toFixed(1)}x)
                    </label>
                    <input
                        id="line-spacing-slider"
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.1"
                        value={lineSpacing}
                        onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                        className="w-full accent-blue-500"
                        aria-label="Adjust line spacing"
                    />
                </div>
            </div>
        </div>
    );
};


export const DyslexiaFontDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 mt-4">Dyslexia-Friendly Font Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Experience how a specialized font can improve readability. Adjust the settings to see what works best for you.</p>
            </header>
            <div className="p-0 md:p-2 rounded-xl">
                <InteractiveDyslexiaFontDemo />
            </div>
        </div>
    );
};