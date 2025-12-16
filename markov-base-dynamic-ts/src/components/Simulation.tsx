import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './Simulation.module.css';
import { STATE_ORDER } from '../game-logic/matrixConfig';
import { StatefulSimulationEngine, getOuts } from '../game-logic/SimulationEngine';

// --- Visual Helper ---
const getBasesForState = (stateIdx: number): boolean[] => {
    if (stateIdx === 24) return [false, false, false];
    const pattern = stateIdx % 8;
    // Map pattern to [1st, 2nd, 3rd]
    switch(pattern) {
        case 1: return [true, false, false];
        case 2: return [false, true, false];
        case 3: return [false, false, true];
        case 4: return [true, true, false];
        case 5: return [true, false, true];
        case 6: return [false, true, true];
        case 7: return [true, true, true];
        default: return [false, false, false];
    }
};

const Simulation = () => {
    // 1. Initialize Engine (Once)
    const engine = useMemo(() => new StatefulSimulationEngine(), []);

    // 2. State
    const [gameState, setGameState] = useState(0); 
    const [inning, setInning] = useState(1);
    const [isTop, setIsTop] = useState(true); 
    const [scores, setScores] = useState({ redsox: 0, yankees: 0 });
    const [gameLog, setGameLog] = useState<{id: number, text: string, type: 'redsox' | 'yankees'}[]>([]);
    
    // Auto-Play State
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    
    // Refs
    const logIdRef = useRef(0);
    const savedCallback = useRef<() => void>(() => {}); // Placeholder

    // --- Core Game Step ---
    const handleNextPlay = () => {
        const teamSlug = isTop ? 'redsox' : 'yankees';
        const teamName = isTop ? 'Red Sox' : 'Yankees';

        // A. Step Engine
        const result = engine.step(isTop);

        // B. Add Log (Limit to last 50 items for performance)
        const newLog = {
            id: logIdRef.current++,
            text: `${isTop ? 'Top' : 'Bot'} ${inning}: ${result.label}`,
            type: teamSlug as 'redsox' | 'yankees'
        };
        setGameLog(prev => [newLog, ...prev].slice(0, 50));

        // C. Check Inning End
        if (result.inningOver) {
            // Update Score
            if (result.runsScored > 0) {
                setScores(prev => ({
                    ...prev,
                    [teamSlug]: prev[teamSlug as 'redsox' | 'yankees'] + result.runsScored
                }));
                setGameLog(prev => [{
                    id: logIdRef.current++,
                    text: `>>> ${teamName} SCORE ${result.runsScored} RUN(S)! <<<`,
                    type: teamSlug as 'redsox' | 'yankees'
                }, ...prev]);
            }

            // Reset and Switch Sides
            engine.resetInning();
            setGameState(0); 

            if (!isTop) setInning(i => i + 1);
            setIsTop(!isTop);

        } else {
            setGameState(result.nextState);
        }
    };

    // --- Auto-Play "Stale Closure" Fix ---
    // 1. Keep Ref updated with the latest function
    useEffect(() => {
        savedCallback.current = handleNextPlay;
    });

    // 2. Interval calls the Ref
    useEffect(() => {
        if (isAutoPlaying) {
            const id = setInterval(() => savedCallback.current(), 800); // 800ms speed
            return () => clearInterval(id);
        }
    }, [isAutoPlaying]);


    // --- Render Logic ---
    const bases = getBasesForState(gameState);
    const outs = getOuts(gameState);

    return (
        <div className={styles.container}>
            {/* LEFT: Controls */}
            <div className={styles.sidebar}>
                <div className={styles.controlPanel}>
                    <h3 style={{marginTop: 0, color: 'white'}}>Game Controls</h3>
                    <button className={styles.bigButton} onClick={handleNextPlay} disabled={isAutoPlaying}>
                        NEXT PLAY ▶
                    </button>
                    <button className={styles.secondaryButton} onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
                        {isAutoPlaying ? 'STOP Auto-Play' : 'START Auto-Play'}
                    </button>
                </div>

                <div className={styles.statBox}>
                    <h4>Current State</h4>
                    <p style={{fontSize: '1.2rem', margin: '0.5rem 0'}}>
                        {STATE_ORDER[gameState] ? STATE_ORDER[gameState].replace(/_/g, " - ") : "Resetting..."}
                    </p>
                    <p style={{color: '#aaa', fontSize: '0.8rem'}}>Matrix Index: {gameState}</p>
                </div>
            </div>

            {/* CENTER: Field */}
            <div className={styles.centerStage}>
                <div className={styles.scoreboard}>
                    <div className={styles.team}>
                        <span className={styles.teamName}>BOS</span>
                        <span className={styles.teamScore} style={{color: 'var(--sox-red)'}}>{scores.redsox}</span>
                    </div>
                    
                    <div className={styles.gameInfo}>
                        <span className={styles.inning}>{isTop ? 'TOP' : 'BOT'} {inning}</span>
                        <span className={styles.outs}>{outs} OUT{outs !== 1 ? 'S' : ''}</span>
                    </div>

                    <div className={styles.team}>
                        <span className={styles.teamName}>NYY</span>
                        <span className={styles.teamScore} style={{color: 'white'}}>{scores.yankees}</span>
                    </div>
                </div>

                <div className={styles.fieldContainer}>
                    <svg width="300" height="300" viewBox="0 0 200 200">
                        <path d="M100 20 L180 100 L100 180 L20 100 Z" className={styles.diamondPath} />
                        
                        {/* Bases - Dynamically colored */}
                        <rect x="92" y="12" width="16" height="16" transform="rotate(45 100 20)"
                            className={`${styles.base} ${bases[1] ? styles.active : ''}`} /> {/* 2nd */}
                        <rect x="12" y="92" width="16" height="16" transform="rotate(45 20 100)"
                            className={`${styles.base} ${bases[2] ? styles.active : ''}`} /> {/* 3rd */}
                        <rect x="172" y="92" width="16" height="16" transform="rotate(45 180 100)"
                            className={`${styles.base} ${bases[0] ? styles.active : ''}`} /> {/* 1st */}
                        
                        <path d="M92 180 L108 180 L108 188 L100 196 L92 188 Z" fill="white" />
                    </svg>
                    <div style={{position: 'absolute', bottom: '20px', fontWeight: 'bold'}}>
                        Batting: {isTop ? "Red Sox" : "Yankees"}
                    </div>
                </div>
            </div>

            {/* RIGHT: Feed */}
            <div className={styles.feed}>
                <div className={styles.feedHeader}>PLAY FEED</div>
                <div className={styles.feedList}>
                    {gameLog.map(log => (
                        <div key={log.id} className={`${styles.playItem} ${styles[log.type]}`}>
                            <span className={styles.playResult}>{log.text.split(':')[1]}</span>
                            <span className={styles.playContext}>{log.text.split(':')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Simulation;
