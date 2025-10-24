import React, { useState, useEffect } from "react";
import { Moon, Sun, Plus, Menu, Trash2 } from "lucide-react";
import "../styles/home.css";
import AddTransaction from "./home/addTransaction.jsx";
import BarraLateral from "./home/barraLateral.jsx";

import appFirebase from "../firebaseConfig";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import PieChartCategorias from "./home/pieChart.jsx";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useBarraLateral } from "../hooks/useBarraLateral.jsx"; // hook barra lateral

const db = getFirestore(appFirebase);

// Botón flotante para agregar transacciones
const AddTransactionButton = ({ onClick }) => (
  <button className="floating-button add-transaction-button" onClick={onClick}>
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

function Home({ onLogout }) {
  // === Dark Mode ===
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

  // === Barra lateral ===
  const { isOpen, openBarra, closeBarra, isDesktop, isMobile } = useBarraLateral();

  // === UI States ===
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // === Transacciones ===
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const q = query(transactionsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransacciones(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // === Cuentas ===
  const [cuentas, setCuentas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCuenta, setSelectedCuenta] = useState("todas");

  const handleCuentaChange = (e) => setSelectedCuenta(e.target.value);

  useEffect(() => {
    const auth = getAuth(appFirebase);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const cuentasRef = collection(db, `users/${user.uid}/cuentas`);
          const snapshot = await getDocs(cuentasRef);
          setCuentas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

  // === Categorias ===
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    const categoriasRef = collection(db, "users", user.uid, "categorias");
    const unsubscribe = onSnapshot(categoriasRef, (snapshot) => {
      setCategorias(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const getCategoriaColor = (categoriaId) => {
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat ? cat.color : "transparent";
  };

  // === Fecha para filtro ===
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const FiltroFecha = ({ startDate, endDate, setStartDate, setEndDate }) => (
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={(update) => {
        setStartDate(update[0]);
        setEndDate(update[1]);
      }}
      dateFormat="dd/MM/yyyy"
      placeholderText="📅 Elegir rango"
      className="datepicker-input"
      isClearable
    />
  );

  // === Filtrar transacciones ===
  const filteredTransacciones = transacciones.filter((t) => {
    const fecha = t.timestamp?.toDate ? t.timestamp.toDate() : new Date(t.timestamp);

    const dentroDeCuenta = selectedCuenta === "todas" || t.cuentaId === selectedCuenta;
    const dentroDeRango =
      (!startDate || fecha >= startDate) && (!endDate || fecha <= endDate);

    return dentroDeCuenta && dentroDeRango;
  });

  // === Eliminar transacción ===
  const handleDelete = async (id) => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "transactions", id));
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
    }
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
            <section>
              <PieChartCategorias
                transacciones={transacciones}
                cuentaSeleccionadaId={selectedCuenta}
                categorias={categorias}
              />
            </section>

            <section className="filters-section">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : cuentas.length === 0 ? (
                <p>No tienes datos registrados.</p>
              ) : (
                <>
                  <select
                    id="cuentaHome"
                    className="form-select"
                    value={selectedCuenta}
                    onChange={handleCuentaChange}
                  >
                    <option value="todas">Todas</option>
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>

                  <div className="date-filters">
                    <FiltroFecha
                      startDate={startDate}
                      endDate={endDate}
                      setStartDate={setStartDate}
                      setEndDate={setEndDate}
                    />
                  </div>
                </>
              )}
            </section>

            {filteredTransacciones.length === 0 ? (
              <p>No hay transacciones para esta cuenta.</p>
            ) : (
              <div className="transacciones-container">
                {filteredTransacciones.map((t) => (
                  <div key={t.id} className={`transaccion ${t.tipo}`}>
                    <div className="descripcion-wrapper">
                      <div
                        className="categoria-flag"
                        style={{ backgroundColor: getCategoriaColor(t.categoriaId) }}
                      />
                      <span className="descripcion">{t.descripcion}</span>
                    </div>
                    <span className="monto">
                      {t.tipo === "egreso" ? "-" : "+"}${t.monto}
                    </span>
                    <button className="delete-button" onClick={() => handleDelete(t.id)}>
                      <Trash2 size={20} color="red" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </main>

          <AddTransactionButton onClick={() => setShowAddTransaction(true)} />

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
          
        </>
      )}
    </div>
  );
}

export default Home;
