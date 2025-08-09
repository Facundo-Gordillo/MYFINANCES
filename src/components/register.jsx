import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react'; // Importa los iconos
import '../styles/login.css';
import appFirebase from '../firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Componente para iconos
const ThemeToggleIcon = ({ isDarkMode }) => {
    if (isDarkMode) {
        return <Sun color="orange"/>;
    }
    return <Moon />;
};

// Inicializar Firebase
const auth = getAuth(appFirebase);

// FUNCION DE REGISTRO
function Register({ onLoginClick, onRegistrationSuccess }) {


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
    //    CONFIGURACION DE ESTADOS PARA VALORES DE REGISTRO
    //    ======================================
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que los campos no estén vacíos
        if (email === '' || password === '' || repeatPassword === '') {
            setError(true);
            setErrorMessage("Por favor, completa todos los campos.");
            return;
        }

        // Validar que las contraseñas coincidan
        if (password !== repeatPassword) {
            setError(true);
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }




        // LOGICA PARA REGISTRAR USUARIO en Firebase
        try {
            // Llama a la función de Firebase para crear un nuevo usuario
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Si el registro es exitoso
            setError(false);
            setErrorMessage("");
            console.log("Registro exitoso!");
            onRegistrationSuccess();

        } catch (firebaseError) {
            // Si el registro falla, maneja el error
            setError(true);
            // Muestra un mensaje de error específico según el código de error de Firebase
            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    setErrorMessage("El correo electrónico ya está en uso.");
                    break;
                case 'auth/invalid-email':
                    setErrorMessage("El formato del correo electrónico no es válido.");
                    break;
                case 'auth/weak-password':
                    setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
                    break;
                default:
                    setErrorMessage("Ocurrió un error inesperado. Inténtalo más tarde.");
                    console.error("Error de Firebase:", firebaseError);
                    break;
            }
        }


    };


    //    ======================================
    //    ESTRUCTURA REGISTER
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

            <h2 className="login-title">Registrarse</h2>

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

                <div className="form-group">
                    <label htmlFor="repeat_password" className="form-label">Repetir Contraseña</label>
                    <input
                        type="password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        id="repeat_password"
                        name="repeat_password"
                        className="form-input"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" className="login-button">
                    Registrarse
                </button>

                {/* Mensaje de error para campos vacíos */}
                {error && <p className="error-message">{errorMessage}</p>}
            </form>

            <p className="signup-text">
                ¿Ya tienes una cuenta? <a href="#" className="signup-link" onClick={onLoginClick}>Inicia sesión</a>
            </p>
        </div>
    );
}

export default Register;
