import React, { useState, useEffect } from 'react';
import { Moon, Sun, Plus } from 'lucide-react';
import '../styles/home.css'; // Archivo CSS para los estilos de la vista Home
import '../styles/home.css'; // Importa los estilos del botón flotante

// Componente para iconos
const ThemeToggleIcon = ({ isDarkMode }) => {
    return isDarkMode ? <Sun /> : <Moon />;
};






// Componente para el botón flotante. VA A SER UN ARCIHVO SEARADO!! SE COLOCA SOLO PARA QUE FUNCIONE
const FloatingButton = ({ onClick }) => {
    return (
        <button className="floating-button" onClick={onClick}>
            <Plus size={24} />
        </button>
    );
};






function Home() {
    // ======================================
    // LÓGICA PARA DARKMODE
    // ======================================
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedMode = localStorage.getItem('isDarkMode');
            return savedMode ? JSON.parse(savedMode) : false;
        } catch (error) {
            console.error("Error al acceder a localStorage:", error);
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // ======================================
    // ESTRUCTURA PARA EL MANEJO DE EVENTOS DEL BOTÓN FLOTANTE
    // ======================================
    const [showAddTransaction, setShowAddTransaction] = useState(false);

    // Función para cambiar el estado a 'true' y mostrar el componente.
    const handleAddTransactionClick = () => {
        setShowAddTransaction(true);
    };
    // Función para volver a Home cuando se haya completado la acción.
    const handleGoBack = () => {
        setShowAddTransaction(false);
    };



    return (
        <div className="home-container">
            {/* Renderizado condicional */}
            {showAddTransaction ? (
                <AddTransaction onTransactionAdded={handleGoBack} /> // Si showAddTransaction es true, muestra el componente AddTransaction.

            ) : ( // Si es false, muestra el contenido normal de Home.
                <>
                    <header className="home-header">
                        <h1 className="home-title">Resumen de Gastos</h1>
                        
                        {/* Renderizar botón Darkmode */}
                        <button
                            onClick={toggleDarkMode}
                            className="dark-mode-toggle"
                            aria-label="Cambiar modo"
                        >
                            <ThemeToggleIcon isDarkMode={isDarkMode} />
                        </button>
                    </header>



                    {/* Renderizar contenido home */}
                    <main className="home-main">
                        {/* Por ejemplo, un gráfico o una lista de gastos */}
                        <p>Contenido de la página Home...</p>
                    </main>





                    {/* Renderizar flotante para agregar transacciones */}
                    <FloatingButton onClick={handleAddTransactionClick} />
                </>
            )}
        </div>
    );
}

export default Home;
