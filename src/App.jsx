import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import appFirebase from './firebaseConfig.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Rutas protegidas
import PrivateRoute from "./routes/PrivateRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

// Componentes
import Login from './components/login.jsx';
import Register from './components/register.jsx';
import Home from './components/home.jsx';
import Cuentas from "./components/barraLateral/cuentas.jsx";

function App() {
  const auth = getAuth(appFirebase);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute user={user}>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute user={user}>
              <Register />
            </PublicRoute>
          }
        />

        {/* Rutas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute user={user}>
              <Home onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/cuentas"
          element={
            <PrivateRoute user={user}>
              <Cuentas onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
