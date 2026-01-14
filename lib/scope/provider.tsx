"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_ORGANIZATION_SCOPE, GET_SPACE_SCOPE } from "@/graphql/queries/viewer";
import { useViewer } from "@/lib/viewer";
import {
  ScopeType,
  spaceMrnFromId,
  organizationMrnFromId,
  IAM_ACTIONS,
  type Scope,
  type Organization,
  type Space,
} from "@/lib/types";

// All IAM actions to check for
const ALL_IAM_ACTIONS = Object.values(IAM_ACTIONS);

// Query result types
interface OrganizationScopeQueryResult {
  organization?: {
    id: string;
    mrn: string;
    name: string;
    description?: string;
    company?: string;
  };
  iamActions?: string[];
}

interface SpaceScopeQueryResult {
  space?: {
    id: string;
    mrn: string;
    name: string;
    description?: string;
    shared?: boolean;
    organization?: {
      id: string;
      mrn: string;
    };
  };
  iamActions?: string[];
}

interface OrganizationScope extends Scope {
  type: ScopeType.Organization;
  organization: Organization;
}

interface SpaceScope extends Scope {
  type: ScopeType.Space;
  space: Space;
  organization?: Organization;
}

interface ScopeContextValue {
  // Current active scope (most specific)
  activeScope: Scope | null;

  // Individual scopes
  organizationScope: OrganizationScope | null;
  spaceScope: SpaceScope | null;

  // Loading states
  isLoading: boolean;

  // Current IDs from URL
  spaceId: string | null;
  organizationId: string | null;

  // Permission helpers
  hasPermission: (action: string) => boolean;
  hasAnyPermission: (actions: string[]) => boolean;
}

const ScopeContext = createContext<ScopeContextValue | undefined>(undefined);

export interface ScopeProviderProps {
  children: ReactNode;
}

export function ScopeProvider({ children }: ScopeProviderProps) {
  const params = useParams();
  const pathname = usePathname();
  const { viewer } = useViewer();

  // Extract IDs from URL params (Next.js App Router uses path params)
  const spaceId = (params?.spaceId as string) || null;
  const organizationId = (params?.orgId as string) || null;

  // Build MRNs
  const spaceMrn = spaceId ? spaceMrnFromId(spaceId) : null;
  const organizationMrn = organizationId ? organizationMrnFromId(organizationId) : null;

  // Fetch organization scope
  const {
    data: orgData,
    loading: orgLoading,
  } = useQuery<OrganizationScopeQueryResult>(GET_ORGANIZATION_SCOPE, {
    variables: {
      mrn: organizationMrn,
      actions: ALL_IAM_ACTIONS,
    },
    skip: !organizationMrn,
  });

  // Fetch space scope
  const {
    data: spaceData,
    loading: spaceLoading,
  } = useQuery<SpaceScopeQueryResult>(GET_SPACE_SCOPE, {
    variables: {
      mrn: spaceMrn,
      actions: ALL_IAM_ACTIONS,
    },
    skip: !spaceMrn,
  });

  // Build organization scope
  const organizationScope = useMemo((): OrganizationScope | null => {
    if (!orgData?.organization) return null;

    const org = orgData.organization;
    return {
      type: ScopeType.Organization,
      id: org.id,
      mrn: org.mrn,
      name: org.name,
      description: org.description || "",
      iamActions: orgData.iamActions || [],
      organization: {
        id: org.id,
        mrn: org.mrn,
        name: org.name,
        company: org.company,
        description: org.description || "",
        capabilities: [],
        spacesCount: 0,
      },
    };
  }, [orgData]);

  // Build space scope
  const spaceScope = useMemo((): SpaceScope | null => {
    if (!spaceData?.space) return null;

    const space = spaceData.space;

    // Find the organization for this space
    let organization: Organization | undefined;

    if (space.shared) {
      // For shared spaces, create a pseudo-organization
      organization = {
        id: "shared-spaces",
        mrn: "//captain.api.mondoo.app/organizations/shared-spaces",
        name: "Shared Spaces",
        description: "Spaces shared with you",
        capabilities: [],
        spacesCount: 0,
      };
    } else if (space.organization) {
      // Find the org from viewer data
      organization = viewer?.organizations?.find(
        (org) => org.mrn === space.organization?.mrn
      );
    }

    return {
      type: ScopeType.Space,
      id: space.id,
      mrn: space.mrn,
      name: space.name,
      description: space.description || "",
      iamActions: spaceData.iamActions || [],
      space: {
        id: space.id,
        mrn: space.mrn,
        name: space.name,
        description: space.description || "",
        shared: space.shared,
        organization: space.organization,
      },
      organization,
    };
  }, [spaceData, viewer?.organizations]);

  // Determine active scope (most specific one)
  const activeScope = useMemo((): Scope | null => {
    if (spaceScope) return spaceScope;
    if (organizationScope) return organizationScope;
    return null;
  }, [spaceScope, organizationScope]);

  // Permission helpers
  const hasPermission = (action: string): boolean => {
    return activeScope?.iamActions.includes(action) ?? false;
  };

  const hasAnyPermission = (actions: string[]): boolean => {
    return actions.some((action) => hasPermission(action));
  };

  const value: ScopeContextValue = {
    activeScope,
    organizationScope,
    spaceScope,
    isLoading: orgLoading || spaceLoading,
    spaceId,
    organizationId,
    hasPermission,
    hasAnyPermission,
  };

  return (
    <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
  );
}

export function useScope() {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error("useScope must be used within a ScopeProvider");
  }
  return context;
}
