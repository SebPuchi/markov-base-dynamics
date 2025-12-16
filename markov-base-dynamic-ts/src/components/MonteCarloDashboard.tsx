import { useState, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, ReferenceLine 
} from 'recharts';
import styles from './MonteCarloDashboard.module.css';

import { StatefulSimulationEngine } from '../game-logic/SimulationEngine';

const MonteCarloDash = () => {
    // 1. Initialize Engine
    const engine = useMemo(() => new StatefulSimulationEngine(), []);

    // 2. UI State
    const [iterations, setIterations] = useState(1000); // Default to 1k
    const [isSimulating, setIsSimulating] = useState(false);
    
    // 3. Data State
    const [convergenceData, setConvergenceData] = useState<{name: number, prob: number}[]>([]);
    const [finalStats, setFinalStats] = useState({
        soxWins: 0,
        yanksWins: 0,
        soxProb: 0,
        yanksProb: 0,
        avgSox: 0,
        avgYanks: 0
    });

    // --- The Simulation Logic ---
    const runSimulation = async () => {
        setIsSimulating(true);
        setConvergenceData([]); // Reset Graph
        
        // We run in "batches" to create graph points
        // Total points on graph ~ 20-50 for smoothness
        const batchCount = 50; 
        const gamesPerBatch = Math.floor(iterations / batchCount);
        
        let totalSoxWins = 0;
        let totalYanksWins = 0;
        let runningSoxScore = 0;
        let runningYanksScore = 0;

        // Use setTimeout to allow UI to render between batches (animation effect)
        for (let i = 1; i <= batchCount; i++) {
            // Run a batch using the engine's optimized method
            // Note: We use the engine's public Monte Carlo method for the batch
            const batchResult = engine.runMonteCarlo(gamesPerBatch);
            
            // Aggregate totals
            totalSoxWins += batchResult.soxWins;
            totalYanksWins += batchResult.yanksWins;
            
            // Parse averages back to totals for running count (approximation for dashboard)
            runningSoxScore += (parseFloat(batchResult.avgSoxScore) * gamesPerBatch);
            runningYanksScore += (parseFloat(batchResult.avgYanksScore) * gamesPerBatch);

            const currentTotalGames = i * gamesPerBatch;
            const currentProb = (totalSoxWins / currentTotalGames) * 100;

            // Update Graph Data
            setConvergenceData(prev => [
                ...prev, 
                { name: currentTotalGames, prob: parseFloat(currentProb.toFixed(1)) }
            ]);

            // Small delay to visualize the "convergence"
            await new Promise(r => setTimeout(r, 20));
        }

        // Finalize Stats
        const totalGames = batchCount * gamesPerBatch;
        setFinalStats({
            soxWins: totalSoxWins,
            yanksWins: totalYanksWins,
            soxProb: parseFloat(((totalSoxWins / totalGames) * 100).toFixed(1)),
            yanksProb: parseFloat(((totalYanksWins / totalGames) * 100).toFixed(1)),
            avgSox: parseFloat((runningSoxScore / totalGames).toFixed(2)),
            avgYanks: parseFloat((runningYanksScore / totalGames).toFixed(2))
        });

        setIsSimulating(false);
    };

    // --- Chart Data Helpers ---
    const barData = [
        { name: 'Red Sox', wins: finalStats.soxWins, color: 'var(--sox-red)' },
        { name: 'Yankees', wins: finalStats.yanksWins, color: '#ffffff' }, // Yankees White
    ];

    return (
        <div className={styles.dashboardContainer}>
            
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Monte Carlo Analytics</h1>
                    <p className={styles.subtitle}>Probabilistic Series Modeling • 2024 Season Data</p>
                </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.sliderGroup}>
                    <div className={styles.sliderLabel}>
                        <span>Simulation Depth</span>
                        <span>{iterations.toLocaleString()} Games</span>
                    </div>
                    <input 
                        type="range" 
                        min="100" 
                        max="10000" 
                        step="100"
                        value={iterations} 
                        onChange={(e) => setIterations(parseInt(e.target.value))}
                        className={styles.rangeInput}
                        disabled={isSimulating}
                    />
                </div>
                <button 
                    className={styles.runButton} 
                    onClick={runSimulation}
                    disabled={isSimulating}
                >
                    {isSimulating ? 'Processing...' : 'RUN SIMULATION'}
                </button>
            </div>

            {/* KPI Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard} style={{borderTop: '4px solid var(--sox-red)'}}>
                    <div className={styles.statLabel}>Red Sox Win Prob</div>
                    <div className={styles.statValue}>
                        {finalStats.soxProb}%
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Wins (BOS)</div>
                    <div className={styles.statValue} style={{color: 'var(--sox-red)'}}>
                        {finalStats.soxWins.toLocaleString()}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Wins (NYY)</div>
                    <div className={styles.statValue} style={{color: 'white'}}>
                        {finalStats.yanksWins.toLocaleString()}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Expected Score</div>
                    <div className={styles.statValue} style={{fontSize: '1.8rem'}}>
                        {finalStats.avgSox} - {finalStats.avgYanks}
                    </div>
                    <div style={{fontSize: '0.8rem', color: '#666'}}>
                        Avg Runs per Game
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className={styles.chartsGrid}>
                
                {/* 1. Convergence Graph */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Convergence of Win Probability</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={convergenceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#888" 
                                label={{ value: 'Iterations', position: 'insideBottomRight', offset: -5 }} 
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                stroke="#888" 
                                label={{ value: 'Win %', angle: -90, position: 'insideLeft' }} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#333', border: 'none' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <ReferenceLine y={50} stroke="white" strokeDasharray="3 3" />
                            <Line 
                                type="monotone" 
                                dataKey="prob" 
                                stroke="var(--sox-red)" 
                                strokeWidth={3} 
                                dot={false} 
                                animationDuration={300}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Head to Head Bar Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Outcome Distribution</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: '#333', border: 'none' }}
                            />
                            <Bar dataKey="wins" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

export default MonteCarloDash;

