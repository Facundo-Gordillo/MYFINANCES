import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu, Pencil, Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
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
    const [cuentaEdit, setCuentaEdit] = useState(null);

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

    const handleDeleteCuenta = async (cuentaId) => {
        try {
            const cuentaRef = doc(db, `users/${userId}/cuentas`, cuentaId);
            await deleteDoc(cuentaRef);
            console.log("Cuenta eliminada exitosamente.");
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
        }
    };

    const handleEditCuenta = (cuenta) => {
        setCuentaEdit(cuenta); 
        setShowAddCuentas(true); // Muestra el formulario de agregar en caso de que la cuenta ya exista (debe mostrarlo con datos precargados)
    };

    return (
        <div className="home-container">
            {showAddCuentas ? (
                <AddCuentas
                    cuentaEdit={cuentaEdit} // Si existe (editando) pasa la cuenta
                    onCuentaAdded={() => {
                        setShowAddCuentas(false);
                        setCuentaEdit(null);  // Limpia la cuenta para no quedar con datos viejos
                    }}
                    onCancel={() => {
                        setShowAddCuentas(false);
                        setCuentaEdit(null);  // Limpia la cuenta al cancelar
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

                    {cuentas.length > 0 && (
                        <main className="home-main">
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
                                                <Pencil size={20} />
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteCuenta(cuenta.id)}
                                                title="Eliminar Cuenta"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </main>
                    )}

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
