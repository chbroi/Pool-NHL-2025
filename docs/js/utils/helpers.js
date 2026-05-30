import { appState } from "../app/state.js";

// ✅ vérifier si un résultat est disponible
export function isResultAvailable(key) {
  return appState.results[key] && appState.results[key] !== "";
}



export function getParentMatch(matchKey, teamNb) {

  const map = {
    R2_EST_1: ["R1_EST_1_team", "R1_EST_2_team"],
    R2_EST_2: ["R1_EST_3_team", "R1_EST_4_team"],
    R2_WEST_1: ["R1_WEST_1_team", "R1_WEST_2_team"],
    R2_WEST_2: ["R1_WEST_3_team", "R1_WEST_4_team"],

    R3_EST_1: ["R2_EST_1_team", "R2_EST_2_team"],
    R3_WEST_1: ["R2_WEST_1_team", "R2_WEST_2_team"],

    R4_final: ["R3_EST_1_team", "R3_WEST_1_team"]
  };

  return map[matchKey] ? map[matchKey][teamNb-1] : null;
}
