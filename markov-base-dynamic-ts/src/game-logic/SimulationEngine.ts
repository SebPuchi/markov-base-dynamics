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
}
