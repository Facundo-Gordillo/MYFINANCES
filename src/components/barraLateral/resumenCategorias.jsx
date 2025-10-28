import React, { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Moon, Sun, Menu } from "lucide-react";
import "../../styles/resumenCategorias.css";
import BarraLateral from "../home/barraLateral.jsx";
import { useBarraLateral } from "../../hooks/useBarraLateral.jsx";

function ResumenCategorias({ onLogout }) {
    const [userId, setUserId] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const db = getFirestore();

    const { isOpen, openBarra, closeBarra, isMobile } = useBarraLateral();

    // Botón para abrir barra lateral
    const BarraLateralButton = ({ onClick }) => (
        <button className="floating-button barra-lateral-button" onClick={onClick}>
            <Menu size={24} />
        </button>
    );

    // Dark Mode
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

    // Obtener UID del usuario
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setUserId(user.uid);
            else setUserId(null);
        });
        return () => unsubscribe();
    }, [auth]);

    // Escuchar categorías
    useEffect(() => {
        if (!userId) return;
        const categoriasRef = collection(db, `users/${userId}/categorias`);
        const unsubscribe = onSnapshot(categoriasRef, (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setCategorias(data);
        });
        return () => unsubscribe();
    }, [userId, db]);

    // Escuchar transacciones
    useEffect(() => {
        if (!userId) return;
        const transaccionesRef = collection(db, `users/${userId}/transactions`);
        const unsubscribe = onSnapshot(transaccionesRef, (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setTransacciones(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userId, db]);

    // Calcular resumen
    const resumen = useMemo(() => {
        if (!transacciones.length) return [];

        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();

        const transMes = transacciones.filter((t) => {
            if (!t.timestamp) return false;
            const fecha = t.timestamp.toDate ? t.timestamp.toDate() : new Date(t.timestamp);
            return (
                fecha.getMonth() === mesActual &&
                fecha.getFullYear() === anioActual &&
                t.tipo === "egreso"
            );
        });

        const totales = {};
        for (const t of transMes) {
            totales[t.categoriaId] = (totales[t.categoriaId] || 0) + Number(t.monto || 0);
        }

        const totalGlobal = Object.values(totales).reduce((acc, v) => acc + v, 0);

        return Object.entries(totales).map(([catId, total]) => {
            const categoria = categorias.find((c) => c.id === catId);
            const nombre = categoria ? categoria.nombre : "Sin categoría";
            const color = categoria ? categoria.color : "#999";
            const porcentaje = totalGlobal > 0 ? ((total / totalGlobal) * 100).toFixed(1) : 0;

            return { id: catId, nombre, color, total, porcentaje };
        });
    }, [transacciones, categorias]);

    if (loading) return <p className="resumen-loading">Cargando resumen...</p>;
    if (!resumen.length) return <p className="resumen-empty">No hay egresos este mes.</p>;

    // Total gastado
    const totalGastado = resumen.reduce((acc, r) => acc + r.total, 0);

    return (
        <div className="resumen-categorias">
            {/* Header: título + dark mode */}
            <div className="resumen-header">
                <h3 className="resumen-title">Gastos por Categoría</h3>
                <button
                    className="dark-mode-toggle"
                    onClick={toggleDarkMode}
                    aria-label="Cambiar modo"
                >
                    {isDarkMode ? <Sun color="orange" /> : <Moon />}
                </button>
            </div>

            {/* Subtotal: monto total */}
            <div className="resumen-subtotal">
                <span className="resumen-subtitle">Monto gastado en total:</span>
                <span className="resumen-total-monto">${totalGastado.toLocaleString()}</span>
            </div>

            {/* Lista de categorías */}
            <ul className="resumen-list">
                {resumen.map((r) => (
                    <li key={r.id} className="resumen-item">
                        <div className="resumen-info">
                            <span
                                className="resumen-color"
                                style={{ backgroundColor: r.color }}
                            ></span>
                            <span className="resumen-nombre">{r.nombre}</span>
                        </div>
                        <div className="resumen-valores">
                            <span className="resumen-monto">${r.total.toLocaleString()}</span>
                            <span className="resumen-porcentaje">{r.porcentaje}%</span>
                        </div>

                        <div className="resumen-barra">
                            <div
                                className="resumen-barra-fill"
                                style={{
                                    width: `${r.porcentaje}%`,
                                    backgroundColor: r.color,
                                }}
                            ></div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Solo mostrar botón para abrir barra en mobile */}
            {isMobile && !isOpen && (
                <BarraLateralButton onClick={openBarra} />
            )}

            {/* Mostrar la barra en desktop */}
            {isOpen && (
                <BarraLateral
                    isDarkMode={isDarkMode}
                    onLogout={onLogout}
                    onClose={closeBarra}
                />
            )}
        </div>
    );
}

export default ResumenCategorias;
