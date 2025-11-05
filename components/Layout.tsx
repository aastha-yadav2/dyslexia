import React, { useState } from 'react';
import { GithubIcon, TwitterIcon, LinkedInIcon, MenuIcon, XIcon } from './icons';

interface LayoutProps {
    children: React.ReactNode;
    onNavigate: (path: string) => void;
    onNavigateToSignIn: () => void;
    onNavigateToSignUp: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, onNavigateToSignIn, onNavigateToSignUp }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavClick = (path: string) => {
        onNavigate(path);
        setIsMenuOpen(false);
    }
    
    return (
        <div>
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700/50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => handleNavClick('/')} className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 rounded-lg">
                        <img src="https://i.postimg.cc/qvQmkpcZ/Untitled-design.png" alt="Includify logo" className="h-9 w-9" />
                        <span className="text-3xl font-bold text-slate-100">Includify</span>
                    </button>
                    
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <button onClick={() => handleNavClick('/')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors">Home</button>
                        <button onClick={() => handleNavClick('/features')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors">Features</button>
                        <button onClick={() => handleNavClick('/dashboard')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors">Dashboard</button>
                        <button onClick={() => handleNavClick('/about')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors">About</button>
                        <button onClick={() => handleNavClick('/community')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors">Community</button>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={onNavigateToSignIn} className="font-medium text-slate-300 hover:text-blue-400 transition-colors">
                            Sign In
                        </button>
                        <button onClick={onNavigateToSignUp} className="bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-600 transition-colors">
                            Sign Up
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" className="p-2">
                        {isMenuOpen ? <XIcon className="w-6 h-6 text-slate-200" /> : <MenuIcon className="w-6 h-6 text-slate-200" />}
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                {isMenuOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-700">
                    <nav className="flex flex-col items-center gap-4 p-4">
                        <button onClick={() => handleNavClick('/')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors py-2">Home</button>
                        <button onClick={() => handleNavClick('/features')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors py-2">Features</button>
                        <button onClick={() => handleNavClick('/dashboard')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors py-2">Dashboard</button>
                        <button onClick={() => handleNavClick('/about')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors py-2">About</button>
                        <button onClick={() => handleNavClick('/community')} className="font-medium text-slate-300 hover:text-blue-400 transition-colors py-2">Community</button>
                        <div className="w-full border-t border-slate-700 my-2"></div>
                        <button onClick={() => { onNavigateToSignIn(); setIsMenuOpen(false); }} className="w-full text-center font-medium text-slate-300 hover:text-blue-400 transition-colors py-2">
                            Sign In
                        </button>
                        <button onClick={() => { onNavigateToSignUp(); setIsMenuOpen(false); }} className="w-full bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-600 transition-colors">
                            Sign Up
                        </button>
                    </nav>
                </div>
                )}
            </header>

            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-slate-900 mt-16" role="contentinfo" aria-labelledby="footer-heading">
                <div className="container mx-auto px-6 py-16">
                    <h2 id="footer-heading" className="sr-only">Footer navigation and site information</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <nav>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><button onClick={() => onNavigate('/')} className="hover:text-blue-400 transition-colors">Home</button></li>
                            <li><button onClick={() => onNavigate('/features')} className="hover:text-blue-400 transition-colors">Features</button></li>
                            <li><button onClick={() => onNavigate('/demo')} className="hover:text-blue-400 transition-colors">Demo</button></li>
                            <li><button onClick={() => onNavigate('/dashboard')} className="hover:text-blue-400 transition-colors">Dashboard</button></li>
                            <li><button onClick={() => onNavigate('/community')} className="hover:text-blue-400 transition-colors">Community</button></li>
                        </ul>
                        </nav>
                        <nav>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><button onClick={() => onNavigate('/docs')} className="hover:text-blue-400 transition-colors">Docs</button></li>
                            <li><button onClick={() => onNavigate('/blog')} className="hover:text-blue-400 transition-colors">Blog</button></li>
                            <li><button onClick={() => onNavigate('/case-studies')} className="hover:text-blue-400 transition-colors">Case Studies</button></li>
                            <li><button onClick={() => onNavigate('/tools')} className="hover:text-blue-400 transition-colors">Developer Tools</button></li>
                        </ul>
                        </nav>
                        <nav>
                        <h4 className="font-semibold text-white mb-4">Legal & Policies</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><button onClick={() => onNavigate('/accessibility-statement')} className="hover:text-blue-400 transition-colors">Accessibility Statement</button></li>
                            <li><button onClick={() => onNavigate('/privacy-policy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => onNavigate('/terms-of-use')} className="hover:text-blue-400 transition-colors">Terms of Use</button></li>
                        </ul>
                        </nav>
                        <nav>
                        <h4 className="font-semibold text-white mb-4">Contact & Social</h4>
                        <ul className="space-y-2 text-slate-300">
                            <li><button onClick={() => onNavigate('/contact')} className="hover:text-blue-400 transition-colors">Contact Support</button></li>
                            <li><button onClick={() => onNavigate('/report-issue')} className="hover:text-blue-400 transition-colors" aria-label="Report an accessibility barrier">Report Accessibility Issue</button></li>
                        </ul>
                        </nav>
                    </div>
                    <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400">
                        <p>&copy; 2024 Includify — Built with accessibility-first principles</p>
                        <div className="flex gap-4 mt-4 sm:mt-0">
                        <a href="https://github.com/includify" aria-label="Github" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer"><GithubIcon className="w-6 h-6" /></a>
                        <a href="https://twitter.com/includify" aria-label="Twitter" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer"><TwitterIcon className="w-6 h-6" /></a>
                        <a href="https://linkedin.com/company/includify" aria-label="LinkedIn" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer"><LinkedInIcon className="w-6 h-6" /></a>
                        </div>
                    </div>
                    <div className="text-center text-xs text-slate-500 pt-8">
                        Powered by Google Gemini API
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;