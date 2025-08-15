import React, { useState, useEffect } from 'react';
import appFirebase from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import '../../styles/addTransaction.css';

function AddTransaction({ onCancel }) {

    // Estado Firebase
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Estado del formulario
    const [formData, setFormData] = useState({
        monto: '',
        categoriaId: '',
        tipo: 'egreso', // Es por default, aunque se cambia luego en el tipo.
        cuentaId: ''
    });

    // Estado para categorías y cuentas
    const [categorias, setCategorias] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
    const [isLoadingCuentas, setIsLoadingCuentas] = useState(true);

    // Inicialización de Firebase y carga de cuentas
    useEffect(() => {
        const firestoreDb = getFirestore(appFirebase);
        const firebaseAuth = getAuth(appFirebase);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
                setIsLoading(false);

                // Cargar cuentas
                try {
                    const cuentasRef = collection(firestoreDb, `users/${user.uid}/cuentas`);
                    const snapshot = await getDocs(cuentasRef);
                    const cuentasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCuentas(cuentasData);
                    setIsLoadingCuentas(false);

                    if (cuentasData.length > 0) {
                        setFormData(prev => ({ ...prev, cuentaId: cuentasData[0].id }));
                    }
                } catch (error) {
                    console.error("Error al obtener cuentas:", error);
                    setIsLoadingCuentas(false);
                }
            } else {
                setUserId(null);
                setIsLoading(false);
                setIsLoadingCuentas(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Cargar categorías en tiempo real
    useEffect(() => {
        if (!db || !userId) return;

        const categoriasRef = collection(db, `users/${userId}/categorias`);
        const unsubscribe = onSnapshot(categoriasRef, (snapshot) => {
            const categoriasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategorias(categoriasData);
            setIsLoadingCategorias(false);

            // Seleccionar la primera categoría disponible o "Transaccion" por defecto
            if (categoriasData.length > 0 && !formData.categoriaId) {
                setFormData(prev => ({ ...prev, categoriaId: categoriasData[0].id }));
            } else if (!formData.categoriaId) {
                setFormData(prev => ({ ...prev, categoriaId: 'Transaccion' }));
            }
        });

        return () => unsubscribe();
    }, [db, userId]);

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Behavior de submit -- guardar transacciones y actualizasr balances:
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
        console.error("Usuario no autenticado");
        return;
    }

    try {
        // Guardar la transacción
        const transactionsRef = collection(db, `users/${userId}/transactions`);
        const newTransaction = {
            monto: Number(formData.monto),
            tipo: formData.tipo,
            cuentaId: formData.cuentaId,
            categoriaId: formData.categoriaId,
            timestamp: serverTimestamp()
        };
        await addDoc(transactionsRef, newTransaction);

        // Actualizar balance de la cuenta
        const cuentaActual = cuentas.find(c => c.id === formData.cuentaId);
        if (!cuentaActual) {
            console.warn("Cuenta no encontrada, balance no actualizado");
        } else {
            let nuevoBalance = Number(cuentaActual.montoOriginal || 0);
            if (formData.tipo === "ingreso") {
                nuevoBalance += Number(formData.monto);
            } else {
                nuevoBalance -= Number(formData.monto);
            }

            const cuentaRef = doc(db, `users/${userId}/cuentas`, formData.cuentaId);
            await updateDoc(cuentaRef, { montoOriginal: nuevoBalance });

            // Actualizar estado local para reflejar cambio inmediato
            setCuentas(prev => prev.map(c => 
                c.id === formData.cuentaId ? { ...c, montoOriginal: nuevoBalance } : c
            ));
        }

        console.log("Transacción guardada y balance actualizado");
        onCancel();
    } catch (error) {
        console.error("Error al guardar transacción y actualizar balance:", error);
    }
};




    // Render
    if (isLoading || isLoadingCuentas || isLoadingCategorias) {
        return <div className="add-transaction-container text-center py-8">Cargando...</div>;
    }

    if (!userId) {
        return <div className="add-transaction-container text-center py-8">Debes iniciar sesión.</div>;
    }

    if (cuentas.length === 0) {
        return <div className="add-transaction-container text-center py-8">No tienes cuentas registradas.</div>;
    }

    return (
        <div className="add-transaction-container">
            <h2 className="form-title">Añadir Transacción</h2>
            <form onSubmit={handleSubmit} className="transaction-form">

                {/* Cuentas */}
                <div className="form-group">
                    <label htmlFor="cuentaId" className="form-label">Cuenta</label>
                    <select
                        id="cuentaId"
                        name="cuentaId"
                        value={formData.cuentaId}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        {cuentas.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Monto */}
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

                {/* Categorías */}
                <div className="form-group">
                    <label htmlFor="categoriaId" className="form-label">Categoría</label>
                    <select
                        id="categoriaId"
                        name="categoriaId"
                        value={formData.categoriaId}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Tipo */}
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
