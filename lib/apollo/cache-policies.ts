import { TypePolicies } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { nexusStylePagination } from "./pagination";

/**
 * Apollo Client type policies for cache normalization and pagination.
 * Ported from the existing application with same patterns.
 */
export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      // Policy listings with pagination
      activePolicies: relayStylePagination([
        "input",
        ["scopeMrn", "orderBy", "query"],
      ]),

      // Advisories and CVEs
      advisories: relayStylePagination(["orderBy", "query", "platform"]),
      cves: relayStylePagination(["orderBy", "query", "state"]),

      // Documents and reports
      listDocuments: relayStylePagination(["scopeMRN"]),

      // Audit log
      auditlog: relayStylePagination([
        "resourceMrn",
        "orderBy",
        "actionFilter",
        "identityFilter",
        "timestampFilter",
      ]),

      // Assets
      assets: relayStylePagination([
        "scopeMrn",
        "queryTerms",
        "platformKind",
        "platformName",
        "rating",
        "reboot",
        "labels",
        "groups",
        "assetTypes",
        "scoreRange",
        "workflowMrn",
      ]),
      assetSearch: relayStylePagination(["input", "orderBy"]),

      // Aggregate scores (nexus-style)
      aggregateScores: nexusStylePagination(["entityMrn", "filter", "orderBy"]),

      // Compliance
      complianceFramework: {
        merge: true,
      },

      // Content/policies
      content: relayStylePagination([
        "input",
        [
          "assignedOnly",
          "catalogType",
          "categories",
          "contentMrns",
          "includePrivate",
          "includePublic",
          "orderBy",
          "platforms",
          "query",
          "scopeMrn",
        ],
      ]),

      // Data queries
      dataQueries: relayStylePagination(["entityMrn", "orderBy", "filter"]),

      // Service accounts and agents
      serviceAccounts: relayStylePagination(["spaceMrn", "queryTerms"]),
      agents: relayStylePagination([
        "spaceMrn",
        "queryTerms",
        "version",
        "state",
      ]),
      registrationTokens: relayStylePagination(["spaceMrn"]),

      // Scores
      mqueryAssetScores: relayStylePagination(["input"]),
      vulnerabilityScores: relayStylePagination([
        "orderBy",
        "filter",
        "entityMrn",
      ]),
      checkScores: relayStylePagination(["orderBy", "filter", "entityMrn"]),

      // Search
      search: relayStylePagination([
        "scope",
        "query",
        "orderBy",
        "type",
        "filters",
      ]),

      // Findings (nexus-style)
      findings: nexusStylePagination(["orderBy", "filter", "scopeMrn"]),
      cases: nexusStylePagination(["input"]),
      listExceptionGroups: nexusStylePagination([
        "input",
        ["scopeMrn", "types", "includeChildScopes", "filter", "orderBy", "mrn"],
      ]),

      // Remediation
      remediationForScope: relayStylePagination([
        "vulnId",
        "scopeMrn",
        "ecosystem",
        "packages",
      ]),

      // Shared spaces
      sharedSpaces: relayStylePagination(),
    },
  },

  // Entity type policies
  Cve: {
    keyFields: ["id"],
    fields: {
      advisoryAggregateScores: relayStylePagination(["id", "scopeMrn"]),
    },
  },

  DataQuery: {
    keyFields: ["id", "mrn"],
  },

  Case: {
    keyFields: ["mrn"],
    fields: {
      affectedAssets: relayStylePagination(["mrn"]),
      mitigated: relayStylePagination(["mrn"]),
    },
  },

  // Finding types with composite keys
  VulnerabilityScore: {
    keyFields: ["mrn", "asset"],
  },
  CheckScore: {
    keyFields: ["mrn", "asset"],
  },
  CheckFinding: {
    keyFields: ["mrn", "asset"],
  },
  AdvisoryFinding: {
    keyFields: ["mrn", "asset"],
  },
  CveFinding: {
    keyFields: ["mrn", "asset"],
  },
  GenericFinding: {
    keyFields: ["mrn", "asset"],
  },
  PackageFinding: {
    keyFields: ["id", "asset"],
  },

  // Disable cache key for aggregate scores
  AggregateScore: {
    keyFields: false,
  },

  // Compliance
  ComplianceControl: {
    keyFields: ["mrn"],
    merge: true,
    fields: {
      checks: relayStylePagination(),
      dataQueries: relayStylePagination(),
    },
  },

  // Resources with MRN keys
  ServiceAccount: {
    keyFields: ["mrn"],
  },
  RegistrationToken: {
    keyFields: ["mrn"],
  },
  Integration: {
    keyFields: ["mrn", "name"],
  },
  Space: {
    keyFields: ["mrn"],
    fields: {
      stats: {
        merge: true,
      },
    },
  },
  Workspace: {
    keyFields: ["mrn"],
  },
  Organization: {
    keyFields: ["mrn"],
    fields: {
      spacesList: relayStylePagination(["mrn", "name"]),
    },
  },
  User: {
    keyFields: ["mrn"],
  },
  ProductInfo: {
    keyFields: ["id", "name"],
  },
  Asset: {
    keyFields: ["mrn"],
    fields: {
      platform: {
        merge: true,
      },
      report: {
        merge: true,
      },
      score: {
        merge: false,
      },
    },
  },
  MqueryRemediation: {
    keyFields: ["id", "desc"],
  },
  CicdProjectJobs: {
    fields: {
      jobs: relayStylePagination(),
    },
  },
  Report: {
    fields: {
      cves: relayStylePagination(["assetMrn"]),
      packages: relayStylePagination(["assetMrn"]),
      advisories: relayStylePagination(["assetMrn"]),
      stats: {
        merge: true,
      },
    },
  },
  Agent: {
    keyFields: ["mrn"],
  },
  Invitation: {
    keyFields: ["mrn"],
  },
  Policy: {
    keyFields: ["mrn"],
    fields: {
      queries: {
        merge: false,
      },
    },
  },
  PolicyReport: {
    keyFields: ["mrn"],
  },
  Score: {
    keyFields: false,
  },
  MvdSource: {
    keyFields: false,
  },
  WIFAuthBinding: {
    keyFields: ["mrn"],
  },
};
