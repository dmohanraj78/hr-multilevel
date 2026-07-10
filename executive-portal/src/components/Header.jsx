import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Settings, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { updateCredentials } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Header({ title, isDemo }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [openSettings, setOpenSettings] = useState(false);
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('supabase_url') || 'https://bkoT5rW1Nnj_0n1s5fTZqA.supabase.co');
  const [dbKey, setDbKey] = useState(localStorage.getItem('supabase_key') || 'sb_publishable_bkoT5rW1Nnj_0n1s5fTZqA_vCM1UVF6');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveSettings = () => {
    updateCredentials(dbUrl, dbKey);
    setOpenSettings(false);
  };

  const handleClearSettings = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    window.location.reload();
  };

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

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-lg h-9 w-9">
          {theme === 'dark' ? <Sun className="h-[16px] w-[16px] stroke-[1.5]" /> : <Moon className="h-[16px] w-[16px] stroke-[1.5]" />}
        </Button>

        <Button variant="outline" size="icon" onClick={() => setOpenSettings(true)} className="rounded-lg h-9 w-9 border-[#800020]/30 hover:border-[#800020] text-[#800020]">
          <Settings className="h-[16px] w-[16px] stroke-[1.5]" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Supabase Live Database Connection</DialogTitle>
            <DialogDescription>
              Please enter your Supabase credentials. Since browser local storage is isolated by port, copy-paste your database details once for this port.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dbUrl" className="text-right">Project URL</Label>
              <Input
                id="dbUrl"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="col-span-3 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dbKey" className="text-right">Anon Key</Label>
              <Input
                id="dbKey"
                type="password"
                value={dbKey}
                onChange={(e) => setDbKey(e.target.value)}
                className="col-span-3 rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleClearSettings} className="rounded-lg">Reset Defaults</Button>
            <Button onClick={handleSaveSettings} className="bg-[#800020] hover:bg-[#800020]/90 text-white rounded-lg">Save Config & Sync</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
