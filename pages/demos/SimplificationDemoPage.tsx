import React, { useState, useCallback, useEffect } from 'react';
import { simplifyText } from '../../services/geminiService';
import { LoaderIcon, ErrorIcon, ArrowLeftIcon } from '../../components/icons';
import { ApiKeyPrompt } from '../../components/ApiKeyPrompt';

const WhoItHelpsItem: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-2xl bg-slate-800/50 p-3 rounded-full">{icon}</div>
        <div>
            <h4 className="font-bold text-slate-100">{title}</h4>
            <p className="text-slate-300 text-sm">{description}</p>
        </div>
    </div>
);

const InteractiveSimplificationDemo: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const sampleText = "The forthcoming meteorological event is projected to manifest as substantial precipitation, potentially causing disruptions to transportation infrastructure and necessitating precautionary measures by the citizenry.";
    const [inputText, setInputText] = useState(sampleText);
    const [simplifiedText, setSimplifiedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(true);

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

    const handleSimplify = useCallback(async () => {
        if (!inputText.trim()) {
            setSimplifiedText('');
            setError(null);
            return;
        }

        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setHasApiKey(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await simplifyText(inputText);
            setSimplifiedText(result);
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
            setSimplifiedText('');
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);
    
    return (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
                 {!hasApiKey && (
                    <ApiKeyPrompt
                        onSelectKey={handleSelectApiKey}
                        message="To use this demo, please select a Google AI Studio API key."
                    />
                )}
                <div className="flex flex-col gap-4">
                     <div>
                         <h3 className="text-xl font-bold text-slate-100">Try it Live</h3>
                         <div>
                            <label htmlFor="complex-text" className="block text-sm font-medium text-slate-300 mb-1">Complex Text</label>
                            <textarea
                                id="complex-text"
                                rows={6}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full p-3 bg-slate-800/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter complex text here..."
                            />
                         </div>
                         <button
                            onClick={handleSimplify}
                            disabled={isLoading || !inputText.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="w-5 h-5 animate-spin" />
                                    <span>Simplifying...</span>
                                </>
                            ) : (
                                'Simplify Text'
                            )}
                        </button>
                        <div>
                            <label htmlFor="simplified-text" className="block text-sm font-medium text-slate-300 mb-1">Simplified Version</label>
                            <div id="simplified-text" className="w-full p-3 h-36 bg-slate-800/50 border border-slate-600 rounded-lg overflow-y-auto">
                                {error && (
                                     <div className="text-rose-400 flex items-center gap-2 text-sm">
                                        <ErrorIcon className="w-5 h-5" /> {error}
                                    </div>
                                )}
                                {!error && !isLoading && !simplifiedText && <p className="text-slate-400">Simplified text will appear here.</p>}
                                {!error && !isLoading && simplifiedText && <p className="text-slate-200">{simplifiedText}</p>}
                            </div>
                        </div>
                         <div className="mt-4 text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-slate-200 text-sm">
                                Also need it in sign language?{' '}
                                <button onClick={() => onNavigate('/sign-language')} className="font-semibold text-blue-400 hover:underline">
                                    Try the Sign Language Assistant &rarr;
                                </button>
                            </p>
                         </div>
                     </div>
                </div>
            </div>
            <div className="space-y-6">
                 <h3 className="text-xl font-bold text-slate-100">Who It Helps</h3>
                 <WhoItHelpsItem 
                    icon="🧠"
                    title="Cognitive Disabilities"
                    description="Reduces cognitive load by presenting information in a more direct and easy-to-process format."
                 />
                 <WhoItHelpsItem 
                    icon="👓"
                    title="Dyslexia & ADHD"
                    description="Uses shorter sentences and simpler words, which can significantly improve reading speed and comprehension."
                 />
                 <WhoItHelpsItem 
                    icon="🌐"
                    title="Language Learners"
                    description="Acts as a learning aid by translating complex jargon and idiomatic expressions into foundational language."
                 />
                  <WhoItHelpsItem 
                    icon="✅"
                    title="General Readability"
                    description="Saves time and improves clarity for everyone, ensuring the core message is understood quickly and accurately."
                 />
            </div>
        </div>
    );
};

export const SimplificationDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 text-neon mt-4">AI Text Simplification Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Try the AI-powered text simplifier live. Paste your text to see it converted into clear, easy-to-understand language.</p>
            </header>
            <div className="glass-card p-6 md:p-10 rounded-xl shadow-2xl">
                <InteractiveSimplificationDemo onNavigate={onNavigate} />
            </div>
        </div>
    );
};