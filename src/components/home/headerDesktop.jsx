import React from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/headerDesktop.css";

function HeaderDesktop({ isDarkMode, toggleDarkMode, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="header-desktop">
      <div className="header-left" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <h1 className="header-title">Mis Finanzas</h1>
      </div>

      <nav className="header-nav">
        <button onClick={() => navigate("/")} className="header-link">Home</button>
        <button onClick={() => navigate("/cuentas")} className="header-link">Cuentas</button>
        <button onClick={() => navigate("/categorias")} className="header-link">Categorías</button>
      </nav>

      <div className="header-right">
        <button className="dark-mode-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} color="orange" /> : <Moon size={20} />}
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}

export default HeaderDesktop;
