

import { getToken } from './auth.js';

export async function fetchGraphQL(query, variables = {}) {
  const token = getToken(); // récupère le JWT stocké après login

  const response = await fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join("\n"));
  }

  return json.data;
}

import {
  queryidLog,
  GetAllXPGains,
  GetPiscineStats,
  PiscineXpWithDetails,
  SkillsAmounts,
  BestFriendQuery,
  AllAuditQuery,
  GithubLikeActivityQuery
} from './query.js';

(async () => {
  try {
    const userData = await fetchGraphQL(queryidLog);
    const user = userData.user[0];

    document.getElementById("user-id").textContent = user.id;
    document.getElementById("user-login").textContent = user.login;

    // Exemple : récupération des stats XP Piscine
    const piscineStats = await fetchGraphQL(GetPiscineStats);
    console.log("XP Piscine:", piscineStats);

    // Ajoute ici d'autres requêtes selon tes besoins
    const skills = await fetchGraphQL(SkillsAmounts);
    console.log("Skills:", skills);

    const audits = await fetchGraphQL(AllAuditQuery);
    console.log("Audits:", audits);

    const activity = await fetchGraphQL(GithubLikeActivityQuery);
    console.log("Activity:", activity);

  } catch (err) {
    console.error("Erreur :", err);
    document.body.innerHTML = `<p>Erreur : ${err.message}</p>`;
  }
})();

