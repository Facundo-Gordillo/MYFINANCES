import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import '../../styles/home.css';
import '../../styles/cuentas.css';
import BarraLateral from "../home/barraLateral.jsx";
import AddCuentas from "./addCuentas.jsx";

// Botón flotante para agregar cuentas
const AddCuentasButton = ({ onClick }) => (
    <button className="floating-button addCentrado" id="addCuenta" onClick={onClick}>
        <Plus size={24} />
    </button>
);

// Botón para abrir barra lateral
const BarraLateralButton = ({ onClick }) => (
    <button className="floating-button barra-lateral-button" onClick={onClick}>
        <Menu size={24} />
    </button>
);

// Icono Dark/Light mode
const ThemeToggleIcon = ({ isDarkMode }) => (isDarkMode ? <Sun color="orange" /> : <Moon />);

function Cuentas({ onLogout }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem("isDarkMode");
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    const [showAddCuentas, setShowAddCuentas] = useState(false);
    const [showBarraLateral, setShowBarraLateral] = useState(false);
    const [userId, setUserId] = useState(null);
    const [cuentas, setCuentas] = useState([]);

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);

                // Escucha en tiempo real la colección "cuentas" del usuario
                const cuentasRef = collection(db, `users/${user.uid}/cuentas`);
                const unsubscribeSnapshot = onSnapshot(cuentasRef, (snapshot) => {
                    const cuentasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCuentas(cuentasData);
                });

                return () => unsubscribeSnapshot();
            } else {
                setUserId(null);
                setCuentas([]);
            }
        });

        return () => unsubscribeAuth();
    }, [auth, db]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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
                        <h1 className="home-title">Cuentas</h1>
                        <button
                            onClick={toggleDarkMode}
                            className="dark-mode-toggle"
                            aria-label="Cambiar modo"
                        >
                            <ThemeToggleIcon isDarkMode={isDarkMode} />
                        </button>
                    </header>

                    <main className="home-main">
                        {cuentas.length === 0 ? (
                            <p>Agregue una cuenta inicial</p>
                        ) : (
                            <div className="cuentas-container">
                                {cuentas.map((cuenta) => (
                                    <div className="cuenta-card" key={cuenta.id}>
                                        <span className="cuenta-nombre">{cuenta.nombre}</span>
                                        <span className="cuenta-monto">{cuenta.monto}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    <AddCuentasButton onClick={() => setShowAddCuentas(true)} />

                    {!showBarraLateral && (
                        <BarraLateralButton onClick={() => setShowBarraLateral(true)} />
                    )}

                    {showBarraLateral && (
                        <BarraLateral
                            isDarkMode={isDarkMode}
                            onLogout={onLogout}
                            onClose={() => setShowBarraLateral(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default Cuentas;
