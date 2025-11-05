import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeftIcon } from '../../components/icons';

const InteractiveFocusModeDemo: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [highlightColor, setHighlightColor] = useState('blue');
    const [focusUnit, setFocusUnit] = useState<'paragraph' | 'sentence'>('paragraph');
    const [isAutoScroll, setIsAutoScroll] = useState(false);
    const [autoScrollDelay, setAutoScrollDelay] = useState(5);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const initialText = `In a world of constant digital noise, maintaining focus is a significant challenge for many. The sheer volume of information, notifications, and competing stimuli can fragment our attention, making deep work or concentrated reading feel like an uphill battle. This is particularly true for individuals with attention-related conditions like ADHD, but it's a universal struggle that affects productivity and mental well-being across the board.

To address this, we've developed Focus Mode, a tool designed to create a serene and distraction-free reading environment. When activated, it subtly dims the surrounding text, drawing your attention to a single paragraph at a time. This simple yet powerful technique is based on the principle of reducing cognitive load. By visually isolating the content you're currently engaged with, we help your brain filter out irrelevant information, allowing for deeper immersion and improved comprehension.`;
    const [userText, setUserText] = useState(initialText);

    const colorOptions = [
        { name: 'Cream', key: 'cream', class: 'bg-yellow-500/20' },
        { name: 'Blue', key: 'blue', class: 'bg-blue-500/20' },
        { name: 'Mint', key: 'mint', class: 'bg-emerald-500/20' },
    ];
    
    const textUnits = useMemo(() => {
        const trimmedText = userText.trim();
        if (!trimmedText) return [];
        if (focusUnit === 'paragraph') {
            return trimmedText.split(/\n+/).map(p => p.trim()).filter(Boolean);
        } else { // sentence
            const sentences = trimmedText.match(/[^.!?\n]+(?:[.!?\n]|$)/g) || [];
            return sentences.map(s => s.trim()).filter(Boolean);
        }
    }, [userText, focusUnit]);

    const unitRefs = React.useRef<(HTMLParagraphElement | null)[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        unitRefs.current = unitRefs.current.slice(0, textUnits.length);
    }, [textUnits]);
    
    useEffect(() => {
        setActiveIndex(null);
    }, [isEnabled, isAutoScroll, userText, focusUnit]);

    useEffect(() => {
        if (isEnabled && isAutoScroll && textUnits.length > 0) {
            const intervalId = setInterval(() => {
                setActiveIndex(prevIndex => {
                    const nextIndex = (prevIndex === null ? 0 : prevIndex + 1);
                    if (nextIndex >= textUnits.length) {
                        clearInterval(intervalId);
                        return prevIndex;
                    }
                    unitRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return nextIndex;
                });
            }, autoScrollDelay * 1000);
            return () => clearInterval(intervalId);
        }
    }, [isEnabled, isAutoScroll, autoScrollDelay, textUnits]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isEnabled || isAutoScroll || !(e.target instanceof HTMLElement && container.contains(e.target))) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const currentFocusIndex = unitRefs.current.findIndex(ref => ref === document.activeElement);
                const currentIndex = currentFocusIndex !== -1 ? currentFocusIndex : (activeIndex ?? -1);
                let nextIndex;
                if (e.key === 'ArrowDown') {
                    nextIndex = Math.min(currentIndex + 1, textUnits.length - 1);
                } else { // ArrowUp
                    nextIndex = Math.max(currentIndex - 1, 0);
                }
                if (nextIndex >= 0 && unitRefs.current[nextIndex]) {
                    unitRefs.current[nextIndex]!.focus();
                }
            }
        };
        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [isEnabled, isAutoScroll, textUnits, activeIndex]);

    const highlightClasses = {
        cream: 'bg-yellow-500/20',
        blue: 'bg-blue-500/20',
        mint: 'bg-emerald-500/20',
    };

    return (
      <div className="bg-slate-800 p-6 rounded-xl">
        <p className="text-center text-slate-300 mb-6 max-w-2xl mx-auto">
            Enter your own content below. Then, enable focus mode and use your mouse, arrow keys, or auto-scroll to highlight one part at a time.
        </p>
        <div className="mb-4">
             <label htmlFor="focus-mode-input" className="block text-sm font-medium text-slate-300 mb-2">
                Your Content
            </label>
            <textarea
                id="focus-mode-input"
                rows={8}
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                className="w-full p-4 text-slate-100 bg-slate-700/50 border border-slate-600 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
                placeholder="Type or paste your text here..."
            />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 rounded-lg bg-slate-700/50 border border-slate-700 mb-6">
            <div className="flex items-center gap-4">
                <label htmlFor="focus-toggle" className="font-semibold text-slate-100">
                    Enable Focus Mode
                </label>
                <button
                    id="focus-toggle"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-700 ${ isEnabled ? 'bg-blue-500' : 'bg-slate-500' }`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${ isEnabled ? 'translate-x-6' : 'translate-x-1' }`} />
                </button>
            </div>
            <div>
                 <span className="font-semibold text-slate-100 text-sm block mb-2">Focus On</span>
                 <div className="flex gap-2 rounded-lg bg-slate-700 p-1">
                     <button onClick={() => setFocusUnit('paragraph')} className={`flex-1 text-sm py-1 rounded-md transition-colors ${focusUnit === 'paragraph' ? 'bg-blue-500 text-white shadow' : 'hover:bg-slate-600 text-slate-300'}`}>Paragraphs</button>
                     <button onClick={() => setFocusUnit('sentence')} className={`flex-1 text-sm py-1 rounded-md transition-colors ${focusUnit === 'sentence' ? 'bg-blue-500 text-white shadow' : 'hover:bg-slate-600 text-slate-300'}`}>Sentences</button>
                 </div>
            </div>
            <div>
                <span className="font-semibold text-slate-100 text-sm block mb-2">
                    Highlight Color
                </span>
                <div className="flex gap-2">
                    {colorOptions.map(option => (
                        <button
                            key={option.key}
                            onClick={() => setHighlightColor(option.key)}
                            className={`w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-slate-700 ${option.class} ${highlightColor === option.key ? `ring-blue-500` : 'ring-transparent'}`}
                            aria-label={`Set highlight color to ${option.name}`}
                        />
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="autoscroll-toggle" className="font-semibold text-slate-100">
                    Auto-Scroll
                </label>
                <button
                    id="autoscroll-toggle"
                    role="switch"
                    aria-checked={isAutoScroll}
                    onClick={() => setIsAutoScroll(!isAutoScroll)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-700 ${ isAutoScroll ? 'bg-blue-500' : 'bg-slate-500' }`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${ isAutoScroll ? 'translate-x-6' : 'translate-x-1' }`} />
                </button>
            </div>
            <div className="lg:col-span-2">
                <label htmlFor="delay-input" className="font-semibold text-slate-100 text-sm block mb-2">
                    Auto-Scroll Delay ({autoScrollDelay}s)
                </label>
                 <input
                    id="delay-input"
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={autoScrollDelay}
                    onChange={(e) => setAutoScrollDelay(Number(e.target.value))}
                    className="w-full accent-blue-500"
                    disabled={!isAutoScroll || !isEnabled}
                    aria-label="Adjust auto-scroll delay"
                />
            </div>
        </div>

        <div 
            ref={containerRef}
            className="bg-slate-700/50 p-4 sm:p-6 rounded-lg shadow-inner border border-slate-700 text-slate-200 leading-relaxed min-h-[200px] max-h-[50vh] overflow-y-auto" 
            onMouseLeave={() => !isAutoScroll && setActiveIndex(null)}
        >
            {textUnits.length === 0 && <p className="text-slate-400">Your content will be displayed here.</p>}
            {textUnits.map((unit, index) => (
                 <p
                    key={index}
                    ref={el => { if (unitRefs.current) unitRefs.current[index] = el; }}
                    tabIndex={isEnabled ? 0 : -1}
                    onMouseEnter={() => !isAutoScroll && setActiveIndex(index)}
                    onFocus={() => { if (!isAutoScroll) setActiveIndex(index); }}
                    className={`p-2 my-1 rounded-lg transition-all duration-300 ease-in-out ${ isEnabled ? 'cursor-pointer' : ''} ${
                        isEnabled
                            ? (activeIndex === null || activeIndex === index ? 'opacity-100' : 'opacity-40')
                            : 'opacity-100'
                    } ${
                        isEnabled && activeIndex === index
                            ? highlightClasses[highlightColor as keyof typeof highlightClasses]
                            : ''
                    }
                    focus:outline-none`}
                 >
                    {unit}
                 </p>
            ))}
        </div>
      </div>
    );
};

export const FocusModeDemoPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <button onClick={() => onNavigate('/features')} className="flex items-center gap-2 text-blue-400 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to All Features
                </button>
                <h1 className="text-4xl font-extrabold text-slate-100 mt-4">Focus Mode Demo</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">Improve your concentration by highlighting one paragraph or sentence at a time, dimming the surrounding text to minimize distractions.</p>
            </header>
            <div className="p-0 md:p-2 rounded-xl">
                <InteractiveFocusModeDemo />
            </div>
        </div>
    );
};