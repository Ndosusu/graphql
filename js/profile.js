import { fetchGraphQL } from "./graphql.js";
import { logoutUser } from "./auth.js";

document.getElementById("logout").addEventListener("click", () => {
  logoutUser();
  window.location.href = "index.html";
});

(async () => {
  try {
    const userData = await fetchGraphQL(`{
      user {
        id
        login
      }
    }`);

    document.getElementById("login").textContent = userData.user[0].login;

    // fetchGraphQL(...) pour XP, résultats, etc.

  } catch (err) {
    alert("Session expirée ou erreur : " + err.message);
    logoutUser();
    window.location.href = "index.html";
  }
})();

//debugger
