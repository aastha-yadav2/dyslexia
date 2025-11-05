import React, { useState } from 'react';
import { ArrowLeftIcon } from '../../components/icons';

type LineSpacingValue = 'normal' | 'relaxed' | 'loose';

const InteractiveLineSpacingDemo: React.FC = () => {
    const [lineSpacing, setLineSpacing] = useState<LineSpacingValue>('relaxed');
    const [customText, setCustomText] = useState(
        "Adjusting the space between lines of text can significantly improve readability, especially for long passages. This feature is particularly helpful for individuals with dyslexia, as it can prevent the visual 'crowding' of letters and words, making it easier to track lines of text without losing one's place. \n\nFor users with certain visual impairments, increased line spacing can also enhance clarity. Test the different options below to find the setting that provides the most comfortable reading experience for you. You can also edit this text to see how it looks with your own content."
    );

    const getLineSpacingClass = (spacing: LineSpacingValue) => {
        switch (spacing) {
            case 'normal': return 'leading-normal';
            case 'relaxed': return 'leading-relaxed';
            case 'loose': return 'leading-loose';
            default: return 'leading-relaxed';
        }
    };

    const previewClasses = `w-full h-full p-4 text-slate-100 bg-slate-700/50 border border-slate-600 rounded-lg shadow-inner overflow-y-auto whitespace-pre-wrap transition-all duration-300 ${getLineSpacingClass(lineSpacing)}`;

    return (
        <div className="bg-slate-800 p-6 rounded-xl">
            <p className="text-center text-slate-300 mb-6 max-w-2xl mx-auto">
                Select a line spacing option to see how it affects the readability of the text below. You can also edit the content to preview your own text.
            </p>

            <div className="flex justify-center gap-3 mb-6 bg-slate-700/50 p-2 rounded-full">
                {(['normal', 'relaxed', 'loose'] as LineSpacingValue[]).map(spacing => (
                    <button
                        key={spacing}
                        onClick={() => setLineSpacing(spacing)}
                        className={`font-semibold py-2 px-5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                            lineSpacing === spacing
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        aria-pressed={lineSpacing === spacing}
                    >
                        {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                    </button>
                ))}
            </div>
            
            <div className="min-h-[300px]">
                <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className={previewClasses}
                    aria-label="Text with adjustable line spacing"
                />
            </div>
        </div>
    );
};


export const LineSpacingDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 mt-4">Adjustable Line Spacing Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Customize the spacing between lines of text to make reading smoother and more comfortable.</p>
            </header>
            <div className="p-0 md:p-2 rounded-xl">
                <InteractiveLineSpacingDemo />
            </div>
        </div>
    );
};
