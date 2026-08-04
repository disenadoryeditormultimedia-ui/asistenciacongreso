import styles from './registro.module.css'; // O importa tu archivo CSS global si ya lo tienes
import FormularioRegistro from '@/components/FormularioRegistro/FormularioRegistro';

export const metadata = {
  title: 'Registro de Asistentes - Sistema de Asistencia',
};

export default function RegistroPage() {
  return (
    <main className={styles.contDinamico}>
      <header className={styles.headerSeccion}>
        <h1>Módulo de Registro</h1>
        <p className={styles.subtitulo}>
          Registra nuevos asistentes al evento o institución de forma rápida.
        </p>
      </header>

      <section className={styles.contenedorFormulario}>
        <FormularioRegistro />
      </section>
    </main>
  );
}