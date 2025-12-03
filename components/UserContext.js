// components/UserContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext({ user: null, loading: true });

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setUser(data?.session?.user ?? null);
        setLoading(false);
      }
    }

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!cancelled) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
