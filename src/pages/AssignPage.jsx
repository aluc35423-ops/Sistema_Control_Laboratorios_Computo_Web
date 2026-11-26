import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Monitor } from 'lucide-react';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MATERIAS_SUGERIDAS = [
  'Desarrollo Web Integral',
  'Desarrollo para Dispositivos Inteligentes',
  'Arquitectura de Computadoras',
  'Bases de Datos',
  'Redes y Seguridad',
  'Otra materia...',
];

const formatHour = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const formatDateShort = (date) => {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `HOY · ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const AssignPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const computer = location.state?.computer;

  const [selectedMateria, setSelectedMateria] = useState(MATERIAS_SUGERIDAS[0]);
  const [customMateria, setCustomMateria] = useState('');
  const [horasUso, setHorasUso] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!computer) {
    return (
      <div className="page-shell white-bg">
        <TopHeader />
        <main className="container main-content">
          <div className="empty-box">
            <p>Selecciona primero una computadora disponible desde el mapa de laboratorios.</p>
            <button
              type="button"
              className="btn-primary inline-btn"
              onClick={() => navigate('/labs')}
            >
              Volver a laboratorios
            </button>
          </div>
        </main>
      </div>
    );
  }

  const inventario =
    computer.numeroInventario || computer.numerolnventario || `CMP-${computer.id}`;
  const perifericos = Array.isArray(computer.perifericosIncluidos)
    ? computer.perifericosIncluidos.join(', ')
    : 'Monitor, teclado y mouse';

  const now = new Date();
  const estimatedEnd = new Date(now.getTime() + horasUso * 60 * 60 * 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const materiaFinal =
      selectedMateria === 'Otra materia...' ? customMateria.trim() : selectedMateria;

    if (!materiaFinal) {
      setError('Selecciona o escribe el nombre de la materia.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/api/labs/assignments', {
        method: 'POST',
        body: JSON.stringify({
          computerId: computer.id || computer._id,
          userId: user?.id || user?._id,
          materia: materiaFinal,
          horasUso,
        }),
      });

      navigate('/session');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell white-bg">
      <TopHeader />

      <main className="container main-content assign-container">
        <button type="button" className="back-link" onClick={() => navigate('/labs')}>
          <ArrowLeft size={16} />
          <span>Volver a laboratorios</span>
        </button>

        <p className="eyebrow teal">ASIGNACIÓN DE EQUIPO</p>
        <h1 className="page-title">Prepara tu próxima sesión</h1>

        <div className="assign-grid">
          <section className="card station-card-compact">
            <div className="card-header-row">
              <span className="small-caps">TU ESTACIÓN</span>
              <span className="status-pill pill-disponible">
                <span className="status-dot" />
                DISPONIBLE
              </span>
            </div>

            <div className="station-banner-vertical">
              <Monitor size={42} color="#1E293B" strokeWidth={1.6} />
              <h2 className="station-code">{computer._pcLabel || inventario}</h2>
              <p className="station-sub">Inventario {inventario}</p>
            </div>

            <div className="spec-list">
              <div className="spec-row">
                <span>Laboratorio</span>
                <strong>{computer.laboratorio}</strong>
              </div>
              <div className="spec-row">
                <span>Especificaciones</span>
                <strong>{computer.especificaciones || 'Estándar UTR'}</strong>
              </div>
              <div className="spec-row">
                <span>Periféricos</span>
                <strong>{perifericos}</strong>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Datos de tu sesión</h2>
            <p className="card-sub">Los campos marcados con * son obligatorios.</p>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="materia">Materia *</label>
                <select
                  id="materia"
                  value={selectedMateria}
                  onChange={(e) => setSelectedMateria(e.target.value)}
                >
                  {MATERIAS_SUGERIDAS.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMateria === 'Otra materia...' && (
                <div className="form-group">
                  <label htmlFor="customMateria">Nombre de la materia *</label>
                  <input
                    id="customMateria"
                    type="text"
                    placeholder="Escribe la materia"
                    value={customMateria}
                    onChange={(e) => setCustomMateria(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Horas de uso *</label>
                <div className="hours-grid">
                  {[1, 2, 3].map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`hour-btn ${horasUso === h ? 'active' : ''}`}
                      onClick={() => setHorasUso(h)}
                    >
                      {h} {h === 1 ? 'hora' : 'horas'}
                    </button>
                  ))}
                </div>
                <p className="field-hint">Duración máxima por sesión: 3 horas.</p>
              </div>

              <div className="time-box">
                <p className="date-caption">{formatDateShort(now)}</p>
                <div className="time-row">
                  <div>
                    <span className="time-label">Inicio</span>
                    <strong className="time-value">{formatHour(now)}</strong>
                  </div>
                  <ArrowRight size={20} color="#64748B" />
                  <div style={{ textAlign: 'right' }}>
                    <span className="time-label">Fin estimado</span>
                    <strong className="time-value">{formatHour(estimatedEnd)}</strong>
                  </div>
                </div>
              </div>

              <p className="rule-title">Una estación, una sesión a la vez.</p>
              <p className="rule-desc">
                Al confirmar, la PC quedará ocupada a tu nombre. Libera el equipo al terminar y
                reporta cualquier falla.
              </p>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Confirmando...'
                ) : (
                  <>
                    <span>Confirmar asignación</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="footer-note">
                Asignación para {user?.nombre || 'Estudiante'} · Matrícula{' '}
                {user?.matricula || '---'}
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AssignPage;