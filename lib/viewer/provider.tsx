"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import { LOAD_VIEWER, SET_VIEWER_SETTING } from "@/graphql/queries/viewer";
import type {
  Viewer,
  ViewerSettings,
  RawViewerSetting,
  Organization,
} from "@/lib/types";

// Check if auth is disabled for development
const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

// Mock viewer data for development
const mockViewer: Viewer = {
  mrn: "//mondoo.app/users/dev-user",
  name: "Dev User",
  email: "dev@example.com",
  organizations: [
    {
      id: "org-1",
      mrn: "//mondoo.app/organizations/org-1",
      name: "Demo Organization",
      description: "A demo organization for development",
      capabilities: [],
      spacesCount: 3,
      subscriptionInfo: {
        basePlan: { id: "enterprise", name: "Enterprise" },
      },
    },
  ],
  firstSpace: {
    id: "space-1",
    mrn: "//mondoo.app/spaces/space-1",
    name: "Production",
    description: "Production environment",
    priorityFindings: 42,
    organization: {
      id: "org-1",
      mrn: "//mondoo.app/organizations/org-1",
      name: "Demo Organization",
    },
  },
};

// Query result type
interface LoadViewerQueryResult {
  viewer?: Viewer;
  viewerSettings?: RawViewerSetting[];
}

interface ViewerContextValue {
  viewer: Viewer | null;
  viewerSettings: ViewerSettings;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  findOrg: (orgId: string) => Organization | undefined;
  updateViewerSetting: (key: string, value: string) => Promise<void>;
}

const ViewerContext = createContext<ViewerContextValue | undefined>(undefined);

function parseViewerSettings(rawSettings: RawViewerSetting[]): ViewerSettings {
  const settings: ViewerSettings = {};

  for (const { key, value } of rawSettings) {
    switch (key) {
      case "last_space_id":
        settings.last_space_id = value;
        break;
      case "colorblind":
        settings.colorblind = value;
        break;
      case "colormode":
        if (value === "light" || value === "dark" || value === "system") {
          settings.colormode = value;
        }
        break;
      case "assetDoNotAskToDelete":
        settings.assetDoNotAskToDelete = value === "true";
        break;
    }
  }

  return settings;
}

export interface ViewerProviderProps {
  children: ReactNode;
}

export function ViewerProvider({ children }: ViewerProviderProps) {
  // Use mock data when auth is disabled
  if (DISABLE_AUTH) {
    const value: ViewerContextValue = {
      viewer: mockViewer,
      viewerSettings: { colormode: "system" },
      isLoading: false,
      error: null,
      refetch: async () => {},
      findOrg: (orgId: string) => mockViewer.organizations?.find((org) => org.id === orgId),
      updateViewerSetting: async () => {},
    };

    return (
      <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
    );
  }

  const { data, error, refetch } = useSuspenseQuery<LoadViewerQueryResult>(LOAD_VIEWER, {
    errorPolicy: "all",
  });

  const [setViewerSetting] = useMutation(SET_VIEWER_SETTING);

  const viewer = data?.viewer as Viewer | null;
  const viewerSettings = useMemo(() => {
    const rawSettings = (data?.viewerSettings || []) as RawViewerSetting[];
    return parseViewerSettings(rawSettings);
  }, [data?.viewerSettings]);

  const findOrg = (orgId: string): Organization | undefined => {
    return viewer?.organizations?.find((org) => org.id === orgId);
  };

  const updateViewerSetting = async (key: string, value: string) => {
    await setViewerSetting({
      variables: { key, value },
      refetchQueries: [{ query: LOAD_VIEWER }],
    });
  };

  const handleRefetch = async () => {
    await refetch();
  };

  const value: ViewerContextValue = {
    viewer,
    viewerSettings,
    isLoading: false, // useSuspenseQuery suspends, so when we have data, we're not loading
    error: error as Error | null,
    refetch: handleRefetch,
    findOrg,
    updateViewerSetting,
  };

  return (
    <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}
