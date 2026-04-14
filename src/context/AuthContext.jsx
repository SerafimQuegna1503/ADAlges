import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'auth:role';
const AUTH_CODE_STORAGE_KEY = 'auth:code';
const ACCESS_CODES = {
  '1991': 'ADMIN',
  '1234': 'MEMBRO',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (isMounted && (savedRole === 'ADMIN' || savedRole === 'MEMBRO')) {
          setRole(savedRole);
        }
      } catch {
        // Ignore storage read issues and continue as logged out.
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithPin = async (pin) => {
    const trimmedPin = String(pin || '').trim();
    const matchedRole = ACCESS_CODES[trimmedPin];

    if (!matchedRole) {
      return {
        ok: false,
        error: 'Código inválido. Verifica e tenta novamente.',
      };
    }

    setRole(matchedRole);

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, matchedRole);
      await AsyncStorage.setItem(AUTH_CODE_STORAGE_KEY, trimmedPin);
    } catch {
      // Keep in-memory session even if persistence fails.
    }

    return { ok: true, role: matchedRole };
  };

  const logout = async () => {
    setRole(null);
    try {
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, AUTH_CODE_STORAGE_KEY]);
    } catch {
      try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        await AsyncStorage.removeItem(AUTH_CODE_STORAGE_KEY);
      } catch {
        // Ignore storage cleanup errors.
      }
    }
  };

  const value = useMemo(
    () => ({
      role,
      isAdmin: role === 'ADMIN',
      isMember: role === 'MEMBRO',
      isLoading,
      loginWithPin,
      logout,
    }),
    [role, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
