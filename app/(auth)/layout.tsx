import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Auth layout - minimal centered layout for authentication pages.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-darker to-secondary-darker">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <svg
              className="mx-auto h-10 w-auto text-white"
              viewBox="0 0 120 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm0 28c-6.627 0-12-5.373-12-12S13.373 8 20 8s12 5.373 12 12-5.373 12-12 12z" />
              <path d="M20 12c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              <text x="44" y="24" className="text-2xl font-bold" fill="currentColor">
                mondoo
              </text>
            </svg>
          </div>

          {/* Content card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
            {children}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white/60">
            &copy; {new Date().getFullYear()} Mondoo, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
