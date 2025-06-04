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
  SkillsAmounts,
  AllAuditQuery,
  GithubLikeActivityQuery,
  BestFriendQuery,
  GetProgress,
} from './query.js';

(async () => {
  try {
    const userData = await fetchGraphQL(queryidLog);
    const user = userData.user[0];

    document.getElementById("user-id").textContent = user.id;
    document.getElementById("user-login").textContent = user.login;
    document.getElementById("user-firstName").textContent = user.firstName;
    document.getElementById("user-lastName").textContent = user.lastName;
    document.getElementById("user-campus").textContent = user.campus;
    document.getElementById("user-auditRatio").textContent = Math.round(user.auditRatio * 100) / 100;

    const piscineStats = await fetchGraphQL(GetPiscineStats);
    console.log("XP Piscine:", piscineStats);


    const skillsData = await fetchGraphQL(SkillsAmounts);
    let skills = skillsData.user[0].transactions;

    // Liste des skills à exclure
    const excludedSkills = [
      "skill_curriculum-objectives-completed",
      "skill_docker",
      "skill_game",
      "skill_sys-admin",
      "skill_unix",
      "skill_stats",
      "skill_css",
      "skill_sql",
      "skill_tcp",
    ];

    // Filtrer les skills pour exclure ceux non désirés
    skills = skills.filter(skill => !excludedSkills.includes(skill.type));

    // Calculer le maximum pour chaque skill
    const maxSkills = {};
    skills.forEach(skill => {
      if (!maxSkills[skill.type] || skill.amount > maxSkills[skill.type]) {
        maxSkills[skill.type] = skill.amount;
      }
    });

    const radarCtx = document.getElementById("skills-radar").getContext("2d");
    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: Object.keys(maxSkills),
        datasets: [{
          label: 'Skill Maximum',
          data: Object.values(maxSkills),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Skills Tree (Max)',
            font: { size: 16 }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    });


    const audits = await fetchGraphQL(AllAuditQuery);
    console.log("Audits:", audits);

    // Ajout du nombre d'audits réalisés et reçus
    const auditsList = audits.user[0]?.audits_as_auditor || [];
    const auditsReceived = audits.user[0]?.audits_as_auditee || [];
    const totalAudits = auditsList.length + auditsReceived.length;

    document.getElementById("audits-section").textContent = totalAudits;

    const activity = await fetchGraphQL(GithubLikeActivityQuery);
    console.log("Activity:", activity);



    const totalXpData = await fetchGraphQL(GetAllXPGains);

console.log("Toutes les transactions XP:", totalXpData.transaction);
console.log("Nombre total de transactions:", totalXpData.transaction.length);

// Analysons ce qui est exclu
const piscineTransactions = totalXpData.transaction.filter(tx => tx.path.includes('piscine-'));
const onboardingTransactions = totalXpData.transaction.filter(tx => tx.path.includes('/onboarding/'));

console.log("Transactions piscine exclues:", piscineTransactions.length);
console.log("XP piscine total:", piscineTransactions.reduce((sum, t) => sum + t.amount, 0));
console.log("Transactions onboarding exclues:", onboardingTransactions.length);
console.log("XP onboarding total:", onboardingTransactions.reduce((sum, t) => sum + t.amount, 0));

// Filtrer les transactions pour exclure les XP non pertinents
const validXpTransactions = totalXpData.transaction.filter(tx => {
  // Inclure les piscines maintenant
  // if (tx.path.includes('piscine-')) return false;
  
  // Exclure seulement l'onboarding
  if (tx.path.includes('/onboarding/')) return false;
  
  return true;
});

console.log("Transactions valides:", validXpTransactions.length);

const totalXp = validXpTransactions.reduce((sum, t) => sum + t.amount, 0);
const totalAllXp = totalXpData.transaction.reduce((sum, t) => sum + t.amount, 0);

console.log("XP total (toutes transactions):", totalAllXp);
console.log("XP total (filtrées):", totalXp);
console.log("Différence:", totalAllXp - totalXp);

    if (totalXp > 1000) {
      document.getElementById("total-xp").textContent = Math.round(totalXp / 1000) + "k";
    } else if (totalXp > 1000000) {
      document.getElementById("total-xp").textContent = Math.round(totalXp / 1000000) + "M";
    } else {
      document.getElementById("total-xp").textContent = totalXp;
    }
    
    // Pour le graphique, utilisez aussi les transactions filtrées
    const xpTransactions = validXpTransactions;

// Trier par date
xpTransactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

// Construire les données cumulées
let cumulativeXP = 0;
const labels = [];
const data = [];

xpTransactions.forEach(tx => {
  cumulativeXP += tx.amount;
  labels.push(new Date(tx.createdAt).toLocaleDateString());
  data.push(cumulativeXP);
});

// Affichage graph xp over time avec Chart.js
const ctx = document.getElementById("xp-chart").getContext("2d");
new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'XP Cumulé',
      data: data,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.3,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Progression de l’XP dans le temps',
        font: { size: 18 }
      },
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        }
      },
      y: {
        title: {
          display: true,
          text: 'XP Cumulé',
        }
      }
    }
  }
});

    const bestFriendData = await fetchGraphQL(BestFriendQuery);
    const groups = bestFriendData.user[0]?.groups || [];
    const myLogin = user.login;

    const friendCount = {};
    groups.forEach(g => {
      const members = g.group.members.map(m => m.user.login);
      members.forEach(login => {
        if (login !== myLogin) {
          friendCount[login] = (friendCount[login] || 0) + 1;
        }
      });
    });

    // Trier par nombre de projets communs (décroissant)
    const sortedFriends = Object.entries(friendCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const bestFriendList = document.getElementById("bestfriend-list");
    bestFriendList.innerHTML = ""; // Vide la liste avant d'ajouter

    sortedFriends.forEach(([login, count]) => {
      const li = document.createElement("li");
      li.textContent = `${login} (${count} projets communs)`;
      bestFriendList.appendChild(li);
    });

    const progressData = await fetchGraphQL(GetProgress);
    const progresses = progressData.progress || [];

    // Trier par date décroissante et prendre les 5 derniers
    const last5 = progresses
      .slice() // copie pour ne pas modifier l'original
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    const progressListElem = document.getElementById("progress-list");
    progressListElem.innerHTML = ""; // Vide avant d'ajouter

    last5.forEach(prog => {
      const li = document.createElement("li");
      li.textContent = prog.path.split('/').pop();
      progressListElem.appendChild(li);
    });

  } catch (err) {
    console.error("Erreur :", err);
    document.body.innerHTML = `<p>Erreur : ${err.message}</p>`;
  }
})();


