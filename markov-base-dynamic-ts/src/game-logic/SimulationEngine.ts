import { redSoxMatrix, yankeesMatrix, transitionLabelMatrix } from './matricies';

// Lookup for how many runners are on base for a given state index
const RUNNERS_ON_BASE_MAP = [
    0, 1, 1, 1, 2, 2, 2, 3, // 0 Outs
    0, 1, 1, 1, 2, 2, 2, 3, // 1 Out
    0, 1, 1, 1, 2, 2, 2, 3, // 2 Outs
    0 // 3 Outs
];

// Helper to get outs from state index
export const getOuts = (stateIdx: number) => {
    if (stateIdx === 24) return 3;
    if (stateIdx < 8) return 0;
    if (stateIdx < 16) return 1;
    return 2;
};

export class StatefulSimulationEngine {
    private soxCDF: number[][];
    private yanksCDF: number[][];

    // Internal Game State
    private currentState: number = 0;
    private B: number = 0; // Batter Count for formula
    private L: number = 0; // Runners Left on Base (captured at end of inning)


    constructor() {
        this.soxCDF = this.generateCDF(redSoxMatrix);
        this.yanksCDF = this.generateCDF(yankeesMatrix);
    }

    private generateCDF(matrix: number[][]): number[][] {
        return matrix.map(row => {
            let sum = 0;
            return row.map(prob => {
                sum += prob;
                return Number(sum.toFixed(4));
            });
        });
    }

    public resetInning() {
        this.currentState = 0;
        this.B = 0;
        this.L = 0;
    }

    public getCurrentState() {
        return this.currentState;
    }

    // --- THE MAIN STEP FUNCTION ---
    // Advances the game by exactly one play
    public step(isRedSoxBatting: boolean) {
        // 1. Get the probability row based on current state & team
        const cdf = isRedSoxBatting ? this.soxCDF : this.yanksCDF;
        const row = cdf[this.currentState];

        const rawMatrix = isRedSoxBatting ? redSoxMatrix : yankeesMatrix;
        //
        // 2. Roll the Dice
        let nextState = -1;
        while (nextState === -1) {
            const roll = Math.random();
            nextState = row.findIndex(val => roll < val);
        }
        const probability = rawMatrix[this.currentState][nextState];
        //
        // 3. Identify the Event Label
        const label = transitionLabelMatrix[this.currentState][nextState];

        // 4. Update "B" (Batters) Logic
        // Only increment if it's NOT a steal event
        if (!label.includes("Steal")) {
            this.B++;
        }

        // 5. Check for End of Inning (Runs Scored Calculation)
        let runsScored = 0;
        let inningOver = false;

        if (nextState === 24) {
            // Inning is over. Calculate Runs using the Formula: R = B - L - 3
            // L is the number of runners on base in the PREVIOUS state
            this.L = RUNNERS_ON_BASE_MAP[this.currentState];

            const R = Math.max(0, this.B - this.L - 3);
            runsScored = R;
            inningOver = true;
        }

        // 6. Update State
        const prevState = this.currentState;
        this.currentState = nextState;

        return {
            prevState,
            nextState,
            label, // e.g., "Single", "Out"
            runsScored,
            inningOver,
            outs: getOuts(nextState),
            probability
        };
    }

    // --- MONTE CARLO METHODS

    /**
     * Public method to run thousands of games instantly.
     * Uses local variables so it DOES NOT disrupt the visual simulation state.
     */
    public runMonteCarlo(iterations: number) {
        let soxWins = 0;
        let yanksWins = 0;
        let totalSoxRuns = 0;
        let totalYanksRuns = 0;

        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            const result = this.playFullGameFast();

            if (result.winner === 'redsox') soxWins++;
            else yanksWins++;

            totalSoxRuns += result.soxScore;
            totalYanksRuns += result.yanksScore;
        }

        const endTime = performance.now();

        return {
            iterations,
            soxWins,
            yanksWins,
            soxWinProb: soxWins / iterations,
            yanksWinProb: yanksWins / iterations,
            avgSoxScore: (totalSoxRuns / iterations).toFixed(2),
            avgYanksScore: (totalYanksRuns / iterations).toFixed(2),
            timeTaken: (endTime - startTime).toFixed(0) + 'ms'
        };
    }

    /**
     * Simulates one complete 9-inning game using standard rules.
     * Returns the winner and final scores.
     */
    private playFullGameFast() {
        let soxScore = 0;
        let yanksScore = 0;
        let inning = 1;

        // Play at least 9 innings, continuing if tied
        while (inning <= 9 || soxScore === yanksScore) {

            // --- TOP OF INNING (Red Sox) ---
            soxScore += this.simulateSingleInning(true);

            // RULE: Home Team Advantage (Walk-off condition / Not batting if winning)
            // If we are in the 9th inning (or later) and Yankees are already ahead 
            // after the top half, the game ends immediately.
            if (inning >= 9 && yanksScore > soxScore) {
                return { winner: 'yankees', soxScore, yanksScore };
            }

            // --- BOTTOM OF INNING (Yankees) ---
            const runsBottom = this.simulateSingleInning(false);
            yanksScore += runsBottom;

            // Check if Yankees won in the bottom half (Walk-off)
            if (inning >= 9 && yanksScore > soxScore) {
                return { winner: 'yankees', soxScore, yanksScore };
            }

            inning++;
        }

        const winner = soxScore > yanksScore ? 'redsox' : 'yankees';
        return { winner, soxScore, yanksScore };
    }

    /**
     * Simulates a single half-inning from 0 outs to 3 outs.
     * USES LOCAL VARIABLES ONLY (state, B, L) to avoid side effects.
     */
    private simulateSingleInning(isRedSox: boolean): number {
        // Select correct data
        const cdf = isRedSox ? this.soxCDF : this.yanksCDF;

        // Local state variables (independent of this.currentState)
        let state = 0; // Start Empty
        let B = 0;     // Local Batter count
        let L = 0;     // Local Runners Left

        // Loop until 3 Outs (State 24)
        while (state !== 24) {
            const row = cdf[state];

            // 1. Fast Roll (Retry loop for precision)
            let nextState = -1;
            while (nextState === -1) {
                const roll = Math.random();
                nextState = row.findIndex(val => roll < val);
            }

            // 2. Check Event Label for Scoring Logic
            // We need to check if B should increment (Same logic as step())
            const label = transitionLabelMatrix[state][nextState];
            if (!label.includes("Steal")) {
                B++;
            }

            // 3. Handle End of Inning
            if (nextState === 24) {
                // Capture runners on base from the PREVIOUS state
                L = RUNNERS_ON_BASE_MAP[state];
            }

            // 4. Advance State
            state = nextState;
        }

        // Apply Formula: R = B - L - 3
        return Math.max(0, B - L - 3);
    }

}
