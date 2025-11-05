import React, { useState } from 'react';
import { 
    LoaderIcon, ErrorIcon, GlobeAltIcon, DocumentArrowUpIcon, 
    CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, 
    DocumentDownloadIcon, FilterIcon, EyeIcon, KeyboardIcon
} from '../components/icons';

// --- TYPES ---
type IssueSeverity = 'critical' | 'serious' | 'moderate' | 'pass';
interface Issue {
    id: number;
    severity: IssueSeverity;
    title: string;
    location: string;
    fix: string;
}

// NEW: Add types for new report sections
interface ContrastSimulationData {
    protanopia: { imageUrl: string; summary: string; };
    deuteranopia: { imageUrl: string; summary: string; };
    tritanopia: { imageUrl: string; summary: string; };
}

interface KeyboardNavigationCheck {
    element: string;
    status: 'pass' | 'fail';
    notes: string;
}

interface KeyboardNavigationReport {
    summary: string;
    checks: KeyboardNavigationCheck[];
}

interface Report {
    score: number;
    issues: Issue[];
    recommendations: string[];
    // NEW properties
    contrastSimulations: ContrastSimulationData;
    keyboardNavigation: KeyboardNavigationReport;
}


// --- MOCK DATA ---
const mockReportData: Report = {
    score: 78,
    issues: [
        { id: 1, severity: 'critical', title: 'Image missing alternative text', location: '<img> on line 42', fix: 'Add an `alt` attribute that describes the image content, or `alt=""` if it is decorative.' },
        { id: 2, severity: 'critical', title: 'Button does not have an accessible name', location: '<button> on line 101', fix: 'Provide text content or an `aria-label` for the button.' },
        { id: 3, severity: 'serious', title: 'Color contrast is insufficient', location: '.footer-link on line 256', fix: 'Increase the text color lightness or background color darkness to meet the WCAG AA ratio of 4.5:1.' },
        { id: 4, severity: 'serious', title: 'Heading levels skip from <h1> to <h3>', location: '<h3> on line 88', fix: 'Use an <h2> to maintain a logical heading structure.' },
        { id: 5, severity: 'moderate', title: 'Link text could be more descriptive', location: '<a> on line 112 with text "Click Here"', fix: 'Change link text to describe its destination, like "Read more about our services".' },
        { id: 6, severity: 'pass', title: 'All form elements have corresponding labels', location: '<form> on line 95', fix: 'No action needed.' },
        { id: 7, severity: 'pass', title: 'Page has a valid language attribute', location: '<html> tag', fix: 'No action needed.' },
    ],
    recommendations: [
        'Review all images for descriptive alt text.',
        'Manually test keyboard navigation to ensure all interactive elements are reachable.',
        'Audit the color palette to ensure all text meets WCAG AA contrast standards.'
    ],
    // NEW data
    contrastSimulations: {
        protanopia: {
            imageUrl: 'https://i.postimg.cc/k40f0ZkC/contrast-protanopia.png',
            summary: 'Reds and greens appear muted. Text on red backgrounds may have low contrast.'
        },
        deuteranopia: {
            imageUrl: 'https://i.postimg.cc/pT4D7pQJ/contrast-deuteranopia.png',
            summary: 'Similar to Protanopia, with difficulty distinguishing red and green hues.'
        },
        tritanopia: {
            imageUrl: 'https://i.postimg.cc/W3dKjMdB/contrast-tritanopia.png',
            summary: 'Blues and yellows are hard to differentiate. Blue links may be difficult to see.'
        }
    },
    keyboardNavigation: {
        summary: 'Most elements are navigable, but a critical dropdown menu is not keyboard-accessible, which can block users from key site functions.',
        checks: [
            { element: 'Main Navigation Links', status: 'pass', notes: 'All main links are focusable and have clear focus indicators.' },
            { element: 'Dropdown Menu ".user-profile"', status: 'fail', notes: 'Menu cannot be opened using Enter/Space key and items are not reachable via Tab.' },
            { element: 'Form Input Fields', status: 'pass', notes: 'All inputs are reachable and have associated labels.' },
            { element: 'Modal Dialog Close Button', status: 'fail', notes: 'Focus is not trapped within the modal, and the close button is skipped in the tab order.' },
        ]
    }
};


// --- SUB-COMPONENTS ---

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 90 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                <circle
                    className={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${color}`}>
                <span className="text-4xl font-extrabold">{score}</span>
                <span className="text-sm font-semibold">Score</span>
            </div>
        </div>
    );
};

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const severityMap: { [key in IssueSeverity]: { icon: React.ReactNode; border: string; bg: string } } = {
        critical: { icon: <XCircleIcon className="w-5 h-5 text-rose-400" />, border: 'border-rose-500', bg: 'bg-rose-500/10' },
        serious: { icon: <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />, border: 'border-amber-500', bg: 'bg-amber-500/10' },
        moderate: { icon: <ErrorIcon className="w-5 h-5 text-sky-400" />, border: 'border-sky-500', bg: 'bg-sky-500/10' },
        pass: { icon: <CheckCircleIcon className="w-5 h-5 text-emerald-400" />, border: 'border-emerald-500', bg: 'bg-emerald-500/10' },
    };
    
    const { icon, border, bg } = severityMap[issue.severity];

    return (
        <div className={`border-l-4 p-4 rounded-r-lg ${border} ${bg}`}>
            <button className="w-full text-left" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h4 className="font-semibold text-slate-100">{issue.title}</h4>
                    </div>
                    <span className={`transform transition-transform duration-200 text-slate-400 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                </div>
            </button>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm">
                    <p><strong className="text-slate-400">Location:</strong> <code className="bg-slate-700 px-1 py-0.5 rounded text-slate-200">{issue.location}</code></p>
                    <p><strong className="text-slate-400">Suggested Fix:</strong> <span className="text-slate-300">{issue.fix}</span></p>
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
export const AccessibilityCheckerPage: React.FC = () => {
    const [inputType, setInputType] = useState<'url' | 'file'>('url');
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<Report | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analyzedTarget, setAnalyzedTarget] = useState<string>('');
    const [filter, setFilter] = useState<IssueSeverity | 'all'>('all');

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        let target = '';
        if (inputType === 'url') {
            if (!url.trim()) return;
            try {
                // Validate URL format
                new URL(url);
                target = url;
            } catch (_) {
                setError("Please enter a valid URL (e.g., https://example.com).");
                return;
            }
        } else {
            if (!selectedFile) return;
            target = selectedFile.name;
        }

        setAnalyzedTarget(target);
        setIsLoading(true);
        setReport(null);
        setError(null);
        
        setTimeout(() => {
            if (target.includes('error.com')) {
                setError('Could not analyze the provided URL. Please check if it is correct and publicly accessible.');
            } else {
                setReport(mockReportData);
            }
            setIsLoading(false);
        }, 2500);
    };

    const downloadReport = () => {
        if (!report) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `accessibility-report-${analyzedTarget.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        link.click();
    };
    
    const canSubmit = (inputType === 'url' && url.trim() !== '') || (inputType === 'file' && selectedFile !== null);

    const filteredIssues = report?.issues.filter(issue => filter === 'all' || issue.severity === filter) || [];

    const issueCounts = report?.issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
    }, {} as Record<IssueSeverity, number>) || {};

    return (
        <div className="container mx-auto px-6 py-12">
            <section className="text-center py-16">
                <h1 className="text-5xl font-extrabold text-blue-400 mb-4">Accessibility Scanner</h1>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                    Get a comprehensive, AI-driven accessibility health check for any website or document.
                </p>
            </section>
            
            <section className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setInputType('url')} className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${inputType === 'url' ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'}`}>
                        <GlobeAltIcon className="w-6 h-6" />
                        <span className="font-semibold">Analyze by URL</span>
                    </button>
                    <button onClick={() => setInputType('file')} className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${inputType === 'file' ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'}`}>
                        <DocumentArrowUpIcon className="w-6 h-6" />
                        <span className="font-semibold">Analyze by File</span>
                    </button>
                </div>

                <form onSubmit={handleCheck}>
                    {inputType === 'url' ? (
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setSelectedFile(null); setError(null); }}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    ) : (
                        <label htmlFor="file-upload" className="cursor-pointer w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors">
                            <DocumentArrowUpIcon className="w-10 h-10 text-slate-400 mb-2" />
                            <span className="font-semibold text-blue-400">
                                {selectedFile ? 'Change file' : 'Choose a file'}
                            </span>
                             <span className="text-sm text-slate-400 mt-1">{selectedFile ? selectedFile.name : 'or drag and drop'}</span>
                            <input id="file-upload" type="file" className="sr-only" onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setUrl(''); setError(null); }} />
                        </label>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || !canSubmit}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading && <LoaderIcon className="animate-spin w-5 h-5"/>}
                        <span>{isLoading ? 'Analyzing...' : 'Run Analysis'}</span>
                    </button>
                </form>
            </section>

            {error && (
                 <div className="max-w-3xl mx-auto mt-8 bg-rose-500/20 border-l-4 border-rose-500 text-rose-200 p-4 rounded-lg flex items-start gap-3">
                    <ErrorIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Analysis Failed</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            
            {isLoading && (
                 <div className="text-center py-16">
                    <LoaderIcon className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
                    <p className="mt-4 text-slate-300 font-semibold">Scanning your content... this may take a moment.</p>
                </div>
            )}
            
            {report && (
                <section className="max-w-5xl mx-auto mt-12 bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-700">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-100">Accessibility Report</h2>
                            <p className="text-slate-400 mt-1">For: <span className="font-semibold text-blue-400 break-all">{analyzedTarget}</span></p>
                        </div>
                         <button onClick={downloadReport} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors">
                            <DocumentDownloadIcon className="w-5 h-5" />
                            Download Report
                        </button>
                    </header>
                    
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 flex flex-col items-center text-center">
                            <h3 className="text-lg font-bold text-slate-200 mb-4">Overall Score</h3>
                            <ScoreCircle score={report.score} />
                            <p className="text-sm text-slate-400 mt-4 max-w-xs">This score is an automated estimate based on common accessibility issues.</p>
                        </div>

                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-bold text-slate-200 mb-4">High-Level Recommendations</h3>
                            <ul className="space-y-2">
                                {report.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-200">{rec}</span>
                                    </li>
                                ))}
                            </ul>

                             <div className="mt-8">
                                <h3 className="text-lg font-bold text-slate-200 mb-4">Detailed Issues ({report.issues.length})</h3>
                                <div className="border-b border-slate-700 mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(['all', 'critical', 'serious', 'moderate'] as const).map(f => {
                                            const count = f === 'all' ? report.issues.length : (issueCounts[f as IssueSeverity] || 0);
                                            if (count === 0 && f !== 'all') return null;
                                            return (
                                                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 ${filter === f ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                                                    {f.charAt(0).toUpperCase() + f.slice(1)} <span className="text-xs font-normal opacity-75">{count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {filteredIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-700">
                        <h3 className="text-xl font-bold text-slate-100 text-center mb-6">Detailed Analysis</h3>
                        <div className="space-y-6">
                            {/* Contrast Simulation Report */}
                            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <EyeIcon className="w-6 h-6 text-blue-400" />
                                    <h4 className="font-semibold text-slate-100 text-lg">Contrast Simulation Report</h4>
                                </div>
                                <p className="text-sm text-slate-300 mb-4">
                                    This simulation shows how your page might appear to users with different types of color vision deficiencies.
                                </p>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <h5 className="font-bold text-slate-200 mb-2">Protanopia (Red-Blind)</h5>
                                        <img src={report.contrastSimulations.protanopia.imageUrl} alt="Simulation for Protanopia" className="rounded-lg border-2 border-slate-600 mb-2"/>
                                        <p className="text-xs text-slate-400">{report.contrastSimulations.protanopia.summary}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-200 mb-2">Deuteranopia (Green-Blind)</h5>
                                        <img src={report.contrastSimulations.deuteranopia.imageUrl} alt="Simulation for Deuteranopia" className="rounded-lg border-2 border-slate-600 mb-2"/>
                                        <p className="text-xs text-slate-400">{report.contrastSimulations.deuteranopia.summary}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-200 mb-2">Tritanopia (Blue-Blind)</h5>
                                        <img src={report.contrastSimulations.tritanopia.imageUrl} alt="Simulation for Tritanopia" className="rounded-lg border-2 border-slate-600 mb-2"/>
                                        <p className="text-xs text-slate-400">{report.contrastSimulations.tritanopia.summary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Keyboard Navigation Report */}
                            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <KeyboardIcon className="w-6 h-6 text-blue-400" />
                                    <h4 className="font-semibold text-slate-100 text-lg">Keyboard Navigation Report</h4>
                                </div>
                                <p className="font-semibold text-slate-200">Summary:</p>
                                <p className="text-sm text-slate-300 mb-4 italic">"{report.keyboardNavigation.summary}"</p>
                                <div className="space-y-2">
                                    {report.keyboardNavigation.checks.map((check, index) => (
                                        <div key={index} className={`flex items-start gap-3 p-3 rounded-md ${check.status === 'pass' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                            {check.status === 'pass' ? <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
                                            <div>
                                                <p className="font-semibold text-slate-200">{check.element}</p>
                                                <p className="text-sm text-slate-400">{check.notes}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};
