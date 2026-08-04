'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    setLoading(false);

    if (result.success) {
      // Reemplaza la ruta para que el botón de "atrás" no vuelva a mostrar el formulario
      router.replace('/dash');
    } else {
      setError(result.error || 'Ocurrió un error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Iniciar Sesión</h2>
          
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Usuario</label>
              <input
                name="usuario"
                type="text"
                required
                className={styles.input}
                placeholder="Tu usuario"
              />
            </div>
            
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input
                name="password"
                type="password"
                required
                className={styles.input}
                placeholder="************"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}