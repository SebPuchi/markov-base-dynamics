import styles from './Info.module.css';
import redSoxLogo from '../assets/redsox.png';
import yankeesLogo from '../assets/yankees.png';

import type { Dispatch, SetStateAction } from 'react';
import type { ViewState } from './Navbar';

interface InfoProps {
    setView: Dispatch<SetStateAction<ViewState>>;
};

const Info = ({ setView }: InfoProps) => {
    return (
        <div className={styles.container}>


            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Red Sox - Yankees Markov Analysis</h1>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>
                    A Monte Carlo simulation of the 2024 MLB Season
                </p>

                <p style={{ fontSize: '1rem', color: '#666' }}>
                    Sebastian Pucher • Bryan O'Keefe • Will Gall
                </p>
            </div>

            <header className={styles.hero}>
                <img src={redSoxLogo} alt="Boston Red Sox" className={styles.logo} />
                <div className={styles.vs}>VS</div>
                <img src={yankeesLogo} alt="New York Yankees" className={styles.logo} />
            </header>

            <div className={styles.buttonWrapper}>
                <button onClick={() => setView("model")}>
                    The Model
                </button>

            </div>

            {/* 2. Overview Card */}
            <section className={styles.card}>
                <h2>How It Works</h2>
                <p>
                    This project moves beyond simple batting averages to model the flow of a baseball game
                    as a series of state transitions. The application breaks down the analysis into three stages:
                </p>
                <br />
                <ul>
                    <li><strong>The Model:</strong> We construct Markov matrices for both teams based on 2024 data, defining probabilities for hits, outs, and walks.</li>
                    <li><strong>The Visualizer:</strong> A live, simple demonstration of a single game engine running turn-by-turn.</li>
                    <li><strong>The Simulation:</strong> A Monte Carlo engine that runs thousands of games instantly to determine the statistical probability of winning a 3-game series.</li>
                </ul>
            </section>

            {/* 3. The "Event" Definition */}
            <div className={styles.grid}>
                <section className={styles.card}>
                    <h2>Defining "The Event"</h2>
                    <p>
                        In this simulation, we do not simply look at batting stats. We define any transition
                        in the state diagram as an <strong>EVENT</strong>.
                    </p>
                    <br />
                    <p>An Event is one of three specific triggers:</p>
                    <ul>
                        <li><strong>Plate Appearance:</strong> The standard outcome of a batter vs. pitcher matchup (Hit, Walk, Out).</li>
                        <li><strong>Steal Attempt:</strong> A calculated risk taken by a runner on 1st base to advance to 2nd.</li>
                        <li><strong>Double Play:</strong> A single defensive play where two outs are recorded</li>
                    </ul>
                </section>

                <section className={styles.card}>
                    <h2>New Features</h2>
                    <p>
                        Beyond the standard Markov chain, this model incorporates advanced logic
                        to better simulate game flow:
                    </p>
                    <br />
                    <ul>
                        <li><strong>Active Stealing:</strong> Runners may attempt to steal 2nd base based on speed metrics.</li>
                        <li><strong>Forced Double Plays:</strong> Ground balls with runners on 1st trigger double play probabilities.</li>
                        <li><strong>Sacrifice Flies:</strong> Modeled specifically when a runner is on 3rd base with less than 2 outs.</li>
                    </ul>
                </section>
            </div>

            {/* 4. Assumptions (The Rules) */}
            <section className={styles.card}>
                <h2>Assumptions & Rules</h2>
                <p>To create a feasible model, the following constraints were applied to the simulation:</p>

                <div className={styles.grid} style={{ marginTop: '1rem', gap: '1rem' }}>
                    <div>
                        <h3>Base Running</h3>
                        <ul>
                            <li><strong>Conservative Base Running:</strong> Runners advance the exact number of bases as the batter (e.g., Single = 1 base).</li>
                            <li><strong>Outs stop advancement:</strong> If a batter makes an out, no runners advance (except on Sac Flies).</li>
                            <li><strong>Stealing Limits:</strong> Runners can only steal 2nd base.</li>
                        </ul>
                    </div>
                    <div>
                        <h3>Game Logic</h3>
                        <ul>
                            <li><strong>No Errors:</strong> Defense is assumed to play perfectly.</li>
                            <li><strong>No Triple Plays:</strong> Rare events are excluded for statistical stability.</li>
                            <li><strong>Perfect Defense:</strong> Fielders always make the best play (Lead runner is the priority out).</li>
                            <li><strong>Standard Length:</strong> No extra innings; games conclude after 9.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <footer className={styles.citation}>
                Data Source: MLB stats, scores, History, & Records. Baseball. (n.d.).
                <a href="https://www.baseball-reference.com/" target="_blank" rel="noreferrer"> baseball-reference.com</a>
            </footer>
        </div>
    );
}

export default Info;


