import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      login(res.data);
      if (res.data.user.role === 'paciente') {
        navigate('/paciente');
      } else if (res.data.user.role === 'medico') {
        navigate('/medico');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Ocurrió un error. Verifica tu correo y contraseña.'
      );
    }
  };

  return (
    <div className={styles.bgContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>MediTurno</h2>
        {error && <div className={styles.errorMsg}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
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
            Iniciar sesión
          </button>
        </form>
        <p className={styles.registerLink}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className={styles.registerAnchor}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
