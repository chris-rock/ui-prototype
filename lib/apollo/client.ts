"use client";

import {
  ApolloClient,
  from,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { typePolicies } from "./cache-policies";
import { getFeatureFlags, formatFlagsForHeader } from "@/lib/config/feature-flags";

export interface ApolloClientOptions {
  token: string;
  refreshToken: () => Promise<string>;
  onUnauthorized: () => void;
  onGeolock?: () => void;
  endpoint: string;
}

/**
 * Create an Apollo Client instance configured for the Mondoo API.
 */
export function createApolloClient({
  token,
  endpoint,
}: ApolloClientOptions): ApolloClient {
  const bearerToken = token;

  // HTTP link to GraphQL endpoint
  const httpLink = new HttpLink({
    uri: endpoint,
  });

  // Auth link - adds Bearer token to requests
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: bearerToken ? `Bearer ${bearerToken}` : "",
    },
  }));

  // Feature flags link - adds feature flags header
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

  // Trace link - adds console URL for debugging
  const traceLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      "X-Console-Url": typeof window !== "undefined" ? window.location.pathname : "",
    },
  }));

  // Build the link chain
  const link = from([
    authLink,
    traceLink,
    featureFlagsLink,
    httpLink,
  ]);

  // Create cache with type policies
  const cache = new InMemoryCache({ typePolicies });

  return new ApolloClient({
    link,
    cache,
  });
}

/**
 * Create a "bare" Apollo Client for SSR/RSC without auth.
 * Used for server-side data fetching.
 */
export function createServerClient(endpoint: string): ApolloClient {
  const httpLink = new HttpLink({
    uri: endpoint,
    fetch,
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({ typePolicies }),
    ssrMode: true,
  });
}
