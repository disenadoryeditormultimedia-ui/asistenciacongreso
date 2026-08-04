'use client';
import { useState } from 'react';
import styles from './Input.module.css';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

export default function Input({ label, type = 'text', value, onChange, required = false }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`${styles.container} ${focused || value ? styles.active : ''}`}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={styles.input}
      />
    </div>
  );
}