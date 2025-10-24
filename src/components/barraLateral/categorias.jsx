import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu, Pencil, Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import '../../styles/home.css';
import '../../styles/cuentas.css';
import '../../styles/categorias.css';

import BarraLateral from "../home/barraLateral.jsx";
import AddCategorias from "./addCategorias.jsx";

import { useBarraLateral } from "../../hooks/useBarraLateral.jsx";
import useDarkMode from "../../hooks/useDarkMode.jsx";

// Botón flotante para agregar categoría
const AddCategoriasButton = ({ onClick }) => (
    <button className="floating-button addCentrado" id="addCategoria" onClick={onClick}>
        <Plus size={24} />
    </button>
);

// Botón para abrir barra lateral (solo visible si barra cerrada y mobile)
const BarraLateralButton = ({ onClick }) => (
    <button className="floating-button barra-lateral-button" onClick={onClick}>
        <Menu size={24} />
    </button>
);

// Icono Dark/Light mode
const ThemeToggleIcon = ({ isDarkMode }) => (isDarkMode ? <Sun color="orange" /> : <Moon />);

function Categorias({ onLogout }) {
    // Barra lateral
    const { isOpen, openBarra, closeBarra, isDesktop, isMobile } = useBarraLateral();

    // Dark mode
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    // UI States
    const [showAddCategorias, setShowAddCategorias] = useState(false);
    const [categoriaEdit, setCategoriaEdit] = useState(null);

    // Datos
    const [userId, setUserId] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();

    // === Cargar categorías del usuario en tiempo real ===
    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                const categoriasRef = collection(db, `users/${user.uid}/categorias`);
                unsubscribeSnapshot = onSnapshot(categoriasRef, (snapshot) => {
                    const categoriasData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setCategorias(categoriasData);
                    setLoading(false);
                });
            } else {
                setUserId(null);
                setCategorias([]);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []); // Solo al montar

    // === Eliminar categoría ===
    const handleDeleteCategoria = async (categoriaId) => {
        if (!userId) return;
        try {
            const categoriaRef = doc(db, `users/${userId}/categorias`, categoriaId);
            await deleteDoc(categoriaRef);
            console.log("Categoría eliminada exitosamente.");
        } catch (error) {
            console.error("Error al eliminar la categoría:", error);
        }
    };

    // === Editar categoría ===
    const handleEditCategoria = (categoria) => {
        setCategoriaEdit(categoria);
        setShowAddCategorias(true);
    };

    return (
        <div className="home-container">
            {showAddCategorias ? (
                <AddCategorias
                    categoriaEdit={categoriaEdit}
                    onCategoriaAdded={() => {
                        setShowAddCategorias(false);
                        setCategoriaEdit(null);
                    }}
                    onCancel={() => {
                        setShowAddCategorias(false);
                        setCategoriaEdit(null);
                    }}
                />
            ) : (
                <>
                    <header className="home-header">
                        <h1 className="home-title">Categorías</h1>
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
                            <p>Cargando categorías...</p>
                        </main>
                    ) : (
                        <main className="home-main">
                            {categorias.length === 0 ? (
                                <p>No tienes categorías registradas.</p>
                            ) : (
                                <div className="categoria-container cuentas-container">
                                    {categorias.map((categoria) => (
                                        <div className="categoria-wrapper" key={categoria.id}>
                                            <div
                                                className="categoria-card cuenta-card"
                                                style={{ backgroundColor: categoria.color || "#cccccc" }}
                                            >
                                                <span className="cuenta-nombre">{categoria.nombre}</span>
                                            </div>
                                            <div className="categoria-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEditCategoria(categoria)}
                                                    title="Editar Categoría"
                                                >
                                                    <Pencil size={20} color="green" />
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDeleteCategoria(categoria.id)}
                                                    title="Eliminar Categoría"
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

                    <AddCategoriasButton onClick={() => setShowAddCategorias(true)} />

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

export default Categorias;
