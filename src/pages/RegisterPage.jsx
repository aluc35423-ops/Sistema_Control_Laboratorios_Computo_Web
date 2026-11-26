import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    matricula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { nombre, matricula, email, password, confirmPassword } = form;
    if (!nombre.trim() || !matricula.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          matricula: matricula.trim(),
          email: email.trim(),
          password,
          rol: 'USER',
        }),
      });

      setSuccess('Cuenta creada correctamente. Redirigiendo a iniciar sesión...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell white-bg">
      <TopHeader authMode="register" />

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
            <p className="eyebrow red">NUEVA CUENTA</p>
            <h1 className="page-title">Crea tu cuenta</h1>
            <p className="page-subtitle">
              Completa tus datos para acceder al laboratorio.
            </p>

            {error && <div className="alert-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre y apellidos"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="matricula">Matrícula *</label>
                <input
                  id="matricula"
                  name="matricula"
                  type="text"
                  placeholder="Ej. 20240081"
                  value={form.matricula}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo institucional *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@institucion.edu.mx"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <div className="password-box">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crea una contraseña"
                    value={form.password}
                    onChange={handleChange}
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                <div className="password-box">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Vuelve a escribir tu contraseña"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-pwd"
                    onClick={() => setShowConfirm((prev) => !prev)}
                  >
                    {showConfirm ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Creando cuenta...'
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer">
              ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;