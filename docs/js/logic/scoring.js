
import { SCORING } from "../constants.js";

// helper
export function getRoundFromKey(key) {
  if (key.startsWith("R1")) return 1;
  if (key.startsWith("R2")) return 2;
  if (key.startsWith("R3")) return 3;
  if (key.startsWith("R4")) return 4;
  return 0;
}

// score d'une soumission
export function calculateSubmissionScore(picks, results) {

  let score = 0;

  Object.keys(picks).forEach(key => {

    const resultValue = results[key];
    if (!resultValue) return;

    if (key.includes("_team")) {

      const round = getRoundFromKey(key);
      const multiplier = SCORING.roundMultiplier[round];

      if (picks[key] === resultValue) {

        score += SCORING.teamCorrect * multiplier;

        const gamesKey = key.replace("_team", "_games");

        if (
          results[gamesKey] &&
          Number(picks[gamesKey]) === Number(results[gamesKey])
        ) {
          score += SCORING.gamesCorrect * multiplier;
        }
      }
    }

    if (key === "Conn_Smythe") {
      if (picks[key] === results[key]) {
        score += SCORING.connSmythe;
      }
    }

  });

  return score;
}


// total utilisateur
export function calculateTotalScore(predictions, results) {

  let total = 0;

  predictions.forEach(pred => {

    const submissionNumber = pred.round;
    const picks = pred.picks;

    const filtered = {};

    Object.keys(picks).forEach(key => {

      const round = getRoundFromKey(key);

      if (round >= submissionNumber || key === "Conn_Smythe") {
        filtered[key] = picks[key];
      }
    });

    total += calculateSubmissionScore(filtered, results);
  });

  return total;
}


// leaderboard
export async function computeLeaderboard(predictions, results) {

  const users = {};

  predictions.forEach(data => {

    if (!users[data.userId]) {
      users[data.userId] = {
        name: data.userName,
        predictions: []
      };
    }

    users[data.userId].predictions.push(data);
  });

  const leaderboard = [];

  Object.values(users).forEach(user => {

    const score = calculateTotalScore(user.predictions, results);

    leaderboard.push({
      name: user.name,
      score: score
    });
  });

  leaderboard.sort((a, b) => b.score - a.score);

  return leaderboard;
}
