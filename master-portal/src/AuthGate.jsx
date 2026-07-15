import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  isMondeeEmail,
  hasPortalAccess,
  getUserPortals,
  PORTAL_LABELS,
  PORTAL_ACCENTS,
  PORTAL_URLS,
} from '@/lib/access';
import { Loader2, ArrowRight, LogOut } from 'lucide-react';

export default function AuthGate({ portal, children }) {
  const [status, setStatus] = useState('checking'); // checking | signin | denied | authorized
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const accent = PORTAL_ACCENTS[portal] || '#ea580c';
  const label = PORTAL_LABELS[portal] || 'Portal';

  useEffect(() => {
    const evaluate = (session) => {
      if (!session) {
        setStatus('signin');
        return;
      }
      const em = (session.user?.email || '').toLowerCase();
      setEmail(em);
      if (!isMondeeEmail(em)) {
        setMessage('Access is limited to @mondee.com Google accounts.');
        setStatus('denied');
        return;
      }
      if (!hasPortalAccess(em, portal)) {
        setMessage(`${em} is not authorized for the ${label}.`);
        setStatus('denied');
        return;
      }
      setStatus('authorized');
    };

    supabase.auth.getSession().then(({ data: { session } }) => evaluate(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => evaluate(session));
    return () => subscription.unsubscribe();
  }, [portal, label]);

  const signIn = async () => {
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmail('');
    setMessage('');
    setStatus('signin');
  };

  if (status === 'authorized') return children;

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 font-sans text-sm text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: accent }} />
        Verifying access&hellip;
      </div>
    );
  }

  const allowed = email ? getUserPortals(email) : [];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center p-6 font-sans">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Soft bottom wavy gradient */}
        <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-orange-50/80 to-transparent"></div>
        {/* Wavy SVGs (simulated via overlapping soft ellipses for exact effect) */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[120%] h-[40%] bg-orange-100/40 blur-3xl rounded-[100%] transform -rotate-6"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[120%] h-[50%] bg-orange-50/60 blur-3xl rounded-[100%] transform rotate-3"></div>
        
        {/* Abstract circles */}
        <div className="absolute top-[20%] right-[15%] w-48 h-48 border-[1px] border-orange-200/50 rounded-full"></div>
        <div className="absolute top-[28%] right-[14%] w-3 h-3 bg-orange-200 rounded-full"></div>
        <div className="absolute top-[29%] right-[13.5%] w-1.5 h-1.5 bg-orange-400 rounded-full"></div>

        <div className="absolute top-[40%] left-[10%] w-64 h-64 border-[1px] border-orange-200/30 rounded-full"></div>
        <div className="absolute top-[48%] left-[12%] w-2 h-2 bg-orange-500 rounded-full"></div>
        
        <div className="absolute bottom-[25%] left-[20%] w-12 h-12 bg-orange-50/80 rounded-full blur-md"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center mt-12 md:mt-24">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/aviators_logo.png" alt="Aviators" className="h-16 w-16 mb-4 object-contain" />
          <h1 className="text-[22px] font-bold text-slate-800 tracking-[0.2em] uppercase">
            A V I A T O R S
          </h1>
          <div className="flex items-center gap-3 mt-2 opacity-60">
            <div className="h-[1px] w-12 bg-orange-500"></div>
            <span className="text-xs font-semibold text-slate-600 tracking-widest uppercase">{label}</span>
            <div className="h-[1px] w-12 bg-orange-500"></div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back!</h2>
          <p className="text-sm text-slate-500 mb-8">
            {status === 'denied' ? 'Access denied' : `Sign in to continue to Aviators ${label}`}
          </p>

          {status === 'signin' && (
            <>
              {message && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-2 rounded-lg w-full">{message}</p>}
              <button
                onClick={signIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-200 font-medium text-[15px] py-3.5 rounded-2xl hover:bg-slate-50 hover:shadow-sm hover:-translate-y-[1px] transition-all active:scale-[0.98]"
              >
                <GoogleIcon /> Sign in with Google
              </button>
              
              <div className="flex items-center w-full my-6 opacity-40">
                <div className="flex-grow h-[1px] bg-slate-300"></div>
                <span className="px-4 text-xs font-medium text-slate-500">or</span>
                <div className="flex-grow h-[1px] bg-slate-300"></div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Use your <span className="text-slate-800 font-bold">@mondee.com</span> account.
              </p>
            </>
          )}

          {status === 'denied' && (
            <>
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 leading-relaxed w-full mb-6">
                {message}
              </div>

              {allowed.length > 0 && (
                <div className="flex flex-col gap-2 w-full mb-6">
                  <p className="text-xs text-slate-500 font-medium mb-1">Portals you can access:</p>
                  {allowed.map((p) => (
                    <a
                      key={p}
                      href={PORTAL_URLS[p]}
                      className="w-full flex items-center justify-between text-sm font-semibold py-3 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all"
                    >
                      {PORTAL_LABELS[p]}
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}

              <button
                onClick={signOut}
                className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors py-2"
              >
                <LogOut className="h-4 w-4" /> Sign in with another account
              </button>
            </>
          )}
        </div>

        {/* Footer Logo */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          Powered by <img src="/mondee_logo.svg" alt="Mondee" className="h-4 object-contain opacity-80 mix-blend-multiply" />
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
