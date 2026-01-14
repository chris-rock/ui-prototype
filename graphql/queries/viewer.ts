import { gql } from "@apollo/client";

export const LOAD_VIEWER = gql`
  query LoadViewer {
    viewer {
      mrn
      email
      name
      createdAt
      state
      organizations {
        id
        mrn
        name
        company
        description
        capabilities
        spacesCount
        subscriptionInfo {
          basePlan {
            id
            name
          }
        }
      }
      firstSpace {
        id
        mrn
        name
        description
        priorityFindings
        organization {
          id
          mrn
          name
          description
        }
        settings {
          eolAssetsConfiguration {
            enable
            monthsInAdvance
          }
          platformVulnerabilityConfiguration {
            enable
          }
          casesConfiguration {
            enable
            autoCreate
          }
          garbageCollectAssetsConfiguration {
            enable
            afterDays
          }
        }
      }
    }
    viewerSettings {
      key
      value
    }
  }
`;

export const GET_ORGANIZATION_SCOPE = gql`
  query GetOrganizationScope($mrn: String!, $actions: [String!]!) {
    organization(mrn: $mrn) {
      id
      mrn
      name
      description
      company
    }
    iamActions: testIamActions(resourceMrn: $mrn, actions: $actions)
  }
`;

export const GET_SPACE_SCOPE = gql`
  query GetSpaceScope($mrn: String!, $actions: [String!]!) {
    space(mrn: $mrn) {
      id
      mrn
      name
      description
      shared
      organization {
        id
        mrn
      }
    }
    iamActions: testIamActions(resourceMrn: $mrn, actions: $actions)
  }
`;

export const LOAD_SPACE = gql`
  query LoadSpace($spaceMrn: String!) {
    space(mrn: $spaceMrn) {
      id
      mrn
      name
      description
      priorityFindings
      organization {
        id
        mrn
        name
        description
      }
      settings {
        eolAssetsConfiguration {
          enable
          monthsInAdvance
        }
        platformVulnerabilityConfiguration {
          enable
        }
        casesConfiguration {
          enable
          autoCreate
        }
        garbageCollectAssetsConfiguration {
          enable
          afterDays
        }
      }
    }
  }
`;

export const SET_VIEWER_SETTING = gql`
  mutation SetViewerSetting($key: String!, $value: String!) {
    changeViewerSetting(key: $key, value: $value)
  }
`;
