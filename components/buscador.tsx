import styles from './BarraBusqueda.module.css';
import { Search } from 'lucide-react';

export default function Buscador() {
  return (
    <div className={styles.ContGENbuscador}>
      <div className={styles.ContBuscador}>
         <input type="text" placeholder="Ingresa el nombre" />
         <button> <Search size={20} /></button>
      </div>

      <div className={styles.ContFiltro}>
        <button>Todos</button>
         <button>Presentes</button>
          <button>Ausentes</button>
      </div>
        
    </div>
  );
}