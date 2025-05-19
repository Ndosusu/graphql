(async () => {
  try {
    const data = await fetchGraphQL(queryidLog);
    const user = data.user[0];

    
    console.log("ID:", user.id);
    console.log("Login:", user.login);

    //add user data to the page
    document.getElementById("user-id").textContent = user.id;
    document.getElementById("user-login").textContent = user.login;

  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur :", err);
    document.body.innerHTML = `<p>Erreur : ${err.message}</p>`;
  }
})();

// GraphQL query to fetch user ID and login
const queryidLog = `{
  user {
    id
    login
  }
}`;


import { getToken } from './auth.js';

export async function fetchGraphQL(query, variables = {}) {
  const token = getToken(); // récupère le JWT stocké après login

  const response = await fetch("https://madere.ytrack.learn.ynov.com/api/graphql-engine/v1/graphql", {
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
