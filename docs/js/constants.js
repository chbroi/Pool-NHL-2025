//Constantes nécessaires au foctionnement du Pool

export const MATCH_ORDER = [
  "R1_EST_1","R1_EST_2","R1_EST_3","R1_EST_4",
  "R1_WEST_1","R1_WEST_2","R1_WEST_3","R1_WEST_4",
  "R2_EST_1","R2_EST_2","R2_WEST_1","R2_WEST_2",
  "R3_EST_1","R3_WEST_1",
  "R4_final",
  "Conn_Smythe"
];

export const POOL_CONFIG = {
  entryFee: 10,
  payout: {
    first: 4 / 7,
    second: 2 / 7,
    third: 1 / 7
  }
};

export const round1Ids = [
      'R1_EST_1_team', 'R1_EST_2_team', 'R1_EST_3_team', 'R1_EST_4_team',
      'R1_WEST_1_team', 'R1_WEST_2_team', 'R1_WEST_3_team', 'R1_WEST_4_team'
    ];



export const SCORING = {

  submissions: {

    1: {
      rounds: {
        1: { team: 1, games: 2 },
        2: { team: 2, games: 2 },
        3: { team: 4, games: 2 },
        4: { team: 8, games: 2 }
      },
      connSmythe: 4
    },

    2: {
      rounds: {
        2: { team: 1, games: 2 },
        3: { team: 2, games: 2 },
        4: { team: 4, games: 2 }
      },
      connSmythe: 3
    },

    3: {
      rounds: {
        3: { team: 1, games: 2 },
        4: { team: 2, games: 2 }
      },
      connSmythe: 2
    },

    4: {
      rounds: {
        4: { team: 1, games: 2 }
      },
      connSmythe: 1
    }

  }

};

