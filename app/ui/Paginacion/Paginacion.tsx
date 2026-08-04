'use client';
import styles from './Paginacion.module.css';

interface PaginacionProps {
  paginaActual: number;
  totalElementos: number;
  elementosPorPagina: number;
  onCambiarPagina: (pagina: number) => void;
}

export default function Paginacion({ paginaActual, totalElementos, elementosPorPagina, onCambiarPagina }: PaginacionProps) {
  const totalPaginas = Math.ceil(totalElementos / elementosPorPagina);

  if (totalPaginas <= 1) return null; // Ocultar si todo cabe en una página

  return (
    <div className={styles.paginationRow}>
      <span className={styles.info}>Total: {totalElementos} registros</span>
      <div className={styles.controls}>
        <button 
          disabled={paginaActual === 1} 
          onClick={() => onCambiarPagina(paginaActual - 1)}
          className={styles.pageBtn}
        >
          Anterior
        </button>
        <span className={styles.indicator}>Página {paginaActual} de {totalPaginas}</span>
        <button 
          disabled={paginaActual === totalPaginas} 
          onClick={() => onCambiarPagina(paginaActual + 1)}
          className={styles.pageBtn}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}