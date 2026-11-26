import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import TopHeader from '../components/TopHeader';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-shell">
      <TopHeader />

      <main className="container main-content">
        <section className="profile-card">
          <UserCircle size={84} color="#E10600" />
          <h1>{user?.nombre || 'Usuario UTR'}</h1>
          <p className="profile-email">{user?.email || '---'}</p>
          {user?.matricula && (
            <p className="profile-meta">Matrícula: {user.matricula}</p>
          )}
          <span className="role-badge">ROL: {user?.rol || 'USER'}</span>

          <button type="button" className="btn-primary logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;