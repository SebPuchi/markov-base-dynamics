// src/data/matrixConfig.ts

export const STATE_ORDER = [
  // 0 Outs
  "0_000", "0_100", "0_010", "0_001", "0_110", "0_101", "0_011", "0_111",
  // 1 Out
  "1_000", "1_100", "1_010", "1_001", "1_110", "1_101", "1_011", "1_111",
  // 2 Outs
  "2_000", "2_100", "2_010", "2_001", "2_110", "2_101", "2_011", "2_111",
  // 3 Outs (The Absorbing State)
  "3_000"
] as const;

export type GameStateID = typeof STATE_ORDER[number];
