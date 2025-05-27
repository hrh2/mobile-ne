import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { userApi, User } from '@/utils/api';
import { 
  saveUserToStorage, 
  getUserFromStorage, 
  removeUserFromStorage,
  encryptPassword,
  comparePassword
} from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Check for stored user on mount
  useEffect(() => {
    checkUserSession();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    
    if (!isLoading) {
      if (!user && !inAuthGroup) {
        // Redirect to login if no user
        router.replace('/auth/login');
      } else if (user && inAuthGroup) {
        // Redirect to home if user exists
        router.replace('/');
      }
    }
  }, [user, segments, isLoading]);

  // Check if user is logged in
  const checkUserSession = async () => {
    try {
      const storedUser = await getUserFromStorage();
      setUser(storedUser);
    } catch (error) {
      console.error('Failed to check user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in
  const signIn = async (username: string, password: string) => {
  setIsLoading(true);
  setError(null);

  try {
    const res = await userApi.login(username);

    if (res.status === 404 || res.data.length === 0) {
      throw new Error('User not found');
    }

    const user = res.data[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await saveUserToStorage(user);
    setUser(user);
    router.replace('/');
  } catch (error: any) {
    setError(error.message || 'Failed to sign in');
    console.error('Sign in error:', error);
  } finally {
    setIsLoading(false);
  }
};


  // Sign up
  const signUp = async (username: string, password: string) => {
  setIsLoading(true);
  setError(null);

  try {
    const res = await userApi.login(username);

    if (res.status !== 404 && res.data.length > 0) {
      throw new Error('Username already taken');
    }

    const hashedPassword = await encryptPassword(password);

    const userData: User = {
      username,
      password: hashedPassword,
      createdAt: Date.now()
    };

    const { data: newUser } = await userApi.register(userData);

    await saveUserToStorage(newUser);
    setUser(newUser);
    router.replace('/');
  } catch (error: any) {
    setError(error.message || 'Failed to sign up');
    console.error('Sign up error:', error);
  } finally {
    setIsLoading(false);
  }
};


  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await removeUserFromStorage();
      setUser(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using the auth context
// hooks/useAuth.tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};