// User state enum matching GraphQL schema
export enum UserState {
  ENABLED = "ENABLED",
  WAITLISTED = "WAITLISTED",
  UNKNOWN = "UNKNOWN",
}

// Organization type
export interface Organization {
  id: string;
  mrn: string;
  name: string;
  company?: string;
  description: string;
  capabilities: string[];
  spacesCount: number;
  subscriptionInfo?: {
    basePlan: {
      id: string;
      name: string;
    };
  };
}

// Space settings
export interface SpaceSettings {
  eolAssetsConfiguration?: {
    enable: boolean;
    monthsInAdvance?: number;
  };
  platformVulnerabilityConfiguration?: {
    enable: boolean;
  };
  casesConfiguration?: {
    enable: boolean;
    autoCreate?: boolean;
  };
  garbageCollectAssetsConfiguration?: {
    enable: boolean;
    afterDays?: number;
  };
}

// Space type
export interface Space {
  id: string;
  mrn: string;
  name: string;
  description: string;
  priorityFindings?: number;
  shared?: boolean;
  organization?: {
    id: string;
    mrn: string;
    name?: string;
    description?: string;
  };
  settings?: SpaceSettings;
}

// Viewer type
export interface Viewer {
  mrn: string;
  email?: string;
  name: string;
  createdAt?: string;
  state?: UserState;
  organizations?: Organization[];
  firstSpace?: Space;
}

// Viewer settings
export interface ViewerSettings {
  last_space_id?: string;
  colorblind?: string;
  colormode?: "light" | "dark" | "system";
  assetDoNotAskToDelete?: boolean;
}

// Raw viewer setting from GraphQL
export interface RawViewerSetting {
  key: string;
  value: string;
}

// Scope types
export enum ScopeType {
  Region = "region",
  Organization = "organization",
  Space = "space",
}

export interface Scope {
  type: ScopeType;
  id: string;
  mrn: string;
  name: string;
  description: string;
  iamActions: string[];
}

// IAM Actions for permission checks
export const IAM_ACTIONS = {
  // Organization actions
  ORG_EDIT: "mondoo.organization.edit",
  ORG_DELETE: "mondoo.organization.delete",
  ORG_MEMBERS_VIEW: "mondoo.organization.members.view",
  ORG_MEMBERS_EDIT: "mondoo.organization.members.edit",
  ORG_BILLING_VIEW: "mondoo.organization.billing.view",
  ORG_BILLING_EDIT: "mondoo.organization.billing.edit",

  // Space actions
  SPACE_EDIT: "mondoo.space.edit",
  SPACE_DELETE: "mondoo.space.delete",
  SPACE_AGENTS_VIEW: "mondoo.space.agents.view",
  SPACE_AGENTS_SETCONFIG: "mondoo.space.agents.setconfig",
  SPACE_INTEGRATIONS_VIEW: "mondoo.space.integrations.view",
  SPACE_INTEGRATIONS_EDIT: "mondoo.space.integrations.edit",
  SPACE_ASSETS_VIEW: "mondoo.space.assets.view",
  SPACE_ASSETS_EDIT: "mondoo.space.assets.edit",
  SPACE_POLICIES_VIEW: "mondoo.space.policies.view",
  SPACE_POLICIES_EDIT: "mondoo.space.policies.edit",
  SPACE_VULNERABILITIES_VIEW: "mondoo.space.vulnerabilities.view",
  SPACE_ADVISORIES_VIEW: "mondoo.space.advisories.view",
  SPACE_CHECKS_VIEW: "mondoo.space.checks.view",
  SPACE_FRAMEWORKS_VIEW: "mondoo.space.frameworks.view",
  SPACE_REPORTS_VIEW: "mondoo.space.reports.view",
  SPACE_REPORTS_EDIT: "mondoo.space.reports.edit",
  SPACE_CASES_VIEW: "mondoo.space.cases.view",
  SPACE_CASES_EDIT: "mondoo.space.cases.edit",
  SPACE_EXCEPTIONS_VIEW: "mondoo.space.exceptions.view",
  SPACE_EXCEPTIONS_EDIT: "mondoo.space.exceptions.edit",
} as const;

// MRN helpers
export function spaceMrnFromId(spaceId: string): string {
  return `//captain.api.mondoo.app/spaces/${spaceId}`;
}

export function organizationMrnFromId(orgId: string): string {
  return `//captain.api.mondoo.app/organizations/${orgId}`;
}

export function idFromMrn(mrn: string): string {
  const parts = mrn.split("/");
  return parts[parts.length - 1];
}
