// queries.js

export const queryidLog = `{
  user {
    id
    login
    auditRatio
    campus
    lastName
    firstName
  }
}`;
//debugger

export const GetAllXPGains = `
  query GetUserDetailedXp {
    transaction(
      where: {
        type: {_eq: "xp"},
        path: {_niregex: "/(piscine-[^/]+/)"}
      },
      order_by: {createdAt: desc}
    ) {
      id
      type
      amount
      createdAt
      path
      objectId
    }
  }
`;

export const GetPiscineStats = `
  query GetXpStats {
    piscineGoXp: transaction_aggregate(where: {
      type: { _eq: "xp" },
      path: { _like: "%piscine-go%" }
    }) {
      aggregate {
        sum {
          amount
        }
      }
    }
    piscineJsXp: transaction_aggregate(where: {
      type: { _eq: "xp" },
      path: { _like: "%piscine-js/%" }
    }) {
      aggregate {
        sum {
          amount
        }
      }
    }
    cursusXp: transaction_aggregate(where: {
      type: { _eq: "xp" },
      _or: [
        { path: { _like: "%div-01%" }, _not: { path: { _like: "%piscine%" } } },
        { path: { _like: "%div-01/piscine-js" }, _not: { path: { _like: "%piscine-js/%" } } }
      ]
    }) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

export const PiscineXpWithDetails = `
  query GetXpStatsWithDetails {
    piscineGoXpAggregate: transaction_aggregate(
      where: {
        type: { _eq: "xp" },
        path: { _like: "%piscine-go%" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    piscineGoXpDetails: transaction(
      where: {
        type: { _eq: "xp" },
        path: { _like: "%piscine-go%" }
      },
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
      path
    }
    piscineJsXpAggregate: transaction_aggregate(
      where: {
        type: { _eq: "xp" },
        path: { _like: "%piscine-js/%" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    piscineJsXpDetails: transaction(
      where: {
        type: { _eq: "xp" },
        path: { _like: "%piscine-js/%" }
      },
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
      path
    }
    cursusXpAggregate: transaction_aggregate(
      where: {
        type: { _eq: "xp" },
        _or: [
          { path: { _like: "%div-01%" }, _not: { path: { _like: "%piscine%" } } },
          { path: { _like: "%div-01/piscine-js" }, _not: { path: { _like: "%piscine-js/%" } } }
        ]
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    cursusXpDetails: transaction(
      where: {
        type: { _eq: "xp" },
        _or: [
          { path: { _like: "%div-01%" }, _not: { path: { _like: "%piscine%" } } },
          { path: { _like: "%div-01/piscine-js" }, _not: { path: { _like: "%piscine-js/%" } } }
        ]
      },
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
      path
    }
  }
`;

export const SkillsAmounts = `
  query GetSkills {
    user {
      transactions(
        where: {
          _and: [
            { type: { _neq: "xp" } },
            { type: { _neq: "level" } },
            { type: { _neq: "up" } },
            { type: { _neq: "down" } }
          ]
        }
        order_by: { createdAt: asc }
      ) {
        type
        amount
      }
    }
  }
`;

export const BestFriendQuery = `
  query GetBestFriend {
    user {
      groups {
        id
        createdAt   
        group {
          object {
            type
          }
          captainId
          members {
            user {
              login
            }
          }
        }
      }
    }
  }
`;

export const AllAuditQuery = `
  query GetAudits {
    user {
      audits_as_auditor: audits(order_by: {createdAt: desc}) {
        createdAt
        grade
        group {
          object {
            name
            type
          }
          members {
            user {
              id
              login
            }
          }
        }
      }
    }
  }
`;

export const GithubLikeActivityQuery = `
  query GetActivity {
    user {
      progresses(order_by: {createdAt: desc}) {
        createdAt
      }
    }
  }
`;
