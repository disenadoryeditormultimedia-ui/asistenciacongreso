'use client';

import styles from './SwitchDias.module.css';

// Definimos lo que el componente necesita recibir desde fuera para funcionar
interface SwitchDiasProps {
  diaSeleccionado: number;
  onCambiarDia: (dia: number) => void;
  // Opcional por si quieres personalizar las etiquetas de los días más adelante
  etiquetaDia1?: string; 
  etiquetaDia2?: string;
}

export default function SwitchDias({
  diaSeleccionado,
  onCambiarDia,
  etiquetaDia1 = "20 de Octubre",
  etiquetaDia2 = "21 de Octubre"
}: SwitchDiasProps) {
  
  return (
    <div className={styles.switchContenedor}>
      <button 
        className={`${styles.btnSwitch} ${diaSeleccionado === 1 ? styles.activo : ''}`} 
        onClick={() => onCambiarDia(1)}
      >
        {etiquetaDia1}
      </button>
      <button 
        className={`${styles.btnSwitch} ${diaSeleccionado === 2 ? styles.activo : ''}`} 
        onClick={() => onCambiarDia(2)}
      >
        {etiquetaDia2}
      </button>
    </div>
  );
}