'use client';
import { AlertTriangle } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export default function Modal({ isOpen, onClose, onConfirm, title, description }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.iconContainer}>
          <AlertTriangle size={28} color="#ba1a1a" />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.btnCancel}>Cancelar</button>
          <button onClick={onConfirm} className={styles.btnConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}