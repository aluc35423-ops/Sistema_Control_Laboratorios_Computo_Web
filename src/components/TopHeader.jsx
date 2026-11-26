import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, UserCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopHeader = ({
  authMode = null,
  searchQuery,
  onSearchChange,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState('');
  const isAdmin = user?.rol === 'ADMIN';

  const isControlled = typeof onSearchChange === 'function';
  const inputValue = isControlled ? searchQuery : localQuery;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (isControlled) {
      onSearchChange(val);
    } else {
      setLocalQuery(val);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!isControlled) {
      const q = localQuery.trim();
      navigate(q ? `/labs?q=${encodeURIComponent(q)}` : '/labs');
    }
  };

  const handleClear = () => {
    if (isControlled) {
      onSearchChange('');
    } else {
      setLocalQuery('');
    }
  };

  return (
    <header className="top-header">
      <div className="top-header-inner">
        <div className="header-left">
          <div
            className="logo-circle"
            onClick={() => !authMode && navigate('/labs')}
            style={{ cursor: authMode ? 'default' : 'pointer' }}
            title="Universidad Tecnológica El Retoño"
          >
            UTR
          </div>

          {!authMode && (
            <nav className="desktop-nav">
              <NavLink
                to="/labs"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Laboratorios
              </NavLink>

              <NavLink
                to="/session"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Mi sesión
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Administración
                </NavLink>
              )}
            </nav>
          )}
        </div>

        {authMode ? (
          <div className="auth-header-cta">
            {authMode === 'login' ? (
              <>
                <span>¿Aún no tienes cuenta?</span>
                <Link to="/register">Regístrate</Link>
              </>
            ) : (
              <>
                <span>¿Ya tienes cuenta?</span>
                <Link to="/login">Inicia sesión</Link>
              </>
            )}
          </div>
        ) : (
          <div className="header-right">
            <form className="header-search" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Buscar PC, inventario o laboratorio..."
                value={inputValue || ''}
                onChange={handleInputChange}
              />
              {inputValue ? (
                <button
                  type="button"
                  className="search-icon-btn"
                  onClick={handleClear}
                  title="Limpiar búsqueda"
                >
                  <X size={16} color="#64748B" />
                </button>
              ) : (
                <button type="submit" className="search-icon-btn" title="Buscar">
                  <Search size={17} color="#64748B" />
                </button>
              )}
            </form>

            <button
              type="button"
              className="profile-icon-btn"
              onClick={() => navigate('/profile')}
              title="Mi perfil"
            >
              <UserCircle size={30} color="#E10600" strokeWidth={1.6} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopHeader;