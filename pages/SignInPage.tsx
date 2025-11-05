// pages/SignInPage.tsx
import React, { useState } from 'react';
import type { AccessibilitySettings } from '../types';
import { GoogleIcon, AdjustmentsHorizontalIcon } from '../components/icons';
import AuthLayout from '../components/AuthLayout';
import { AccessibilityPanel } from '../components/AccessibilityPanel';

// Firebase helpers (ensure services/firebase.ts exports these)
import {
  signinWithEmail,
  signinWithGooglePopup,
  signinWithGoogleRedirect
} from '../services/firebase';

interface SignInPageProps {
  onSignIn: () => void; // keep same signature as your parent expects
  onNavigateToSignUp: () => void;
  onNavigateToAbout: () => void;
  onNavigateToHome: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onSignIn, onNavigateToSignUp, onNavigateToAbout, onNavigateToHome }) => {
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

  // auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fontClass = settings.isDyslexiaFont ? 'font-opendyslexic' : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await signinWithEmail(email, password);
      console.log('SignInPage: email signin success ->', { uid: user.uid, email: user.email });
      try { onSignIn(); } catch (e) { console.warn('onSignIn threw', e); }
      // don't navigate here — let AuthProvider/parent redirect on auth change
    } catch (err: unknown) {
      console.error('SignInPage: signin error', err);
      const e = err as any;
      if (e?.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (e?.code === 'auth/user-not-found') {
        setError('No account found for this email. Please sign up.');
      } else {
        setError(e?.message ?? 'Sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in: popup first, fallback to redirect
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signinWithGooglePopup();
      console.log('SignInPage: Google popup success ->', { uid: user.uid, email: user.email });
      try { onSignIn(); } catch (e) { console.warn('onSignIn threw', e); }
      // rely on auth observer to navigate
    } catch (err: any) {
      console.warn('SignInPage: Google popup error ->', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/popup-blocked') {
        try {
          console.log('SignInPage: starting redirect fallback for Google sign-in');
          await signinWithGoogleRedirect(); // navigates to Google; handle result on return
        } catch (redirErr: any) {
          console.error('SignInPage: redirect start failed', redirErr);
          setError(redirErr?.message ?? 'Redirect sign-in failed');
          setLoading(false);
        }
      } else {
        setError(err?.message ?? 'Google sign-in failed');
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

        <h1 className="text-4xl font-bold text-center text-blue-400 mb-2">Welcome Back</h1>
        <p className="text-center text-slate-400 mb-8">Sign in to continue to Includify.</p>

        {isPanelOpen && (
          <div className="mb-8">
            <AccessibilityPanel settings={settings} onSettingsChange={setSettings} textToRead="" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            <a href="#" className="font-medium text-sm text-blue-400 hover:underline block text-right mt-2">Forgot password?</a>
          </div>

          {error && <div role="alert" className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-700" />
          <span className="mx-4 text-sm text-slate-400">OR</span>
          <div className="flex-grow border-t border-slate-700" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 focus:ring-slate-500"
          disabled={loading}
        >
          <GoogleIcon className="w-5 h-5" />
          {loading ? 'Please wait...' : 'Sign in with Google'}
        </button>

        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignUp} className="font-medium text-blue-400 hover:underline">Sign Up</button>
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

export default SignInPage;
