import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import styles from './PacienteDashboard.module.css'

export default function PacienteDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [turno, setTurno] = useState({
    especialidad: '',
    fecha: '',
    hora: '', 
    motivo: '',
    medicoId: '',
    medicoNombre: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [turnos, setTurnos] = useState([]);
  const [filtro, setFiltro] = useState('pendiente');
  const [editando, setEditando] = useState(null); // id del turno en edición o null

  const navigate = useNavigate();

  // Mensajes auto-ocultos
  useEffect(() => {
    if (mensaje || error) {
      const timeout = setTimeout(() => {
        setMensaje('');
        setError('');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje, error]);

  // Cargar turnos del paciente
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/turnos/paciente`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => setTurnos(res.data))
      .catch(() => setTurnos([]));
  }, [user, mensaje]); // Recarga lista al registrar turno

  // Cargar medicos disponibles
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/medicos`)
      .then(res => setMedicos(res.data))
      .catch(() => setMedicos([]));
  }, []);

  // Controlar inputs
  const handleChange = e => {
    const { name, value } = e.target;
    setTurno(prev => {
      if (name === 'medicoId') {
        const medico = medicos.find(m => m.id === value);
        return { ...prev, medicoId: value, medicoNombre: medico?.name || '' };
      }
      return { ...prev, [name]: value };
    });
  };

  // Crear nuevo turno
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (editando) return; // NO permite crear si estas editando
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/turnos`,
        {
        ...turno,
        especialidad: turno.especialidad, 
        fecha: turno.fecha,
        hora: turno.hora, 
        motivo: turno.motivo,
        medicoId: turno.medicoId,
        medicoNombre: turno.medicoNombre,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMensaje('Turno solicitado correctamente'); 
      setTurno({ especialidad: '', fecha: '', hora: '', motivo: '', medicoId: '', medicoNombre: '' });
      setShowForm(false);
      setFiltro(''); // Oculta filtros hasta nueva accion
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar turno');
    }
  };

  // Editar turno existente
  const handleEditSubmit = async e => {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (!editando) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/turnos/${editando}`,
        turno,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMensaje('Turno editado correctamente');
      setTurno({ especialidad: '', fecha: '', hora: '', motivo: '', medicoId: '', medicoNombre: '' });
      setEditando(null);
      setShowForm(false);
      setFiltro('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al editar turno');
    }
  };

  // Al presionar el botón editar de algún turno
  const comenzarEdicion = t => {
    setTurno({
      especialidad: t.especialidad,
      fecha: t.fecha,
      hora: t.hora,
      motivo: t.motivo,
      medicoId: t.medicoId,
      medicoNombre: t.medicoNombre
    });
    setEditando(t._id);
    setShowForm(false);
    setFiltro('');
  };

  // Botón cancelar en edición
  const cancelarEdicion = () => {
    setEditando(null);
    setShowForm(false);
    setTurno({ especialidad: '', fecha: '', hora: '', motivo: '', medicoId: '', medicoNombre: '' });
    setMensaje('');
    setError('');
  };

  // Botón cancelar en edición
  const cancelarCreacion = () => {
    setEditando(null);
    setShowForm(false);
    setTurno({ especialidad: '', fecha: '', hora: '', motivo: '', medicoId: '', medicoNombre: '' });
    setMensaje('');
    setError('');
  };

  const ocultarTurno = async id => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/turnos/${id}/ocultar_paciente`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMensaje('Turno ocultado');
    } catch {
      setError('No se pudo ocultar');
    }
  };

  const mostrarFiltros = !showForm && !editando;
  const mostrarListado = !showForm && !editando;

  return (
    <div className={styles.container}>
      <div className={styles.logoutRow}>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={styles.logoutBtn}
        >
          Cerrar sesión
        </button>
      </div>
      <h2 className={styles.title}>
        Bienvenido, {user?.name}
      </h2>
      {mensaje && <div className={styles.msgSuccess}>{mensaje}</div>}
      {error && <div className={styles.msgError}>{error}</div>}

      {/* Botón solicitar */}
      {!showForm && !editando && (
        <button
          className={styles.solicitarBtn}
          onClick={() => setShowForm(true)}
        >
          Solicitar Turno
        </button>
      )}

      {/* Formulario de creación */}
      {showForm && !editando && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Especialidad</label>
            <select
              name="especialidad"
              value={turno.especialidad}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Seleccione especialidad</option>
              <option value="general">Medicina General</option>
              <option value="pediatria">Pediatría</option>
              <option value="ginecologia">Ginecología</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Médico</label>
            <select
              name="medicoId"
              value={turno.medicoId}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Selecciona médico</option>
              {medicos.map(med => (
                <option value={med.id} key={med.id}>{med.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={turno.fecha}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Hora</label>
            <input
              type="time"
              name="hora"
              value={turno.hora}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Motivo</label>
            <textarea
              name="motivo"
              rows="3"
              value={turno.motivo}
              onChange={handleChange}
              required
              className={styles.textarea}
            />
          </div>
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
            >
              Enviar Solicitud
            </button>
            <button
              type="button"
              onClick={cancelarCreacion}
              className={styles.btnCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Formulario de edición */}
      {editando && (
        <form onSubmit={handleEditSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Especialidad</label>
            <select
              name="especialidad"
              value={turno.especialidad}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Seleccione</option>
              <option value="general">Medicina General</option>
              <option value="pediatria">Pediatría</option>
              <option value="ginecologia">Ginecología</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Médico</label>
            <select
              name="medicoId"
              value={turno.medicoId}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Selecciona médico</option>
              {medicos.map(med => (
                <option value={med.id} key={med.id}>{med.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={turno.fecha}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Hora</label>
            <input
              type="time"
              name="hora"
              value={turno.hora}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Motivo</label>
            <textarea
              name="motivo"
              rows="3"
              value={turno.motivo}
              onChange={handleChange}
              required
              className={styles.textarea}
            />
          </div>
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={cancelarEdicion}
              className={styles.btnCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      {mostrarFiltros && (
        <div className={styles.filtros}>
          <button
            onClick={() => setFiltro('pendiente')}
            className={`${styles.filtroBtn} ${filtro === 'pendiente' ? styles.active : ''}`}
          >Pendientes</button>
          <button
            onClick={() => setFiltro('terminada')}
            className={`${styles.filtroBtn} ${filtro === 'terminada' ? styles.active : ''}`}
          >Terminadas</button>
        </div>
      )}

      {/* Listado de turnos */}
      {mostrarListado && (
        <div>
          {turnos.filter(t => t.estado === filtro && !t.ocultoPaciente).length === 0 && (
            <div style={{ textAlign: 'center', color: '#999' }}>
              No hay turnos {filtro === 'pendiente' ? 'pendientes' : 'terminados'}.
            </div>
          )}
          {turnos.filter(t => t.estado === filtro && !t.ocultoPaciente).map(t => (
            <div key={t._id} className={styles.turnoItem}>
              <b>{t.fecha} {t.hora}</b><br />
              Médico: <b>{t.medicoNombre}</b><br />
              Especialidad: {t.especialidad}<br />
              Motivo: {t.motivo}<br />
              Estado: <span className={t.estado === 'pendiente' ? styles.estadoPendiente : styles.estadoTerminada}>
                {t.estado}
              </span>
              {t.estado === 'pendiente' && (
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    comenzarEdicion(t);
                    setShowForm(false);
                  }}
                >
                  Editar
                </button>
              )}
              {t.estado === 'terminada' && (
                <button
                  className={styles.ocultarBtn}
                  onClick={() => ocultarTurno(t._id)}
                >
                  Ocultar del historial
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}