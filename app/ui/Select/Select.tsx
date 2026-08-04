'use client';
import styles from './Select.module.css';

interface Option { value: string; label: string; }
interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
}

export default function Select({ value, onChange, options }: SelectProps) {
  return (
    <div className={styles.selectWrapper}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}