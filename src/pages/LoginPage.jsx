import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Ingresa tu correo institucional y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      saveSession({ token: data.token, user: data.user });
      navigate('/labs');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell white-bg">
      <TopHeader authMode="login" />

      <main className="auth-split-container">
        <aside className="auth-brand-panel">
          <div className="auth-brand-overlay">
            <div className="utr-crest">
              <span className="crest-top">UNIVERSIDAD TECNOLÓGICA</span>
              <strong className="crest-main">UTR</strong>
              <span className="crest-bottom">EL RETOÑO</span>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-inner">
            <p className="eyebrow red">BIENVENIDO DE NUEVO</p>
            <h1 className="page-title">Inicia sesión</h1>
            <p className="page-subtitle">
              Ingresa con tu correo institucional para continuar.
            </p>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo institucional *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="id@utr.edu.mx"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <div className="password-box">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pwd"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <p className="helper-text">Todos los campos son obligatorios.</p>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Ingresando...'
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer">
              ¿No tienes una cuenta? <Link to="/register">Crear cuenta</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;