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
  GithubLikeActivityQuery,
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
    document.getElementById("user-auditRatio").textContent = user.auditRatio;


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

    const activity = await fetchGraphQL(GithubLikeActivityQuery);
    console.log("Activity:", activity);



    const totalXpData = await fetchGraphQL(GetAllXPGains);
    const totalXp = totalXpData.transaction.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById("total-xp").textContent = totalXp;
    
    const xpTransactions = totalXpData.transaction;

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

  } catch (err) {
    console.error("Erreur :", err);
    document.body.innerHTML = `<p>Erreur : ${err.message}</p>`;
  }
})();


