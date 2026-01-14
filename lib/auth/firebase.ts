"use client";

import { initializeApp, getApps, FirebaseApp, FirebaseError } from "firebase/app";
import {
  Auth,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  SAMLAuthProvider,
  User,
  UserCredential,
  AuthErrorCodes,
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
  MultiFactorResolver,
  MultiFactorError,
  getMultiFactorResolver,
} from "firebase/auth";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
} from "@/lib/config/env";

// Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
};

// Initialize Firebase app (only once)
let app: FirebaseApp;
let auth: Auth;

export function initFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
  }
  return { app, auth };
}

export { auth };

// Auth provider types
export type OAuthProviderType = "google" | "github" | "microsoft";

/**
 * Get OAuth provider instance
 */
function getOAuthProvider(type: OAuthProviderType) {
  switch (type) {
    case "google":
      return new GoogleAuthProvider();
    case "github":
      return new GithubAuthProvider();
    case "microsoft":
      return new OAuthProvider("microsoft.com");
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; mfaRequired: boolean; resolver?: MultiFactorResolver }> {
  const { auth } = initFirebase();

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, mfaRequired: false };
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === AuthErrorCodes.MFA_REQUIRED
    ) {
      const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
      return { user: null, mfaRequired: true, resolver };
    }
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const { auth } = initFirebase();
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with OAuth provider (Google, GitHub, Microsoft)
 */
export async function signInWithOAuth(
  providerType: OAuthProviderType
): Promise<{ user: User | null; mfaRequired: boolean; resolver?: MultiFactorResolver }> {
  const { auth } = initFirebase();
  const provider = getOAuthProvider(providerType);

  try {
    const credential = await signInWithPopup(auth, provider);
    return { user: credential.user, mfaRequired: false };
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === AuthErrorCodes.MFA_REQUIRED
    ) {
      const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
      return { user: null, mfaRequired: true, resolver };
    }
    throw error;
  }
}

/**
 * Sign in with SAML SSO
 */
export async function signInWithSSO(
  orgId: string
): Promise<{ user: User | null; mfaRequired: boolean; resolver?: MultiFactorResolver }> {
  const { auth } = initFirebase();
  const provider = new SAMLAuthProvider(`saml.${orgId}`);

  try {
    const credential = await signInWithPopup(auth, provider);
    return { user: credential.user, mfaRequired: false };
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === AuthErrorCodes.MFA_REQUIRED
    ) {
      const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
      return { user: null, mfaRequired: true, resolver };
    }
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function logout(): Promise<void> {
  const { auth } = initFirebase();
  return signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  const { auth } = initFirebase();
  return sendPasswordResetEmail(auth, email);
}

/**
 * Send email verification to current user
 */
export async function sendVerificationEmail(): Promise<void> {
  const { auth } = initFirebase();
  const user = auth.currentUser;
  if (user) {
    return sendEmailVerification(user);
  }
  throw new Error("No user is currently signed in");
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  const { auth } = initFirebase();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user
 */
export function getCurrentUser(): User | null {
  const { auth } = initFirebase();
  return auth.currentUser;
}

/**
 * Get the current user's ID token
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const { auth } = initFirebase();
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken(forceRefresh);
  }
  return null;
}

// MFA Functions

/**
 * Check if user has MFA enabled
 */
export function isMfaEnabled(user: User): boolean {
  const factors = multiFactor(user).enrolledFactors;
  return factors.some((factor) => factor.factorId === "totp");
}

/**
 * Generate MFA secrets for enrollment
 */
export async function generateMfaSecrets(): Promise<{
  qrCodeUrl: string;
  secret: TotpSecret;
}> {
  const { auth } = initFirebase();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const multiFactorSession = await multiFactor(user).getSession();
  const totpSecret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);

  const accountName = user.email || "user";
  const issuer = "Mondoo";
  const qrCodeUrl = totpSecret.generateQrCodeUrl(accountName, issuer);

  return { qrCodeUrl, secret: totpSecret };
}

/**
 * Enroll user in MFA with TOTP
 */
export async function enrollMfa(
  secret: TotpSecret,
  verificationCode: string
): Promise<void> {
  const { auth } = initFirebase();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
    secret,
    verificationCode
  );

  await multiFactor(user).enroll(multiFactorAssertion, "Authenticator App");
}

/**
 * Verify MFA code during sign-in
 */
export async function verifyMfaCode(
  resolver: MultiFactorResolver,
  verificationCode: string
): Promise<User> {
  const { auth } = initFirebase();

  const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
    resolver.hints[0].uid,
    verificationCode
  );

  const credential = await resolver.resolveSignIn(multiFactorAssertion);
  await auth.updateCurrentUser(credential.user);

  return credential.user;
}

/**
 * Unenroll user from MFA
 */
export async function unenrollMfa(): Promise<void> {
  const { auth } = initFirebase();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const factors = multiFactor(user).enrolledFactors;
  const totpFactor = factors.find((factor) => factor.factorId === "totp");

  if (!totpFactor) {
    throw new Error("No MFA enrollment found for user");
  }

  await multiFactor(user).unenroll(totpFactor);
}

/**
 * Handle Firebase auth errors and return user-friendly messages
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return "An unexpected error occurred";
  }

  switch (error.code) {
    case AuthErrorCodes.INVALID_EMAIL:
      return "Invalid email address";
    case AuthErrorCodes.USER_DISABLED:
      return "This account has been disabled";
    case AuthErrorCodes.USER_DELETED:
      return "No account found with this email";
    case AuthErrorCodes.INVALID_PASSWORD:
    case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
      return "Invalid email or password";
    case AuthErrorCodes.EMAIL_EXISTS:
      return "An account with this email already exists";
    case AuthErrorCodes.WEAK_PASSWORD:
      return "Password is too weak. Use at least 8 characters";
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return "Too many failed attempts. Please try again later";
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return "Network error. Please check your connection";
    case AuthErrorCodes.POPUP_CLOSED_BY_USER:
      return "Sign-in was cancelled";
    case AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN:
      return "Please sign in again to continue";
    case "auth/invalid-verification-code":
      return "Invalid verification code";
    default:
      console.error("Unhandled auth error:", error.code, error.message);
      return error.message || "Authentication failed";
  }
}
