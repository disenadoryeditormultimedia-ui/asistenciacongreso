'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './TablaAsistencia.module.css';
import Switch from '@mui/material/Switch';
import { supabase } from '@/app/lib/supabaseClient';

// Importación de Átomos Reutilizables de UI
import SwitchDias from '@/app/ui/SwitchDias/SwitchDias';
import SearchInput from '@/app/ui/SearchInput/SearchInput';
import Select from '@/app/ui/Select/Select';
import TabsFiltro from '@/app/ui/TabsFiltro/TabsFiltro';
import Paginacion from '@/app/ui/Paginacion/Paginacion';
import Modal from '@/app/ui/Modal/Modal';

// --- INTERFAZ CORREGIDA (id es UUID / string) ---
interface Usuario {
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

export default function TablaAsistencia() {
  // --- ESTADOS DE CONTROL ---
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);
  const [salaFiltro, setSalaFiltro] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const elementosPorPagina = 5;

  // Modal (string para id UUID)
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioPorModificar, setUsuarioPorModificar] = useState<string | null>(null);

  // --- DATOS DE SUPABASE ---
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Carga de datos desde Supabase
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error al cargar asistentes:', error.message);
    } else if (data) {
      setUsuarios(data as Usuario[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // --- LÓGICA DE NEGOCIO Y BASE DE DATOS ---
  const formatearHora = (fechaIso: string | null) => {
    if (!fechaIso) return '—'; 
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Cambiar estado del Switch (asistencia_dia_1 / asistencia_dia_2)
  const manejarCambioAsistencia = async (id: string, valorActual: boolean) => {
    const campoAsistencia = diaSeleccionado === 1 ? 'asistencia_dia_1' : 'asistencia_dia_2';
    const nuevoEstado = !valorActual;

    // Actualización optimista en el estado local
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [campoAsistencia]: nuevoEstado } : u))
    );

    const { error } = await supabase
      .from('profiles')
      .update({ [campoAsistencia]: nuevoEstado })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando asistencia:', error.message);
      cargarUsuarios(); // Revertir en caso de fallo
    }
  };

  // Registrar o eliminar hora de salida (hora_salida_dia_1 / hora_salida_dia_2)
  const presionarBotonSalida = (id: string, horaActual: string | null) => {
    if (horaActual) {
      setUsuarioPorModificar(id);
      setModalAbierto(true);
    } else {
      registrarHora(id, new Date().toISOString());
    }
  };

  const confirmarEliminarHora = () => {
    if (usuarioPorModificar !== null) {
      registrarHora(usuarioPorModificar, null);
    }
    cerrarModal();
  };

  const registrarHora = async (id: string, nuevoValor: string | null) => {
    const campoSalida = diaSeleccionado === 1 ? 'hora_salida_dia_1' : 'hora_salida_dia_2';

    // Actualización optimista en el estado local
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [campoSalida]: nuevoValor } : u))
    );

    const { error } = await supabase
      .from('profiles')
      .update({ [campoSalida]: nuevoValor })
      .eq('id', id);

    if (error) {
      console.error('Error al registrar hora de salida:', error.message);
      cargarUsuarios(); // Revertir en caso de fallo
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioPorModificar(null);
  };

  // --- FILTRADO DINÁMICO ROBUSTO ---
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const asistencia = diaSeleccionado === 1 ? usuario.asistencia_dia_1 : usuario.asistencia_dia_2;

    const pasaSala = salaFiltro === 'todas' || usuario.facultad === salaFiltro;
    const pasaStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'presente' && Boolean(asistencia)) ||
      (statusFiltro === 'pendiente' && !asistencia);

    const textoBusqueda = busqueda.toLowerCase().trim();
    if (!textoBusqueda) {
      return pasaSala && pasaStatus;
    }

    const nombreMatch = usuario.nombre_completo ? usuario.nombre_completo.toLowerCase().includes(textoBusqueda) : false;
    const facultadMatch = usuario.facultad ? usuario.facultad.toLowerCase().includes(textoBusqueda) : false;
    const rolMatch = usuario.rol ? usuario.rol.toLowerCase().includes(textoBusqueda) : false;

    return pasaSala && pasaStatus && (nombreMatch || facultadMatch || rolMatch);
  });

  // --- SEGMENTACIÓN Y PAGINACIÓN ---
  const indiceUltimoItem = paginaActual * elementosPorPagina;
  const indicePrimerItem = indiceUltimoItem - elementosPorPagina;
  const registrosVisuales = usuariosFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const resetearPaginacionYCambiarDia = (dia: number) => {
    setPaginaActual(1);
    setDiaSeleccionado(dia);
  };

  return (
    <div className={styles.mainCard}>
      
      {/* Barra de Controles Superior */}
      <div className={styles.actionsBar}>
        <SwitchDias 
          diaSeleccionado={diaSeleccionado} 
          onCambiarDia={resetearPaginacionYCambiarDia} 
          etiquetaDia1="20 de Octubre"
          etiquetaDia2="21 de Octubre"
        />

        <div className={styles.filtersGroup}>
          <SearchInput value={busqueda} onChange={(val) => { setBusqueda(val); setPaginaActual(1); }} placeholder="Buscar asistente..." />
          
          <Select 
            value={salaFiltro} 
            onChange={(val) => { setSalaFiltro(val); setPaginaActual(1); }} 
            options={[
              { value: 'todas', label: 'Todas las Facultades' },
              { value: 'FCEAN', label: 'Facultad de Ciencias Económico Administrativas y Negocios (FCEAN)' },
              { value: 'FCH', label: 'Facultad de Ciencias Humanas (FCH)' },
              { value: 'FCYT', label: 'Facultad de Ciencia y Tecnología (FCYT)' },
              { value: 'Universidad Simón Bolívar', label: 'Universidad Simón Bolívar' },
              { value: 'Externo', label: 'Externo' },
            ]}
          />

          <TabsFiltro 
            selectedId={statusFiltro}
            onChange={(val) => { setStatusFiltro(val); setPaginaActual(1); }}
            options={[
              { id: 'todos', label: 'Todos' },
              { id: 'presente', label: 'Presentes' },
              { id: 'pendiente', label: 'Ausentes' }
            ]}
          />
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className={styles.tableResponsiveWrapper}>
        <div className={styles.tableHeader}>
          <div>Nombre</div>
          <div>Facultad</div>
          <div>Rol</div>
          <div>Salón</div>
          <div>Asistencia</div>
          <div>Salida</div>
        </div> 

        <div className={styles.tableBodyFixed}>
          {loading ? (
            <div className={styles.emptyState}>Cargando datos de asistentes...</div>
          ) : registrosVisuales.length > 0 ? (
            registrosVisuales.map((usuario) => {
              const asistencia = diaSeleccionado === 1 ? usuario.asistencia_dia_1 : usuario.asistencia_dia_2;
              const horaSalida = diaSeleccionado === 1 ? usuario.hora_salida_dia_1 : usuario.hora_salida_dia_2;

              return (
                <div key={usuario.id} className={styles.tableRow}>
                  <div className={styles.boldText}>{usuario.nombre_completo}</div>
                  <div>{usuario.facultad || '—'}</div>
                  <div>{usuario.rol || '—'}</div>
                  <div>{usuario.sala || '—'}</div>
                  
                  <div className={styles.centerCell}>
                    <Switch
                      checked={!!asistencia}
                      onChange={() => manejarCambioAsistencia(usuario.id, !!asistencia)}
                      sx={{
                        '& .MuiSwitch-switchBase.MuiChecked': { color: '#0CE816' },
                        '& .MuiSwitch-switchBase.MuiChecked + .MuiSwitch-track': { backgroundColor: '#0CE816' },
                      }}
                    />
                  </div>

                  <div className={styles.centerCell}>
                    {!horaSalida ? (
                      <button onClick={() => presionarBotonSalida(usuario.id, null)} className={styles.btnSalida}>
                        Registrar Salida
                      </button>
                    ) : (
                      <div className={styles.timeTag}>
                        <span>{formatearHora(horaSalida)}</span>
                        <button onClick={() => presionarBotonSalida(usuario.id, horaSalida)} className={styles.btnResetTime}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>No se encontraron usuarios con los filtros seleccionados.</div>
          )}
        </div>
      </div>

      {/* Paginación */}
      <Paginacion 
        paginaActual={paginaActual}
        totalElementos={usuariosFiltrados.length}
        elementosPorPagina={elementosPorPagina}
        onCambiarPagina={setPaginaActual}
      />

      {/* Modal Reutilizable */}
      <Modal 
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onConfirm={confirmarEliminarHora}
        title="¿Eliminar registro de salida?"
        description="Esta acción borrará de forma permanente la hora capturada para este asistente. ¿Deseas continuar?"
      />

    </div>
  );
}