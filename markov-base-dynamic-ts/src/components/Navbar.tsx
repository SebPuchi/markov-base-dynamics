import { Dispatch, SetStateAction } from 'react';
import styles from './Navbar.module.css';

// Define the available views based on our outline
export type ViewState = 'intro' | 'model' | 'game-sim' | 'monte-carlo' | 'results';

interface NavbarProps {
    currentView: ViewState;
    setView: Dispatch<SetStateAction<ViewState>>;
}

const Navbar = ({ currentView, setView }: NavbarProps) => {

    const navItems: { id: ViewState; label: string }[] = [
        { id: 'intro', label: 'Introduction' },
        { id: 'model', label: 'The Model' },
        { id: 'game-sim', label: 'Game Simulation' },
        { id: 'monte-carlo', label: 'Monte Carlo Calculation' },
        { id: 'results', label: 'Results' },
    ];

    return (
        <nav className={styles.nav}>
            <div className={styles.logo} onClick={() => setView('intro')}>
                Stochastic Diamond
            </div>
            
            <ul className={styles.ul}>
                {navItems.map((item) => (
                    <li
                        key={item.id}
                        // If the item is active, attach both classes: "li active"
                        className={`${styles.li} ${currentView === item.id ? styles.active : ''}`}
                        onClick={() => setView(item.id)}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
