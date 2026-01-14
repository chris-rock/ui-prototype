/**
 * Environment configuration for the application.
 * All environment variables should be accessed through this module.
 */

// GraphQL API
export const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://api.mondoo.com/query";

// Firebase Configuration
export const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
export const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";

// OIDC Configuration
export const OIDC_AUTHORITY = process.env.NEXT_PUBLIC_OIDC_AUTHORITY || "";
export const OIDC_CLIENT_ID = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || "";
export const OIDC_REDIRECT_URI = process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI || "";

// Feature Flags
export const FEATURE_FLAGS = process.env.NEXT_PUBLIC_FEATURE_FLAGS || "";

// Analytics
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
export const DATADOG_APPLICATION_ID = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || "";
export const DATADOG_CLIENT_TOKEN = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || "";

// Auth Provider Selection
export type AuthProvider = "firebase" | "oidc" | "development";
export const AUTH_PROVIDER: AuthProvider = (process.env.NEXT_PUBLIC_AUTH_PROVIDER as AuthProvider) || "development";

// Session Configuration
export const SESSION_MAX_DURATION = parseInt(process.env.NEXT_PUBLIC_SESSION_MAX_DURATION || "3600000", 10);

// App Info
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "development";
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "development";

// Check if running in development
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";
