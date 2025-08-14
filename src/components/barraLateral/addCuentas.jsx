import React, { useState, useEffect } from 'react';
import appFirebase from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../../styles/addTransaction.css'

function AddCuentas({ onCancel, cuentaEdit }) {
    const [formData, setFormData] = useState({ monto: '', cuenta: '' });
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // inicializar Firebase y Auth
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

        // Si se pasa una cuenta para editar carga los datos en el formulario
        if (cuentaEdit) {
            setFormData({
                cuenta: cuentaEdit.nombre,
                monto: cuentaEdit.monto.toString(), // Se convierte a string para el input
            });
        }

        return () => unsubscribe();
    }, [cuentaEdit]);

    // Maneja los cambios en los campos del form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Maneja el envío del form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!db || !userId) return;

        try {
            if (cuentaEdit) {
                // Si es edicion, actualiza la cuenta (updateDoc)
                const cuentaRef = doc(db, `users/${userId}/cuentas`, cuentaEdit.id);
                await updateDoc(cuentaRef, {
                    nombre: formData.cuenta,
                    monto: parseFloat(formData.monto),
                    timestamp: serverTimestamp()
                });
                console.log("Cuenta actualizada correctamente!");
            } else {
                // Si no, agrega una nueva cuenta (addDoc)
                const accountsCollection = collection(db, `users/${userId}/cuentas`);
                await addDoc(accountsCollection, {
                    nombre: formData.cuenta,
                    monto: parseFloat(formData.monto),
                    timestamp: serverTimestamp()
                });
                console.log("Cuenta guardada correctamente!");
            }
            onCancel();
        } catch (error) {
            console.error("Error al añadir o actualizar la cuenta:", error);
        }
    };

    // Condicional para manejar la carga mientras se verifica la sesión
    if (isLoading) return <div className="add-transaction-container text-center py-8">Verificando sesión...</div>;
    if (!userId) return <div className="add-transaction-container text-center py-8">Debes iniciar sesión para añadir cuentas.</div>;

    return (
        <div className="add-transaction-container">
            <h2 className="form-title">{cuentaEdit ? "Editar Cuenta" : "Añadir Cuenta"}</h2>
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
                    <button type="submit" className="save-button">{cuentaEdit ? "Actualizar" : "Guardar"}</button>
                    <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default AddCuentas;
