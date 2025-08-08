import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import './add-transaction.css';

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
        const initFirebase = async () => {
            try {
                // Variables globales proporcionadas por el entorno de Canvas
                const firebaseConfig = JSON.parse(__firebase_config);
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

                // Inicializar Firebase
                const app = initializeApp(firebaseConfig);
                const firestoreDb = getFirestore(app);
                const firebaseAuth = getAuth(app);

                setDb(firestoreDb);
                setAuth(firebaseAuth);

                // Autenticar al usuario con el token provisto
                if (typeof __initial_auth_token !== 'undefined') {
                    await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                } else {
                    await signInAnonymously(firebaseAuth);
                }

                // Escuchar los cambios en el estado de autenticación
                onAuthStateChanged(firebaseAuth, (user) => {
                    if (user) {
                        setUserId(user.uid);
                    } else {
                        setUserId(null);
                    }
                    setIsLoading(false);
                });
            } catch (error) {
                console.error("Error al inicializar Firebase:", error);
                setIsLoading(false);
            }
        };

        initFirebase();
    }, []);

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
        
        if (!db || !userId) {
            console.error("Firebase no está inicializado o el usuario no está autenticado.");
            return;
        }

        try {
            // Referencia a la colección donde se guardarán las transacciones.
            // Sigue las reglas de seguridad: /artifacts/{appId}/users/{userId}/transactions
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const collectionPath = `/artifacts/${appId}/users/${userId}/transactions`;
            const transactionsCollection = collection(db, collectionPath);

            // Añadir un nuevo documento a la colección con los datos del formulario y una marca de tiempo
            await addDoc(transactionsCollection, {
                ...formData,
                timestamp: new Date()
            });

            console.log("Transacción guardada exitosamente en Firestore!");
            // Volver a la vista principal después de guardar
            onCancel();
        } catch (error) {
            console.error("Error al añadir la transacción:", error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    };

    // Mostrar un estado de carga mientras se inicializa Firebase
    if (isLoading) {
        return <div className="add-transaction-container text-center py-8">Cargando...</div>;
    }

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
