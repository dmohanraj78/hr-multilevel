import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, ShieldAlert, CheckCircle, ArrowRight, Loader2, Send, ShieldCheck, Lock, Landmark, Users2, Users, Briefcase } from 'lucide-react';

const SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PORTAL_URLS = {
  Admin: 'https://aviators-master.vercel.app',
  Recruiter: 'https://aviators-recruiter.vercel.app',
  Evaluator: 'https://aviators-evaluator.vercel.app',
  Executive: 'https://aviators-executive.vercel.app'
};

export default function App() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserAccess(session.user, session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUserAccess(session.user, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserAccess = async (user, currentSession) => {
    const userEmail = user.email || '';
    if (!userEmail.endsWith('@mondee.com')) {
      setAuthError('Access Denied: Only Mondee (@mondee.com) email addresses are permitted.');
      await supabase.auth.signOut();
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', userEmail.toLowerCase().trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setAuthError(`No assigned role found for ${userEmail}. Contact administrator.`);
        await supabase.auth.signOut();
        return;
      }

      setUserRole(data.role);
      
      // If the user is NOT an Admin (they have a single specific role), redirect them automatically
      if (data.role !== 'Admin') {
        const targetUrl = PORTAL_URLS[data.role];
        if (targetUrl) {
          setTimeout(() => {
            const at = currentSession?.access_token || '';
            const rt = currentSession?.refresh_token || '';
            window.location.href = `${targetUrl}/?access_token=${encodeURIComponent(at)}&refresh_token=${encodeURIComponent(rt)}`;
          }, 1500);
        }
      }
    } catch (err) {
      setAuthError('Failed to fetch role status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePortalRedirect = (targetKey) => {
    const targetUrl = PORTAL_URLS[targetKey];
    if (targetUrl && session) {
      const at = session.access_token || '';
      const rt = session.refresh_token || '';
      window.location.href = `${targetUrl}/?access_token=${encodeURIComponent(at)}&refresh_token=${encodeURIComponent(rt)}`;
    }
  };

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@mondee.com')) {
      setAuthError('Only @mondee.com emails are allowed.');
      return;
    }

    setLoading(true);
    setAuthError('');
    setAuthSuccess(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setAuthSuccess(true);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            hd: 'mondee.com'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    setAuthSuccess(false);
    setAuthError('');
  };

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
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Welcome Back!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your Aviators HR Portal securely
          </p>
          <div className="orange-line-indicator" />
        </div>

        {/* Auth Error Display */}
        {authError && (
          <div className="error-banner flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <strong className="font-bold block text-red-950 mb-0.5">Authorization Failed</strong>
              {authError}
            </div>
          </div>
        )}

        {/* Access Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
            <Loader2 className="h-8 w-8 text-[#ff5500] animate-spin" />
            <p className="text-xs text-slate-500 font-mono">Verifying role and access privileges...</p>
          </div>
        )}

        {/* Login Form Layout */}
        {!session && !loading && (
          <div className="flex flex-col gap-5">
            
            {/* Google Authentication */}
            <button onClick={handleGoogleLogin} className="google-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
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
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <div className="divider-line" />
              <span className="bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold text-[10px]">OR</span>
              <div className="divider-line" />
            </div>

            {/* Email OTP Sign In */}
            <form onSubmit={handleMagicLinkLogin} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your @mondee.com email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              {authSuccess ? (
                <div className="success-banner flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                  Sign-in link sent! Please check your mailbox.
                </div>
              ) : (
                <button type="submit" className="submit-btn">
                  <Send className="h-4 w-4" /> Send Sign-In Link
                </button>
              )}
            </form>

            {/* Secure note */}
            <div className="secure-info-bar">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold block">Secure. Simple. Seamless.</strong>
                We care about the safety of your data.
              </div>
            </div>
          </div>
        )}

        {/* Redirecting Single-Role Users (Non-Admins) */}
        {session && userRole && userRole !== 'Admin' && !loading && (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">Role: <strong className="text-[#ff5500] font-semibold">{userRole}</strong></p>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-2">
              Redirecting you to the portal <ArrowRight className="h-3.5 w-3.5 animate-pulse text-[#ff5500]" />
            </p>
            <button
              onClick={handleSignOut}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600 hover:underline"
            >
              Use another account
            </button>
          </div>
        )}

        {/* Admin Multi-Role Selector Interface */}
        {session && userRole === 'Admin' && !loading && (
          <div className="flex flex-col gap-4">
            <div className="text-center pb-2">
              <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                Administrator Access
              </span>
              <p className="text-[11px] text-slate-400 mt-1.5">Select a workspace portal to enter:</p>
            </div>

            <div className="admin-grid">
              {/* Master Portal */}
              <button 
                onClick={() => handlePortalRedirect('Admin')}
                className="admin-btn"
              >
                <Landmark className="admin-btn-icon" />
                <span className="admin-btn-text">Master Portal</span>
              </button>

              {/* Recruiter Portal */}
              <button 
                onClick={() => handlePortalRedirect('Recruiter')}
                className="admin-btn"
              >
                <Briefcase className="admin-btn-icon" />
                <span className="admin-btn-text">Recruiter Portal</span>
              </button>

              {/* Evaluator Portal */}
              <button 
                onClick={() => handlePortalRedirect('Evaluator')}
                className="admin-btn"
              >
                <Users className="admin-btn-icon" />
                <span className="admin-btn-text">Evaluator Portal</span>
              </button>

              {/* Executive Portal */}
              <button 
                onClick={() => handlePortalRedirect('Executive')}
                className="admin-btn"
              >
                <Users2 className="admin-btn-icon" />
                <span className="admin-btn-text">Executive Portal</span>
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="signout-link"
            >
              Sign out from Admin session
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
