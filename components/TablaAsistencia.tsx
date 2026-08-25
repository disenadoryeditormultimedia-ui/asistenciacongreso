'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './TablaAsistencia.module.css';
import Switch from '@mui/material/Switch';
import { supabase } from '@/app/lib/supabaseClient';

import SwitchDias from '@/app/ui/SwitchDias/SwitchDias';
import SearchInput from '@/app/ui/SearchInput/SearchInput';
import Select from '@/app/ui/Select/Select';
import TabsFiltro from '@/app/ui/TabsFiltro/TabsFiltro';
import Paginacion from '@/app/ui/Paginacion/Paginacion';
import Modal from '@/app/ui/Modal/Modal';

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
  asistencia_sala_dia_1: boolean;
  hora_salida_sala_dia_1: string | null;
  asistencia_sala_dia_2: boolean;
  hora_salida_sala_dia_2: string | null;
  estatus_asistencia_dia_1?: string | null;
  estatus_asistencia_dia_2?: string | null;
}

export default function TablaAsistencia() {
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);
  const [salaFiltro, setSalaFiltro] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const elementosPorPagina = 5;

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [cambioPendiente, setCambioPendiente] = useState<{ id: string; campo: string; nuevoValor: string | null } | null>(null);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- CONTROLES DE BLOQUEO Y MODAL DE CONTRASEÑA ---
  const CLAVE_MAESTRA = 'Programacion_1995';
  
  const [dia1Desbloqueado, setDia1Desbloqueado] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('desbloqueado_dia_1') === 'true';
    }
    return false;
  });

  const [dia2Desbloqueado, setDia2Desbloqueado] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('desbloqueado_dia_2') === 'true';
    }
    return false;
  });

  const [modalClaveAbierto, setModalClaveAbierto] = useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('desbloqueado_dia_1', String(dia1Desbloqueado));
  }, [dia1Desbloqueado]);

  useEffect(() => {
    localStorage.setItem('desbloqueado_dia_2', String(dia2Desbloqueado));
  }, [dia2Desbloqueado]);

  const esEdicionPermitida = useCallback(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const FECHA_DIA_1 = '2026-10-20';
    const FECHA_DIA_2 = '2026-10-21';

    if (diaSeleccionado === 1) {
      return hoy === FECHA_DIA_1 || dia1Desbloqueado;
    } else {
      return hoy === FECHA_DIA_2 || dia2Desbloqueado;
    }
  }, [diaSeleccionado, dia1Desbloqueado, dia2Desbloqueado]);

  const abrirModalClave = () => {
    setInputPassword('');
    setModalClaveAbierto(true);
  };

  const confirmarClave = () => {
    if (inputPassword === CLAVE_MAESTRA) {
      const estaDesbloqueado = diaSeleccionado === 1 ? dia1Desbloqueado : dia2Desbloqueado;
      if (diaSeleccionado === 1) {
        setDia1Desbloqueado(!dia1Desbloqueado);
      } else {
        setDia2Desbloqueado(!dia2Desbloqueado);
      }
      alert(`El Día ${diaSeleccionado} ha sido ${estaDesbloqueado ? 'bloqueado' : 'desbloqueado'}.`);
      setModalClaveAbierto(false);
      setInputPassword('');
    } else {
      alert('Contraseña incorrecta.');
    }
  };

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

  const formatearHora = (fechaIso: string | null) => {
    if (!fechaIso) return '—'; 
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Calcula minutos entre la salida registrada y la hora actual o parámetro
  const calcularMinutosTranscurridos = (fechaIsoSalida: string) => {
    const inicio = new Date(fechaIsoSalida).getTime();
    const ahora = new Date().getTime();
    return Math.floor((ahora - inicio) / (1000 * 60));
  };

  const manejarCambioAsistencia = async (id: string, valorActual: boolean) => {
    if (!esEdicionPermitida()) {
      alert('La edición para este día está bloqueada por fecha.');
      return;
    }

    const campoAsistencia = diaSeleccionado === 1 ? 'asistencia_dia_1' : 'asistencia_dia_2';
    const nuevoEstado = !valorActual;

    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [campoAsistencia]: nuevoEstado } : u))
    );

    const { error } = await supabase
      .from('profiles')
      .update({ [campoAsistencia]: nuevoEstado })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando asistencia:', error.message);
      cargarUsuarios();
    }
  };

  const manejarCambioAsistenciaSala = async (id: string, valorActual: boolean) => {
    if (!esEdicionPermitida()) {
      alert('La edición para este día está bloqueada por fecha.');
      return;
    }

    const campoSala = diaSeleccionado === 1 ? 'asistencia_sala_dia_1' : 'asistencia_sala_dia_2';
    const nuevoEstado = !valorActual;

    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [campoSala]: nuevoEstado } : u))
    );

    const { error } = await supabase
      .from('profiles')
      .update({ [campoSala]: nuevoEstado })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando asistencia a salón:', error.message);
      cargarUsuarios();
    }
  };

  const presionarBotonSalida = (id: string, horaActual: string | null, esSalidaSalon: boolean = false) => {
    if (!esEdicionPermitida()) {
      alert('La edición para este día está bloqueada por fecha.');
      return;
    }

    const campo = esSalidaSalon 
      ? (diaSeleccionado === 1 ? 'hora_salida_sala_dia_1' : 'hora_salida_sala_dia_2')
      : (diaSeleccionado === 1 ? 'hora_salida_dia_1' : 'hora_salida_dia_2');

    if (horaActual) {
      // Si la hora ya existe, se abre el modal para quitarla libremente
      setCambioPendiente({ id, campo, nuevoValor: null });
      setModalAbierto(true);
    } else {
      // Registrar nueva hora de salida
      registrarHora(id, campo, new Date().toISOString());
    }
  };

  const confirmarEliminarHora = () => {
    if (cambioPendiente !== null) {
      registrarHora(cambioPendiente.id, cambioPendiente.campo, cambioPendiente.nuevoValor);
    }
    cerrarModal();
  };

  const registrarHora = async (id: string, campo: string, nuevoValor: string | null) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [campo]: nuevoValor } : u))
    );

    const { error } = await supabase
      .from('profiles')
      .update({ [campo]: nuevoValor })
      .eq('id', id);

    if (error) {
      console.error('Error al registrar hora de salida:', error.message);
      cargarUsuarios();
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCambioPendiente(null);
  };

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

  const indiceUltimoItem = paginaActual * elementosPorPagina;
  const indicePrimerItem = indiceUltimoItem - elementosPorPagina;
  const registrosVisuales = usuariosFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const resetearPaginacionYCambiarDia = (dia: number) => {
    setPaginaActual(1);
    setDiaSeleccionado(dia);
  };

  const edicionHabilitada = esEdicionPermitida();

  return (
    <div className={styles.mainCard}>
      
      {/* Indicador y Botón Dinámico */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: edicionHabilitada ? '#0CE816' : '#FF4D4D' }}>
          {edicionHabilitada ? '🟢 Registro habilitado' : '🔴 Día bloqueado para edición'}
        </span>
        
        <button 
          onClick={abrirModalClave}
          style={{ 
            padding: '6px 12px', 
            cursor: 'pointer', 
            borderRadius: '4px', 
            border: '1px solid #ccc', 
            backgroundColor: edicionHabilitada ? '#fff0f0' : '#f0fff0',
            color: edicionHabilitada ? '#d32f2f' : '#2e7d32',
            fontWeight: 'bold'
          }}
        >
          {edicionHabilitada ? '🔒 Bloquear día con clave' : '🔓 Desbloquear día con clave'}
        </button>
      </div>

      {/* Controles Superiores */}
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

      {/* Tabla de Asistencia */}
      <div className={styles.tableResponsiveWrapper} style={{ overflowX: 'auto', width: '100%' }}>
        <div style={{ minWidth: '1000px' }}>
          
          <div 
            className={styles.tableHeader} 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.2fr 1fr 1.2fr', 
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <div>Nombre</div>
            <div>Facultad</div>
            <div>Rol</div>
            <div>Salón</div>
            <div style={{ textAlign: 'center' }}>Asist. Evento</div>
            <div style={{ textAlign: 'center' }}>Salida Evento</div>
            <div style={{ textAlign: 'center' }}>Asist. Salón</div>
            <div style={{ textAlign: 'center' }}>Salida Salón</div>
          </div> 

          <div className={styles.tableBodyFixed}>
            {loading ? (
              <div className={styles.emptyState}>Cargando datos de asistentes...</div>
            ) : registrosVisuales.length > 0 ? (
              registrosVisuales.map((usuario) => {
                const asistencia = diaSeleccionado === 1 ? usuario.asistencia_dia_1 : usuario.asistencia_dia_2;
                const horaSalida = diaSeleccionado === 1 ? usuario.hora_salida_dia_1 : usuario.hora_salida_dia_2;

                const asistenciaSala = diaSeleccionado === 1 ? usuario.asistencia_sala_dia_1 : usuario.asistencia_sala_dia_2;
                const horaSalidaSala = diaSeleccionado === 1 ? usuario.hora_salida_sala_dia_1 : usuario.hora_salida_sala_dia_2;

                // Validación de salida incompleta (> 30 min) solo para Salón
                const minutosFueraSalon = horaSalidaSala ? calcularMinutosTranscurridos(horaSalidaSala) : 0;
                const esIncompletaSalon = horaSalidaSala !== null && minutosFueraSalon > 30;

                return (
                  <div 
                    key={usuario.id} 
                    className={styles.tableRow}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.2fr 1fr 1.2fr', 
                      gap: '10px',
                      alignItems: 'center'
                    }}
                  >
                    <div className={styles.boldText}>{usuario.nombre_completo}</div>
                    <div>{usuario.facultad || '—'}</div>
                    <div>{usuario.rol || '—'}</div>
                    <div>{usuario.sala || '—'}</div>
                    
                    {/* Asistencia Evento */}
                    <div className={styles.centerCell} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Switch
                        disabled={!edicionHabilitada}
                        checked={!!asistencia}
                        onChange={() => manejarCambioAsistencia(usuario.id, !!asistencia)}
                        sx={{
                          '& .MuiSwitch-switchBase.MuiChecked': { color: '#0CE816' },
                          '& .MuiSwitch-switchBase.MuiChecked + .MuiSwitch-track': { backgroundColor: '#0CE816' },
                        }}
                      />
                    </div>

                    {/* Salida Evento */}
                    <div className={styles.centerCell} style={{ display: 'flex', justifyContent: 'center' }}>
                      {!horaSalida ? (
                        <button 
                          disabled={!edicionHabilitada}
                          onClick={() => presionarBotonSalida(usuario.id, null, false)} 
                          className={styles.btnSalida}
                          style={{ opacity: edicionHabilitada ? 1 : 0.5, cursor: edicionHabilitada ? 'pointer' : 'not-allowed' }}
                        >
                          Salida Evento
                        </button>
                      ) : (
                        <div className={styles.timeTag}>
                          <span>{formatearHora(horaSalida)}</span>
                          <button 
                            disabled={!edicionHabilitada}
                            onClick={() => presionarBotonSalida(usuario.id, horaSalida, false)} 
                            className={styles.btnResetTime}
                            style={{ opacity: edicionHabilitada ? 1 : 0.5, cursor: edicionHabilitada ? 'pointer' : 'not-allowed' }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Asistencia Salón */}
                    <div className={styles.centerCell} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Switch
                        disabled={!edicionHabilitada || !asistencia}
                        checked={!!asistenciaSala}
                        onChange={() => manejarCambioAsistenciaSala(usuario.id, !!asistenciaSala)}
                        sx={{
                          '& .MuiSwitch-switchBase.MuiChecked': { color: '#0070F3' },
                          '& .MuiSwitch-switchBase.MuiChecked + .MuiSwitch-track': { backgroundColor: '#0070F3' },
                        }}
                      />
                    </div>

                    {/* Salida Salón (Con indicador de Incompleta si supera 30 min) */}
                    <div className={styles.centerCell} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {!horaSalidaSala ? (
                        <button 
                          disabled={!edicionHabilitada || !asistenciaSala}
                          onClick={() => presionarBotonSalida(usuario.id, null, true)} 
                          className={styles.btnSalida}
                          style={{ opacity: edicionHabilitada && asistenciaSala ? 1 : 0.5, cursor: edicionHabilitada && asistenciaSala ? 'pointer' : 'not-allowed' }}
                        >
                          Salida Salón
                        </button>
                      ) : (
                        <>
                          <div className={styles.timeTag} style={{ borderColor: esIncompletaSalon ? '#d32f2f' : undefined }}>
                            <span>{formatearHora(horaSalidaSala)}</span>
                            <button 
                              disabled={!edicionHabilitada}
                              onClick={() => presionarBotonSalida(usuario.id, horaSalidaSala, true)} 
                              className={styles.btnResetTime}
                              style={{ opacity: edicionHabilitada ? 1 : 0.5, cursor: edicionHabilitada ? 'pointer' : 'not-allowed' }}
                            >
                              ✕
                            </button>
                          </div>
                          {esIncompletaSalon && (
                            <span style={{ fontSize: '0.65rem', color: '#d32f2f', fontWeight: 'bold', marginTop: '2px' }}>
                              ⚠️ Incompleta (+30 min)
                            </span>
                          )}
                        </>
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
      </div>

      <Paginacion 
        paginaActual={paginaActual}
        totalElementos={usuariosFiltrados.length}
        elementosPorPagina={elementosPorPagina}
        onCambiarPagina={setPaginaActual}
      />

      {/* Modal Confirmación de Borrado de Hora */}
      <Modal 
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onConfirm={confirmarEliminarHora}
        title="¿Eliminar registro de salida?"
        description="Esta acción eliminará el registro de hora capturado."
      />

      {/* Modal de Clave Maestra */}
      {modalClaveAbierto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#111' }}>
              {edicionHabilitada ? `Bloquear Día ${diaSeleccionado}` : `Desbloquear Día ${diaSeleccionado}`}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '16px' }}>
              Ingresa la contraseña maestra para cambiar el estado de edición:
            </p>
            
            <input 
              type="password" 
              placeholder="Contraseña"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmarClave();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '20px'
              }}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setModalClaveAbierto(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarClave}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#0070F3',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}