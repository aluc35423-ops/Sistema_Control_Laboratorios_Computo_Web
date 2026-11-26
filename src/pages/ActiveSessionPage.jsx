import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatTimer = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(safe / 3600)).padStart(2, '0');
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const ActiveSessionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeAssignment, setActiveAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState(false);
  const [reporteFalla, setReporteFalla] = useState(false);
  const [descripcionFalla, setDescripcionFalla] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchActiveSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/labs/assignments');
      const list = Array.isArray(data) ? data : data?.assignments || data?.data || [];
      const current = list.find((a) => a.estatus === 'ASIGNADA') || null;
      setActiveAssignment(current);

      if (current?.inicio) {
        const startMs = new Date(current.inicio).getTime();
        if (!Number.isNaN(startMs)) {
          setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
        }
      } else {
        setElapsedSeconds(0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  useEffect(() => {
    if (!activeAssignment) return undefined;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAssignment]);

  const handleRelease = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;
    setError('');

    if (reporteFalla && !descripcionFalla.trim()) {
      setError('Describe brevemente la falla antes de liberar el equipo.');
      return;
    }

    const assignmentId = activeAssignment.assignmentId || activeAssignment.id;
    setIsReleasing(true);

    try {
      await apiFetch(`/api/labs/assignments/${assignmentId}/release`, {
        method: 'PATCH',
        body: JSON.stringify({
          reporteFalla,
          descripcionFalla: reporteFalla ? descripcionFalla.trim() : '',
        }),
      });

      setSuccess(
        reporteFalla
          ? 'Equipo liberado y enviado a mantenimiento con tu reporte.'
          : 'Tu sesión finalizó y el equipo quedó disponible.'
      );
      setReporteFalla(false);
      setDescripcionFalla('');
      fetchActiveSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsReleasing(false);
    }
  };

  const totalHours = Number(activeAssignment?.horasUso) || 2;
  const totalDurationSec = totalHours * 3600;
  const progressPct = Math.min(100, (elapsedSeconds / totalDurationSec) * 100);
  const remainingSec = Math.max(0, totalDurationSec - elapsedSeconds);
  const remH = Math.floor(remainingSec / 3600);
  const remM = Math.floor((remainingSec % 3600) / 60);

  return (
    <div className="page-shell white-bg">
      <TopHeader />

      <main className="container main-content session-container">
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <p>Consultando tu sesión activa...</p>
          </div>
        ) : !activeAssignment ? (
          <div className="empty-box">
            <Monitor size={48} color="#94A3B8" />
            <h2>Sin sesión activa</h2>
            <p>
              Ve a Laboratorios y elige una computadora disponible para iniciar tu sesión.
            </p>
            <button
              type="button"
              className="btn-primary inline-btn"
              onClick={() => navigate('/labs')}
            >
              Explorar laboratorios
            </button>
          </div>
        ) : (
          <>
            <h1 className="workspace-heading">TU ESPACIO DE TRABAJO</h1>

            <div className="active-banner">
              <div className="banner-title-row">
                <span className="green-dot" />
                <strong>Tu sesión está en curso</strong>
              </div>
              <p>
                {activeAssignment.inicio
                  ? `Inicio: ${new Date(activeAssignment.inicio).toLocaleString()}`
                  : 'Sesión activa registrada'}
              </p>
            </div>

            <div className="session-grid">
              <section className="card">
                <div className="card-header-row">
                  <div>
                    <h2 className="pc-hero">{activeAssignment.pc || 'PC Asignada'}</h2>
                    <p className="card-sub">{activeAssignment.laboratorio}</p>
                  </div>
                  <span className="status-pill pill-ocupada">
                    <span className="status-dot" />
                    OCUPADA
                  </span>
                </div>

                <div className="timer-box">
                  <span className="small-caps">TIEMPO TRANSCURRIDO</span>
                  <div className="timer-value">{formatTimer(elapsedSeconds)}</div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="timer-foot">
                    Te quedan {remH} h {remM} min de {totalHours}{' '}
                    {totalHours === 1 ? 'hora' : 'horas'} asignadas
                  </p>
                </div>

                <div className="spec-list">
                  <div className="spec-row">
                    <span>Materia</span>
                    <strong>{activeAssignment.materia || 'Práctica de laboratorio'}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Duración asignada</span>
                    <strong>
                      {totalHours} {totalHours === 1 ? 'hora' : 'horas'}
                    </strong>
                  </div>
                  <div className="spec-row">
                    <span>Usuario</span>
                    <strong>{activeAssignment.usuario || user?.nombre || 'Estudiante'}</strong>
                  </div>
                </div>
              </section>

              <section className="card">
                <h2 className="card-title">¿Terminaste por hoy?</h2>
                <p className="card-sub">
                  Guarda tus archivos y cierra tus cuentas antes de liberar la estación.
                </p>

                <form onSubmit={handleRelease}>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={reporteFalla}
                      onChange={(e) => setReporteFalla(e.target.checked)}
                    />
                    <span>Reportar una falla del equipo</span>
                  </label>

                  {reporteFalla && (
                    <div className="form-group">
                      <label htmlFor="descripcionFalla">Descripción de la falla *</label>
                      <textarea
                        id="descripcionFalla"
                        rows={4}
                        placeholder="Ej. El puerto USB frontal no reconoce mi memoria..."
                        value={descripcionFalla}
                        onChange={(e) => setDescripcionFalla(e.target.value)}
                      />
                      <p className="field-hint">
                        Visible al activar «Reportar una falla».
                      </p>

                      <div className="warning-card">
                        <strong>El equipo pasará a mantenimiento</strong>
                        <p>
                          TI recibirá tu reporte al liberar la estación. No estará disponible
                          hasta su revisión.
                        </p>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={isReleasing}>
                    {isReleasing ? 'Liberando equipo...' : 'Liberar Equipo'}
                  </button>
                </form>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ActiveSessionPage;