import { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseClient } from '@/app/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let supabase: any = null;
  try {
    supabase = createSupabaseClient();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to initialize Supabase';
    setError(msg);
    console.error('Auth initialization error:', msg);
  }

  useEffect(() => {
    if (!supabase) return;

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase not initialized');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-200 mb-4">⚠️ Configuration Error</h1>
          <p className="text-red-100 mb-6 font-mono text-sm">{error}</p>
          <div className="bg-red-900 rounded-lg p-4 text-left">
            <p className="text-red-200 font-semibold mb-2">Fix: Add Environment Variables</p>
            <ol className="text-red-300 text-sm space-y-2">
              <li>1. Go to Vercel Dashboard → Your Project</li>
              <li>2. Click Settings → Environment Variables</li>
              <li>3. Add these variables:</li>
              <li className="font-mono text-xs mt-2 ml-2">
                NEXT_PUBLIC_SUPABASE_URL<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </li>
              <li>4. Redeploy your application</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
