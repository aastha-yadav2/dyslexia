import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AccessibilitySettings } from '../types';
import { simplifyText, summarizeText } from '../services/geminiService';
import { useTTS } from '../hooks/useTTS';
import { AccessibilityPanel } from '../components/AccessibilityPanel';
import { OutputArea } from '../components/OutputArea';
import { LoaderIcon, ErrorIcon, UserCircleIcon, DocumentDownloadIcon, ClipboardCopyIcon, CheckCircleIcon } from '../components/icons';
import { ApiKeyPrompt } from '../components/ApiKeyPrompt';
import { FocusModeView } from '../components/FocusModeView';

interface UserProfile {
    name: string;
    avatarUrl?: string;
}

export const MainApp: React.FC<{onNavigate: (path: string) => void; isDemo?: boolean}> = ({ onNavigate, isDemo = false }) => {
  const [inputText, setInputText] = useState<string>(isDemo ? "The forthcoming meteorological event is projected to manifest as substantial precipitation, potentially causing disruptions to transportation infrastructure and necessitating precautionary measures by the citizenry." : '');
  const [simplifiedText, setSimplifiedText] = useState<string>('');
  const [summarizedText, setSummarizedText] = useState<string>('');
  const [activeOutput, setActiveOutput] = useState<'simplified' | 'summarized'>('simplified');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<'simplify' | 'summarize' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    isHighContrast: false,
    isFocusMode: false,
    isDyslexiaFont: false,
    ttsLanguage: 'en-US',
    ttsVoiceURI: null,
    ttsRate: 1,
    ttsVolume: 1,
    lineSpacing: 'relaxed',
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Guest' });
  const sessionStartTime = React.useRef<number | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const ttsUsedInSessionRef = useRef(false);
  const [isCopied, setIsCopied] = useState(false);

  const { isSpeaking, voices, speak, cancel } = useTTS();

  useEffect(() => {
    setUserProfile({ name: isDemo ? 'Guest (Demo)' : 'Alex Doe' });
  }, [isDemo]);

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
    
    setLoadingAction('simplify');
    setIsLoading(true);
    setError(null);
    
    sessionStartTime.current = Date.now();
    ttsUsedInSessionRef.current = false;
    
    try {
      const result = await simplifyText(inputText);
      setSimplifiedText(result);
      setActiveOutput('simplified');
      setHasApiKey(true);

      if (sessionStartTime.current) {
        const duration = (Date.now() - sessionStartTime.current) / 1000;
        const wordCount = result.trim().split(/\s+/).length;

        const newSession = {
          timestamp: Date.now(),
          duration: Math.round(duration),
          wordCount,
          settings: {
            isDyslexiaFont: settings.isDyslexiaFont,
            isFocusMode: settings.isFocusMode,
            isHighContrast: settings.isHighContrast,
          },
          ttsUsed: ttsUsedInSessionRef.current,
        };
        
        try {
          const storedMetrics = localStorage.getItem('includifyMetrics');
          const metrics = storedMetrics ? JSON.parse(storedMetrics) : { sessions: [] };
          metrics.sessions.push(newSession);
          localStorage.setItem('includifyMetrics', JSON.stringify(metrics));
        } catch (e) {
          console.error("Failed to save metrics to localStorage:", e);
        }
      }
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
      setLoadingAction(null);
      sessionStartTime.current = null;
    }
  }, [inputText, settings]);

   const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) {
      setSummarizedText('');
      setError(null);
      return;
    }

    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setHasApiKey(false);
        return;
    }
    
    setLoadingAction('summarize');
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await summarizeText(inputText);
      setSummarizedText(result);
      setActiveOutput('summarized');
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
      setSummarizedText('');
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [inputText]);
  
  const activeText = activeOutput === 'simplified' ? simplifiedText : summarizedText;
  
  const handleSaveToFile = () => {
    if (!activeText.trim()) return;

    const blob = new Blob([activeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeOutput}-text.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!activeText.trim() || isCopied) return;

    navigator.clipboard.writeText(activeText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    });
  };

  const handleReadAloud = useCallback(() => {
    if (isSpeaking) {
        cancel();
    } else if (activeText.trim()) {
        ttsUsedInSessionRef.current = true;
        const selectedVoice = voices.find(v => v.voiceURI === settings.ttsVoiceURI);
        speak(activeText, {
            lang: settings.ttsLanguage,
            voice: selectedVoice,
            rate: settings.ttsRate,
            volume: settings.ttsVolume,
        });
    }
  }, [isSpeaking, cancel, activeText, voices, settings, speak]);

  const rootClasses = [
    'min-h-screen',
    'transition-colors',
    'duration-300',
    settings.isDyslexiaFont ? 'font-opendyslexic' : '',
    settings.isHighContrast ? 'bg-black text-white' : 'bg-slate-900',
  ].join(' ');

  if (settings.isFocusMode && activeText) {
    return (
        <FocusModeView
            text={activeText}
            settings={settings}
            onSettingsChange={setSettings}
            onExit={() => setSettings(s => ({ ...s, isFocusMode: false }))}
        />
    );
  }

  const buttonBaseClasses = "w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:cursor-not-allowed";
  const simplifyButtonClasses = settings.isHighContrast
    ? 'bg-black border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black focus:ring-yellow-400 disabled:border-gray-500 disabled:text-gray-500'
    : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-slate-600';
  const summarizeButtonClasses = settings.isHighContrast
    ? 'bg-black border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black focus:ring-yellow-400 disabled:border-gray-500 disabled:text-gray-500'
    : 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 disabled:bg-slate-600';


  return (
    <div className={rootClasses}>
      <header className={`py-4 px-6 ${settings.isHighContrast ? 'bg-black border-b border-white' : 'bg-slate-900'} flex justify-between items-center`}>
        <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/qvQmkpcZ/Untitled-design.png" alt="Includify logo" className={`h-10 w-10`} />
            <div>
              <h1 className={`text-2xl font-bold ${settings.isHighContrast ? 'text-yellow-300' : 'text-blue-400'}`}>Includify</h1>
              <p className={`text-sm ${settings.isHighContrast ? 'text-gray-300' : 'text-slate-400'}`}>
                Making digital content accessible for everyone.
              </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className={`font-semibold ${settings.isHighContrast ? 'text-white' : 'text-slate-200'}`}>{userProfile.name}</p>
                 <div className="flex items-center justify-end gap-3">
                     {!isDemo && <button onClick={() => onNavigate('/dashboard')} className={`text-xs font-medium ${settings.isHighContrast ? 'text-yellow-300' : 'text-blue-400'} hover:underline`}>
                        Dashboard
                    </button>}
                     {!isDemo && <span className={settings.isHighContrast ? 'text-white' : "text-slate-600"}>|</span>}
                    <button onClick={() => onNavigate('/')} className={`text-xs font-medium ${settings.isHighContrast ? 'text-yellow-300' : 'text-blue-400'} hover:underline`}>
                        Back to Home
                    </button>
                </div>
            </div>
            {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="User avatar" className="w-10 h-10 rounded-full" />
            ) : (
                <UserCircleIcon className={`w-10 h-10 ${settings.isHighContrast ? 'text-white' : 'text-slate-500'}`} />
            )}
        </div>
      </header>
      
      <main className="p-4 md:p-6">
        <div className="relative">
          {!hasApiKey && (
              <ApiKeyPrompt
                  onSelectKey={handleSelectApiKey}
                  message="To use AI-powered features, please select a Google AI Studio API key."
              />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Input and Controls */}
            <div className="flex flex-col gap-6">
              <div className="relative">
                <div className={`${settings.isHighContrast ? 'bg-black border border-white' : 'bg-slate-800'} p-4 rounded-xl`}>
                  <label htmlFor="input-text" className="block text-lg font-semibold text-white mb-2">
                    Enter Your Text
                  </label>
                  <textarea
                    id="input-text"
                    rows={10}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste or type your text here..."
                    className={`w-full p-3 text-white rounded-lg focus:ring-2 transition-colors ${settings.isHighContrast ? 'bg-black border-white placeholder-gray-400 focus:ring-yellow-400' : 'bg-slate-700/50 border-slate-600 focus:ring-blue-500'}`}
                  />
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleSimplify}
                      disabled={isLoading || !inputText.trim()}
                      className={`${buttonBaseClasses} ${simplifyButtonClasses}`}
                    >
                      {isLoading && loadingAction === 'simplify' ? (
                        <>
                          <LoaderIcon className="w-5 h-5 animate-spin" />
                          <span>Simplifying...</span>
                        </>
                      ) : (
                        'Simplify Text'
                      )}
                    </button>
                     <button
                      onClick={handleSummarize}
                      disabled={isLoading || !inputText.trim()}
                      className={`${buttonBaseClasses} ${summarizeButtonClasses}`}
                    >
                      {isLoading && loadingAction === 'summarize' ? (
                        <>
                          <LoaderIcon className="w-5 h-5 animate-spin" />
                          <span>Summarizing...</span>
                        </>
                      ) : (
                        'Summarize Text'
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <AccessibilityPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                  textToRead={activeText}
                  onTTSUse={() => { ttsUsedInSessionRef.current = true; }}
                  isSpeaking={isSpeaking}
                  voices={voices}
                  speak={speak}
                  cancel={cancel}
                />
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div className={`flex border-b ${settings.isHighContrast ? 'border-white' : 'border-slate-700'}`}>
                    <button onClick={() => setActiveOutput('simplified')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeOutput === 'simplified' ? (settings.isHighContrast ? 'border-b-2 border-yellow-300 text-white' : 'border-b-2 border-blue-400 text-white') : (settings.isHighContrast ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-200')}`}>
                        Simplified
                    </button>
                    <button onClick={() => setActiveOutput('summarized')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeOutput === 'summarized' ? (settings.isHighContrast ? 'border-b-2 border-yellow-300 text-white' : 'border-b-2 border-emerald-400 text-white') : (settings.isHighContrast ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-200')}`}>
                        Summarized
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyToClipboard}
                        disabled={!activeText.trim() || isLoading || isCopied}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${settings.isHighContrast ? 'bg-black border border-gray-400 text-gray-200 hover:bg-gray-700' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                        title="Copy to clipboard"
                        aria-label="Copy output text to clipboard"
                    >
                        {isCopied ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardCopyIcon className="w-5 h-5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                    <button
                      onClick={handleSaveToFile}
                      disabled={!activeText.trim() || isLoading}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${settings.isHighContrast ? 'bg-black border border-gray-400 text-gray-200 hover:bg-gray-700' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                      title="Save as .txt file"
                      aria-label="Save output text as a text file"
                    >
                      <DocumentDownloadIcon className="w-5 h-5" />
                      <span>Save</span>
                    </button>
                </div>
              </div>
              {error && (
                <div className={`p-4 rounded-lg mb-4 flex items-start gap-3 ${settings.isHighContrast ? 'bg-black border-l-4 border-red-500 text-white' : 'bg-rose-900/50 border-l-4 border-rose-500 text-rose-200'}`}>
                  <ErrorIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              <div className="flex-grow">
                <OutputArea
                    text={activeText}
                    settings={settings}
                    placeholderText={
                        activeOutput === 'simplified'
                            ? "The simplified text will appear here. Click 'Simplify Text' to generate it."
                            : "The summarized text will appear here. Click 'Summarize Text' to generate it."
                    }
                    isSpeaking={isSpeaking}
                    onReadAloud={handleReadAloud}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className={`text-center py-4 text-xs ${settings.isHighContrast ? 'text-gray-400' : 'text-slate-500'}`}>
        Powered by Google Gemini API
      </footer>
    </div>
  );
};