'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './TablaReportes.module.css';
import { supabase } from '@/app/lib/supabaseClient';

// Importación de Átomos de Interfaz de Usuario (UI)
import SwitchDias from '@/app/ui/SwitchDias/SwitchDias';
import TabsFiltro from '@/app/ui/TabsFiltro/TabsFiltro';
import Paginacion from '@/app/ui/Paginacion/Paginacion';
import Button from '@/app/ui/Button/Button';

// Interfaz alineada al esquema de Supabase ('profiles')
interface Profile {
  id: string;
  nombre_completo: string;
  facultad: string;
  rol: string;
  sala: string | null;
  asistencia_dia_1: boolean;
  hora_salida_dia_1: string | null;
  asistencia_dia_2: boolean;
  hora_salida_dia_2: string | null;
}

export default function TablaReportes() {
  // --- ESTADOS DE CONTROL ---
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);
  const [rolFiltro, setRolFiltro] = useState<string>('todos');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const elementosPorPagina = 5;

  // Carga de datos de Supabase
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error al cargar reportes de Supabase:', error.message);
    } else if (data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Formatear horas ISO
  const formatearHora = (fechaIso: string | null) => {
    if (!fechaIso) return 'Sin Registro'; 
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // --- FILTRADO DE ASISTENTES POR DÍA Y POR ROL ---
  // Obtener solo las personas que asistieron en el día seleccionado
  const usuariosPorDia = profiles.filter((u) => {
    return diaSeleccionado === 1 ? u.asistencia_dia_1 : u.asistencia_dia_2;
  });

  // Filtrar adicionalmente por Rol
  const usuariosFiltrados = usuariosPorDia.filter((u) => {
    if (rolFiltro === 'todos') return true;
    return u.rol?.toLowerCase() === rolFiltro.toLowerCase();
  });

  // --- PAGINACIÓN ---
  const indiceUltimoItem = paginaActual * elementosPorPagina;
  const indicePrimerItem = indiceUltimoItem - elementosPorPagina;
  const registrosVisuales = usuariosFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const resetearControlesAlCambiarDia = (dia: number) => {
    setPaginaActual(1);
    setDiaSeleccionado(dia);
  };

  const resetearControlesAlCambiarFiltro = (filtroId: string) => {
    setPaginaActual(1);
    setRolFiltro(filtroId);
  };

  // --- LÓGICA DE EXPORTACIÓN A CSV ---
  const exportarAExcel = (tituloArchivo: string, datos: Profile[]) => {
    if (datos.length === 0) {
      alert("No hay datos de asistencia para exportar con los filtros seleccionados");
      return;
    }

    const encabezados = ["Nombre Completo", "Facultad", "Sala", "Rol", "Hora de Salida"];
    const filas = datos.map((u: Profile) => {
      const horaSalida = diaSeleccionado === 1 ? u.hora_salida_dia_1 : u.hora_salida_dia_2;
      return `"${u.nombre_completo || ''}";"${u.facultad || ''}";"${u.sala || ''}";"${u.rol || ''}";"${formatearHora(horaSalida)}"`;
    });

    const contenidoCsv = ["sep=;", encabezados.join(";"), ...filas].join("\n");
    const encoder = new TextEncoder();
    const arrayBytes = encoder.encode(contenidoCsv);
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), arrayBytes], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${tituloArchivo}_Dia_${diaSeleccionado}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.mainCard}>
      
      {/* Barra de Herramientas Superior */}
      <div className={styles.actionsBar}>
        <div className={styles.leftControls}>
          <SwitchDias 
            diaSeleccionado={diaSeleccionado} 
            onCambiarDia={resetearControlesAlCambiarDia} 
            etiquetaDia1="20 de Octubre"
            etiquetaDia2="21 de Octubre"
          />

          <TabsFiltro 
            selectedId={rolFiltro}
            onChange={resetearControlesAlCambiarFiltro}
            options={[
              { id: 'todos', label: 'Todos' },
              { id: 'alumno', label: 'Alumnos' },
              { id: 'docente', label: 'Docentes' },
              { id: 'admin', label: 'Administrativos' },
              { id: 'exalumno', label: 'Exalumnos' }
            ]}
          />
        </div>

        {/* Acciones de Exportación */}
        <div className={styles.exportGroup}>
          <Button onClick={() => exportarAExcel(`Reporte_${rolFiltro}`, usuariosFiltrados)} variant="tonal">
            📥 Exportar Vista
          </Button>
          <Button onClick={() => exportarAExcel('Reporte_General', usuariosPorDia)} variant="filled">
            📊 Exportar Todo el Día
          </Button>
        </div>
      </div>

      {/* Contenedor de Tabla */}
      <div className={styles.tableResponsiveWrapper}>
        <div className={styles.tableSubtitleRow}>
          <h3>Asistentes registrados: <span>{rolFiltro === 'todos' ? 'Todos los Roles' : rolFiltro}</span></h3>
        </div>

        <div className={styles.tableHeader}>
          <div>Nombre Completo</div>
          <div>Facultad</div>
          <div>Salón / Sala</div>
          <div>Rol</div>
          <div>Hora Salida</div>
        </div> 

        <div className={styles.tableBodyFixed}>
          {loading ? (
            <div className={styles.emptyState}>Cargando reportes desde la base de datos...</div>
          ) : registrosVisuales.length > 0 ? (
            registrosVisuales.map((u) => {
              const horaSalida = diaSeleccionado === 1 ? u.hora_salida_dia_1 : u.hora_salida_dia_2;
              return (
                <div key={u.id} className={styles.tableRow}>
                  <div className={styles.boldText}>{u.nombre_completo}</div>
                  <div>{u.facultad || '—'}</div>
                  <div>{u.sala || '—'}</div>
                  <div className={styles.roleBadge}>{u.rol || '—'}</div>
                  <div>{formatearHora(horaSalida)}</div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              No se encontraron asistentes con el filtro seleccionado para este día.
            </div>
          )}
        </div>
      </div>

      {/* Control de Páginas */}
      <Paginacion 
        paginaActual={paginaActual}
        totalElementos={usuariosFiltrados.length}
        elementosPorPagina={elementosPorPagina}
        onCambiarPagina={setPaginaActual}
      />

    </div>
  );
}