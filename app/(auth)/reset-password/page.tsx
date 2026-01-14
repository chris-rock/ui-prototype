"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const { sendPasswordReset, error, isLoading, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      // Error is handled by the provider
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircleIcon className="h-6 w-6 text-success" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-gray-900 dark:text-white">{email}</span>
        </p>

        <Link
          href="/login"
          className="mt-6 flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-transparent text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Back to sign in
        </Link>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Didn&apos;t receive the email?{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-primary hover:text-primary-dark"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={error || undefined}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
