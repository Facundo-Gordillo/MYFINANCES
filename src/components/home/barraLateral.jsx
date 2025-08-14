import React, { useRef, useEffect } from "react";
import '../../styles/barraLateral.css'
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";


// logica para cambiar color del icono logout (se tiene que hacer de esta manera por el lucide-react)
const LogOutButton = ({ isDarkMode, onClick }) => (
  <button id="btn_logout" onClick={onClick}>
    <LogOut color={isDarkMode ? "white" : "black"} size={24} />
  </button>
);



function BarraLateral({ onClose, onLogout, isDarkMode }) {
  const barraRef = useRef(null);
  const navigate = useNavigate();



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






// Logica para abrir la ruta Cuentas.
  const handleCuentasClick = (e) => {
    e.preventDefault();
    onClose();
    navigate("/cuentas");
  };

  // Logica para abrir la ruta Categorias.
  const handleCategoriasClick = (e) => {
    e.preventDefault();
    onClose();
    navigate("/categorias");
  };

  // Logica para cerrar la barra si se hace click fuera de ella.
  const handleHomeClick = (e) => {
    e.preventDefault();
    onClose();
    navigate("/");
  };



  
  return (
    <div ref={barraRef} className="barra-lateral">
      <button onClick={onClose} className="cerrar-btn">Cerrar</button>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li>
            <a href="#" className="sidebar-link" onClick={handleHomeClick}>
              Home
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-link" onClick={handleCuentasClick}>
              Cuentas
            </a>
          </li>
          <li>
            <a href="#" className="sidebar-link" onClick={handleCategoriasClick}>
              Añadir Categoría
            </a>
          </li>
          <li>
            <LogOutButton
              isDarkMode={isDarkMode}
              onClick={(e) => { e.preventDefault(); onLogout(); }}
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default BarraLateral;
