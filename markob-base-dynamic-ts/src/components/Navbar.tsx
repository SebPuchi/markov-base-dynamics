import { Dispatch, SetStateAction } from 'react';
import styles from './Navbar.module.css';

// Define the available views based on our outline
export type ViewState = 'intro' | 'model' | 'visualizer' | 'simulation' | 'results';

interface NavbarProps {
    currentView: ViewState;
    setView: Dispatch<SetStateAction<ViewState>>;
}

const Navbar = ({ currentView, setView }: NavbarProps) => {

    const navItems: { id: ViewState; label: string }[] = [
        { id: 'intro', label: 'Introduction' },
        { id: 'model', label: 'The Model' },
        { id: 'visualizer', label: '3D Visualizer' },
        { id: 'simulation', label: 'Simulation' },
        { id: 'results', label: 'Results' },
    ];

    return (
        <nav className={styles.nav}>
            <div className={styles.logo} onClick={() => setView('intro')}>
                STOCHASTIC DIAMOND
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
