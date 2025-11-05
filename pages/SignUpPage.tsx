// pages/SignUpPage.tsx
import React, { useState } from 'react';
import type { AccessibilitySettings } from '../types';
import { GoogleIcon, AdjustmentsHorizontalIcon } from '../components/icons';
import AuthLayout from '../components/AuthLayout';
import { AccessibilityPanel } from '../components/AccessibilityPanel';

// Firebase helpers (make sure services/firebase.ts exports these)
import {
  signupWithEmail,
  signinWithGooglePopup,
  signinWithGoogleRedirect
} from '../services/firebase';

interface SignUpPageProps {
  onSignUp: () => void; // keep same signature as your parent expects
  onNavigateToSignIn: () => void;
  onNavigateToAbout: () => void;
  onNavigateToHome: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToSignIn, onNavigateToAbout, onNavigateToHome }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fontClass = settings.isDyslexiaFont ? 'font-opendyslexic' : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await signupWithEmail(email, password, name);
      console.log('SignUpPage: email signup success ->', { uid: user.uid, email: user.email });
      // Inform parent (you keep parent API as onSignUp())
      try { onSignUp(); } catch (e) { console.warn('onSignUp threw', e); }
      // Do NOT forcibly navigate here — let AuthProvider / parent redirect when onAuthStateChanged fires
    } catch (err: unknown) {
      console.error('SignUpPage: signup error', err);
      const e = err as any;
      if (e?.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try signing in instead.');
      } else {
        setError(e?.message ?? 'Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-up: try popup first, then fall back to redirect
  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signinWithGooglePopup();
      console.log('SignUpPage: Google popup success ->', { uid: user.uid, email: user.email });
      try { onSignUp(); } catch (e) { console.warn('onSignUp threw', e); }
      // don't navigate here — let auth observer / parent handle redirect
    } catch (err: any) {
      console.warn('SignUpPage: Google popup error ->', err);
      // If user closed the popup or it was blocked, fallback to redirect flow
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/popup-blocked') {
        try {
          console.log('SignUpPage: starting redirect fallback for Google sign-in');
          await signinWithGoogleRedirect(); // this will navigate to Google and then back
        } catch (redirErr: any) {
          console.error('SignUpPage: redirect start failed', redirErr);
          setError(redirErr?.message ?? 'Redirect sign-in failed');
          setLoading(false);
        }
      } else {
        setError(err?.message ?? 'Google sign-up failed');
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout>
      <div aria-busy={loading} className={`animate-fadeInUp w-full max-w-md p-8 md:p-10 rounded-2xl relative bg-slate-800 ${fontClass}`}>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="absolute top-2 right-2 p-3 rounded-full hover:bg-slate-700/50 transition-colors"
          aria-label="Toggle accessibility settings"
          aria-expanded={isPanelOpen}
        >
          <AdjustmentsHorizontalIcon className="w-6 h-6 text-slate-300" />
        </button>

        <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">Create Your Account</h1>
        <p className="text-center text-slate-400 mb-8">Start making text accessible today.</p>

        {isPanelOpen && (
          <div className="mb-8">
            <AccessibilityPanel settings={settings} onSettingsChange={setSettings} textToRead="" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-300 block mb-2">Full Name</label>
            <input
              name="fullName"
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg transition-colors bg-slate-700/50 border-slate-600 text-white focus:ring-blue-400 focus:border-blue-400"
              placeholder="Your Name"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-300 block mb-2">Email Address</label>
            <input
              name="email"
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg transition-colors bg-slate-700/50 border-slate-600 text-white focus:ring-blue-400 focus:border-blue-400"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-300 block mb-2">Password</label>
            <input
              name="password"
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg transition-colors bg-slate-700/50 border-slate-600 text-white focus:ring-blue-400 focus:border-blue-400"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && <div role="alert" className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-700" />
          <span className="mx-4 text-sm text-slate-400">OR</span>
          <div className="flex-grow border-t border-slate-700" />
        </div>

        <button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 border font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 focus:ring-slate-500"
          disabled={loading}
        >
          <GoogleIcon className="w-5 h-5" />
          {loading ? 'Please wait...' : 'Sign up with Google'}
        </button>

        <p className="text-center text-sm text-slate-400 mt-8">
          Already have an account?{' '}
          <button onClick={onNavigateToSignIn} className="font-medium text-blue-400 hover:underline">Sign In</button>
        </p>

        <div className="text-center text-sm text-slate-400 mt-4 flex justify-center gap-4">
          <button onClick={onNavigateToAbout} className="hover:underline">About Includify</button>
          <span aria-hidden="true">|</span>
          <button onClick={onNavigateToHome} className="hover:underline">Back to Home</button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;
