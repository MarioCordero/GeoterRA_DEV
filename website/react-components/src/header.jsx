import React from "react";
import logo from "./assets/images/GeoterRA-Logo-White.svg";

export default function Header() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      {/* Logo section */}
      <div className="flex items-center">
        <a href="./index.php" className="flex items-center">
          <img 
            id="logo" 
            src={logo} 
            className="h-10" 
            alt="GeeterRA logotype" 
          />
          <h1 className="ml-3 text-xl font-normal text-gray-900">GeeterRA</h1>
        </a>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex space-x-8">
        <a 
          href="./index.php#about-us" 
          className="text-gray-900 hover:text-gray-600 transition-colors"
        >
          Acerca de nosotros
        </a>
        <a 
          href="./index.php#how-works" 
          className="text-gray-900 hover:text-gray-600 transition-colors"
        >
          Como funciona
        </a>
        <a 
          href="./index.php#contact-us" 
          className="text-gray-900 hover:text-gray-600 transition-colors"
        >
          Contacto
        </a>
        <a 
          href="./map.php" 
          className="text-gray-900 hover:text-gray-600 transition-colors"
        >
          Mapa
        </a>
        <a 
          href="./login.php" 
          className="text-gray-900 hover:text-gray-600 transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>

      {/* Mobile menu button (hidden on desktop) */}
      <div className="md:hidden">
        <button className="flex flex-col space-y-1.5">
          <span className="w-6 h-0.5 bg-gray-900"></span>
          <span className="w-6 h-0.5 bg-gray-900"></span>
          <span className="w-6 h-0.5 bg-gray-900"></span>
        </button>
      </div>
    </nav>
  );
}