import { db } from "../firebase.js";

import { doc,collection, onSnapshot }from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { appState } from "../app/state.js";
import * as funcs from "../functions.js";

import {renderHome, renderAdmin, renderFullLeaderboard,loadPredictionsDetails} from "../ui/render.js";

export function setupRealtimeListeners() {

  // Config

  onSnapshot(
    doc(db, "config", "ui"),
    (snap) => {

      const config = snap.data();

      if (!config) return;

      appState.submission =
        Number(config.currentSubmission);

      appState.submissionOpen =
        config.submissionOpen;

      appState.round1Deadline =
        config.round1Deadline;

      appState.round2Deadline =
        config.round2Deadline;

      appState.round3Deadline =
        config.round3Deadline;

      appState.round4Deadline =
        config.round4Deadline;

      funcs.refreshHelperMessage();

    }
  );

  // Results

  onSnapshot(
    doc(db, "results", "Current"),
    (snap) => {

      const data = snap.data();

      if (!data) return;

      appState.results = data;

      renderHome();

      renderFullLeaderboard();

      loadPredictionsDetails();

    }
  );

}
