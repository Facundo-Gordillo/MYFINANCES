import React, { useState, useEffect } from 'react';
import appFirebase from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import '../../styles/addTransaction.css';

function AddTransaction({ onCancel }) {

    // estado del form y de app
    const [formData, setFormData] = useState({
        monto: '',
        categoria: '',
        tipo: 'egreso',
        cuenta: ''
    });

    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cuentas, setCuentas] = useState([]);
    const [isLoadingCuentas, setIsLoadingCuentas] = useState(true);


    useEffect(() => {
        try {
            const firestoreDb = getFirestore(appFirebase);
            const firebaseAuth = getAuth(appFirebase);

            setDb(firestoreDb);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsLoading(false);

                    // Cargar las cuentas del usuario
                    try {
                        const cuentasRef = collection(firestoreDb, `users/${user.uid}/cuentas`);
                        const snapshot = await getDocs(cuentasRef);
                        const cuentasData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        setCuentas(cuentasData);
                        setIsLoadingCuentas(false);

                        if (cuentasData.length > 0) {
                            setFormData(prev => ({ ...prev, cuenta: cuentasData[0].id }));
                        }
                    } catch (error) {
                        console.error("Error al obtener las cuentas:", error);
                        setIsLoadingCuentas(false);
                    }
                } else {
                    setUserId(null);
                    setIsLoading(false);
                    setIsLoadingCuentas(false);
                }
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Error al inicializar Firebase:", error);
            setIsLoading(false);
            setIsLoadingCuentas(false);
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


    // ENVÍO CON FIRESTORE
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!db || !userId) {
            console.error("No se puede guardar: El usuario no está autenticado.");
            return;
        }

        try {
            const transactionsCollection = collection(db, `users/${userId}/transactions`);
            await addDoc(transactionsCollection, {
                ...formData,
                timestamp: serverTimestamp()
            });


            console.log("Transacción guardada exitosamente en Firestore!");
            onCancel();
        } catch (error) {
            console.error("Error al añadir la transacción:", error);
        }
    };

    // RENDERIZADO
    if (isLoading || isLoadingCuentas) {
        return <div className="add-transaction-container text-center py-8">Cargando...</div>;
    }

    if (!userId) {
        return <div className="add-transaction-container text-center py-8">Debes iniciar sesión para añadir transacciones.</div>;
    }

    if (cuentas.length === 0) {
        return (
            <div className="add-transaction-container text-center py-8">
                No tienes cuentas registradas. Por favor, crea una cuenta antes de añadir una transacción.
            </div>
        );
    }

    return (
        <div className="add-transaction-container">
            <h2 className="form-title">Añadir Transacción</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="cuenta" className="form-label">Cuenta</label>
                    <select
                        id="cuenta"
                        name="cuenta"
                        value={formData.cuenta}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        {cuentas.map((cuenta) => (
                            <option key={cuenta.id} value={cuenta.id}>
                                {cuenta.nombre || cuenta.id}
                            </option>
                        ))}
                    </select>
                </div>

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
                    <button type="submit" className="save-button">Guardar</button>
                    <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default AddTransaction;
