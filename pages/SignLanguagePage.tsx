import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LoaderIcon, PlayIcon, StopIcon, ArrowRightLeftIcon, CameraIcon, RecordCircleIcon, DocumentArrowUpIcon, SigningAvatarIcon, HandIcon, LightbulbIcon, SearchIcon, UsersIcon, UserCircleIcon, BookOpenIcon, CheckCircleIcon, TrophyIcon, ErrorIcon, MicrophoneIcon } from '../components/icons';
import { useTTS } from '../hooks/useTTS';
import { interpretSignLanguage, textToSign, getConversationResponse } from '../services/geminiService';
import { ApiKeyPrompt } from '../components/ApiKeyPrompt';

// FIX: Define types for the Web Speech API to resolve TypeScript errors.
// This is necessary when the DOM library for this API is not included in the project's tsconfig.
interface SpeechRecognitionEvent {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            }
        }
    }
}
interface SpeechRecognitionErrorEvent {
    error: string;
}
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


const SpeedButton: React.FC<{ onClick: () => void, isActive: boolean, children: React.ReactNode }> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${
            isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
        }`}
    >
        {children}
    </button>
);

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  innerRef?: React.Ref<HTMLButtonElement>;
  tabIndex?: number;
}> = ({ label, isActive, onClick, icon, innerRef, tabIndex }) => (
  <button
    ref={innerRef}
    tabIndex={tabIndex}
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-t-md ${
      isActive
        ? 'border-blue-400 text-blue-300 bg-slate-700/50'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
    }`}
    aria-selected={isActive}
    role="tab"
  >
    {icon}
    {label}
  </button>
);

const dictionaryData = [
    { word: 'Hello', category: 'Greetings', visual: '👋' },
    { word: 'Goodbye', category: 'Greetings', visual: '👋' },
    { word: 'Thank you', category: 'Greetings', visual: '🙏' },
    { word: 'Please', category: 'Greetings', visual: '🙏' },
    { word: 'Yes', category: 'Greetings', visual: '👍' },
    { word: 'No', category: 'Greetings', visual: '👎' },
    { word: 'Sorry', category: 'Feelings', visual: '😔' },
    { word: 'Happy', category: 'Feelings', visual: '😊' },
    { word: 'Sad', category: 'Feelings', visual: '😢' },
    { word: 'Love', category: 'Feelings', visual: '❤️' },
    { word: 'Angry', category: 'Feelings', visual: '😠' },
    { word: 'Scared', category: 'Feelings', visual: '😨' },
    { word: 'Help', category: 'Actions', visual: '🤝' },
    { word: 'Eat', category: 'Actions', visual: '🍔' },
    { word: 'Drink', category: 'Actions', visual: '🥤' },
    { word: 'Work', category: 'Actions', visual: '💼' },
    { word: 'Play', category: 'Actions', visual: '⚽' },
    { word: 'Read', category: 'Actions', visual: '📖' },
    { word: 'One', category: 'Numbers', visual: '1️⃣' },
    { word: 'Two', category: 'Numbers', visual: '2️⃣' },
    { word: 'Three', category: 'Numbers', visual: '3️⃣' },
    { word: 'Four', category: 'Numbers', visual: '4️⃣' },
    { word: 'Five', category: 'Numbers', visual: '5️⃣' },
    { word: 'What', category: 'Questions', visual: '❓' },
    { word: 'Why', category: 'Questions', visual: '❓' },
    { word: 'Where', category: 'Questions', visual: '📍' },
    { word: 'Who', category: 'Questions', visual: '👤' },
    { word: 'Home', category: 'Objects', visual: '🏠' },
    { word: 'Car', category: 'Objects', visual: '🚗' },
    { word: 'Book', category: 'Objects', visual: '📚' },
    { word: 'Phone', category: 'Objects', visual: '📱' },
];

const categories = ['All', 'Greetings', 'Feelings', 'Actions', 'Numbers', 'Questions', 'Objects'];

const tutorModules = [
  {
    title: 'Basics 101',
    lessons: [
      { 
        id: 1, 
        title: 'The Alphabet', 
        signs: 26, 
        completed: true,
        videos: [
            { title: "Indian Sign Language 101- Alphabet", creator: "Pragya Gupta", url: "https://www.youtube.com/watch?v=qcdivQfA41Y", description: "Basics of the alphabet in accessible format." },
            { title: "Alphabet (Indian Sign Language)", creator: "DEAF ENABLED FOUNDATION", url: "https://www.youtube.com/watch?v=Vj_13bdU4dU", description: "A reliable alternative/broader version of the alphabet." },
            { title: "How to Sign English Alphabet in Indian Sign Language", creator: "CADRRE", url: "https://www.youtube.com/watch?v=ExBuk-V5kN8", description: "Focuses on English alphabet version but using ISL, bilingual appeal." },
        ]
      },
      { 
        id: 2, 
        title: 'Numbers 1-10', 
        signs: 10, 
        completed: true,
        videos: [
            { title: "Indian Sign Language 101- Numbers", creator: "Pragya Gupta", url: "https://www.youtube.com/watch?v=vnH2BmcSRMA", description: "Learning numbers in ISL." },
            { title: "Counting with ISH Kids: Numbers 1-10", creator: "ISH Kids", url: "https://www.youtube.com/watch?v=ilpGSy6JdNA", description: "Kid-friendly format for numbers 1-10 in ISL." },
        ]
      },
      { id: 3, title: 'Common Greetings', signs: 8, completed: false, practice: [
          { word: 'Hello', visual: '👋', options: ['Hello', 'Goodbye', 'Please'] },
          { word: 'Thank you', visual: '🙏', options: ['Sorry', 'Thank you', 'Yes'] },
          { word: 'Goodbye', visual: '👋', options: ['No', 'Goodbye', 'Again'] },
          { word: 'Please', visual: '🙏', options: ['Help', 'Sorry', 'Please'] },
      ] },
    ],
  },
  {
    title: 'Conversation Starters',
    lessons: [
      { id: 4, title: 'Asking Questions', signs: 12, completed: false },
      { id: 5, title: 'Family & People', signs: 15, completed: false },
    ],
  },
] as const;


const CategoryFilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
            isActive ? 'bg-blue-500 text-white shadow' : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
        }`}
    >
        {label}
    </button>
);

const SignCard: React.FC<{ sign: { word: string; visual: string } }> = ({ sign }) => (
    <div className="bg-slate-800 p-4 rounded-lg text-center transform transition-transform hover:scale-105">
        <div className="text-5xl mb-3">{sign.visual}</div>
        <p className="font-semibold text-slate-100">{sign.word}</p>
    </div>
);

type ConversationMessage = {
    sender: 'user' | 'partner';
    text: string;
};

type Lesson = typeof tutorModules[number]['lessons'][number];
type PracticeLesson = Extract<Lesson, { practice: any }>;
type Mode = 'tutor' | 'text-to-sign' | 'sign-to-text' | 'conversation' | 'speech-to-sign';

const modes: { key: Mode; label: string; icon: React.ReactNode }[] = [
    { key: 'tutor', label: 'Tutor', icon: <BookOpenIcon className="w-5 h-5"/> },
    { key: 'text-to-sign', label: 'Text-to-Sign', icon: <ArrowRightLeftIcon className="w-5 h-5"/> },
    { key: 'speech-to-sign', label: 'Speech-to-Sign', icon: <MicrophoneIcon className="w-5 h-5"/> },
    { key: 'sign-to-text', label: 'Sign-to-Text', icon: <CameraIcon className="w-5 h-5"/> },
    { key: 'conversation', label: 'Conversation', icon: <UsersIcon className="w-5 h-5"/> }
];

export const SignLanguagePage: React.FC = () => {
    // Shared state
    const [mode, setMode] = useState<Mode>('tutor');
    const [hasApiKey, setHasApiKey] = useState(true);
    const { speak, cancel: cancelTTS } = useTTS();
    const [speed, setSpeed] = useState(1);

    // --- Text-to-Sign State ---
    const [text, setText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [signs, setSigns] = useState<{ word: string; visual: string; }[]>([]);
    const [currentSignIndex, setCurrentSignIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHands, setShowHands] = useState(true);
    const playbackTimeoutRef = useRef<number | null>(null);
    const [textToSignError, setTextToSignError] = useState<string | null>(null);

    // --- Speech-to-Sign State ---
    const [isListening, setIsListening] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [speechSigns, setSpeechSigns] = useState<{ word: string; visual: string }[]>([]);
    const [isSpeechProcessing, setIsSpeechProcessing] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [speechCurrentSignIndex, setSpeechCurrentSignIndex] = useState(0);
    const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
    const speechPlaybackTimeoutRef = useRef<number | null>(null);

    // --- Sign-to-Text State ---
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [interpretedText, setInterpretedText] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [signToTextError, setSignToTextError] = useState<string | null>(null);
    
    // --- Voice Navigation State ---
    const [isVoiceNavListening, setIsVoiceNavListening] = useState(false);
    const [voiceNavFeedback, setVoiceNavFeedback] = useState<string | null>(null);
    const voiceNavRecognitionRef = useRef<SpeechRecognition | null>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // --- Conversation State ---
    const [conversationLog, setConversationLog] = useState<ConversationMessage[]>([]);
    const [isInterpretingSign, setIsInterpretingSign] = useState(false);
    const [isPartnerReplying, setIsPartnerReplying] = useState(false);
    const [animatedSignText, setAnimatedSignText] = useState('');
    const [conversationError, setConversationError] = useState<string | null>(null);

    // --- Dictionary State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // --- Tutor State ---
    const [activeLesson, setActiveLesson] = useState<PracticeLesson | null>(null);
    const [practiceStep, setPracticeStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);

    const switchMode = (newMode: Mode) => {
        // Cleanup active states when switching modes to prevent conflicts
        if (isCameraOn) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStream(null);
            setIsCameraOn(false);
        }
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        // Stop any animations or TTS
        setIsPlaying(false);
        setIsSpeechPlaying(false);
        cancelTTS();
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        if (speechPlaybackTimeoutRef.current) clearTimeout(speechPlaybackTimeoutRef.current);

        if (newMode === 'conversation') {
            setConversationLog([]);
            setAnimatedSignText('');
            setConversationError(null);
        }
        
        setMode(newMode);
    };

    const handleTabKeyDown = (e: React.KeyboardEvent) => {
        const currentIndex = modes.findIndex(m => m.key === mode);
        let nextIndex = -1;

        if (e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % modes.length;
        } else if (e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + modes.length) % modes.length;
        }

        if (nextIndex !== -1) {
            e.preventDefault();
            const newMode = modes[nextIndex].key;
            switchMode(newMode);
            
            requestAnimationFrame(() => {
                tabRefs.current[nextIndex]?.focus();
            });
        }
    };

    // --- API Key Check ---
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
            setSignToTextError(null);
            setTextToSignError(null);
            setSpeechError(null);
            setConversationError(null);
        }
    }, []);

    // --- Speech Recognition Setup for Speech-to-Sign ---
    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition: SpeechRecognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                setTranscribedText(transcript);
                handleSpeechToSign(transcript);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setSpeechError(`Speech recognition error: ${event.error}. Please ensure microphone permissions are granted.`);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            setSpeechError('Speech recognition is not supported in this browser.');
        }
    }, []);
    
    // --- Voice Navigation Setup ---
    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition for navigation is not supported by this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            let feedback = "Command not recognized. Try 'Sign to Text' or 'Speech to Sign'.";

            if (transcript.includes('sign to text')) {
                switchMode('sign-to-text');
                feedback = "Switched to Sign-to-Text mode.";
            } else if (transcript.includes('speech to sign')) {
                switchMode('speech-to-sign');
                feedback = "Switched to Speech-to-Sign mode.";
            }
            
            setVoiceNavFeedback(feedback);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Voice navigation error:', event.error);
            setVoiceNavFeedback(`Error: ${event.error}. Please check microphone permissions.`);
            setIsVoiceNavListening(false);
        };
        
        recognition.onend = () => {
            setIsVoiceNavListening(false);
        };

        voiceNavRecognitionRef.current = recognition;
    }, []); // Empty array ensures this runs only once.

    // --- Text-to-Sign Handlers ---
    const handleTranslate = async () => {
        if (!text.trim()) return;

        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setHasApiKey(false);
            return;
        }

        setIsTranslating(true);
        setSigns([]);
        setCurrentSignIndex(0);
        setIsPlaying(false);
        setTextToSignError(null);
        cancelTTS();
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
        }

        try {
            const signObjects = await textToSign(text);
            setSigns(signObjects);
            setHasApiKey(true); // Success implies key is valid
            if (signObjects.length > 0) {
                setIsPlaying(true);
            }
        } catch (e) {
            if (e instanceof Error) {
                if (e.message.includes("API key is invalid or missing")) {
                    setHasApiKey(false);
                } else {
                    setTextToSignError(e.message);
                }
            } else {
                setTextToSignError('An unknown error occurred during translation.');
            }
        } finally {
            setIsTranslating(false);
        }
    };

    const togglePlay = () => {
        if (signs.length === 0) return;
        if (isPlaying) {
            setIsPlaying(false);
            cancelTTS();
        } else {
            if (currentSignIndex >= signs.length - 1 && signs.length > 0) {
                setCurrentSignIndex(0);
            }
            setIsPlaying(true);
        }
    };

    // --- Speech-to-Sign Handlers ---
    const handleToggleListening = async () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
                setHasApiKey(false);
                return;
            }
            setTranscribedText('');
            setSpeechSigns([]);
            setSpeechError(null);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };
    
    const handleSpeechToSign = async (textToConvert: string) => {
        if (!textToConvert.trim()) return;
        setIsSpeechProcessing(true);
        setSpeechSigns([]);
        setSpeechCurrentSignIndex(0);
        setIsSpeechPlaying(false);
        setSpeechError(null);
        try {
            const signObjects = await textToSign(textToConvert);
            setSpeechSigns(signObjects);
            if (signObjects.length > 0) {
                setIsSpeechPlaying(true);
            }
        } catch (e) {
            if (e instanceof Error) {
                if (e.message.includes("API key is invalid or missing")) {
                    setHasApiKey(false);
                } else {
                    setSpeechError(e.message);
                }
            } else {
                setSpeechError('An unknown error occurred during translation.');
            }
        } finally {
            setIsSpeechProcessing(false);
        }
    };

    const toggleSpeechPlay = () => {
        if (speechSigns.length === 0) return;
        if (isSpeechPlaying) {
            setIsSpeechPlaying(false);
            cancelTTS();
        } else {
            if (speechCurrentSignIndex >= speechSigns.length - 1 && speechSigns.length > 0) {
                setSpeechCurrentSignIndex(0);
            }
            setIsSpeechPlaying(true);
        }
    };

    // --- Sign-to-Text Handlers ---
    const handleToggleCamera = async () => {
        if (isCameraOn) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStream(null);
            setIsCameraOn(false);
        } else {
            if (videoRef.current) {
                videoRef.current.src = '';
                URL.revokeObjectURL(videoRef.current.src);
            }
            setVideoFile(null);
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                setIsCameraOn(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                alert("Could not access the webcam. Please ensure you have given the necessary permissions.");
            }
        }
    };
    
    const handleRecord = async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setHasApiKey(false);
            return;
        }

        setInterpretedText('');
        setSignToTextError(null);
        setIsProcessing(true);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');

            if (context) {
                // Flip the image horizontally for a mirror effect only if it's a live camera feed
                if (isCameraOn && !videoFile) {
                    context.translate(video.videoWidth, 0);
                    context.scale(-1, 1);
                }
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const base64Data = imageDataUrl.split(',')[1];

                const result = await interpretSignLanguage(base64Data);
                setInterpretedText(result);
                setHasApiKey(true);
            } else {
                throw new Error("Could not get canvas context to capture frame.");
            }
        } catch (e) {
            if (e instanceof Error) {
                if (e.message.includes("API key is invalid or missing")) {
                    setHasApiKey(false);
                } else {
                    setSignToTextError(e.message);
                }
            } else {
                setSignToTextError('An unexpected error occurred during interpretation.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setVideoFile(file);
            setInterpretedText('');
            setSignToTextError(null);

            if (isCameraOn && stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
                setIsCameraOn(false);
            }
            
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                const videoUrl = URL.createObjectURL(file);
                videoRef.current.src = videoUrl;
                // videoRef.current.onend = () => URL.revokeObjectURL(videoUrl); // This might revoke too early
            }
        }
    };
    
    // --- Conversation Handlers ---
    const triggerPartnerResponse = async (currentLog: ConversationMessage[]) => {
        setIsPartnerReplying(true);
        setConversationError(null);
        try {
            const aiResponse = await getConversationResponse(currentLog);
            const newLog = [...currentLog, { sender: 'partner', text: aiResponse }];
            setConversationLog(newLog);
            setAnimatedSignText(aiResponse);
        } catch (e) {
            if (e instanceof Error) {
                if (e.message.includes("API key is invalid or missing")) {
                    setHasApiKey(false);
                } else {
                    setConversationError(e.message);
                }
            } else {
                setConversationError("An AI partner error occurred.");
            }
        } finally {
            setIsPartnerReplying(false);
        }
    };

    const handleSendUserSign = async () => {
        if (!videoRef.current || !canvasRef.current || isInterpretingSign) return;

        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setHasApiKey(false);
            return;
        }

        setConversationError(null);
        setIsInterpretingSign(true);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            
            if (context) {
                context.translate(video.videoWidth, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const base64Data = imageDataUrl.split(',')[1];
                
                const result = await interpretSignLanguage(base64Data);
                const newLog = [...conversationLog, { sender: 'user', text: result }];
                setConversationLog(newLog);
                triggerPartnerResponse(newLog);

            } else {
                throw new Error("Could not get canvas context.");
            }
        } catch (e) {
            if (e instanceof Error) {
                 if (e.message.includes("API key is invalid or missing")) {
                    setHasApiKey(false);
                } else {
                    setConversationError(e.message);
                }
            } else {
                setConversationError("An unexpected error occurred during sign interpretation.");
            }
        } finally {
            setIsInterpretingSign(false);
        }
    };
    
    // --- Tutor Handlers ---
    const startLesson = (lesson: Lesson) => {
        if ('practice' in lesson && lesson.practice) {
            setActiveLesson(lesson as PracticeLesson);
            setPracticeStep(0);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            alert("This lesson is not yet available for practice.");
        }
    };
    
    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        setIsCorrect(answer === activeLesson?.practice[practiceStep].word);
    };

    const nextPracticeStep = () => {
        if (activeLesson && practiceStep < (activeLesson.practice.length - 1)) {
            setPracticeStep(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setActiveLesson(null);
        }
    };
    
    // --- Voice Navigation Handler ---
    const toggleVoiceNavListening = () => {
        if (!voiceNavRecognitionRef.current) return;

        if (isVoiceNavListening) {
            voiceNavRecognitionRef.current.stop();
        } else {
            try {
                // Stop the speech-to-sign listener if it's active to avoid conflict
                if (isListening) {
                    recognitionRef.current?.stop();
                }
                setVoiceNavFeedback("Listening...");
                voiceNavRecognitionRef.current.start();
                setIsVoiceNavListening(true);
            } catch (e) {
                console.error("Could not start voice navigation recognition:", e);
                setVoiceNavFeedback("Failed to start listening.");
                setIsVoiceNavListening(false);
            }
        }
    };

    // --- Effects ---
    useEffect(() => {
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
        }

        if (!isPlaying || signs.length === 0 || currentSignIndex >= signs.length) {
            if (currentSignIndex >= signs.length) {
                setIsPlaying(false);
            }
            return;
        }

        speak(signs[currentSignIndex].word, { lang: 'en-US' });

        playbackTimeoutRef.current = window.setTimeout(() => {
            setCurrentSignIndex(prev => prev + 1);
        }, 1200 / speed);

        return () => {
            if (playbackTimeoutRef.current) {
                clearTimeout(playbackTimeoutRef.current);
            }
        };
    }, [isPlaying, signs, speed, speak, currentSignIndex]);

    useEffect(() => {
        if (speechPlaybackTimeoutRef.current) clearTimeout(speechPlaybackTimeoutRef.current);
        if (!isSpeechPlaying || speechSigns.length === 0 || speechCurrentSignIndex >= speechSigns.length) {
            if (speechCurrentSignIndex >= speechSigns.length) setIsSpeechPlaying(false);
            return;
        }
        speak(speechSigns[speechCurrentSignIndex].word, { lang: 'en-US' });
        speechPlaybackTimeoutRef.current = window.setTimeout(() => {
            setSpeechCurrentSignIndex(prev => prev + 1);
        }, 1200 / speed);
        return () => {
            if (speechPlaybackTimeoutRef.current) clearTimeout(speechPlaybackTimeoutRef.current);
        };
    }, [isSpeechPlaying, speechSigns, speed, speak, speechCurrentSignIndex]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            recognitionRef.current?.stop();
            voiceNavRecognitionRef.current?.stop();
        };
    }, [stream]);

    const filteredSigns = useMemo(() => {
        return dictionaryData.filter(sign => {
            const categoryMatch = activeCategory === 'All' || sign.category === activeCategory;
            const searchMatch = sign.word.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [searchTerm, activeCategory]);

    const totalLessons = tutorModules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = tutorModules.reduce((acc, module) => acc + module.lessons.filter(l => l.completed).length, 0);
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    const signsLearned = tutorModules.reduce((acc, module) => {
        return acc + module.lessons.filter(l => l.completed).reduce((sum, lesson) => sum + lesson.signs, 0);
    }, 0);

    const VoiceNavFeedbackToast: React.FC<{ message: string; onClear: () => void }> = ({ message, onClear }) => {
        useEffect(() => {
            const timer = setTimeout(onClear, 4000);
            return () => clearTimeout(timer);
        }, [message, onClear]);

        return (
            <div className="fixed top-24 right-6 bg-slate-700 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 animate-fadeInUp z-50">
                <MicrophoneIcon className="w-5 h-5 text-blue-400" />
                <span>{message}</span>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-6 py-12">
            {voiceNavFeedback && <VoiceNavFeedbackToast message={voiceNavFeedback} onClear={() => setVoiceNavFeedback(null)} />}
            <canvas ref={canvasRef} className="hidden" />
            <section className="text-center py-16 relative">
                <h1 className="text-5xl font-extrabold text-blue-400 mb-4">🤟 Sign Language Assistant</h1>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                    An interactive AI toolkit for sign language communication and learning.
                </p>
                <button
                    onClick={toggleVoiceNavListening}
                    className={`absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                        isVoiceNavListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                    aria-label={isVoiceNavListening ? 'Stop voice navigation' : 'Start voice navigation for page modes'}
                    title="Navigate modes with your voice (e.g., 'Sign to Text')"
                >
                    <MicrophoneIcon className="w-5 h-5" />
                    {!isVoiceNavListening && <span>Voice Nav</span>}
                </button>
            </section>

            <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl shadow-lg">
                <div
                    role="tablist"
                    aria-label="Assistant mode"
                    className="flex"
                    onKeyDown={handleTabKeyDown}
                >
                    {modes.map((modeInfo, index) => (
                        <TabButton
                            key={modeInfo.key}
                            label={modeInfo.label}
                            icon={modeInfo.icon}
                            isActive={mode === modeInfo.key}
                            onClick={() => {
                              switchMode(modeInfo.key)
                              // Ensure focus moves to the clicked tab for keyboard users
                              setTimeout(() => tabRefs.current[index]?.focus(), 0)
                            }}
                            innerRef={el => tabRefs.current[index] = el}
                            tabIndex={mode === modeInfo.key ? 0 : -1}
                        />
                    ))}
                </div>

                {mode === 'tutor' && (
                  <div role="tabpanel" className="p-4 sm:p-6">
                    {activeLesson ? (
                        <div>
                            <button onClick={() => setActiveLesson(null)} className="text-sm font-semibold text-blue-400 hover:underline mb-4">
                                &larr; Back to All Lessons
                            </button>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">Practice: {activeLesson.title}</h2>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-6">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${((practiceStep + 1) / (activeLesson.practice.length ?? 1)) * 100}%` }}></div>
                            </div>
                            
                            <div className="bg-slate-700/50 p-8 rounded-xl text-center">
                                <p className="text-sm text-slate-400 mb-2">What sign is this?</p>
                                <div className="text-8xl mb-6">{activeLesson.practice[practiceStep].visual}</div>

                                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                    {activeLesson.practice[practiceStep].options.map(option => {
                                        const isSelected = selectedAnswer === option;
                                        const isTheCorrectAnswer = option === activeLesson.practice[practiceStep].word;
                                        let buttonClass = 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600';
                                        if (selectedAnswer) {
                                            if (isSelected && isCorrect) buttonClass = 'bg-green-500 border-green-600 text-white';
                                            else if (isSelected && !isCorrect) buttonClass = 'bg-rose-500 border-rose-600 text-white';
                                            else if (isTheCorrectAnswer) buttonClass = 'bg-green-500/30 border-green-500/50 text-green-200';
                                            else buttonClass = 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed';
                                        }
                                        
                                        return (
                                            <button 
                                                key={option} 
                                                onClick={() => handleAnswer(option)}
                                                disabled={!!selectedAnswer}
                                                className={`p-3 font-semibold border rounded-lg transition-all ${buttonClass}`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedAnswer && (
                                    <div className="mt-6">
                                        <button onClick={nextPracticeStep} className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700">
                                            {practiceStep < (activeLesson.practice.length - 1) ? 'Next' : 'Finish Lesson'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-3xl font-bold text-slate-100 text-center mb-8">Your Learning Journey</h2>
                             <div className="bg-slate-700/50 p-6 rounded-xl grid md:grid-cols-3 gap-6 items-center mb-8">
                                <div className="relative w-32 h-32 mx-auto">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path className="text-slate-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="text-blue-500" strokeWidth="3" strokeDasharray={`${progressPercentage}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-100">{progressPercentage}%</span>
                                        <span className="text-xs text-slate-400">Complete</span>
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-4xl font-bold text-slate-100">{signsLearned}</p>
                                    <p className="text-slate-400">Signs Learned</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-4xl font-bold text-slate-100">{completedLessons}/{totalLessons}</p>
                                    <p className="text-slate-400">Lessons Completed</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {tutorModules.map(module => (
                                    <div key={module.title}>
                                        <h3 className="text-xl font-bold text-slate-200 mb-3">{module.title}</h3>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {module.lessons.map(lesson => (
                                                <div key={lesson.id} className="bg-slate-700/50 p-4 rounded-lg flex flex-col">
                                                    <div>
                                                        <div className="flex items-start justify-between w-full mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    {lesson.completed ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <BookOpenIcon className="w-5 h-5 text-slate-400"/>}
                                                                    <p className="font-semibold text-slate-100">{lesson.title}</p>
                                                                </div>
                                                                <p className="text-sm text-slate-400 mt-1">{lesson.signs} signs</p>
                                                            </div>
                                                            {'practice' in lesson ? (
                                                                <button onClick={() => startLesson(lesson)} className={`font-semibold text-sm py-1.5 px-4 rounded-full ${lesson.completed ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                                                    {lesson.completed ? 'Review Quiz' : 'Start Quiz'}
                                                                </button>
                                                            ) : (
                                                                'videos' in lesson && (
                                                                    <button
                                                                        onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                                                                        className="font-semibold text-sm py-1.5 px-4 rounded-full bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
                                                                        aria-expanded={expandedLessonId === lesson.id}
                                                                    >
                                                                        {expandedLessonId === lesson.id ? 'Hide Videos' : 'View Videos'}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                        {expandedLessonId === lesson.id && 'videos' in lesson && (
                                                            <div className="mt-2 pt-3 border-t border-slate-700">
                                                                <h4 className="text-sm font-bold text-slate-300 mb-2">Practice Videos</h4>
                                                                <div className="space-y-2">
                                                                    {lesson.videos.map((video: any, index: number) => (
                                                                        <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="block text-sm p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                                                                            <span className="font-semibold text-blue-400">{video.title}</span>
                                                                            <span className="text-xs text-slate-400 block">by {video.creator}</span>
                                                                            <span className="text-xs text-slate-400 block mt-1"><em>Good for:</em> {video.description}</span>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                )}
                
                {mode === 'text-to-sign' && (
                    <div role="tabpanel" className="relative grid md:grid-cols-2 gap-8 items-start p-4">
                        {!hasApiKey && (
                            <div className="absolute inset-0 z-10">
                                <ApiKeyPrompt
                                    onSelectKey={handleSelectApiKey}
                                    message="To use the AI Sign Animator, please select a Google AI Studio API key."
                                />
                            </div>
                        )}
                        <div className="p-2">
                             <h2 className="text-2xl font-bold text-slate-100 mb-1">Enter Your Text</h2>
                             <p className="text-sm text-slate-400 mb-4">Type a message and our AI will generate a sign language animation.</p>
                            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500" placeholder="Type a sentence..."/>
                            {textToSignError && (
                                <div className="mt-2 text-sm text-rose-400 flex items-center gap-2">
                                    <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                                    <span>{textToSignError}</span>
                                </div>
                            )}
                            <button onClick={handleTranslate} disabled={isTranslating || !text.trim()} className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-600">
                                {isTranslating ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Translating...</> : <><ArrowRightLeftIcon className="w-5 h-5" /> Translate to Sign</>}
                            </button>
                        </div>
                        <div className="p-2 min-h-[300px] flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 mb-1">AI Sign Animator</h2>
                                <p className="text-sm text-slate-400 mb-4">An avatar will demonstrate the signs for your text.</p>
                                <div className="aspect-video bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
                                    {signs.length > 0 && currentSignIndex < signs.length ? (
                                        <div className="text-white">
                                            <div className="text-9xl mb-4 animate-pulse">{signs[currentSignIndex].visual}</div>
                                            <p className="text-3xl font-bold tracking-wider">{signs[currentSignIndex].word}</p>
                                            <p className="text-sm text-slate-400 mt-2">({currentSignIndex + 1} of {signs.length})</p>
                                        </div>
                                    ) : (
                                        <>
                                            <SigningAvatarIcon className="w-32 h-32 text-slate-600" />
                                            <p className="text-slate-500 mt-4">Animation will appear here.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Playback Controls</h3>
                                        <div className="flex items-center justify-between">
                                            <button onClick={togglePlay} disabled={signs.length === 0} className="flex items-center justify-center gap-2 w-28 px-4 py-2 rounded-lg text-white font-medium disabled:bg-slate-600 bg-blue-600 hover:bg-blue-700">
                                                {isPlaying ? <><StopIcon className="w-5 h-5" /> Pause</> : <><PlayIcon className="w-5 h-5" />{currentSignIndex >= signs.length - 1 && signs.length > 0 ? 'Replay' : 'Play'}</>}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Display Controls</h3>
                                         <button onClick={() => setShowHands(!showHands)} className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 font-medium transition-colors">
                                            <HandIcon className="w-5 h-5"/>
                                            <span>{showHands ? 'Hide Hands' : 'Show Hands'}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                     <h3 className="text-sm font-semibold text-slate-300 mb-2">Animation Speed</h3>
                                      <div className="flex items-center gap-2">
                                        <SpeedButton onClick={() => setSpeed(0.5)} isActive={speed === 0.5}>Slow</SpeedButton>
                                        <SpeedButton onClick={() => setSpeed(1)} isActive={speed === 1}>Normal</SpeedButton>
                                        <SpeedButton onClick={() => setSpeed(1.5)} isActive={speed === 1.5}>Fast</SpeedButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                 {mode === 'speech-to-sign' && (
                    <div role="tabpanel" className="relative grid md:grid-cols-2 gap-8 items-start p-4">
                        {!hasApiKey && (
                            <div className="absolute inset-0 z-10">
                                <ApiKeyPrompt
                                    onSelectKey={handleSelectApiKey}
                                    message="To use the Speech-to-Sign feature, please select a Google AI Studio API key."
                                />
                            </div>
                        )}
                        <div className="p-2 min-h-[400px] flex flex-col items-center justify-between text-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 mb-1">Speech Input</h2>
                                <p className="text-sm text-slate-400 mb-6">Click the microphone to start speaking.</p>
                            </div>
                            <button
                                onClick={handleToggleListening}
                                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-800 ${
                                    isListening ? 'bg-rose-500 text-white focus:ring-rose-400' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                            >
                                {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
                                <MicrophoneIcon className="w-10 h-10" />
                            </button>
                            <div className="mt-6 w-full bg-slate-700/50 p-3 rounded-lg min-h-[100px] text-left">
                                <p className="text-slate-400 text-sm mb-1 font-semibold">Transcribed Text:</p>
                                {isListening && !transcribedText && <p className="text-slate-300 animate-pulse">Listening...</p>}
                                <p className="text-slate-100">{transcribedText}</p>
                            </div>
                             {speechError && (
                                <div className="mt-2 text-sm text-rose-400 flex items-center gap-2">
                                    <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                                    <span>{speechError}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-2 min-h-[400px] flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 mb-1">AI Sign Animator</h2>
                                <p className="text-sm text-slate-400 mb-4">The sign language animation for your speech will appear here.</p>
                                <div className="aspect-video bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
                                    {isSpeechProcessing ? (
                                        <div className="text-center"><LoaderIcon className="w-8 h-8 mx-auto animate-spin text-blue-500" /><p className="mt-2 text-slate-400">Generating signs...</p></div>
                                    ) : speechSigns.length > 0 && speechCurrentSignIndex < speechSigns.length ? (
                                        <div className="text-white">
                                            <div className="text-9xl mb-4 animate-pulse">{speechSigns[speechCurrentSignIndex].visual}</div>
                                            <p className="text-3xl font-bold tracking-wider">{speechSigns[speechCurrentSignIndex].word}</p>
                                            <p className="text-sm text-slate-400 mt-2">({speechCurrentSignIndex + 1} of {speechSigns.length})</p>
                                        </div>
                                    ) : (
                                        <>
                                            <SigningAvatarIcon className="w-32 h-32 text-slate-600" />
                                            <p className="text-slate-500 mt-4">Speak to see animation.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-300">Playback Controls</h3>
                                    <button onClick={toggleSpeechPlay} disabled={speechSigns.length === 0} className="flex items-center justify-center gap-2 w-28 px-4 py-2 rounded-lg text-white font-medium disabled:bg-slate-600 bg-blue-600 hover:bg-blue-700">
                                        {isSpeechPlaying ? <><StopIcon className="w-5 h-5" /> Pause</> : <><PlayIcon className="w-5 h-5" /> {speechCurrentSignIndex >= speechSigns.length - 1 && speechSigns.length > 0 ? 'Replay' : 'Play'}</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {mode === 'sign-to-text' && (
                    <div role="tabpanel" className="relative grid md:grid-cols-2 gap-8 items-start p-4">
                        {!hasApiKey && (
                            <div className="absolute inset-0 z-10">
                                <ApiKeyPrompt
                                    onSelectKey={handleSelectApiKey}
                                    message="To use the AI Sign Interpreter, please select a Google AI Studio API key."
                                />
                            </div>
                        )}
                        <div className="p-2">
                            <h2 className="text-2xl font-bold text-slate-100 mb-1">Video Input</h2>
                            <p className="text-sm text-slate-400 mb-4">Use your webcam or upload a video for the AI to interpret.</p>
                            <div className="aspect-video bg-slate-700/50 rounded-lg flex items-center justify-center text-center p-0 relative overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted={isCameraOn}
                                    className={`w-full h-full object-cover ${!videoFile && isCameraOn ? 'transform -scale-x-100' : ''} ${isCameraOn || videoFile ? 'block' : 'hidden'}`}
                                />
                                {!isCameraOn && !videoFile && (
                                    <div className="p-4">
                                        <p className="text-slate-500">Enable camera or upload a file.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button onClick={handleToggleCamera} className={`w-full flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors ${isCameraOn ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    <CameraIcon className="w-5 h-5"/> {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                                </button>
                                <button onClick={handleRecord} disabled={(!isCameraOn && !videoFile) || isProcessing} className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-600 disabled:bg-slate-600">
                                    <RecordCircleIcon className="w-5 h-5"/> Record Sign
                                </button>
                            </div>
                             <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700"></span></div>
                                <div className="relative flex justify-center text-sm"><span className="bg-slate-800 px-2 text-slate-400">OR</span></div>
                            </div>
                             <label htmlFor="video-upload" className="cursor-pointer w-full flex items-center justify-center gap-2 bg-slate-700 border border-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600">
                                <DocumentArrowUpIcon className="w-5 h-5" />
                                <span>Upload a Video</span>
                                <input id="video-upload" type="file" className="sr-only" onChange={(e) => handleFileUpload(e.target.files)} accept="video/*" />
                            </label>
                            {videoFile && <p className="text-sm text-slate-300 mt-2 text-center">Selected: <span className="font-medium">{videoFile.name}</span></p>}
                            <div className="mt-6 bg-sky-500/10 border border-sky-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <LightbulbIcon className="w-6 h-6 text-sky-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sky-200">Recording Tips for Best Results</h3>
                                        <ul className="mt-2 list-disc list-inside text-sm text-slate-300 space-y-1">
                                            <li><span className="font-medium">Good Lighting:</span> Ensure your face and hands are well-lit.</li>
                                            <li><span className="font-medium">Simple Background:</span> Use a plain background so the AI can focus on you.</li>
                                            <li><span className="font-medium">Clear Framing:</span> Keep your hands, arms, and face clearly within the video frame.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div className="p-2 min-h-[400px]">
                            <h2 className="text-2xl font-bold text-slate-100 mb-4">Interpreted Text</h2>
                            {signToTextError && (
                                <div className="bg-rose-900/50 border-l-4 border-rose-500 text-rose-200 p-4 rounded-lg mb-4 flex items-start gap-3">
                                <ErrorIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Error</p>
                                    <p>{signToTextError}</p>
                                </div>
                                </div>
                            )}
                            <div className="bg-slate-700/50 p-4 rounded-lg h-full min-h-[250px] flex items-center justify-center text-slate-200">
                                {isProcessing ? (
                                    <div className="text-center">
                                        <LoaderIcon className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                                        <p className="mt-2 text-slate-400">AI is interpreting...</p>
                                    </div>
                                ) : interpretedText ? (
                                    <p className="text-lg leading-relaxed">{interpretedText}</p>
                                ) : (
                                    <p className="text-slate-400 text-center">The interpreted text from your video will appear here.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {mode === 'conversation' && (
                    <div role="tabpanel" className="relative p-4">
                        {!hasApiKey && (
                            <div className="absolute inset-0 z-20">
                                <ApiKeyPrompt
                                    onSelectKey={handleSelectApiKey}
                                    message="To use the AI Conversation mode, please select a Google AI Studio API key."
                                />
                            </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Left Panel: Signing User */}
                            <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col">
                                <h3 className="font-bold text-lg text-slate-100 mb-2">You (Signing)</h3>
                                <div className={`aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-0 relative overflow-hidden transition-all duration-300 ${isInterpretingSign ? 'glowing-border' : ''}`}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover transform -scale-x-100 ${isCameraOn ? 'block' : 'hidden'}`}
                                    />
                                    {!isCameraOn && (
                                        <div className="p-4">
                                            <CameraIcon className="w-16 h-16 text-slate-600"/>
                                            <p className="text-slate-400 mt-2">Webcam is off</p>
                                        </div>
                                    )}
                                    {isInterpretingSign && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                            <LoaderIcon className="w-8 h-8 animate-spin" />
                                            <p className="font-semibold mt-2">Interpreting...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <button onClick={handleToggleCamera} className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white font-semibold py-2 rounded-lg hover:bg-slate-600">
                                        <CameraIcon className="w-5 h-5"/> {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                                    </button>
                                    <button onClick={handleSendUserSign} disabled={!isCameraOn || isInterpretingSign || isPartnerReplying} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                        Send My Sign
                                    </button>
                                </div>
                            </div>
                            {/* Right Panel: AI Partner */}
                            <div className="bg-slate-700/50 p-4 flex flex-col rounded-lg">
                                <h3 className="font-bold text-lg text-slate-100 mb-2">AI Partner (Text)</h3>
                                <div className="aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-4">
                                    <SigningAvatarIcon className="w-24 h-24 text-blue-400"/>
                                    <p className="text-white mt-2 font-semibold truncate max-w-full px-2">{animatedSignText || "Animator View"}</p>
                                </div>
                                <div className="mt-3 flex-grow flex flex-col justify-center items-center">
                                    <p className="text-slate-400 text-sm">The AI partner will respond here.</p>
                                </div>
                            </div>
                        </div>

                        {/* Conversation Transcript */}
                        <div className="mt-4">
                            <h3 className="font-bold text-lg text-slate-100 mb-3 text-center">Conversation Transcript</h3>
                             {conversationError && (
                                <div className="bg-rose-900/50 border border-rose-500/50 text-rose-200 p-3 rounded-lg mb-2 text-sm flex items-center gap-2">
                                    <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                                    <span>{conversationError}</span>
                                </div>
                            )}
                            <div className="bg-slate-700/50 p-4 rounded-lg h-64 overflow-y-auto space-y-4">
                                {conversationLog.length === 0 && !isPartnerReplying ? (
                                    <p className="text-center text-slate-400 pt-20">Conversation will appear here.</p>
                                ) : (
                                    conversationLog.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'partner' ? 'justify-end' : ''}`}>
                                            {msg.sender === 'user' && <UserCircleIcon className="w-8 h-8 text-slate-400 flex-shrink-0"/>}
                                            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-slate-600 text-slate-100' : 'bg-blue-600 text-white'}`}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                            {msg.sender === 'partner' && <SigningAvatarIcon className="w-8 h-8 text-slate-400 flex-shrink-0"/>}
                                        </div>
                                    ))
                                )}
                                {isPartnerReplying && (
                                    <div className="flex items-start gap-3 justify-end">
                                        <div className="flex items-center gap-1 p-3 rounded-lg bg-blue-600">
                                            <span className="typing-bubble w-2 h-2 bg-white rounded-full"></span>
                                            <span className="typing-bubble w-2 h-2 bg-white rounded-full"></span>
                                            <span className="typing-bubble w-2 h-2 bg-white rounded-full"></span>
                                        </div>
                                        <SigningAvatarIcon className="w-8 h-8 text-slate-400 flex-shrink-0"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <section className="my-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-slate-100">Sign Language Dictionary</h2>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                        Search our visual library of common signs. We support various regional languages including American Sign Language (ASL), British Sign Language (BSL), and Indian Sign Language (ISL).
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for a sign (e.g., 'Hello')"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-full focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex justify-center flex-wrap gap-2">
                             {categories.map(category => (
                                <CategoryFilterButton
                                    key={category}
                                    label={category}
                                    isActive={activeCategory === category}
                                    onClick={() => setActiveCategory(category)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Signs Grid */}
                    {filteredSigns.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredSigns.map(sign => (
                                <SignCard key={sign.word} sign={sign} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16 bg-slate-800 rounded-lg">
                            <p className="text-slate-400 font-semibold">No signs found.</p>
                            <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};