'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  institucion?: string;
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

  // --- ESTADOS DEL ESCÁNER ---
  const [modoEscaner, setModoEscaner] = useState<'general' | 'salon'>('general');
  const [salaEscaner, setSalaEscaner] = useState<string>('Lemont');
  const [codigoLeido, setCodigoLeido] = useState<string>('');
  const [procesandoLectura, setProcesandoLectura] = useState<boolean>(false);
  const [mensajeEscaner, setMensajeEscaner] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  const inputEscanerRef = useRef<HTMLInputElement>(null);

  // --- CONTROLES DE BLOQUEO Y MODAL DE CONTRASEÑA ---
  const CLAVE_MAESTRA = process.env.NEXT_PUBLIC_CONGRESO_CLAVE_MAESTRA || 'congresoadmin2026';
  
  const [dia1Desbloqueado, setDia1Desbloqueado] = useState<boolean>(false);
  const [dia2Desbloqueado, setDia2Desbloqueado] = useState<boolean>(false);
  const [modalClaveAbierto, setModalClaveAbierto] = useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');

  // Obtener la sala respetando la columna 'sala' de Supabase
  const obtenerSalonUsuario = (usuario: Usuario): string => {
    if (usuario.sala && usuario.sala.trim() !== '') {
      return usuario.sala.trim();
    }
    return 'Sin Asignar';
  };

  useEffect(() => {
    setDia1Desbloqueado(localStorage.getItem('desbloqueado_dia_1') === 'true');
    setDia2Desbloqueado(localStorage.getItem('desbloqueado_dia_2') === 'true');
  }, []);

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
        setDia1Desbloqueado((prev) => !prev);
      } else {
        setDia2Desbloqueado((prev) => !prev);
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

  // --- LÓGICA DE FOCO INTELIGENTE ---
  useEffect(() => {
    const mantenerFoco = (e?: MouseEvent) => {
      if (modalAbierto || modalClaveAbierto || procesandoLectura) return;

      const target = e?.target as HTMLElement;
      if (
        target?.tagName === 'SELECT' || 
        target?.tagName === 'INPUT' || 
        target?.tagName === 'BUTTON' ||
        target?.closest('select') ||
        target?.closest('.MuiSwitch-root')
      ) {
        return;
      }
      inputEscanerRef.current?.focus();
    };

    mantenerFoco();
    window.addEventListener('click', mantenerFoco);
    return () => window.removeEventListener('click', mantenerFoco);
  }, [modalAbierto, modalClaveAbierto, procesandoLectura]);

  // --- PROCESADOR DE LECTURA DE CÓDIGO QR (PROGRESIVO) ---
  const procesarEscaneoQR = async (cadenaQR: string) => {
    if (!cadenaQR.trim() || procesandoLectura) return;

    setProcesandoLectura(true);
    setCodigoLeido('');

    if (!esEdicionPermitida()) {
      setMensajeEscaner({ texto: '🔴 Edición bloqueada para este día.', tipo: 'error' });
      setProcesandoLectura(false);
      return;
    }

    try {
      let entrada = cadenaQR.trim();

      try {
        const datosQR = JSON.parse(entrada);
        entrada = (datosQR.id || datosQR.userId || datosQR.uuid || entrada).toString();
      } catch {
        // No es JSON
      }

      let userId = entrada
        .replace(/^['"]|['"]$/g, '')
        .replace(/'/g, '-')
        .trim();

      if (!userId || userId === 'undefined') {
        throw new Error('CÓDIGO QR NO VÁLIDO O UUID VACÍO');
      }

      const { data: usuario, error: errFetch } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (errFetch) {
        throw new Error(`Error en base de datos: ${errFetch.message}`);
      }

      if (!usuario) {
        throw new Error(`Asistente no encontrado (ID: ${userId})`);
      }

      const campoGeneral = diaSeleccionado === 1 ? 'asistencia_dia_1' : 'asistencia_dia_2';
      const campoSalon = diaSeleccionado === 1 ? 'asistencia_sala_dia_1' : 'asistencia_sala_dia_2';
      const salaAsignada = obtenerSalonUsuario(usuario as Usuario);

      // Buscamos el estado actual del usuario en la memoria local
      const usuarioEnEstado = usuarios.find((u) => u.id === userId) || (usuario as Usuario);
      const yaTieneGeneral = Boolean(usuarioEnEstado[campoGeneral as keyof Usuario]);
      const yaTieneSalon = Boolean(usuarioEnEstado[campoSalon as keyof Usuario]);

      // --- EVALUACIÓN PROGRESIVA ---
      if (!yaTieneGeneral) {
        // --- 1ER ESCANEO: Marca Asistencia General ---
        
        setUsuarios((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, [campoGeneral]: true } : u))
        );

        const { error } = await supabase
          .from('profiles')
          .update({ [campoGeneral]: true })
          .eq('id', userId);

        if (error) throw error;

        setMensajeEscaner({
          texto: `✅ 1er Check (General): ${usuario.nombre_completo} (Salón: ${salaAsignada})`,
          tipo: 'exito'
        });

      } else if (!yaTieneSalon) {
        // --- 2DO ESCANEO: Marca Asistencia a Salón ---

        setUsuarios((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, [campoSalon]: true } : u))
        );

        const { error } = await supabase
          .from('profiles')
          .update({ [campoSalon]: true })
          .eq('id', userId);

        if (error) throw error;

        setMensajeEscaner({
          texto: `✅ 2do Check (Salón): ${usuario.nombre_completo}`,
          tipo: 'exito'
        });

      } else {
        // --- ESCANEOS POSTERIORES: Ya completó ambos ---
        setMensajeEscaner({
          texto: `ℹ️ ${usuario.nombre_completo} ya tiene marcadas ambas asistencias.`,
          tipo: 'exito'
        });
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Código QR no reconocido';
      setMensajeEscaner({
        texto: `❌ Error de lectura: ${msg}`,
        tipo: 'error'
      });
      await cargarUsuarios();
    } finally {
      setProcesandoLectura(false);
      setTimeout(() => {
        inputEscanerRef.current?.focus();
      }, 100);
    }
  };

  const formatearHora = (fechaIso: string | null) => {
    if (!fechaIso) return '—'; 
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calcularMinutosTranscurridos = (fechaIsoSalida: string) => {
    const inicio = new Date(fechaIsoSalida).getTime();
    const ahora = Date.now();
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
      setCambioPendiente({ id, campo, nuevoValor: null });
      setModalAbierto(true);
    } else {
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
    const salaCalculada = obtenerSalonUsuario(usuario);
    const pasaFacultad = salaFiltro === 'todas' || usuario.facultad === salaFiltro;
    const pasaSalonEscaner = modoEscaner === 'salon' ? salaCalculada.toLowerCase() === salaEscaner.toLowerCase() : true;

    const pasaStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'presente' && Boolean(asistencia)) ||
      (statusFiltro === 'pendiente' && !asistencia);

    const textoBusqueda = busqueda.toLowerCase().trim();
    if (!textoBusqueda) {
      return pasaFacultad && pasaSalonEscaner && pasaStatus;
    }

    const nombreMatch = usuario.nombre_completo?.toLowerCase().includes(textoBusqueda) ?? false;
    const facultadMatch = usuario.facultad?.toLowerCase().includes(textoBusqueda) ?? false;
    const rolMatch = usuario.rol?.toLowerCase().includes(textoBusqueda) ?? false;

    return pasaFacultad && pasaSalonEscaner && pasaStatus && (nombreMatch || facultadMatch || rolMatch);
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
      
      {/* Indicador de Edición y Bloqueo */}
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

      {/* --- PANEL DEL ESCÁNER DE CÓDIGOS QR --- */}
      <div style={{ background: '#111827', color: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.8rem', display: 'block', color: '#9CA3AF' }}>Modo Escáner:</label>
            <select 
              value={modoEscaner} 
              onChange={(e) => {
                setModoEscaner(e.target.value as 'general' | 'salon');
                setPaginaActual(1);
              }}
              style={{ padding: '8px', borderRadius: '4px', background: '#1F2937', color: '#fff', border: '1px solid #374151', cursor: 'pointer' }}
            >
              <option value="general">1. Entrada General</option>
              <option value="salon">2. Entrada a Salón</option>
            </select>
          </div>

          {modoEscaner === 'salon' && (
            <div>
              <label style={{ fontSize: '0.8rem', display: 'block', color: '#9CA3AF' }}>Salón que estás controlando:</label>
              <select 
                value={salaEscaner} 
                onChange={(e) => {
                  setSalaEscaner(e.target.value);
                  setPaginaActual(1);
                }}
                style={{ padding: '8px', borderRadius: '4px', background: '#1F2937', color: '#fff', border: '1px solid #374151', cursor: 'pointer' }}
              >
                <option value="Lemont">Lemont</option>
                <option value="Concorde">Concorde</option>
                <option value="Vendome">Vendome</option>
                <option value="Louvre">Louvre</option>
              </select>
            </div>
          )}

          <input
            ref={inputEscanerRef}
            type="text"
            disabled={procesandoLectura}
            value={codigoLeido}
            onChange={(e) => setCodigoLeido(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                procesarEscaneoQR(codigoLeido);
              }
            }}
            style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          />

          <div style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 'bold' }}>
            Puedes usar la tabla manual en cualquier momento
          </div>
        </div>

        {mensajeEscaner && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '6px',
            fontWeight: 'bold',
            backgroundColor: mensajeEscaner.tipo === 'exito' ? '#065F46' : '#991B1B',
            color: '#ffffff'
          }}>
            {mensajeEscaner.texto}
          </div>
        )}
      </div>

      {/* Controles Superiores / Filtros */}
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

      {/* Tabla de Asistencia Manual */}
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

                const minutosFueraSalon = horaSalidaSala ? calcularMinutosTranscurridos(horaSalidaSala) : 0;
                const esIncompletaSalon = horaSalidaSala !== null && minutosFueraSalon > 30;

                const salonMostrado = obtenerSalonUsuario(usuario);

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
                    <div>{salonMostrado}</div>
                    
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
                        disabled={!edicionHabilitada}
                        checked={!!asistenciaSala}
                        onChange={() => manejarCambioAsistenciaSala(usuario.id, !!asistenciaSala)}
                        sx={{
                          '& .MuiSwitch-switchBase.MuiChecked': { color: '#0070F3' },
                          '& .MuiSwitch-switchBase.MuiChecked + .MuiSwitch-track': { backgroundColor: '#0070F3' },
                        }}
                      />
                    </div>

                    {/* Salida Salón */}
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

      <Modal 
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onConfirm={confirmarEliminarHora}
        title="¿Eliminar registro de salida?"
        description="Esta acción eliminará el registro de hora capturado."
      />

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