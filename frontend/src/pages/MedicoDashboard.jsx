import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './MedicoDashboard.module.css'

export default function MedicoDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [turnos, setTurnos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('pendiente'); // 'pendiente', 'terminada', 'todos'

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

  // Cargar turnos del médico
  useEffect(() => {
    if (!user) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/turnos/medico`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => setTurnos(res.data))
      .catch(() => setTurnos([]));
  }, [user, mensaje]); // Recarga al actualizar mensaje

  // Cambiar estado a terminada
  const terminarTurno = async id => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/turnos/${id}/estado`,
        { estado: 'terminada' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMensaje('Turno actualizado');
      setError('');
      // Recarga turnos automáticamente con el efecto
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar turno');
      setMensaje('');
    }
  };

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
        Agenda del Dr(a). {user?.name}
      </h2>
      {mensaje && <div className={styles.msgSuccess}>{mensaje}</div>}
      {error && <div className={styles.msgError}>{error}</div>}

      <div className={styles.filtros}>
        <button
          className={`${styles.filtroBtn} ${filtro === 'pendiente' ? styles.active : ''}`}
          onClick={() => setFiltro('pendiente')}
        >Pendientes</button>
        <button
          className={`${styles.filtroBtn} ${filtro === 'terminada' ? styles.active : ''}`}
          onClick={() => setFiltro('terminada')}
        >Terminados</button>
        <button
          className={`${styles.filtroBtn} ${filtro === 'todos' ? styles.active : ''}`}
          onClick={() => setFiltro('todos')}
        >Todos</button>
      </div>

      <div>
        {turnos.filter(t => filtro === 'todos' ? true : t.estado === filtro).length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999' }}>
            No hay turnos {filtro === 'pendiente' ? 'pendientes' : filtro === 'terminada' ? 'terminados' : ''}.
          </div>
        ) : (
          turnos
            .filter(t => filtro === 'todos' ? true : t.estado === filtro)
            .map(t => (
              <div
                key={t._id}
                className={
                  t.estado === 'pendiente'
                    ? styles.turnoItem
                    : `${styles.turnoItem} ${styles.turnoItemTerminada}`
                }
              >
                <b>{t.fecha} {t.hora}</b><br />
                Paciente: <b>{t.pacienteNombre}</b><br />
                Especialidad: {t.especialidad}<br />
                Motivo: {t.motivo}<br />
                Estado: <span className={t.estado === 'pendiente' ? styles.estadoPendiente : styles.estadoTerminada}>
                  {t.estado}
                </span>
                {t.estado === 'pendiente' && (
                  <button
                    onClick={() => terminarTurno(t._id)}
                    className={styles.terminarBtn}
                  >
                    Marcar como terminada
                  </button>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}