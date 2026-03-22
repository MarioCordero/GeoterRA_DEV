import React from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

const Header = () => {
  const { user, loading, logout } = useSession();

  // Mientras carga la sesión, mostramos un spinner o estado de carga
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          GeoterRA
        </Link>

        <div className="nav-links">
          <Link to="/home">
            {user ? <span>Mi perfil</span> : <span>Iniciar Sesión</span>}
          </Link>
          <Link to="/about">Órganos</Link>
          {user && (
            <button
              type="button"
              onClick={logout}
              className="nav-logout"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;