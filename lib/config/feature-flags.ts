/**
 * Feature flag management for the application.
 * Flags can be set via environment variables or remotely.
 */

import { FEATURE_FLAGS } from "./env";

export interface FeatureFlags {
  // Navigation
  workspaces: boolean;
  commandPalette: boolean;

  // Features
  multiTenant: boolean;
  ticketing: boolean;
  compliance: boolean;
  cicd: boolean;
  reporting: boolean;
  securityModel: boolean;

  // Experimental
  foundationThemes: boolean;
  initiatives: boolean;
  platformPolicyManagement: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  workspaces: true,
  commandPalette: true,
  multiTenant: true,
  ticketing: true,
  compliance: true,
  cicd: true,
  reporting: true,
  securityModel: true,
  foundationThemes: false,
  initiatives: false,
  platformPolicyManagement: false,
};

/**
 * Parse feature flags from a string (format: "flag1=enabled;flag2=disabled")
 */
function parseFlags(flagString: string): Partial<FeatureFlags> {
  const flags: Partial<FeatureFlags> = {};
  if (!flagString) return flags;

  flagString.split(";").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) {
      const flagKey = key.trim() as keyof FeatureFlags;
      flags[flagKey] = value.trim() === "enabled";
    }
  });

  return flags;
}

/**
 * Get all feature flags with defaults and overrides applied
 */
export function getFeatureFlags(): FeatureFlags {
  const envFlags = parseFlags(FEATURE_FLAGS);
  const localFlags = typeof window !== "undefined"
    ? parseFlags(localStorage.getItem("feature-flags") || "")
    : {};

  return {
    ...DEFAULT_FLAGS,
    ...envFlags,
    ...localFlags,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return getFeatureFlags()[flag];
}

/**
 * Format feature flags as HTTP header value
 */
export function formatFlagsForHeader(flags: FeatureFlags): string {
  return Object.entries(flags)
    .map(([key, value]) => `${key}=${value ? "enabled" : "disabled"}`)
    .join(";");
}
