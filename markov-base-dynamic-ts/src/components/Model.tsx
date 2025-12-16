import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from './Model.module.css';
import diagram from '../assets/final_markov_red_sox.jpg';

import type { ViewState } from "./Navbar";

import type { Dispatch, SetStateAction } from 'react';

interface ModelProps {
    setView: Dispatch<SetStateAction<ViewState>>;
};
const Model = ({ setView }: ModelProps) => {
    // Helper to generate the 8 base states for a given out count
    const renderStateColumn = (outs: number) => {
        const baseStates = [
            "0-0-0", "1-0-0", "0-1-0", "0-0-1",
            "1-1-0", "1-0-1", "0-1-1", "1-1-1"
        ];

        return (
            <div className={styles.stateColumn}>
                <h3>{outs} Out{outs !== 1 ? 's' : ''}</h3>
                <ul className={styles.stateList}>
                    {baseStates.map((base, idx) => (
                        <li key={idx}>
                            {outs} Out, {base}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const legendItems = [
        { label: "Single", color: "darkblue" },
        { label: "Double", color: "orange" },
        { label: "Triple", color: "green" },
        { label: "Home Run", color: "#d3d3d3" }, // Light Gray
        { label: "Steal", color: "blue" },
        { label: "GIDP", color: "#FFD700" }, // Yellow
        { label: "Outs", color: "black" },
        { label: "Sac Fly", color: "#555555" }, // Dark Gray
        { label: "Walks / HBP", color: "pink" },
    ];

    return (
        <div className={styles.container}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>The Markov Model</h1>
                <p style={{ color: '#666', marginBottom:'1.5rem' }}>Visualizing the 25 States of Baseball</p>

                <div className={styles.buttonWrapper}>
                    <button onClick={() => setView("game-sim")}>
                        Begin Simulation
                    </button>
                </div>
            </div>




            {/* 1. The Interactive Diagram */}
            <section className={styles.card}>
                <h2>State Transition Diagram</h2>
                <p style={{ marginBottom: '1rem' }}>
                    The diagram below represents all possible state transitions for the Red Sox.
                    The notation <strong>#-#-#</strong> represents a binary indicator of a runner on
                    1st, 2nd, and 3rd base respectively.
                </p>

                <div className={styles.diagramContainer}>
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit={true}
                    >
                        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                            <img
                                src={diagram}
                                alt="Markov Chain Diagram"
                                className={styles.diagramImage}
                            />
                        </TransformComponent>
                    </TransformWrapper>
                </div>
                <p className={styles.instructions}>
                    (Click and drag to pan • Scroll to zoom)
                </p>
            </section>

            {/* 2. Event Legend */}
            <section className={styles.card}>
                <h2>Event Legend</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    Each color in the diagram corresponds to a specific "Event" that triggers a state transition.
                </p>
                <div className={styles.legendGrid}>
                    {legendItems.map((item) => (
                        <div key={item.label} className={styles.legendItem}>
                            <span
                                className={styles.colorDot}
                                style={{ backgroundColor: item.color }}
                            />
                            {item.label}
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. List of States */}
            <section className={styles.card}>
                <h2>The 25 Game States</h2>
                <p>
                    The model tracks exactly 25 unique states. The inning begins at
                    <strong> 0 Outs, 0-0-0</strong> and ends inevitably at <strong>3 Outs</strong>.
                </p>

                <div className={styles.stateSection}>
                    <div className={styles.stateGrid}>
                        {renderStateColumn(0)}
                        {renderStateColumn(1)}
                        {renderStateColumn(2)}
                    </div>

                    <div className={styles.finalState}>
                        3 Outs (Absorbing State)
                    </div>
                </div>
            </section>

            {/* 4. Placeholder for Matrices */}
            <section className={styles.card}>
                <h2>Transition Matrices</h2>
                <p>
                    We have calculated unique probability matrices for both the Red Sox and Yankees
                    based on the 2024 season data. These matrices drive the Monte Carlo engine.
                </p>
                <div style={{
                    marginTop: '2rem',
                    padding: '3rem',
                    background: '#f4f4f4',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#888'
                }}>
                    [Matrix Data Tables Coming Soon]
                </div>
            </section>

        </div>
    );
}

export default Model;
