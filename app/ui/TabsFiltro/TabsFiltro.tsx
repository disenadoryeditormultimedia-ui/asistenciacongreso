'use client';
import styles from './TabsFiltro.module.css';

interface TabOption { id: string; label: string; }
interface TabsFiltroProps {
  selectedId: string;
  onChange: (id: string) => void;
  options: TabOption[];
}

export default function TabsFiltro({ selectedId, onChange, options }: TabsFiltroProps) {
  return (
    <div className={styles.container}>
      {options.map((opt) => (
        <button
          key={opt.id}
          className={`${styles.tab} ${selectedId === opt.id ? styles.active : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}