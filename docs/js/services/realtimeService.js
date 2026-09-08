import { db } from "../firebase.js";

import { doc,collection, onSnapshot }from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { appState } from "../app/state.js";
import * as funcs from "../functions.js";

import {renderHome, renderAdmin, renderFullLeaderboard,loadPredictionsDetails} from "../ui/render.js";
import { reloadFeedbackSection} from "../ui/adminFeedback.js";

let listenersStarted = false;
export function setupRealtimeListeners() {

  if (listenersStarted) {
    return;
  }

  listenersStarted = true;
  // Config

  onSnapshot(
  doc(db, "config", "ui"),

  (snap) => {

    console.log("CONFIG OK");

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

  },

  (error) => {

    console.error(
      "CONFIG ERROR",
      error
    );

  }
);

  // Results
  onSnapshot(
  doc(db, "results", "Current"),

  (snap) => {

    console.log("RESULTS OK");

    const data = snap.data();

    if (!data) return;

    appState.results = data;

    renderHome();
    renderFullLeaderboard();
    loadPredictionsDetails();

  },

  (error) => {

    console.error(
      "RESULTS ERROR",
      error
    );

  }

);

  if (appState.isAdmin) {

  onSnapshot(
    collection(db, "feedback"),

    (snapshot) => {

      console.log(
        "FEEDBACK OK"
      );

      reloadFeedbackSection(
        snapshot
      );

      const count =
        snapshot.size;

      if (
        window.lastFeedbackCount !==
          undefined &&
        count >
          window.lastFeedbackCount
      ) {

        alert(
          "💬 Nouveau commentaire reçu"
        );

      }

      window.lastFeedbackCount =
        count;

    },

    (error) => {

      console.error(
        "FEEDBACK ERROR",
        error
      );

    }

  );

}
}
