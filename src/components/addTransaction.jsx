import React, { useState, useEffect } from 'react';
import appFirebase from '../firebaseConfig'; // Importamos tu configuración de Firebase
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/addTransaction.css'

function AddTransaction({ onCancel }) {
    // ======================================
    // ESTADO DEL FORMULARIO Y DE LA APP
    // ======================================
    const [formData, setFormData] = useState({
        monto: '',
        categoria: '',
        tipo: 'egreso'
    });
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // ======================================
    // INICIALIZACIÓN Y AUTENTICACIÓN DE FIREBASE
    // ======================================
    useEffect(() => {
        try {
            // Inicializamos Firestore y Auth usando tu objeto appFirebase
            const firestoreDb = getFirestore(appFirebase);
            const firebaseAuth = getAuth(appFirebase);

            setDb(firestoreDb);
            setAuth(firebaseAuth);

            // Suscribirse a los cambios de autenticación
            // Esta es la clave: solo procedemos si hay un "user"
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsLoading(false); // El usuario está logueado, se puede mostrar la app
                } else {
                    setUserId(null);
                    setIsLoading(false); // No hay usuario, mostramos un mensaje o redireccionamos
                    // Aquí podrías agregar una redirección a la página de login
                    // console.log("Usuario no autenticado, redirigiendo al login...");
                }
            });

            // Limpiar la suscripción al desmontar el componente
            return () => unsubscribe();
        } catch (error) {
            console.error("Error al inicializar Firebase:", error);
            setIsLoading(false);
        }
    }, []);

    // Maneja los cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // ======================================
    // MANEJADOR DE ENVÍO CON FIRESTORE
    // ======================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verifica si el usuario está logueado antes de intentar guardar
        if (!db || !userId) {
            console.error("No se puede guardar: El usuario no está autenticado.");
            return;
        }

        try {
            // Referencia a la colección donde se guardarán las transacciones.
            // La ruta es específica de cada usuario.
            const transactionsCollection = collection(db, `users/${userId}/transactions`);

            // Añadir un nuevo documento a la colección con los datos del formulario y una marca de tiempo
            await addDoc(transactionsCollection, {
                ...formData,
                timestamp: serverTimestamp() // Usamos serverTimestamp para mayor precisión
            });

            console.log("Transacción guardada exitosamente en Firestore!");
            // Volver a la vista principal después de guardar
            onCancel();
        } catch (error) {
            console.error("Error al añadir la transacción:", error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    };

    // ======================================
    // RENDERIZADO CONDICIONAL
    // ======================================
    // Mientras se verifica el estado de login, muestra un mensaje de carga.
    if (isLoading) {
        return <div className="add-transaction-container text-center py-8">Verificando sesión...</div>;
    }

    // Si el usuario no está logueado, muestra un mensaje
    if (!userId) {
        return <div className="add-transaction-container text-center py-8">Debes iniciar sesión para añadir transacciones.</div>;
    }

    // Si el usuario está logueado, muestra el formulario
    return (
        <div className="add-transaction-container">
            <h2 className="form-title">Añadir Transacción</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="monto" className="form-label">Monto</label>
                    <input
                        type="number"
                        id="monto"
                        name="monto"
                        value={formData.monto}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="categoria" className="form-label">Categoría</label>
                    <input
                        type="text"
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="tipo" className="form-label">Tipo</label>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        className="form-select"
                    >
                        <option value="egreso">Egreso</option>
                        <option value="ingreso">Ingreso</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Cancelar
                    </button>
                    <button type="submit" className="save-button">
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddTransaction;
