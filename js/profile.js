import { fetchGraphQL } from "./graphql.js";
import { logoutUser } from "./auth.js";
import { queryidLog, SkillsAmounts, BestFriendQuery, AllAuditQuery } from "./query.js";

document.getElementById("logout").addEventListener("click", () => {
  logoutUser();
  window.location.href = "index.html";
});

// Affiche les infos de base
async function displayProfile() {
  // Infos de base
  const userData = await fetchGraphQL(queryidLog);
  document.getElementById("login").textContent = userData.user.login;
  document.getElementById("user-id").textContent = userData.user.id;
  document.getElementById("user-login").textContent = userData.user.login;

  // Skills
  const skillsData = await fetchGraphQL(SkillsAmounts);
  const skills = skillsData.user.transactions;
  let skillsHtml = "<h3>Skills</h3><ul>";
  for (const skill of skills) {
    skillsHtml += `<li>${skill.type}: ${skill.amount}</li>`;
  }
  skillsHtml += "</ul>";
  document.getElementById("infos").insertAdjacentHTML("beforeend", skillsHtml);

  // ...après avoir récupéré les skills...
  const skillsList = document.getElementById("skills-list");
  skills.forEach(skill => {
    const li = document.createElement("li");
    li.textContent = `${skill.type}: ${skill.amount}`;
    skillsList.appendChild(li);
  });

  // Best friends (groupes)
  const groupsData = await fetchGraphQL(BestFriendQuery);
  const groups = groupsData.user.groups;
  let groupsHtml = "<h3>Groupes</h3><ul>";
  for (const g of groups) {
    const members = g.group.members.map(m => m.user.login).join(", ");
    groupsHtml += `<li>Type: ${g.group.object.type}, Captain: ${g.group.captainId}, Membres: ${members}</li>`;
  }
  groupsHtml += "</ul>";
  document.getElementById("infos").insertAdjacentHTML("beforeend", groupsHtml);

  // Audits
  const auditsData = await fetchGraphQL(AllAuditQuery);
  const audits = auditsData.user.audits_as_auditor;
  let auditsHtml = "<h3>Audits réalisés</h3><ul>";
  for (const audit of audits) {
    auditsHtml += `<li>${audit.createdAt} - ${audit.grade} - ${audit.group.object.name} (${audit.group.object.type})</li>`;
  }
  auditsHtml += "</ul>";
  document.getElementById("infos").insertAdjacentHTML("beforeend", auditsHtml);
}

displayProfile();
