"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const { signIn, signInWithProvider, error, isLoading, clearError, status, verifyMfa } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    await signIn(email, password);
  };

  const handleMfaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    await verifyMfa(mfaCode);
  };

  const handleOAuth = async (provider: "google" | "github" | "microsoft") => {
    clearError();
    await signInWithProvider(provider);
  };

  // MFA verification screen
  if (status === "mfa_required" || status === "mfa_verifying") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter the 6-digit code from your authenticator app.
        </p>

        <form onSubmit={handleMfaSubmit} className="mt-6 space-y-4">
          <Input
            label="Verification Code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="000000"
            error={error || undefined}
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={status === "mfa_verifying"}
          >
            Verify
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Sign in to your account
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:text-primary-dark">
          Sign up
        </Link>
      </p>

      {/* OAuth buttons */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth("google")}
          disabled={isLoading}
        >
          <GoogleIcon className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth("github")}
          disabled={isLoading}
        >
          <GitHubIcon className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth("microsoft")}
          disabled={isLoading}
        >
          <MicrosoftIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          error={error || undefined}
          required
        />

        <div className="flex items-center justify-end">
          <Link
            href="/reset-password"
            className="text-sm text-primary hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      {/* SSO link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Using SSO?{" "}
        <Link href="/sso" className="text-primary hover:text-primary-dark">
          Sign in with your organization
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700" />
      <div className="mt-2 h-4 w-64 bg-gray-200 rounded dark:bg-gray-700" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-700" />
      </div>
      <div className="mt-6 space-y-4">
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="h-10 bg-gray-200 rounded dark:bg-gray-700" />
      </div>
    </div>
  );
}

// OAuth provider icons
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022" />
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00" />
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF" />
      <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900" />
    </svg>
  );
}
