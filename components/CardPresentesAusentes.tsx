'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import styles from './CardPresentesAusentes.module.css';

interface CardPresentesAusentesProps {
  dia: number;
}

export default function CardPresentesAusentes({ dia }: CardPresentesAusentesProps) {
  const [presentes, setPresentes] = useState(0);
  const [ausentes, setAusentes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerPresentesAusentes() {
      setLoading(true);
      const campoAsistencia = dia === 1 ? 'asistencia_dia_1' : 'asistencia_dia_2';

      // 1. Obtener total general de registros
      const { count: total, error: errTotal } = await supabase
        .from('profiles') // ⚠️  nombre de mi tabla
        .select('*', { count: 'exact', head: true });

      // 2. Obtener total de presentes del día seleccionado
      const { count: totalPresentes, error: errPresentes } = await supabase
        .from('profiles') // ⚠️ nombre de mi tabla
        .select('*', { count: 'exact', head: true })
        .eq(campoAsistencia, true);

      if (errTotal || errPresentes) {
        console.error('Error al consultar asistencia:', errTotal || errPresentes);
      } else {
        const cantPresentes = totalPresentes || 0;
        const cantTotal = total || 0;

        setPresentes(cantPresentes);
        setAusentes(cantTotal - cantPresentes);
      }
      setLoading(false);
    }

    obtenerPresentesAusentes();
  }, [dia]);

  const datosActuales = [
    { id: 1, nombre: 'Presentes', total: presentes },
    { id: 2, nombre: 'Ausentes', total: ausentes },
  ];

  return (
    <div className={styles.CardCounter}>
      <div className={styles.gridSalas}>
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          datosActuales.map((item) => (
            <div key={item.id} className={styles.contSalas}>
              <h2>{item.nombre}</h2>
              <h3 className={item.nombre === 'Presentes' ? styles.textoverde : styles.textorojo}>
                {item.total}
              </h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}