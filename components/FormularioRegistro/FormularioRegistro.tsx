'use client';

import { useState } from 'react';
import styles from './FormularioRegistro.module.css';
import { supabase } from '@/app/lib/supabaseClient';

// Importación de átomos de UI reutilizables
import Input from '@/app/ui/Input/Input';
import Select from '@/app/ui/Select/Select';
import Button from '@/app/ui/Button/Button';

export default function FormularioRegistro() {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('alumno');
  const [institucion, setInstitucion] = useState('Universidad Simón Bolívar');
  const [facultad, setFacultad] = useState('FCH');
  const [cargando, setCargando] = useState(false);

  // Ajusta automáticamente la facultad por defecto según el rol seleccionado
  const manejarCambioRol = (nuevoRol: string) => {
    setRol(nuevoRol);
    if (nuevoRol === 'alumno' || nuevoRol === 'exalumno') {
      setFacultad('FCH');
    } else {
      setFacultad('Universidad Simón Bolívar');
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreCompleto.trim()) {
      alert('Por favor, ingresa el nombre completo.');
      return;
    }

    if (cargando) return; // Evita envíos dobles

    setCargando(true);

    // Inserción directa en la tabla 'profiles' de Supabase
    const { error } = await supabase.from('profiles').insert([
      {
        id: crypto.randomUUID(), // Genera un UUID válido
        nombre_completo: nombreCompleto.trim(),
        correo: correo.trim() || null,
        rol,
        institucion,
        facultad,
        asistencia_dia_1: false,
        asistencia_dia_2: false,
      },
    ]);

    setCargando(false);

    if (error) {
      console.error('Error al registrar asistente:', error.message);
      alert(`Error al guardar el registro: ${error.message}`);
    } else {
      alert(`¡Asistente "${nombreCompleto}" registrado con éxito!`);
      // Limpieza del formulario
      setNombreCompleto('');
      setCorreo('');
      setRol('alumno');
      setInstitucion('Universidad Simón Bolívar');
      setFacultad('FCH');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Registro de Asistente</h2>
        <p>Completa la información para dar de alta en el sistema.</p>
      </div>

      <form onSubmit={manejarEnvio} className={styles.form}>
        
        {/* Campo Nombre Completo */}
        <Input 
          label="Nombre Completo" 
          value={nombreCompleto} 
          onChange={setNombreCompleto} 
          required 
        />

        {/* Campo Correo Electrónico */}
        <Input 
          label="Correo Electrónico" 
          type="email" 
          value={correo} 
          onChange={setCorreo} 
          required 
        />

        {/* Selector de Institución */}
        <div className={styles.selectorGroup}>
          <label className={styles.selectLabel}>Institución</label>
          <Select 
            value={institucion} 
            onChange={setInstitucion} 
            options={[
              { value: 'Universidad Simón Bolívar', label: 'Universidad Simón Bolívar' },
              { value: 'Externo', label: 'Externo' }
            ]}
          />
        </div>

        {/* Selector de Rol */}
        <div className={styles.selectorGroup}>
          <label className={styles.selectLabel}>Rol del Asistente</label>
          <Select 
            value={rol} 
            onChange={manejarCambioRol} 
            options={[
              { value: 'alumno', label: 'Alumno' },
              { value: 'exalumno', label: 'Exalumno / Egresado' },
              { value: 'docente', label: 'Docente' },
              { value: 'administrativo', label: 'Administrativo' },
              { value: 'asistente', label: 'Asistente General' },
              { value: 'ponente', label: 'Ponente' },
              { value: 'organizador', label: 'Organizador' },
              { value: 'externo', label: 'Externo' }
            ]}
          />
        </div>

        {/* Selector de Facultad */}
        <div className={styles.selectorGroup}>
          <label className={styles.selectLabel}>Facultad</label>
          <Select 
            value={facultad} 
            onChange={setFacultad} 
            options={
              rol === 'alumno' || rol === 'exalumno'
                ? [
                    { value: 'FCH', label: 'Facultad de Ciencias Humanas (FCH)' },
                    { value: 'FCEAN', label: 'Facultad de Ciencias Económico Administrativas y Negocios (FCEAN)' },
                    { value: 'FCYT', label: 'Facultad de Ciencia y Tecnología (FCYT)' },
                    { value: 'Universidad Simón Bolívar', label: 'Universidad Simón Bolívar' },
                    { value: 'Externo', label: 'Externo' },
                  ]
                : [
                    { value: 'Universidad Simón Bolívar', label: 'Universidad Simón Bolívar' },
                    { value: 'Externo', label: 'Externo' },
                  ]
            }
          />
        </div>
       
        {/* Botón de Enviar */}
        <div className={styles.actionRow}>
          <Button onClick={() => {}} variant="filled">
            {cargando ? 'Guardando...' : 'Guardar Registro'}
          </Button>
        </div>

      </form>
    </div>
  );
}