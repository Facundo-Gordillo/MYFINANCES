import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu, Pencil, Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import "../../styles/home.css";
import "../../styles/cuentas.css";

import BarraLateral from "../home/barraLateral.jsx";
import AddCuentas from "./addCuentas.jsx";

import { useBarraLateral } from "../../hooks/useBarraLateral.jsx";
import useDarkMode from "../../hooks/useDarkMode.jsx";

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
    const { isOpen, openBarra, closeBarra, isDesktop, isMobile } = useBarraLateral();
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const [showAddCuentas, setShowAddCuentas] = useState(false);
    const [cuentaEdit, setCuentaEdit] = useState(null);

    const [userId, setUserId] = useState(null);
    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();

    // === Cargar cuentas del usuario en tiempo real ===
    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                const cuentasRef = collection(db, `users/${user.uid}/cuentas`);
                unsubscribeSnapshot = onSnapshot(cuentasRef, (snapshot) => {
                    const cuentasData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setCuentas(cuentasData);
                    setLoading(false);
                });
            } else {
                setUserId(null);
                setCuentas([]);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []); // Solo al montar

    // === Eliminar cuenta ===
    const handleDeleteCuenta = async (cuentaId) => {
        if (!userId) return;
        try {
            const cuentaRef = doc(db, `users/${userId}/cuentas`, cuentaId);
            await deleteDoc(cuentaRef);
            console.log("Cuenta eliminada exitosamente.");
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
        }
    };

    // === Editar cuenta ===
    const handleEditCuenta = (cuenta) => {
        setCuentaEdit(cuenta);
        setShowAddCuentas(true);
    };

    return (
        <div className="home-container">
            {showAddCuentas ? (
                <AddCuentas
                    cuentaEdit={cuentaEdit}
                    onCuentaAdded={() => {
                        setShowAddCuentas(false);
                        setCuentaEdit(null);
                    }}
                    onCancel={() => {
                        setShowAddCuentas(false);
                        setCuentaEdit(null);
                    }}
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

                    {loading ? (
                        <main className="home-main">
                            <p>Cargando cuentas...</p>
                        </main>
                    ) : (
                        <main className="home-main">
                            {cuentas.length === 0 ? (
                                <p>No tienes cuentas registradas.</p>
                            ) : (
                                <div className="cuentas-container">
                                    {cuentas.map((cuenta) => (
                                        <div className="cuenta-card" key={cuenta.id}>
                                            <span className="cuenta-nombre">{cuenta.nombre}</span>
                                            <span className="cuenta-monto">{cuenta.monto}</span>
                                            <div className="cuenta-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEditCuenta(cuenta)}
                                                    title="Editar Cuenta"
                                                >
                                                    <Pencil size={20} color="green" />
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDeleteCuenta(cuenta.id)}
                                                    title="Eliminar Cuenta"
                                                >
                                                    <Trash2 size={20} color="red" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    )}

                    <AddCuentasButton onClick={() => setShowAddCuentas(true)} />

                    {/* Solo mostrar botón para abrir barra en mobile */}
                    {isMobile && !isOpen && <BarraLateralButton onClick={openBarra} />}

                    {/* Mostrar la barra cuando está abierta */}
                    {isOpen && (
                        <BarraLateral
                            isDarkMode={isDarkMode}
                            onLogout={onLogout}
                            onClose={closeBarra}
                        />
                    )}

                </>
            )}
        </div>
    );
}

export default Cuentas;
