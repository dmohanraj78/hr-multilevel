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
import { Loader2, ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

// Self-contained Google (@mondee.com) login + RBAC gate.
// Renders `children` only for an authenticated, authorized user; otherwise it
// shows a sign-in or access-denied screen. No cross-domain token hand-off —
// each portal establishes its own session on its own origin.
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 font-mono text-xs text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: accent }} />
        Verifying access&hellip;
      </div>
    );
  }

  const allowed = email ? getUserPortals(email) : [];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-5">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: accent + '22', color: accent }}
        >
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-100">Aviators {label}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {status === 'denied' ? 'Access denied' : 'Sign in to continue'}
          </p>
        </div>

        {status === 'signin' && (
          <>
            {message && <p className="text-xs text-red-400">{message}</p>}
            <button
              onClick={signIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold text-sm py-3 rounded-2xl hover:bg-slate-100 transition-all"
            >
              <GoogleIcon /> Sign in with Google
            </button>
            <p className="text-[11px] text-slate-500">
              Use your <span className="text-slate-300">@mondee.com</span> account.
            </p>
          </>
        )}

        {status === 'denied' && (
          <>
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-3 leading-relaxed">
              {message}
            </p>

            {allowed.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                <p className="text-[11px] text-slate-500">Portals you can access:</p>
                {allowed.map((p) => (
                  <a
                    key={p}
                    href={PORTAL_URLS[p]}
                    className="w-full flex items-center justify-between text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all"
                  >
                    {PORTAL_LABELS[p]}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-200 py-2"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign in with another account
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
