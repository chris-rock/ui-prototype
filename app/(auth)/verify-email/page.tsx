"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function VerifyEmailPage() {
  const { user, sendEmailVerification, signOut, isLoading } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    try {
      await sendEmailVerification();
      setSent(true);
    } catch (err) {
      setError("Failed to send verification email. Please try again.");
    }
  };

  if (user?.emailVerified) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircleIcon className="h-6 w-6 text-success" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Email verified
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your email has been verified. You can now access your account.
        </p>

        <Link
          href="/"
          className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <EnvelopeIcon className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        Verify your email
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        We&apos;ve sent a verification link to{" "}
        <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
      </p>

      {sent && (
        <div className="mt-4 rounded-md bg-success/10 p-3">
          <p className="text-sm text-success-dark dark:text-success">
            Verification email sent! Check your inbox.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          className="w-full"
          onClick={handleResend}
          isLoading={isLoading}
          disabled={sent}
        >
          Resend verification email
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signOut}
        >
          Sign out
        </Button>
      </div>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        After verifying your email, refresh this page or{" "}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-primary hover:text-primary-dark"
        >
          click here
        </button>
      </p>
    </div>
  );
}
