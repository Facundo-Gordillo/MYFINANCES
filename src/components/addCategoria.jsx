import React, { useState, useEffect } from 'react';

// Componente principal de la aplicación
const App = () => {
  // Estado para almacenar la lista de categorías
  const [categories, setCategories] = useState([]);
  // Estado para el nombre de la nueva categoría
  const [newCategoryName, setNewCategoryName] = useState('');
  // Estado para el color de la nueva categoría, con un valor por defecto
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');

  // useEffect para cargar las categorías desde localStorage al iniciar la app
  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error al cargar categorías de localStorage:", error);
    }
  }, []);

  // useEffect para guardar las categorías en localStorage cada vez que cambian
  useEffect(() => {
    try {
      localStorage.setItem('categories', JSON.stringify(categories));
    } catch (error) {
      console.error("Error al guardar categorías en localStorage:", error);
    }
  }, [categories]);

  // Función para manejar el envío del formulario
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim() === '') {
      return; // No agregar categorías vacías
    }
    const newCategory = {
      id: Date.now(), // Un ID único basado en la marca de tiempo
      name: newCategoryName,
      color: newCategoryColor,
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName(''); // Limpiar el input del nombre
  };

  // Función para manejar el cambio en el input del nombre
  const handleNameChange = (e) => {
    setNewCategoryName(e.target.value);
  };

  // Función para manejar el cambio en el input del color
  const handleColorChange = (e) => {
    setNewCategoryColor(e.target.value);
  };

  // Renderizado del componente
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-start justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Administrador de Categorías</h2>

        {/* Formulario para agregar una nueva categoría */}
        <form onSubmit={handleAddCategory} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Nombre de la Categoría</label>
              <input
                type="text"
                id="categoryName"
                value={newCategoryName}
                onChange={handleNameChange}
                placeholder="Ej: Comida, Transporte"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="categoryColor" className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                id="categoryColor"
                value={newCategoryColor}
                onChange={handleColorChange}
                className="mt-1 block h-10 w-full rounded-md cursor-pointer border border-gray-300 transition duration-150 ease-in-out"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Agregar Categoría
          </button>
        </form>

        {/* Listado de categorías */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Categorías Existentes</h3>
          {categories.length === 0 ? (
            <p className="text-gray-500">Aún no hay categorías. ¡Agrega una!</p>
          ) : (
            <ul className="space-y-4">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="bg-gray-50 p-4 rounded-lg flex items-center justify-between shadow-sm transition duration-150 ease-in-out hover:bg-gray-100"
                >
                  <span className="text-gray-900 font-medium">{category.name}</span>
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
