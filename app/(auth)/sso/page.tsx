"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function SSOPage() {
  const { signInWithSso, error, isLoading, clearError } = useAuth();

  const [orgId, setOrgId] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    await signInWithSso(orgId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Sign in with SSO
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Enter your organization ID to sign in with your company&apos;s identity provider.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Organization ID"
          type="text"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="your-org-id"
          hint="Contact your administrator if you don't know your organization ID"
          error={error || undefined}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Continue with SSO
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Want to sign in differently?{" "}
        <Link href="/login" className="text-primary hover:text-primary-dark">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
