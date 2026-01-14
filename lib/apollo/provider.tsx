"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloNextAppProvider,
  ApolloClient as NextApolloClient,
  InMemoryCache as NextInMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/provider";
import { getRegionEndpoint } from "@/lib/config/regions";
import { typePolicies } from "./cache-policies";
import { getFeatureFlags, formatFlagsForHeader } from "@/lib/config/feature-flags";

interface GraphQLContextValue {
  regionId: string;
}

const GraphQLContext = createContext<GraphQLContextValue | undefined>(undefined);

export interface ApolloProviderProps {
  children: ReactNode;
  regionId?: string;
}

function makeClient(token: string, endpoint: string) {
  const httpLink = new HttpLink({
    uri: endpoint,
    fetchOptions: { cache: "no-store" },
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  }));

  const featureFlagsLink = setContext((_, { headers }) => {
    const flags = getFeatureFlags();
    const headerValue = formatFlagsForHeader(flags);

    return {
      headers: {
        ...headers,
        ...(headerValue ? { "X-MONDOO-FEATURE-FLAGS": headerValue } : {}),
      },
    };
  });

  const traceLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      "X-Console-Url": typeof window !== "undefined" ? window.location.pathname : "",
    },
  }));

  const link = from([authLink, traceLink, featureFlagsLink, httpLink]);

  return new NextApolloClient({
    cache: new NextInMemoryCache({ typePolicies }),
    link,
  });
}

/**
 * Apollo Client provider that integrates with authentication.
 * Uses the experimental Next.js App Router support.
 */
export function ApolloProvider({ children, regionId = "us" }: ApolloProviderProps) {
  const auth = useAuth();

  // Don't render until we have auth
  if (!auth.user) {
    return null;
  }

  const endpoint = getRegionEndpoint(regionId);

  return (
    <GraphQLContext.Provider value={{ regionId }}>
      <ApolloNextAppProvider
        makeClient={() => {
          // Token will be added via the auth link - start with empty string
          // The auth link will use getToken() which handles both mock and real tokens
          return makeClient("", endpoint);
        }}
      >
        {children}
      </ApolloNextAppProvider>
    </GraphQLContext.Provider>
  );
}

/**
 * Hook to access the GraphQL context.
 */
export function useGraphQL() {
  const context = useContext(GraphQLContext);
  if (!context) {
    throw new Error("useGraphQL must be used within an ApolloProvider");
  }
  return context;
}
