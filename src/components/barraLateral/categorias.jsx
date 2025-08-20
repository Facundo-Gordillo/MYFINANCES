import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu, Pencil, Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import '../../styles/home.css';
import '../../styles/cuentas.css';
import '../../styles/categorias.css';
import BarraLateral from "../home/barraLateral.jsx";
import AddCategorias from "./addCategorias.jsx";

// Botón flotante para agregar categorías
const AddCategoriasButton = ({ onClick }) => (
    <button className="floating-button addCentrado" id="addCategoria" onClick={onClick}>
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

function Categorias({ onLogout }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem("isDarkMode");
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    const [showAddCategorias, setShowAddCategorias] = useState(false);
    const [showBarraLateral, setShowBarraLateral] = useState(false);
    const [userId, setUserId] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [categoriaEdit, setCategoriaEdit] = useState(null);

    const auth = getAuth();
    const db = getFirestore();

    // Dark mode toggle
    useEffect(() => {
        localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    // Listener de autenticación y carga de categorías
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);

                const categoriasRef = collection(db, `users/${user.uid}/categorias`);
                const unsubscribeSnapshot = onSnapshot(categoriasRef, (snapshot) => {
                    const categoriasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCategorias(categoriasData);
                });

                return () => unsubscribeSnapshot();
            } else {
                setUserId(null);
                setCategorias([]);
            }
        });

        return () => unsubscribeAuth();
    }, [auth, db]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    const handleDeleteCategoria = async (categoriaId) => {
        try {
            const categoriaRef = doc(db, `users/${userId}/categorias`, categoriaId);
            await deleteDoc(categoriaRef);
            console.log("Categoría eliminada exitosamente.");
        } catch (error) {
            console.error("Error al eliminar la categoría:", error);
        }
    };

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

                    {categorias.length > 0 && (
                        <main className="home-main">
                            <div className="categoria-container cuentas-container">
                                {categorias.map((categoria) => (
                                    <div className="categoria-wrapper" key={categoria.id}>
                                        <div
                                            className="categoria-card cuenta-card"
                                            style={{ backgroundColor: categoria.color || '#000000' }}
                                        >
                                            <span className="cuenta-nombre">{categoria.nombre}</span>
                                        </div>
                                        <div className="categoria-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditCategoria(categoria)}
                                                title="Editar Categoría"
                                            >
                                                <Pencil size={20} color="green"/>
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteCategoria(categoria.id)}
                                                title="Eliminar Categoría"
                                            >
                                                <Trash2 size={20} color="red"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </main>
                    )}

                    <AddCategoriasButton onClick={() => setShowAddCategorias(true)} />

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

export default Categorias;
