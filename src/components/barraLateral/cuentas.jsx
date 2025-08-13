import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu } from "lucide-react";
import '../../styles/home.css';
import '../../styles/cuentas.css';
import AddTransaction from "../home/addTransaction.jsx";
import BarraLateral from "../home/barraLateral.jsx";
import AddCuentas from "./addCuentas.jsx";

// Botón flotante para agregar transacciones
const AddCuentasButton = ({ onClick }) => (
    <button className="floating-button addCentrado" id="addCuenta" onClick={onClick}>
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
const ThemeToggleIcon = ({ isDarkMode }) => (isDarkMode ? <Sun color="orange" /> : <Moon />);

function Cuentas({ onLogout }) {
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

    // Estados AddCuentas y Barra Lateral
    const [showAddCuentas, setShowAddCuentas] = useState(false);
    const [showBarraLateral, setShowBarraLateral] = useState(false);

    return (
        <div className="home-container">
            {showAddCuentas ? (
                <AddCuentas
                    onCuentaAdded={() => setShowAddCuentas(false)}
                    onCancel={() => setShowAddCuentas(false)}
                />
            ) : (
                <>
                    <header className="home-header">
                        <h1 className="home-title">Agregar una cuenta</h1>
                        <button
                            onClick={toggleDarkMode}
                            className="dark-mode-toggle"
                            aria-label="Cambiar modo"
                        >
                            <ThemeToggleIcon isDarkMode={isDarkMode} />
                        </button>
                    </header>

                    <main className="home-main">
                        <p>AÑADIR CUENTA!!...</p>
                    </main>

                    <AddCuentasButton onClick={() => setShowAddCuentas(true)} />

                    {/* Mostrar botón solo si barra lateral está cerrada */}
                    {!showBarraLateral && (
                        <BarraLateralButton onClick={() => setShowBarraLateral(true)} />
                    )}

                    {/* Mostrar barra lateral solo si está abierta */}
                    {showBarraLateral && (
                        <BarraLateral isDarkMode={isDarkMode} onLogout={onLogout} onClose={() => setShowBarraLateral(false)} />
                    )}
                </>
            )}
        </div>
    );
}

export default Cuentas;