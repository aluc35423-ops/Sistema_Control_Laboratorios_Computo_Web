import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import TopHeader from '../components/TopHeader';
import { apiFetch } from '../services/api';

const padTwo = (num) => String(num).padStart(2, '0');

const LabsGridPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [computers, setComputers] = useState([]);
  const [labs, setLabs] = useState(['Todos']);
  const [selectedLab, setSelectedLab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchComputers = useCallback(async (labFilter = 'Todos') => {
    setLoading(true);
    setError('');
    try {
      const query =
        labFilter !== 'Todos' ? `?laboratorio=${encodeURIComponent(labFilter)}` : '';
      const data = await apiFetch(`/api/labs/computers${query}`);
      const list = Array.isArray(data) ? data : data?.computers || data?.data || [];
      setComputers(list);

      if (labFilter === 'Todos') {
        const uniqueLabs = [...new Set(list.map((pc) => pc.laboratorio).filter(Boolean))];
        setLabs(['Todos', ...uniqueLabs]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComputers(selectedLab);
  }, [selectedLab, fetchComputers]);

  const handleSelectPC = (pc) => {
    if (pc.estatus !== 'DISPONIBLE') {
      setNotice(`La estación ${pc._pcLabel} está en estatus ${pc.estatus} y no se puede asignar.`);
      return;
    }
    setNotice('');
    navigate(`/assign/${pc.id || pc._id}`, { state: { computer: pc } });
  };

  const computersWithLabel = computers.map((pc, idx) => ({
    ...pc,
    _pcLabel: `PC-${padTwo(idx + 1)}`,
  }));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredComputers = normalizedQuery
    ? computersWithLabel.filter((pc) => {
        const inv = (pc.numeroInventario || pc.numerolnventario || '').toLowerCase();
        const lab = (pc.laboratorio || '').toLowerCase();
        const specs = (pc.especificaciones || '').toLowerCase();
        const est = (pc.estatus || '').toLowerCase();
        return (
          inv.includes(normalizedQuery) ||
          lab.includes(normalizedQuery) ||
          specs.includes(normalizedQuery) ||
          est.includes(normalizedQuery) ||
          pc._pcLabel.toLowerCase().includes(normalizedQuery)
        );
      })
    : computersWithLabel;

  const total = filteredComputers.length;
  const disponibles = filteredComputers.filter((c) => c.estatus === 'DISPONIBLE').length;
  const ocupadas = filteredComputers.filter((c) => c.estatus === 'OCUPADA').length;
  const mantto = filteredComputers.filter((c) => c.estatus === 'MANTENIMIENTO').length;

  return (
    <div className="page-shell white-bg">
      <TopHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <section className="campus-hero">
        <div className="campus-hero-overlay">
          <div className="container campus-hero-text">
            <span>UNIVERSIDAD TECNOLÓGICA EL RETOÑO</span>
          </div>
        </div>
      </section>

      <main className="container labs-main">
        <section className="kpi-grid-4">
          <div className="kpi-card-web">
            <span className="kpi-num dark">{total}</span>
            <strong className="kpi-title dark">Estaciones en Total</strong>
          </div>
          <div className="kpi-card-web">
            <span className="kpi-num green">{disponibles}</span>
            <strong className="kpi-title green">Disponibles</strong>
          </div>
          <div className="kpi-card-web">
            <span className="kpi-num red">{ocupadas}</span>
            <strong className="kpi-title red">Ocupadas</strong>
          </div>
          <div className="kpi-card-web">
            <span className="kpi-num amber">{mantto}</span>
            <strong className="kpi-title amber">En mantenimiento</strong>
          </div>
        </section>

        <div className="chips-row">
          {labs.map((lab) => (
            <button
              key={lab}
              type="button"
              className={`chip ${selectedLab === lab ? 'active' : ''}`}
              onClick={() => setSelectedLab(lab)}
            >
              {lab}
            </button>
          ))}
        </div>

        {error && <div className="alert-error">{error}</div>}
        {notice && <div className="alert-warning">{notice}</div>}

        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <p>Cargando equipos de laboratorio...</p>
          </div>
        ) : filteredComputers.length === 0 ? (
          <div className="empty-box">
            <p>
              {normalizedQuery
                ? `No hay resultados para "${searchQuery}".`
                : 'No se encontraron equipos registrados.'}
            </p>
          </div>
        ) : (
          <section className="pc-grid-web">
            {filteredComputers.map((pc) => {
              const statusKey = (pc.estatus || 'MANTENIMIENTO').toLowerCase();
              const inventario =
                pc.numeroInventario || pc.numerolnventario || `INV-${pc.id}`;

              return (
                <article
                  key={pc.id || pc._id}
                  className={`pc-card status-${statusKey}`}
                  onClick={() => handleSelectPC(pc)}
                >
                  <div className="pc-card-top">
                    <Monitor size={18} className="pc-icon" />
                    <strong className="pc-name">{pc._pcLabel}</strong>
                  </div>

                  <p className="pc-inv">INV · {inventario}</p>
                  <p className="pc-lab">{pc.laboratorio}</p>
                  <p className="pc-specs">{pc.especificaciones || 'Sin especificaciones'}</p>

                  <div className={`status-pill pill-${statusKey}`}>
                    <span className="status-dot" />
                    <span>{pc.estatus}</span>
                  </div>

                  <div className={`pc-card-foot foot-${statusKey}`}>
                    {pc.estatus === 'DISPONIBLE'
                      ? 'Seleccionar estación →'
                      : pc.estatus === 'OCUPADA'
                      ? 'En uso'
                      : 'En revisión'}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default LabsGridPage;