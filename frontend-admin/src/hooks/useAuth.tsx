import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  checkAdminAccess: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar se é admin
        try {
          const tokenResult = await user.getIdTokenResult();
          const isAdmin = tokenResult.claims.role === 'ADMIN' || tokenResult.claims.admin === true;
          setState({ user, loading: false, isAdmin });
        } catch {
          setState({ user, loading: false, isAdmin: false });
        }
      } else {
        setState({ user: null, loading: false, isAdmin: false });
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Verificar se é admin após login
    const tokenResult = await result.user.getIdTokenResult();
    const isAdmin = tokenResult.claims.role === 'ADMIN' || tokenResult.claims.admin === true;
    
    if (!isAdmin) {
      await firebaseSignOut(auth);
      throw new Error('Acesso não autorizado. Apenas administradores podem acessar.');
    }
    
    return result.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const checkAdminAccess = async (): Promise<boolean> => {
    try {
      await apiClient.get('/admin/health');
      return true;
    } catch {
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    checkAdminAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
