import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('paciente');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:4000/api/auth/register', {
        name, email, password, role
      });
      setSuccess('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Ocurrió un error. Intenta con otro correo.'
      );
    }
  };

  return (
    <div className={styles.bgContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Crear cuenta</h2>
        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nombre completo</label>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Correo electrónico</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Rol</label>
            <select
              className={styles.select}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.button}
          >
            Registrarse
          </button>
        </form>
        <p className={styles.loginLink}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.loginAnchor}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}