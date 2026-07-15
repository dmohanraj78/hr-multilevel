import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Loader2, ShieldCheck, Lock, ArrowRight, LogOut, Landmark, Briefcase, Users, Users2 } from 'lucide-react';
import { isMondeeEmail, getUserPortals, PORTAL_URLS, PORTAL_LABELS } from './lib/access';

const SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co';
// Public anon key — this hub only performs Google auth, it never queries data.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTU5NDgsImV4cCI6MjA5ODM5MTk0OH0.dqPKhwzhBvuL7gNuoNC9Bl-iCOfzZV61qM0whZLfXaA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PORTAL_ICONS = {
  master: Landmark,
  recruiter: Briefcase,
  evaluator: Users,
  executive: Users2,
};

export default function App() {
  const [status, setStatus] = useState('checking'); // checking | signin | denied | hub
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const evaluate = (session) => {
      if (!session) {
        setStatus('signin');
        return;
      }
      const em = (session.user?.email || '').toLowerCase();
      setEmail(em);
      if (!isMondeeEmail(em)) {
        setMessage('Only @mondee.com Google accounts are permitted.');
        setStatus('denied');
        return;
      }
      if (getUserPortals(em).length === 0) {
        setMessage(`No portal access is assigned to ${em}. Please contact an administrator.`);
        setStatus('denied');
        return;
      }
      setStatus('hub');
    };

    supabase.auth.getSession().then(({ data: { session } }) => evaluate(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => evaluate(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: 'mondee.com', prompt: 'select_account' },
      },
    });
    if (error) setMessage(error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setEmail('');
    setMessage('');
    setStatus('signin');
  };

  const portals = email ? getUserPortals(email) : [];

  return (
    <div className="flex items-center justify-center p-6 w-full max-w-md min-h-screen">
      <div className="bg-white-card flex flex-col gap-6 relative">

        {/* Brand Logo Row */}
        <div className="logo-row pb-4 border-b border-slate-100">
          <img src="/tabhi_logo.png" alt="Tabhi" />
          <div className="w-px h-6 bg-slate-200" />
          <img src="/aviators_logo.png" alt="Aviators" />
        </div>

        {/* Circular Security Shield Badge */}
        <div className="flex justify-center">
          <div className="security-badge">
            <Lock className="h-6 w-6 stroke-[1.5]" />
          </div>
        </div>

        {/* Card Title & Subtitle */}
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Welcome Back!</h2>
          <p className="text-xs text-slate-500 mt-1">Access your Aviators HR Portal securely</p>
          <div className="orange-line-indicator" />
        </div>

        {/* Checking session */}
        {status === 'checking' && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
            <Loader2 className="h-8 w-8 text-[#ff5500] animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Verifying access privileges&hellip;</p>
          </div>
        )}

        {/* Sign in with Google */}
        {status === 'signin' && (
          <div className="flex flex-col gap-5">
            {message && (
              <div className="error-banner flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>{message}</div>
              </div>
            )}

            <button onClick={handleGoogleLogin} className="google-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="secure-info-bar">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold block">Mondee accounts only</strong>
                Sign in with your @mondee.com Google account.
              </div>
            </div>
          </div>
        )}

        {/* Access denied */}
        {status === 'denied' && (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-full">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Authorization Failed</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
            </div>
            <button onClick={handleSignOut} className="signout-link flex items-center justify-center gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Use another account
            </button>
          </div>
        )}

        {/* Portal hub */}
        {status === 'hub' && (
          <div className="flex flex-col gap-4">
            <div className="text-center pb-1">
              <p className="text-[11px] text-slate-400">
                Signed in as <strong className="text-[#ff5500] font-semibold">{email}</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5">Select a workspace portal to enter:</p>
            </div>

            <div className="admin-grid">
              {portals.map((p) => {
                const Icon = PORTAL_ICONS[p] || Landmark;
                return (
                  <a key={p} href={PORTAL_URLS[p]} className="admin-btn">
                    <Icon className="admin-btn-icon" />
                    <span className="admin-btn-text">{PORTAL_LABELS[p]}</span>
                  </a>
                );
              })}
            </div>

            <button onClick={handleSignOut} className="signout-link flex items-center justify-center gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        )}

        {/* Powered by Mondee Logo */}
        <div className="mondee-footer">
          <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">Powered by</span>
          <img src="/mondee_logo.svg" alt="Mondee" className="mondee-footer-logo" />
        </div>

      </div>
    </div>
  );
}
