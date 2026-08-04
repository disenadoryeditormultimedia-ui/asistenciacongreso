'use client';
import styles from './Button.module.css';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'filled' | 'tonal';
}

export default function Button({ onClick, children, variant = 'filled' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`${styles.btn} ${styles[variant]}`}>
      {children}
    </button>
  );
}