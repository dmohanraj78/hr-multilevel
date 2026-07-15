import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, LogOut, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Header({ title, isDemo }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const meta = user?.user_metadata || {};
  const displayName = meta.full_name || meta.name || (user?.email ? user.email.split('@')[0] : '');
  const email = user?.email || '';
  const avatarUrl = meta.avatar_url || meta.picture || '';
  const initial = (displayName || email || '?').charAt(0).toUpperCase();

  return (
    <header className="border-b bg-card text-card-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-4">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <img src="/aviators_logo.png" alt="Aviators" className="h-10 w-auto object-contain dark:brightness-110" />
          <div className="hidden md:flex flex-col">
            <span className="font-extrabold text-sm font-heading tracking-tight text-foreground uppercase">
              Aviators Funnel
            </span>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              Dynamic Screening Hub
            </span>
          </div>
        </div>

        <span className="text-muted-foreground font-light">|</span>
        <span className="text-xs font-mono bg-muted/60 px-2.5 py-1 rounded-md text-muted-foreground font-semibold">
          {title}
        </span>

        {isDemo ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-mono">
            <ShieldAlert className="h-3 w-3 mr-1 animate-pulse" />
            Offline Mode
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-mono">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Supabase Live
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-lg h-9 w-9">
          {theme === 'dark' ? <Sun className="h-[16px] w-[16px] stroke-[1.5]" /> : <Moon className="h-[16px] w-[16px] stroke-[1.5]" />}
        </Button>

        {/* Signed-in user profile */}
        {user && (
          <div className="flex items-center gap-2 pl-1">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {initial}
              </div>
            )}
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-foreground">{displayName}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{email}</span>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={handleSignOut}
          title="Sign out"
          className="rounded-lg h-9 w-9"
        >
          <LogOut className="h-[16px] w-[16px] stroke-[1.5]" />
        </Button>
      </div>
    </header>
  );
}
