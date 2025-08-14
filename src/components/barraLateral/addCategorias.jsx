import React, { useState, useEffect } from 'react';
import appFirebase from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../../styles/addTransaction.css'

function AddCategoria({ onCancel, categoriaEdit }) {
    const [formData, setFormData] = useState({ nombre: '', color: '#000000' });
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

        if (categoriaEdit) {
            setFormData({
                nombre: categoriaEdit.nombre,
                color: categoriaEdit.color || '#000000'
            });
        }

        return () => unsubscribe();
    }, [categoriaEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!db || !userId) return;

        try {
            if (categoriaEdit) {
                const categoriaRef = doc(db, `users/${userId}/categorias`, categoriaEdit.id);
                await updateDoc(categoriaRef, {
                    nombre: formData.nombre,
                    color: formData.color,
                    timestamp: serverTimestamp()
                });
                console.log("Categoría actualizada correctamente!");
            } else {
                const categoriasCollection = collection(db, `users/${userId}/categorias`);
                await addDoc(categoriasCollection, {
                    nombre: formData.nombre,
                    color: formData.color,
                    timestamp: serverTimestamp()
                });
                console.log("Categoría guardada correctamente!");
            }
            onCancel();
        } catch (error) {
            console.error("Error al añadir o actualizar la categoría:", error);
        }
    };

    if (isLoading) return <div className="add-transaction-container text-center py-8">Verificando sesión...</div>;
    if (!userId) return <div className="add-transaction-container text-center py-8">Debes iniciar sesión para añadir categorías.</div>;

    return (
        <div className="add-transaction-container">
            <h2 className="form-title">{categoriaEdit ? "Editar Categoría" : "Añadir Categoría"}</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="nombre" className="form-label">Nombre de la Categoría</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="color" className="form-label">Color</label>
                    <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" className="save-button">{categoriaEdit ? "Actualizar" : "Guardar"}</button>
                    <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default AddCategoria;
