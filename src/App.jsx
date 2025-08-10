import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import appFirebase from './firebaseConfig.js';

import Login from './components/login.jsx';
import Register from './components/register.jsx';
import Home from './components/home.jsx';

function App() {
  const auth = getAuth(appFirebase);
  const [currentView, setCurrentView] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentView('home');
      } else {
        setCurrentView('login');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setCurrentView('register');
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setCurrentView('login');
  };

  const handleRegistrationSuccess = () => {
    setCurrentView('home');
  };

  const handleLoginSuccess = () => {
    setCurrentView('home');
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onRegisterClick={handleRegisterClick} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return <Register onLoginClick={handleLoginClick} onRegistrationSuccess={handleRegistrationSuccess} />;
      case 'home':
        return <Home onLogout={handleLogout} />;
      case 'loading':
        return <p>Cargando...</p>;
      default:
        return <Login onRegisterClick={handleRegisterClick} onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return <div className="App">{renderView()}</div>;
}

export default App;
