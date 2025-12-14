import { Canvas } from '@react-three/fiber';
import styles from './Simulation.module.css'; 
import Field from './Field';

const Simulation = () => {
  return (
    <div className={styles.container}>
      
      {/* LEFT COLUMN: The 3D Scene */}
      <div className={styles.canvasContainer}>
        <Canvas shadows>
          <Field />
        </Canvas>
        
        {/* Overlay Label */}
        <div className={styles.liveIndicator}>
            <span className={styles.dot}></span> LIVE VIEW
        </div>
      </div>

      {/* RIGHT COLUMN: The Scoreboard & Stats */}
      <div className={styles.sidebar}>
        
        {/* Scoreboard Header */}
        <div className={styles.scoreboard}>
            <div className={styles.teamScore}>
                <span className={styles.teamName}>BOS</span>
                <span className={styles.score}>0</span>
            </div>
            <div className={styles.inningInfo}>
                <div className={styles.inningNumber}>TOP 1st</div>
                <div className={styles.outs}>0 Outs</div>
            </div>
            <div className={styles.teamScore}>
                <span className={styles.teamName}>NYY</span>
                <span className={styles.score}>0</span>
            </div>
        </div>

        {/* Placeholder for Game Log */}
        <div className={styles.gameLog}>
            <h3>Current Event</h3>
            <div className={styles.eventCard}>
                Waiting for simulation start...
            </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
             <button style={{width: '100%'}}>Simulate Next Play</button>
        </div>

      </div>
    </div>
  );
};

export default Simulation;
