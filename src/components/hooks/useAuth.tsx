// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../demanda/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = supabase.auth.session() || 
                     JSON.parse(localStorage.getItem('supabaseSession') || 
                     JSON.parse(sessionStorage.getItem('supabaseSession'));

      if (session) {
        // Obtener datos adicionales del usuario
        const { data, error } = await supabase
          .from('Usuario')
          .select('*')
          .eq('mail', session.user.email)
          .single();

        if (!error && data) {
          setUser({
            ...session.user,
            ...data
          });
        }
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data } = await supabase
          .from('Usuario')
          .select('*')
          .eq('mail', session.user.email)
          .single();

        setUser({
          ...session.user,
          ...data
        });
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