import { useState, useEffect } from "react";

export function useBarraLateral() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Detectar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Definir breakpoints
  const isDesktop = windowWidth > 1024; // Desktop
  const isMobile = windowWidth <= 1024; // Mobile y tablet

  // Forzar barra abierta en desktop
  const isOpen = isDesktop ? true : isOpenMobile;

  // Funciones para mobile
  const openBarra = () => setIsOpenMobile(true);
  const closeBarra = () => setIsOpenMobile(false);
  const toggleBarra = () => setIsOpenMobile((prev) => !prev);

  return {
    isOpen,
    openBarra,
    closeBarra,
    toggleBarra,
    isDesktop,
    isMobile,
  };
}
