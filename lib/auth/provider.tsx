"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_PROVIDER } from "@/lib/config/env";

// Simplified User type for both mock and real usage
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
  phoneNumber?: string | null;
};

type MultiFactorResolver = unknown;
type TotpSecret = unknown;
type OAuthProviderType = "google" | "github" | "microsoft";

// Auth status types
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "mfa_required"
  | "mfa_verifying"
  | "error";

// Auth context value type
export interface AuthContextValue {
  // State
  user: User | null;
  status: AuthStatus;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasMfa: boolean;

  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: OAuthProviderType) => Promise<void>;
  signInWithSso: (orgId: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  getToken: () => Promise<string | null>;
  clearError: () => void;

  // MFA actions
  mfaResolver: MultiFactorResolver | null;
  verifyMfa: (code: string) => Promise<void>;
  setupMfa: () => Promise<{ qrCodeUrl: string; secret: TotpSecret }>;
  completeMfaSetup: (secret: TotpSecret, code: string) => Promise<void>;
  removeMfa: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for development
const mockUser: User = {
  uid: "dev-user-123",
  email: "dev@example.com",
  displayName: "Dev User",
  emailVerified: true,
  photoURL: null,
  phoneNumber: null,
};

// No-op async function for mock actions
const noopAsync = async () => {};
const noopAsyncString = async () => null as string | null;

/**
 * Mock auth provider for development when auth is disabled.
 */
function MockAuthProvider({ children }: AuthProviderProps) {
  const value: AuthContextValue = {
    user: mockUser,
    status: "authenticated",
    error: null,
    isLoading: false,
    isAuthenticated: true,
    hasMfa: false,
    signIn: noopAsync,
    signUp: noopAsync,
    signInWithProvider: noopAsync,
    signInWithSso: noopAsync,
    signOut: noopAsync,
    sendPasswordReset: noopAsync,
    sendEmailVerification: noopAsync,
    getToken: async () => "mock-token",
    clearError: () => {},
    mfaResolver: null,
    verifyMfa: noopAsync,
    setupMfa: async () => ({ qrCodeUrl: "", secret: {} as TotpSecret }),
    completeMfaSetup: noopAsync,
    removeMfa: noopAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Real Firebase auth provider.
 */
function FirebaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [firebaseModule, setFirebaseModule] = useState<typeof import("./firebase") | null>(null);

  // Dynamically import Firebase
  useEffect(() => {
    import("./firebase").then((module) => {
      setFirebaseModule(module);
      module.initFirebase();

      const unsubscribe = module.subscribeToAuthState((firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
          });
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      });

      return () => unsubscribe();
    });
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    if (!firebaseModule) return;
    setStatus("loading");
    setError(null);

    try {
      const result = await firebaseModule.signInWithEmail(email, password);
      if (result.mfaRequired && result.resolver) {
        setMfaResolver(result.resolver);
        setStatus("mfa_required");
      }
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      setStatus("error");
    }
  }, [firebaseModule]);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
    if (!firebaseModule) return;
    setStatus("loading");
    setError(null);

    try {
      await firebaseModule.signUpWithEmail(email, password);
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      setStatus("error");
    }
  }, [firebaseModule]);

  // Sign in with OAuth provider
  const signInWithProvider = useCallback(async (provider: OAuthProviderType) => {
    if (!firebaseModule) return;
    setStatus("loading");
    setError(null);

    try {
      const result = await firebaseModule.signInWithOAuth(provider);
      if (result.mfaRequired && result.resolver) {
        setMfaResolver(result.resolver);
        setStatus("mfa_required");
      }
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      setStatus("error");
    }
  }, [firebaseModule]);

  // Sign in with SSO
  const signInWithSso = useCallback(async (orgId: string) => {
    if (!firebaseModule) return;
    setStatus("loading");
    setError(null);

    try {
      const result = await firebaseModule.signInWithSSO(orgId);
      if (result.mfaRequired && result.resolver) {
        setMfaResolver(result.resolver);
        setStatus("mfa_required");
      }
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      setStatus("error");
    }
  }, [firebaseModule]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!firebaseModule) return;
    try {
      await firebaseModule.logout();
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
    }
  }, [firebaseModule]);

  // Send password reset email
  const sendPasswordReset = useCallback(async (email: string) => {
    if (!firebaseModule) return;
    setError(null);

    try {
      await firebaseModule.resetPassword(email);
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  }, [firebaseModule]);

  // Send email verification
  const sendEmailVerification = useCallback(async () => {
    if (!firebaseModule) return;
    setError(null);

    try {
      await firebaseModule.sendVerificationEmail();
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  }, [firebaseModule]);

  // Get ID token
  const getToken = useCallback(async () => {
    if (!firebaseModule) return null;
    return firebaseModule.getIdToken(false);
  }, [firebaseModule]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    if (status === "error") {
      setStatus(user ? "authenticated" : "unauthenticated");
    }
  }, [status, user]);

  // Verify MFA code
  const verifyMfa = useCallback(async (code: string) => {
    if (!firebaseModule || !mfaResolver) {
      throw new Error("No MFA resolver available");
    }

    setStatus("mfa_verifying");
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await firebaseModule.verifyMfaCode(mfaResolver as any, code);
      setMfaResolver(null);
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      setStatus("mfa_required");
    }
  }, [firebaseModule, mfaResolver]);

  // Setup MFA
  const setupMfa = useCallback(async () => {
    if (!firebaseModule) throw new Error("Firebase not loaded");
    return firebaseModule.generateMfaSecrets();
  }, [firebaseModule]);

  // Complete MFA setup
  const completeMfaSetup = useCallback(async (secret: TotpSecret, code: string) => {
    if (!firebaseModule) return;
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await firebaseModule.enrollMfa(secret as any, code);
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  }, [firebaseModule]);

  // Remove MFA
  const removeMfa = useCallback(async () => {
    if (!firebaseModule) return;
    setError(null);

    try {
      await firebaseModule.unenrollMfa();
    } catch (err) {
      const message = firebaseModule.getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  }, [firebaseModule]);

  const value: AuthContextValue = {
    user,
    status,
    error,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    hasMfa: false, // Would need to check firebaseModule.isMfaEnabled
    signIn,
    signUp,
    signInWithProvider,
    signInWithSso,
    signOut,
    sendPasswordReset,
    sendEmailVerification,
    getToken,
    clearError,
    mfaResolver,
    verifyMfa,
    setupMfa,
    completeMfaSetup,
    removeMfa,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Authentication provider that manages auth state.
 * Uses mock data when AUTH_PROVIDER is "development"
 */
export function AuthProvider({ children }: AuthProviderProps) {
  if (AUTH_PROVIDER === "development") {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

/**
 * Hook to access authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
