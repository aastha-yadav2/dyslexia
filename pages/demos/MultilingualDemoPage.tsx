import React, { useState, useCallback, useEffect } from 'react';
import { translateText } from '../../services/geminiService';
import { LoaderIcon, ErrorIcon, ArrowLeftIcon, PlayIcon, StopIcon } from '../../components/icons';
import { ApiKeyPrompt } from '../../components/ApiKeyPrompt';
import { useTTS } from '../../hooks/useTTS';

const InteractiveMultilingualDemo: React.FC = () => {
    const [inputText, setInputText] = useState('This platform is designed to make digital content accessible for everyone.');
    const [translatedText, setTranslatedText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(true);
    const { speak, cancel, isSpeaking, voices } = useTTS();

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio) {
                setHasApiKey(await window.aistudio.hasSelectedApiKey());
            }
        };
        checkApiKey();
    }, []);

    const handleSelectApiKey = useCallback(async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
        }
    }, []);

    const languages = [
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'mr', name: 'Marathi' },
        { code: 'kn', name: 'Kannada' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ar', name: 'Arabic' },
    ];

    const handleTranslate = useCallback(async () => {
        if (!inputText.trim()) {
            setTranslatedText('');
            setError(null);
            return;
        }

        if (isSpeaking) {
            cancel();
        }

        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setHasApiKey(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await translateText(inputText, targetLanguage);
            setTranslatedText(result);
            setHasApiKey(true);
        } catch (e) {
            if (e instanceof Error) {
                if (e.message.includes("API key is invalid or missing")) {
                    setHasApiKey(false);
                    setError(null);
                } else {
                    setError(e.message);
                }
            } else {
                setError('An unknown error occurred.');
            }
            setTranslatedText('');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, targetLanguage, isSpeaking, cancel]);
    
    const handleReadAloud = () => {
        if (isSpeaking) {
            cancel();
        } else if (translatedText.trim()) {
            const selectedLanguage = languages.find(l => l.name === targetLanguage);
            const langCode = selectedLanguage ? selectedLanguage.code : 'en-US';
            
            const voiceForLang = voices.find(v => v.lang.startsWith(langCode) && v.default) || voices.find(v => v.lang.startsWith(langCode));

            speak(translatedText, {
                lang: langCode,
                voice: voiceForLang,
            });
        }
    };


    return (
        <div className="relative glass-card p-6 rounded-xl">
             {!hasApiKey && (
                <ApiKeyPrompt
                    onSelectKey={handleSelectApiKey}
                    message="To use the live translation demo, please select a Google AI Studio API key."
                />
            )}
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-2">Live Translation</h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="multilingual-input" className="block text-sm font-medium text-slate-300 mb-1">Text to Translate</label>
                            <textarea
                                id="multilingual-input"
                                rows={5}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="language-select" className="block text-sm font-medium text-slate-300 mb-1">Translate to</label>
                            <select
                                id="language-select"
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.name}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleTranslate}
                            disabled={isLoading || !inputText.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><LoaderIcon className="w-5 h-5 animate-spin" /> Translating...</>
                            ) : (
                                'Translate'
                            )}
                        </button>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="translated-output" className="block text-sm font-medium text-slate-300">Translated Text</label>
                                <button
                                    onClick={handleReadAloud}
                                    disabled={!translatedText.trim() || isLoading}
                                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSpeaking ? (
                                        <>
                                            <StopIcon className="w-4 h-4" />
                                            <span>Stop</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="w-4 h-4" />
                                            <span>Read Aloud</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div id="translated-output" className="w-full p-3 h-32 bg-slate-800/50 border border-slate-600 rounded-lg overflow-y-auto">
                               {error && (
                                     <div className="text-rose-400 flex items-center gap-2 text-sm">
                                        <ErrorIcon className="w-5 h-5" /> {error}
                                    </div>
                                )}
                                {!error && !isLoading && !translatedText && <p className="text-slate-400">Translation will appear here.</p>}
                                {!error && !isLoading && translatedText && <p className="text-slate-200">{translatedText}</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Interface Language</h3>
                        <p className="text-slate-300 text-sm mb-3">Switch the entire application interface to your preferred language, including menus, buttons, and instructions.</p>
                        <div className="flex gap-2 p-2 bg-slate-700/50 rounded-lg">
                            <button className="flex-1 py-2 text-sm font-semibold bg-slate-200 text-blue-900 rounded-md shadow">English</button>
                            <button className="flex-1 py-2 text-sm font-semibold bg-slate-600 text-slate-300 rounded-md hover:bg-slate-500">Español</button>
                            <button className="flex-1 py-2 text-sm font-semibold bg-slate-600 text-slate-300 rounded-md hover:bg-slate-500">Français</button>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Localized Accessibility</h3>
                        <p className="text-slate-300 text-sm">Our accessibility features, like Text-to-Speech, are available in multiple languages with region-specific voices and dialects for a natural experience.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">Right-to-Left (RTL) Support</h3>
                        <p className="text-slate-300 text-sm">The interface automatically adjusts to RTL layouts for languages like Arabic and Hebrew, ensuring correct alignment and readability.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const MultilingualDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 text-neon mt-4">Multilingual Support Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Translate content and use accessibility tools in multiple languages. Our interface also supports right-to-left (RTL) layouts.</p>
            </header>
            <div className="p-0 md:p-2 rounded-xl">
                <InteractiveMultilingualDemo />
            </div>
        </div>
    );
};