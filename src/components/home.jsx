import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu } from "lucide-react";
import "../styles/home.css";
import AddTransaction from "./addTransaction.jsx";
import BarraLateral from "./barraLateral.jsx";

// Botón flotante para agregar transacciones
const AddTransactionButton = ({ onClick }) => (
    <button className="floating-button add-transaction-button" onClick={onClick}>
        <Plus size={24} />
    </button>
);

// Botón para abrir barra lateral (solo visible si barra cerrada)
const BarraLateralButton = ({ onClick }) => (
    <button className="floating-button barra-lateral-button" onClick={onClick}>
        <Menu size={24} />
    </button>
);

// Icono Dark/Light mode
const ThemeToggleIcon = ({ isDarkMode }) => (isDarkMode ? <Sun color="orange"/> : <Moon />);

function Home({ onLogout }) {
    // Dark Mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem("isDarkMode");
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

    // Estados AddTransaction y Barra Lateral
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showBarraLateral, setShowBarraLateral] = useState(false);

    return (
        <div className="home-container">
            {showAddTransaction ? (
                <AddTransaction
                    onTransactionAdded={() => setShowAddTransaction(false)}
                    onCancel={() => setShowAddTransaction(false)}
                />
            ) : (
                <>
                    <header className="home-header">
                        <h1 className="home-title">Resumen de Gastos</h1>
                        <button
                            onClick={toggleDarkMode}
                            className="dark-mode-toggle"
                            aria-label="Cambiar modo"
                        >
                            <ThemeToggleIcon isDarkMode={isDarkMode} />
                        </button>
                    </header>

                    <main className="home-main">
                        <p>Contenido de la página Home...</p>
                    </main>

                    <AddTransactionButton onClick={() => setShowAddTransaction(true)} />

                    {/* Mostrar botón solo si barra lateral está cerrada */}
                    {!showBarraLateral && (
                        <BarraLateralButton onClick={() => setShowBarraLateral(true)} />
                    )}

                    {/* Mostrar barra lateral solo si está abierta */}
                    {showBarraLateral && (
                        <BarraLateral  onLogout={onLogout} onClose={() => setShowBarraLateral(false)} />
                    )}
                </>
            )}
        </div>
    );
}

export default Home;
