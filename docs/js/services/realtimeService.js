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
  },

  (error) => {
    console.error("CONFIG ERROR", error);
  }
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
      console.log("RESULTS OK");
  },

  (error) => {
    console.error("RESULTS ERROR", error);
  }

      const data = snap.data();

      if (!data) return;

      appState.results = data;

      renderHome();
      renderFullLeaderboard();
      loadPredictionsDetails();

    }
  );

  if (appState.isAdmin) {

    onSnapshot(
      collection(db, "feedback"),

      (snapshot) => {
    console.log("FEEDBACK OK");
  },

  (error) => {
    console.error("FEEDBACK ERROR", error);
  }
        reloadFeedbackSection(snapshot);

      },

      (error) => {

        console.error(
          "Feedback listener ERROR",
          error
        );

      }
    );

  }

}
