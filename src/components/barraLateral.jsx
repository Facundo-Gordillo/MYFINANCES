import React, { useRef, useEffect } from "react";
import "../styles/barraLateral.css";
import { LogOut } from "lucide-react";

// Botón para logout barra lateral
// const LogOutButton = ({ onClick }) => (
//   <button className="floating-button barra-lateral-button" id="btn_logout" onClick={onClick}>
//     <LogOut size={24} color="white"/>
//   </button>
// );

const LogOutButton = ({ isDarkMode, onClick }) => {
  return (
    <button className="floating-button barra-lateral-button" onClick={onClick}>
      <LogOut color={isDarkMode ? "white" : "black"} size={20} />
    </button>
  );
};


function BarraLateral({ onClose, onLogout, isDarkMode}) {

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
          <li>
            <LogOutButton isDarkMode={isDarkMode} onClick={(e) => { e.preventDefault(); onLogout(); }} />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default BarraLateral;
