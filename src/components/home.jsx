import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu, Trash2 } from "lucide-react";
import "../styles/home.css";
import AddTransaction from "./home/addTransaction.jsx";
import BarraLateral from "./home/barraLateral.jsx";

import appFirebase from "../firebaseConfig";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";


const db = getFirestore(appFirebase);

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
const ThemeToggleIcon = ({ isDarkMode }) => (isDarkMode ? <Sun color="orange" /> : <Moon />);





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

    // Estado de transacciones
    const [transacciones, setTransacciones] = useState([]);



    // Estados para cuentas
    const [cuentas, setCuentas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // cargar cuentas
    useEffect(() => {
        const firestoreDb = getFirestore(appFirebase);
        const firebaseAuth = getAuth(appFirebase);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                try {
                    const cuentasRef = collection(firestoreDb, `users/${user.uid}/cuentas`);
                    const snapshot = await getDocs(cuentasRef);
                    const cuentasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCuentas(cuentasData);
                } catch (error) {
                    console.error("Error al obtener cuentas:", error);
                }
            } else {
                setCuentas([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);






    // Cargar transacciones en tiempo real --> Para mostrar las transacciones en el home
    useEffect(() => {
        const user = getAuth().currentUser;
        if (!user) return;

        const transactionsRef = collection(db, "users", user.uid, "transactions");
        const q = query(transactionsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setTransacciones([]);
            } else {
                setTransacciones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        });

        return () => unsubscribe();
    }, []);




    // Estado de categorias (Para mostrar los colores a las que pertenecen las transacciones)
    const [categorias, setCategorias] = useState([]);

    // Traer categorías en tiempo real
    useEffect(() => {
        const user = getAuth().currentUser;
        if (!user) return;

        const categoriasRef = collection(db, "users", user.uid, "categorias");
        const unsubscribe = onSnapshot(categoriasRef, (snapshot) => {
            setCategorias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);




    // Eliminar una transacción
    const handleDelete = async (id) => {
        try {
            const user = getAuth().currentUser;
            if (!user) return;
            await deleteDoc(doc(db, "users", user.uid, "transactions", id));
        } catch (error) {
            console.error("Error al eliminar transacción:", error);
        }
    };


    // Función para obtener color de categoría
    const getCategoriaColor = (categoriaId) => {
        const cat = categorias.find(c => c.id === categoriaId);
        return cat ? cat.color : "transparent"; // fallback
    };



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

                        {/* Mostrar cuentas */}
                        <section className="filters-section">
                            {isLoading ? (
                                <p>Cargando cuentas...</p>
                            ) : cuentas.length === 0 ? (
                                <p>No tienes cuentas registradas.</p>
                            ) : (
                                <select id="cuentaHome" name="cuentaHome" className="form-select" defaultValue="">
                                    {/* Opción default */}
                                    <option value="todas">Todas</option>

                                    {/* Opción para mostrar las cuentas disponibles */}
                                    {cuentas.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </section>



                        {/* Mostrar transacciones */}
                        {transacciones.length === 0 ? (
                            <p>No hay transacciones todavía.</p>
                        ) : (
                            <div className="transacciones-container">
                                {transacciones.map((t) => (
                                    <div key={t.id} className={`transaccion ${t.tipo}`}>
                                        {/* Wrapper para flag + descripción */}
                                        <div className="descripcion-wrapper">
                                            <div
                                                className="categoria-flag"
                                                style={{ backgroundColor: getCategoriaColor(t.categoriaId) }}
                                            ></div>
                                            <span className="descripcion">{t.descripcion}</span>
                                        </div>

                                        {/* Monto */}
                                        <span className="monto">
                                            {t.tipo === "egreso" ? "-" : "+"}${t.monto}
                                        </span>

                                        {/* Botón de borrar */}
                                        <button className="delete-button" onClick={() => handleDelete(t.id)}>
                                            <Trash2 size={20} color="red" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    <AddTransactionButton onClick={() => setShowAddTransaction(true)} />

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

export default Home;
