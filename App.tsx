import React, { useState, useCallback, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from './services/firebase';
import { LandingPage } from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { AboutPage } from './pages/AboutPage';
import { MainApp } from './pages/MainApp';
import Layout from './components/Layout';
import { FeaturesPage } from './pages/FeaturesPage';
import { DashboardPage } from './pages/DashboardPage';
import { CommunityPage } from './pages/CommunityPage';
import { SignLanguagePage } from './pages/SignLanguagePage';
import { AccessibilityCheckerPage } from './pages/AccessibilityCheckerPage';
import { HomePage } from './pages/HomePage';
import { SimplificationDemoPage } from './pages/demos/SimplificationDemoPage';
import { TTSDemoPage } from './pages/demos/TTSDemoPage';
import { DyslexiaFontDemoPage } from './pages/demos/DyslexiaFontDemoPage';
import { ContrastDemoPage } from './pages/demos/ContrastDemoPage';
import { FocusModeDemoPage } from './pages/demos/FocusModeDemoPage';
import { LineSpacingDemoPage } from './pages/demos/LineSpacingDemoPage';
import { MultilingualDemoPage } from './pages/demos/MultilingualDemoPage';
import { MicrophoneIcon, CheckCircleIcon } from './components/icons';

// Firebase User state type
type FirebaseUser = User | null;

// Voice recognition interfaces
interface SpeechRecognitionEvent {
  results: { [key: number]: { [key: number]: { transcript: string } } };
}
interface SpeechRecognitionErrorEvent { error: string; }
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

const FeedbackToast: React.FC<{ message: string; onClear: () => void }> = ({ message, onClear }) => {
  useEffect(() => {
    const timer = setTimeout(onClear, 3000);
    return () => clearTimeout(timer);
  }, [onClear]);

  return (
    <div className="fixed bottom-24 right-6 bg-emerald-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 animate-fadeInUp z-50">
      <CheckCircleIcon className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.pathname);
  const [user, setUser] = useState<FirebaseUser>(null);

  // Voice Control State
  const [isListening, setIsListening] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleNavigation = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    window.scrollTo(0, 0);
  }, []);

  // --- Firebase Auth State Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser && route === '/app') {
        handleNavigation('/signin');
      }
    });
    return () => unsubscribe();
  }, [route, handleNavigation]);

  // --- Voice Commands ---
  const processVoiceCommand = useCallback((command: string) => {
    const commands: { [key: string]: { path: string; feedback: string; keywords: string[] } } = {
      home: { path: '/', feedback: 'Navigating to Home...', keywords: ['go home', 'open home'] },
      features: { path: '/features', feedback: 'Opening Features...', keywords: ['show features', 'open features'] },
      dashboard: { path: '/dashboard', feedback: 'Navigating to Dashboard...', keywords: ['go to dashboard', 'open dashboard'] },
      about: { path: '/about', feedback: 'Opening About page...', keywords: ['open about', 'show about'] },
      community: { path: '/community', feedback: 'Opening Community Hub...', keywords: ['open community', 'go to community'] },
      signLanguage: { path: '/sign-language', feedback: 'Opening Sign Assistant...', keywords: ['open sign assistant', 'open sign language'] },
      checker: { path: '/accessibility-checker', feedback: 'Opening Accessibility Checker...', keywords: ['open accessibility checker', 'run accessibility'] },
      demo: { path: '/demo', feedback: 'Opening the main demo...', keywords: ['try the demo', 'open demo', 'open main demo'] },
      // Feature demo pages
      simplificationDemo: { path: '/features/simplification', feedback: 'Opening Simplification Demo...', keywords: ['open simplification demo', 'show simplification'] },
      ttsDemo: { path: '/features/tts', feedback: 'Opening Text-to-Speech Demo...', keywords: ['open text to speech demo', 'show text to speech', 'open tts demo'] },
      dyslexiaFontDemo: { path: '/features/dyslexia-font', feedback: 'Opening Dyslexia Font Demo...', keywords: ['open dyslexia font demo', 'show dyslexia font'] },
      contrastDemo: { path: '/features/contrast', feedback: 'Opening Contrast Demo...', keywords: ['open contrast demo', 'show contrast demo'] },
      focusModeDemo: { path: '/features/focus-mode', feedback: 'Opening Focus Mode Demo...', keywords: ['open focus mode demo', 'show focus mode'] },
      lineSpacingDemo: { path: '/features/line-spacing', feedback: 'Opening Line Spacing Demo...', keywords: ['open line spacing demo', 'show line spacing'] },
      multilingualDemo: { path: '/features/multilingual', feedback: 'Opening Multilingual Demo...', keywords: ['open multilingual demo', 'show multilingual'] },
    };

    for (const key in commands) {
      if (commands[key].keywords.some(c => command.includes(c))) {
        handleNavigation(commands[key].path);
        setFeedbackMessage(commands[key].feedback);
        break;
      }
    }
  }, [handleNavigation]);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript.toLowerCase().trim());
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setFeedbackMessage(event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice command error.');
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [processVoiceCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleNavigation('/app');
    } catch (e: any) {
      alert(`Sign in failed: ${e.message}`);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      handleNavigation('/app');
    } catch (e: any) {
      alert(`Sign up failed: ${e.message}`);
    }
  };

  const renderPage = () => {
    if (user && (route === '/app' || route === '/demo')) return <MainApp onNavigate={handleNavigation} isDemo={route === '/demo'} />;

    switch (route) {
      case '/signin':
        return <SignInPage onSignIn={handleSignIn} onNavigateToSignUp={() => handleNavigation('/signup')} onNavigateToAbout={() => handleNavigation('/about')} onNavigateToHome={() => handleNavigation('/')} />;
      case '/signup':
        return <SignUpPage onSignUp={handleSignUp} onNavigateToSignIn={() => handleNavigation('/signin')} onNavigateToAbout={() => handleNavigation('/about')} onNavigateToHome={() => handleNavigation('/')} />;
      case '/about': return <AboutPage />;
      case '/features': return <FeaturesPage onNavigate={handleNavigation} />;
      case '/features/simplification': return <SimplificationDemoPage onNavigate={handleNavigation} />;
      case '/features/tts': return <TTSDemoPage onNavigate={handleNavigation} />;
      case '/features/dyslexia-font': return <DyslexiaFontDemoPage onNavigate={handleNavigation} />;
      case '/features/contrast': return <ContrastDemoPage onNavigate={handleNavigation} />;
      case '/features/focus-mode': return <FocusModeDemoPage onNavigate={handleNavigation} />;
      case '/features/line-spacing': return <LineSpacingDemoPage onNavigate={handleNavigation} />;
      case '/features/multilingual': return <MultilingualDemoPage onNavigate={handleNavigation} />;
      case '/dashboard': return <DashboardPage onNavigate={handleNavigation} />;
      case '/community': return <CommunityPage />;
      case '/sign-language': return <SignLanguagePage />;
      case '/accessibility-checker': return <AccessibilityCheckerPage />;
      case '/home':
      case '/':
      default: return <HomePage onNavigate={handleNavigation} />;
    }
  };

  const pagesWithoutGlobalLayout = ['/signin', '/signup', '/app', '/demo'];
  const currentPage = renderPage();
  const mainContent = pagesWithoutGlobalLayout.includes(route)
    ? <div className="min-h-screen font-sans antialiased">{currentPage}</div>
    : <Layout onNavigate={handleNavigation} onNavigateToSignIn={() => handleNavigation('/signin')} onNavigateToSignUp={() => handleNavigation('/signup')}>{currentPage}</Layout>;

  return (
    <div className="min-h-screen font-sans antialiased">
      {mainContent}
      {feedbackMessage && <FeedbackToast message={feedbackMessage} onClear={() => setFeedbackMessage(null)} />}
      <button
        onClick={toggleListening}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg transition-colors z-50 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-900 ${isListening ? 'bg-rose-500 animate-pulse focus:ring-rose-400' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}`}
        aria-label={isListening ? 'Stop voice control' : 'Activate voice control'}
        aria-pressed={isListening}
      >
        <MicrophoneIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

export default App;
