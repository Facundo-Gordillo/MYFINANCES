import React, { useRef, useEffect } from "react";
import "../styles/barraLateral.css";

function BarraLateral({ onClose }) {
  const barraRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (barraRef.current && !barraRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={barraRef} className="barra-lateral">
      <button onClick={onClose} className="cerrar-btn">
        Cerrar
      </button>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <a href="#" className="sidebar-link">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-link">
              Cuentas
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-link">
              Añadir Categoría
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default BarraLateral;
