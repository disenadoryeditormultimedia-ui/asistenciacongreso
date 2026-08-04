'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import styles from './TotalGlobal.module.css';

interface TotalGlobalProps {
  dia: number;
}

export default function ResumenTotal({ dia }: TotalGlobalProps) {
  const [totalInvitados, setTotalInvitados] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerTotal() {
      setLoading(true);
      const { count, error } = await supabase
        .from('profiles') // ⚠️ nombre de mi tabla
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error al obtener total de invitados:', error.message);
      } else {
        setTotalInvitados(count || 0);
      }
      setLoading(false);
    }

    obtenerTotal();
  }, [dia]);

  return (
    <div className={styles.CardCounter}>
      <h2>Cantidad total de invitados:</h2>
         
      <div className={styles.gridSalas}>
        <div className={styles.contSalas}>
          <h3>{loading ? '...' : totalInvitados}</h3>
        </div>
      </div>
    </div>
  );
}