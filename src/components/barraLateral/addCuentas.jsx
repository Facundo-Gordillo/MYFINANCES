import React, { useState, useEffect } from 'react';
import appFirebase from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../../styles/addTransaction.css'

function AddCuentas({ onCancel }) {
    const [formData, setFormData] = useState({ monto: '', cuenta: '' });
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const firestoreDb = getFirestore(appFirebase);
        const firebaseAuth = getAuth(appFirebase);
        setDb(firestoreDb);

        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setUserId(user.uid);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!db || !userId) return;

        try {
            const accountsCollection = collection(db, `users/${userId}/cuentas`);
            await addDoc(accountsCollection, {
                nombre: formData.cuenta,
                monto: parseFloat(formData.monto),
                timestamp: serverTimestamp()
            });
            console.log("Cuenta guardada correctamente!");
            onCancel();
        } catch (error) {
            console.error("Error al añadir la cuenta:", error);
        }
    };

    if (isLoading) return <div className="add-transaction-container text-center py-8">Verificando sesión...</div>;
    if (!userId) return <div className="add-transaction-container text-center py-8">Debes iniciar sesión para añadir cuentas.</div>;

    return (
        <div className="add-transaction-container">
            <h2 className="form-title">Añadir Cuenta</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="cuenta" className="form-label">Nombre de la Cuenta</label>
                    <input
                        type="text"
                        id="cuenta"
                        name="cuenta"
                        value={formData.cuenta}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="monto" className="form-label">Monto Inicial</label>
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
                <div className="form-actions">
                    <button type="submit" className="save-button">Guardar</button>
                    <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default AddCuentas;
