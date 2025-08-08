import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../styles/login.css';
import appFirebase from '../firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Inicializar Firebase
const auth = getAuth(appFirebase);


// Componente para iconos
const ThemeToggleIcon = ({ isDarkMode }) => {
    if (isDarkMode) {
        return <Sun />;
    }
    return <Moon />;
};

// FUNCION DE LOGIN
function Login({ onRegisterClick, onLoginSuccess }) {


    //    ======================================
    //    LOGICA PARA DARKMODE
    //    ======================================
    // El estado inicial se lee desde localStorage -- Si no hay un valor guardado, por defecto es 'false' (modo claro).
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
        // Al cambiar el estado, se guarda la preferencia en localStorage
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));

        // Se aplica o remueve la clase del body para cambiar el tema
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };



    //    ======================================
    //    CONFIGURACION DE ESTADOS PARA VALORES DE LOGIN
    //    ======================================
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (email === '' || password === '') {
            setError(true);
            setErrorMessage("Por favor, completa todos los campos.");
            return;
        }

        try {
            // Llama a la función de Firebase para iniciar sesión
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Si el inicio de sesión es exitoso
            setError(false);
            setErrorMessage("");
            console.log("Inicio de sesión exitoso!");

            onLoginSuccess(); // Llama a la función de prop para notificar al componente padre

        } catch (firebaseError) {
            setError(true); // Si el inicio de sesión falla
            // Muestra un mensaje de error específico según el código de error de Firebase
            switch (firebaseError.code) {
                case 'auth/invalid-credential':
                    setErrorMessage("Credenciales incorrectas. Verifique su correo y contraseña.");
                    break;
                case 'auth/user-disabled':
                    setErrorMessage("Este usuario ha sido deshabilitado.");
                    break;
                default:
                    setErrorMessage("Ocurrió un error inesperado. Inténtalo más tarde.");
                    console.error("Error de Firebase:", firebaseError);
                    break;
            }
        }
    };

    //    ======================================
    //    ESTRUCTURA LOGIN
    //    ======================================
    return (
        <div className="login-card">
            {/* Botón para cambiar entre modo claro y oscuro */}
            <button
                onClick={toggleDarkMode}
                className="dark-mode-toggle"
                aria-label="Cambiar modo"
            >
                <ThemeToggleIcon isDarkMode={isDarkMode} />
            </button>

            <h2 className="login-title">Iniciar Sesión</h2>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder="ejemplo@correo.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        id="password"
                        name="password"
                        className="form-input"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="forgot-password">
                    <a href="#" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" className="login-button">
                    Iniciar sesión
                </button>

                {error && <p className="error-message">{errorMessage}</p>}
            </form>

            <p className="signup-text">
                ¿No tienes una cuenta? <a href="#" className="signup-link" onClick={onRegisterClick}>Regístrate ahora</a>
            </p>
        </div>
    );
}

export default Login;
