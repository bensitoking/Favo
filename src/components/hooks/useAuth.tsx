// src/hooks/useAuth.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../demanda/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const supabaseSession = supabase.auth.session();
      
      if (supabaseSession) {
        setUser(supabaseSession.user);
        setLoading(false);
        return;
      }

      const manualSession = JSON.parse(localStorage.getItem('supabaseSession') || sessionStorage.getItem('supabaseSession') || 'null');
      
      if (manualSession) {
        setUser(manualSession.user);
      }
      
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return { user, loading };
};