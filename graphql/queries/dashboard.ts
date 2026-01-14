import { gql } from "@apollo/client";

export const GET_SPACE_DASHBOARD = gql`
  query GetSpaceDashboard($spaceMrn: String!) {
    space(mrn: $spaceMrn) {
      id
      mrn
      name
      priorityFindings
      stats {
        riskScore
        assetCount
        findingsCount
        complianceScore
        assetGroupStatistics {
          groupType
          statistics {
            total
            critical
            high
            medium
            low
            none
            unknown
          }
        }
      }
    }
  }
`;

export const GET_SEVERITY_DISTRIBUTION = gql`
  query GetSeverityDistribution($spaceMrn: String!) {
    space(mrn: $spaceMrn) {
      id
      stats {
        vulnerabilities {
          total
          critical
          high
          medium
          low
          none
        }
        advisories {
          total
          critical
          high
          medium
          low
          none
        }
        checks {
          total
          critical
          high
          medium
          low
          none
          pass
          fail
          error
          skip
          unknown
        }
      }
    }
  }
`;

export const GET_CRITICAL_FINDINGS = gql`
  query GetCriticalFindings($spaceMrn: String!, $first: Int!) {
    vulnerabilities(
      spaceMrn: $spaceMrn
      first: $first
      filter: { severity: CRITICAL }
      orderBy: { field: SEVERITY, direction: DESC }
    ) {
      edges {
        node {
          id
          mrn
          title
          severity
          cvssScore
          publishedAt
          affectedAssets
        }
      }
      totalCount
    }
  }
`;

export const GET_RECENT_ASSETS = gql`
  query GetRecentAssets($spaceMrn: String!, $first: Int!) {
    assets(
      spaceMrn: $spaceMrn
      first: $first
      orderBy: { field: LAST_UPDATED, direction: DESC }
    ) {
      edges {
        node {
          id
          mrn
          name
          platform {
            name
            title
          }
          state
          score {
            value
            grade
          }
          updatedAt
        }
      }
      totalCount
    }
  }
`;

export const GET_ORGANIZATION_DASHBOARD = gql`
  query GetOrganizationDashboard($orgMrn: String!) {
    organization(mrn: $orgMrn) {
      id
      mrn
      name
      spacesCount
      spaces(first: 100) {
        edges {
          node {
            id
            mrn
            name
            stats {
              riskScore
              assetCount
              findingsCount
            }
          }
        }
      }
    }
  }
`;
