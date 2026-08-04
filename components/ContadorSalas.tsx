'use client';

import { useEffect, useState } from 'react';
import { ContactRound } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';
import styles from './ContadorSalas.module.css';

interface SalaData {
  nombre: string;
  total: number;
}

interface ResumenSalasProps {
  dia: number;
}

export default function ResumenSalas({ dia }: ResumenSalasProps) {
  const [salas, setSalas] = useState<SalaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerConteoSalas() {
      setLoading(true);
      const campoAsistencia = dia === 1 ? 'asistencia_dia_1' : 'asistencia_dia_2';

      // Consultamos los registros donde la asistencia del día sea true
      const { data, error } = await supabase
        .from('profiles') // ⚠️ nombre de mi tabla
        .select('sala')
        .eq(campoAsistencia, true);

      if (error) {
        console.error('Error al obtener datos por sala:', error.message);
        setLoading(false);
        return;
      }

      // Agrupamos y contamos por sala dinámicamente
      const conteoMap: Record<string, number> = {};
      data?.forEach((row) => {
        const nombreSala = row.sala || 'Sin Sala';
        conteoMap[nombreSala] = (conteoMap[nombreSala] || 0) + 1;
      });

      const resultado: SalaData[] = Object.entries(conteoMap).map(([nombre, total]) => ({
        nombre,
        total,
      }));

      setSalas(resultado);
      setLoading(false);
    }

    obtenerConteoSalas();
  }, [dia]);

  return (
    <div className={styles.CardCounter}>
      <ContactRound color='#4D73F8' size={100} className={styles.icono}/>
      <h2>Asistentes por salón</h2>
         
      <div className={styles.gridSalas}>
        {loading ? (
          <p>Cargando datos...</p>
        ) : salas.length === 0 ? (
          <p>No hay asistentes registrados para este día.</p>
        ) : (
          salas.map((sala, index) => (
            <div key={index} className={styles.contSalas}>
              <span>{sala.nombre}</span>
              <h3>{sala.total}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}