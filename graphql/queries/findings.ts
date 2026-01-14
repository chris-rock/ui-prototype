import { gql } from "@apollo/client";

export const GET_VULNERABILITIES = gql`
  query GetVulnerabilities(
    $spaceMrn: String!
    $first: Int
    $after: String
    $filter: VulnerabilityFilter
    $orderBy: VulnerabilityOrder
  ) {
    vulnerabilities(
      spaceMrn: $spaceMrn
      first: $first
      after: $after
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        cursor
        node {
          id
          mrn
          cveId
          title
          description
          severity
          cvssScore
          publishedAt
          modifiedAt
          affectedAssets
          fixedBy
          state
          exception {
            id
            justification
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_VULNERABILITY_DETAIL = gql`
  query GetVulnerabilityDetail($mrn: String!, $spaceMrn: String!) {
    vulnerability(mrn: $mrn, spaceMrn: $spaceMrn) {
      id
      mrn
      cveId
      title
      description
      severity
      cvssScore
      cvssVector
      publishedAt
      modifiedAt
      affectedAssets
      fixedBy
      state
      references {
        url
        title
      }
      affectedPackages {
        name
        version
        fixedVersion
      }
      exception {
        id
        justification
        createdAt
        expiresAt
        createdBy {
          name
          email
        }
      }
    }
  }
`;

export const GET_ADVISORIES = gql`
  query GetAdvisories(
    $spaceMrn: String!
    $first: Int
    $after: String
    $filter: AdvisoryFilter
    $orderBy: AdvisoryOrder
  ) {
    advisories(
      spaceMrn: $spaceMrn
      first: $first
      after: $after
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        cursor
        node {
          id
          mrn
          advisoryId
          title
          description
          severity
          publishedAt
          modifiedAt
          affectedAssets
          state
          cves {
            id
            cveId
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_CHECKS = gql`
  query GetChecks(
    $spaceMrn: String!
    $first: Int
    $after: String
    $filter: CheckFilter
    $orderBy: CheckOrder
  ) {
    checks(
      spaceMrn: $spaceMrn
      first: $first
      after: $after
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        cursor
        node {
          id
          mrn
          title
          description
          severity
          impact
          state
          affectedAssets
          passingAssets
          policy {
            name
            mrn
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_EXCEPTION = gql`
  mutation CreateException($input: CreateExceptionInput!) {
    createException(input: $input) {
      exception {
        id
        justification
        createdAt
        expiresAt
      }
    }
  }
`;

export const DELETE_EXCEPTION = gql`
  mutation DeleteException($id: ID!) {
    deleteException(id: $id)
  }
`;
