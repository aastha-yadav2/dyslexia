import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheckIcon, UserCircleIcon, SparklesIcon, CogIcon, TrophyIcon, FontIcon, FocusIcon, EyeIcon, MicrophoneIcon, TrashIcon } from '../components/icons';

// --- TYPES & HELPERS ---
interface Session {
    timestamp: number;
    duration: number;
    wordCount: number;
    settings: {
        isDyslexiaFont: boolean;
        isFocusMode: boolean;
        isHighContrast: boolean;
    };
    ttsUsed: boolean;
}

interface Metrics {
    sessions: Session[];
}

const timeAgo = (timestamp: number): string => {
    const now = new Date();
    const secondsPast = (now.getTime() - timestamp) / 1000;

    if (secondsPast < 60) return `${Math.round(secondsPast)}s ago`;
    if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
    if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;
    
    const day = new Date(timestamp);
    const daysPast = (now.getTime() - day.getTime()) / 86400000;
    
    if (daysPast < 7) return `${Math.round(daysPast)}d ago`;
    return day.toLocaleDateString();
};

// --- SUB-COMPONENTS ---

const UserInfoCard: React.FC = () => (
    <div className="bg-gradient-to-br from-blue-500 to-blue-400 p-6 rounded-xl text-white shadow-lg flex items-center gap-4">
        <UserCircleIcon className="w-16 h-16 flex-shrink-0" />
        <div>
            <h2 className="text-2xl font-bold">Welcome back, Alex!</h2>
            <p className="flex items-center gap-1.5 text-blue-100"><SparklesIcon className="w-4 h-4" /> You made reading easier today!</p>
        </div>
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number; color: string; icon: React.ReactNode }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div>
            <h4 className="text-sm font-bold text-slate-300 mb-3">Feature Usage</h4>
            <div className="flex justify-around items-end h-40 gap-3">
                {data.map(item => (
                    <div key={item.label} className="flex flex-col items-center flex-1 text-center w-1/5">
                        <div className="text-sm font-bold text-slate-200">{item.value}</div>
                        <div 
                            className={`w-full rounded-t-md transition-all duration-500 ease-out ${item.color}`} 
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={`${item.label}: ${item.value} uses`}
                        ></div>
                         <div className="mt-2 text-slate-400">{item.icon}</div>
                         <div className="text-xs text-slate-400 mt-1 truncate w-full">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AchievementBadge: React.FC<{ icon: React.ReactNode; title: string; achieved: boolean }> = ({ icon, title, achieved }) => (
    <div className={`text-center transition-opacity ${achieved ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-4 ${achieved ? 'bg-amber-100 border-amber-300' : 'bg-slate-700 border-slate-600'}`}>
            {icon}
        </div>
        <p className={`text-xs font-semibold mt-2 ${achieved ? 'text-amber-300' : 'text-slate-400'}`}>{title}</p>
    </div>
);

const ActivityItem: React.FC<{ session: Session }> = ({ session }) => (
    <div className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-md">
        <p className="text-sm text-slate-200">Simplified a text of <span className="font-bold">{session.wordCount} words</span>.</p>
        <p className="text-xs text-slate-400">{timeAgo(session.timestamp)}</p>
    </div>
);


export const DashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const [metrics, setMetrics] = useState<Metrics>({ sessions: [] });

    useEffect(() => {
        try {
            const storedMetrics = localStorage.getItem('includifyMetrics');
            if (storedMetrics) setMetrics(JSON.parse(storedMetrics));
        } catch (error) { console.error("Failed to parse metrics:", error); }
    }, []);

    const { stats, achievements, featureUsageData, recentActivity } = useMemo(() => {
        const sessions = metrics.sessions;
        if (sessions.length === 0) return { stats: null, achievements: [], featureUsageData: [], recentActivity: [] };

        const totalWords = sessions.reduce((acc, s) => acc + s.wordCount, 0);
        const focusTime = sessions.reduce((acc, s) => s.settings.isFocusMode ? acc + s.duration : acc, 0);
        
        const featureCounts = sessions.reduce((acc, s) => {
            acc.simplifyText += 1;
            if (s.ttsUsed) acc.tts += 1;
            if (s.settings.isDyslexiaFont) acc.dyslexiaFont += 1;
            if (s.settings.isFocusMode) acc.focusMode += 1;
            if (s.settings.isHighContrast) acc.highContrast += 1;
            return acc;
        }, { simplifyText: 0, tts: 0, dyslexiaFont: 0, focusMode: 0, highContrast: 0 });
        
        const calculatedAchievements = [
            { title: 'First Step', threshold: 1, icon: <TrophyIcon className="w-8 h-8 text-amber-500" /> },
            { title: '5 Texts Simplified', threshold: 5, icon: <TrophyIcon className="w-8 h-8 text-amber-500" /> },
            { title: '10 Texts Simplified', threshold: 10, icon: <TrophyIcon className="w-8 h-8 text-amber-500" /> },
            { title: 'First Focus Session', threshold: 1, customCheck: () => featureCounts.focusMode >= 1, icon: <FocusIcon className="w-8 h-8 text-amber-500" /> }
        ].map(a => ({ ...a, achieved: a.customCheck ? a.customCheck() : sessions.length >= a.threshold }));

        const calculatedFeatureUsage = [
            { label: 'Simplify', value: featureCounts.simplifyText, color: 'bg-blue-400', icon: <SparklesIcon className="w-5 h-5"/> },
            { label: 'TTS', value: featureCounts.tts, color: 'bg-blue-400', icon: <MicrophoneIcon className="w-5 h-5"/> },
            { label: 'Dyslexia Font', value: featureCounts.dyslexiaFont, color: 'bg-blue-400', icon: <FontIcon className="w-5 h-5"/> },
            { label: 'Focus Mode', value: featureCounts.focusMode, color: 'bg-blue-400', icon: <FocusIcon className="w-5 h-5"/> },
            { label: 'High Contrast', value: featureCounts.highContrast, color: 'bg-blue-400', icon: <EyeIcon className="w-5 h-5"/> },
        ];
        
        const calculatedRecentActivity = [...sessions].reverse().slice(0, 5);

        return {
            stats: { totalWords, focusTime: Math.round(focusTime / 60) },
            achievements: calculatedAchievements,
            featureUsageData: calculatedFeatureUsage,
            recentActivity: calculatedRecentActivity
        };
    }, [metrics]);
    
     const handleClearData = () => {
        if (window.confirm("Are you sure you want to reset all your local insights? This action cannot be undone.")) {
            localStorage.removeItem('includifyMetrics');
            setMetrics({ sessions: [] });
        }
    };


    return (
        <div className="container mx-auto px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold text-slate-100">Your Dashboard</h1>
                <p className="text-lg text-slate-300 mt-2 max-w-3xl">An overview of your reading habits and personalized accessibility recommendations.</p>
            </header>

            <div className="max-w-4xl mx-auto bg-amber-500/20 border-l-4 border-amber-400 p-4 rounded-lg flex items-center gap-4 mb-8">
                <ShieldCheckIcon className="w-8 h-8 text-amber-300 flex-shrink-0" />
                <div>
                    <h2 className="font-bold text-amber-200">Privacy-First Analytics</h2>
                    <p className="text-sm text-amber-300">All data shown here is stored exclusively on your device. We never collect or share your personal usage information.</p>
                </div>
            </div>

            {metrics.sessions.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 rounded-xl">
                    <h3 className="text-2xl font-bold text-slate-200">No data yet!</h3>
                    <p className="text-slate-400 mt-2 mb-6">Start using the app to see your personalized insights here.</p>
                    <button onClick={() => onNavigate('/demo')} className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        Try the Simplifier
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <UserInfoCard />
                        <div className="bg-slate-800 p-6 rounded-xl">
                            <BarChart data={featureUsageData} />
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-slate-100 mb-4">Progress Insights</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-blue-400">{stats?.totalWords.toLocaleString()}</p>
                                    <p className="text-sm text-slate-400">Total Words Simplified</p>
                                </div>
                                <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                                    <p className="text-3xl font-bold text-blue-400">{stats?.focusTime} min</p>
                                    <p className="text-sm text-slate-400">Time in Focus Mode</p>
                                </div>
                            </div>
                            <h4 className="text-sm font-bold text-slate-300 mb-4">Achievements</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {achievements.map(badge => <AchievementBadge key={badge.title} {...badge} />)}
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-slate-800 p-6 rounded-xl">
                             <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Activity</h3>
                             <div className="space-y-1">
                                {recentActivity.map(session => <ActivityItem key={session.timestamp} session={session} />)}
                             </div>
                        </div>
                         <div className="bg-slate-800 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-slate-100 mb-2">Settings</h3>
                            <p className="text-sm text-slate-400 mb-4">Quickly access and modify your accessibility preferences.</p>
                            <button onClick={() => onNavigate('/demo')} className="w-full flex items-center justify-center gap-2 bg-slate-700/50 text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600/50 transition-colors">
                                <CogIcon className="w-5 h-5"/>
                                Edit Preferences
                            </button>
                        </div>
                        <div className="text-center">
                           <button onClick={handleClearData} className="text-xs text-amber-400 hover:underline flex items-center gap-1.5 mx-auto">
                               <TrashIcon className="w-3 h-3" />
                               Reset All My Data
                           </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};