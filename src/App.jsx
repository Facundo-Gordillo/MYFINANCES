import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import appFirebase from './firebaseConfig.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


// Imports de cada componente (cada funcion de ellos)
import Login from './components/login.jsx';
import Register from './components/register.jsx';
import Home from './components/home.jsx';
import Cuentas from "./components/barraLateral/cuentas.jsx";




function App() {
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Detecta cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <Router>
      <Routes>
        {/* Rutas públicas: solo accesibles si NO hay usuario */}
        {/* Login */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" replace />}
        />

        {/* Rutas privadas: solo accesibles si hay usuario */}

        {/* Home */}
        <Route
          path="/"
          element={user ? <Home onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        {/* Cuentas */}
        <Route
          path="/cuentas"
          element={user ? <Cuentas /> : <Navigate to="/login" replace />}
        />


        {/* Cualquier ruta desconocida redirige */}
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
