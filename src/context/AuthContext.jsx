import React, { createContext, useContext, useState, useEffect } from 'react';
import { SESSION_KEY, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSession(null);
    });
  }, []);

  const saveSession = (sessionData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        token: session?.token || null,
        saveSession,
        logout: clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);