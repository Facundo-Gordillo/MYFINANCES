import React from 'react';
import { X } from 'lucide-react'; // Usamos el ícono 'X' para cerrar

// Componente de la Barra Lateral
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div
      className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}
    >
      <div className="sidebar-header">
        <h2 className="sidebar-title">Menú</h2>
        {/* Botón para cerrar la barra lateral, siempre visible dentro de la barra */}
        <button onClick={onClose} className="sidebar-close-button" aria-label="Cerrar menú">
          <X size={24} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li><a href="#" className="sidebar-link">Home</a></li>
          <li><a href="#" className="sidebar-link">Cuentas</a></li>
          <li><a href="#" className="sidebar-link">Añadir Categoría</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
