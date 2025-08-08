import React, { useState } from 'react';

// Importar modulos de Firebase
import appFirebase from './firebaseConfig.js';

// Import de componentes
import Login from './components/login';
import Register from './components/register.jsx';
import Home from './components/home.jsx';

function App() {
  const [currentView, setCurrentView] = useState('login'); // Estado para controlar view actual de la app

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setCurrentView('register'); // Cambia la vista a 'register'
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setCurrentView('login'); // Cambia la vista a 'login'
  };

  const handleRegistrationSuccess = () => { // esta funcion se pasa al componente register
    setCurrentView('home'); // Cambia la vista a 'home' después del registro
  };

  const handleLoginSuccess = () => { // se pasa al componente login y cambia la vista al home si es successful
    setCurrentView('home');
  }

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onRegisterClick={handleRegisterClick} onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return <Register onLoginClick={handleLoginClick} onRegistrationSuccess={handleRegistrationSuccess} />;
      case 'home':
        return <Home />;
      default:
        return <Login onRegisterClick={handleRegisterClick} onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;
