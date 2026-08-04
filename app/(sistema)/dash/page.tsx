// app/(sistema)/dash/page.tsx
'use client'; 

import { useState } from 'react';
import styles from './dash.module.css'; // 👈 1. IMPORTAMOS LOS ESTILOS
import Contador from '@/components/ContadorSalas';
import ContadorTotal from '@/components/TotalGlobal';
import ContadorPresentesAusentes from '@/components/CardPresentesAusentes';
import SwitchDias from '@/app/ui/SwitchDias/SwitchDias';

export default function Page() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(1);

  return (
    // 👈 2. USAMOS styles.contDash EN LUGAR DE 'contDash'
    <div className={styles.contDash}>
      
      {/* Cabecera limpia sin estilos inline */}
      <div className={styles.headerDashboard}>
        <h1 className={styles.TituloResumen}>Tu resumen en tiempo real</h1>
        
        <SwitchDias 
          diaSeleccionado={diaSeleccionado} 
          onCambiarDia={setDiaSeleccionado} 
          etiquetaDia1="20 de Octubre"
          etiquetaDia2="21 de Octubre"
        />
      </div>
      
      {/* Tarjetas de totales separadas dinámicamente */}
      <div className={styles.ContenedorGenTotalYPresen}>
        <ContadorTotal dia={diaSeleccionado} />
        <ContadorPresentesAusentes dia={diaSeleccionado} />
      </div>
      
      {/* Contador por salas específicas */}
      <Contador dia={diaSeleccionado} />

    </div>
  );
}