'use client';

import { useState } from 'react';
import styles from './TablaUsuarios.module.css';
import Switch from '@mui/material/Switch';
import { Search, AlertTriangle } from 'lucide-react'; 
import SwitchDias from '@/app/ui/SwitchDias/SwitchDias'; // Componente atómico importado 🚀

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  sala: string;
  asistencia: boolean;
  facultad: string;
  rol: string;      
  salida: string | null; 
}

export default function Tabla() {
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);
  const [salaFiltro, setSalaFiltro] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioPorModificar, setUsuarioPorModificar] = useState<number | null>(null);

  const [usuariosDia1, setUsuariosDia1] = useState<Usuario[]>([
    { id: 1, nombre: 'Juan Daniel Pérez Suárez', correo: 'juandaniel.perez@gmail.com', sala: 'Salon Vendome', asistencia: true, facultad: 'administrativo', rol:'Administrativo', salida: null },
    { id: 2, nombre: 'Ana María Gómez', correo: 'ana.gomez@gmail.com', sala: 'Salon Vendome', asistencia: false, facultad: 'administrativo', rol:'Administrativo', salida: null },
    { id: 3, nombre: 'Carlos López Estrada', correo: 'carlos.lopez@gmail.com', sala: 'Salon Concorde', asistencia: true, facultad: 'FCH', rol:'Alumno', salida: null },
    { id: 4, nombre: 'Sofía Ruíz Martínez', correo: 'sofia.ruiz@gmail.com', sala: 'Salon Concorde', asistencia: false, facultad: 'FCH', rol:'Alumno', salida: null },
    { id: 5, nombre: 'Luis Fernando Pat', correo: 'luis.pat@gmail.com', sala: 'Salon Concorde', asistencia: true, facultad: 'docente', rol:'Docente', salida: null },
    { id: 6, nombre: 'Hector Fernando Guzmán', correo: 'luis.pat@gmail.com', sala: 'Salon Concorde', asistencia: true, facultad: 'docente', rol:'Docente', salida: null },
    { id: 7, nombre: 'Daniel Fernando Guerrero', correo: 'luis.pat@gmail.com', sala: 'Salon Louvre', asistencia: true, facultad: 'FCYT', rol:'Alumno', salida: null },
    { id: 8, nombre: 'Erick Fernando Martinez', correo: 'luis.pat@gmail.com', sala: 'Salon Louvre', asistencia: true, facultad: 'FCYT', rol:'Alumno', salida: null },
    { id: 9, nombre: 'Luis Hernández Loy', correo: 'luis.pat@gmail.com', sala: 'Salon Louvre', asistencia: true, facultad: 'FCYT', rol:'Alumno', salida: null },
  ]);

  const [usuariosDia2, setUsuariosDia2] = useState<Usuario[]>([
    { id: 6, nombre: 'Pedro Alcántara Sol', correo: 'pedro.sol@gmail.com', sala: 'Salon Louvre', asistencia: true, facultad: 'FCYT', rol:'Administrativo', salida: null },
    { id: 7, nombre: 'Diana Laura Méndez', correo: 'diana.mendez@gmail.com', sala: 'Salon Vendome', asistencia: false, facultad: 'FCEAN', rol:'Administrativo', salida: null },
  ]);

  const usuariosPorDia = diaSeleccionado === 1 ? usuariosDia1 : usuariosDia2;

  const formatearHora = (fechaIso: string | null) => {
    if (!fechaIso) return '—'; 
    const fecha = new Date(fechaIso);
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  };

  const manejarCambioAsistencia = (id: number) => {
    const actualizarLista = (lista: Usuario[]) => 
      lista.map(u => u.id === id ? { ...u, asistencia: !u.asistencia } : u);

    if (diaSeleccionado === 1) setUsuariosDia1(actualizarLista(usuariosDia1));
    else setUsuariosDia2(actualizarLista(usuariosDia2));
  };

  const presionarBotonSalida = (id: number, horaActual: string | null) => {
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

  const registrarHora = (id: number, nuevoValor: string | null) => {
    const actualizarLista = (lista: Usuario[]) => 
      lista.map(u => u.id === id ? { ...u, salida: nuevoValor } : u);

    if (diaSeleccionado === 1) setUsuariosDia1(actualizarLista(usuariosDia1));
    else setUsuariosDia2(actualizarLista(usuariosDia2));
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioPorModificar(null);
  };

  const usuariosFiltrados = usuariosPorDia.filter((usuario) => {
    const pasaSala = salaFiltro === 'todas' || usuario.facultad === salaFiltro;
    const pasaStatus = statusFiltro === 'todos' || (statusFiltro === 'presente' && usuario.asistencia === true) || (statusFiltro === 'pendiente' && usuario.asistencia === false);
    const textoBusqueda = busqueda.toLowerCase();
    return pasaSala && pasaStatus && (usuario.nombre.toLowerCase().includes(textoBusqueda) || usuario.correo.toLowerCase().includes(textoBusqueda));
  });

  return (
    <div className={styles.conTabla}>
      
      {/* Barra de Controles */}
      <div className={styles.barraHerramientas}>
        
        {/* ¡NUEVO COMPONENTE INTEGRADO AQUÍ! */}
        <SwitchDias 
          diaSeleccionado={diaSeleccionado} 
          onCambiarDia={setDiaSeleccionado} 
          etiquetaDia1="20 de Octubre"
          etiquetaDia2="21 de Octubre"
        />

        <div className={styles.contenedorFiltros}>
          <div className={styles.buscadorGrupo}>
            <input type="text" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={styles.inputBuscar} />
            <Search size={30} className={styles.iconoBuscar} />
          </div>
          
          <div className={styles.contSelectYestado}>
            <select value={salaFiltro} onChange={(e) => setSalaFiltro(e.target.value)} className={styles.selectFiltro}>
              <option value="todas">Todas las Facultades</option>
              <option value="FCEAN">Facultad de Ciencias Económico Administrativas y Negocios</option>
              <option value="FCH">Facultad de Ciencias Humanas</option>
              <option value="FCYT">Facultad de Ciencia y Tecnología</option>
              <option value="docente">Docente</option>
              <option value="administrativo">Administrativo</option>
            </select>

            <div className={styles.switchEstado}>
              <button className={`${styles.btnEstado} ${statusFiltro === 'todos' ? styles.activoEstado : ''}`} onClick={() => setStatusFiltro('todos')}>Todos</button>
              <button className={`${styles.btnEstado} ${statusFiltro === 'presente' ? styles.activoEstado : ''}`} onClick={() => setStatusFiltro('presente')}>Presentes</button>
              <button className={`${styles.btnEstado} ${statusFiltro === 'pendiente' ? styles.activoEstado : ''}`} onClick={() => setStatusFiltro('pendiente')}>Ausentes</button>
            </div>
          </div>
        </div>
      </div>

      {/* Encabezado */}
      <div className={styles.HeaderTabla}>
        <div><p>Nombre</p></div>
        <div><p>Facultad</p></div>
        <div><p>Rol</p></div>
        <div><p>Salón</p></div>
        <div><p>Asistencia</p></div>
        <div><p>Salida</p></div>
      </div> 

      {/* Listado Filtrado */}
      {usuariosFiltrados.length > 0 ? (
        usuariosFiltrados.map((usuario: Usuario) => (
          <div key={usuario.id} className={styles.usuario}>
            <div className={styles.nombre}><p>{usuario.nombre}</p></div>
            <div className={styles.facultad}><p>{usuario.facultad}</p></div>
            <div className={styles.sala}><p>{usuario.rol}</p></div>
            <div className={styles.sala}><p>{usuario.sala}</p></div>
            
            {/* ASISTENCIA: Switch estilizado con tu color personalizado 0CE816 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Switch
                checked={usuario.asistencia}
                onChange={() => manejarCambioAsistencia(usuario.id)}
                sx={{
                  '& .MuiSwitch-switchBase.MuiChecked': {
                    color: '#0CE816',
                  },
                  '& .MuiSwitch-switchBase.MuiChecked + .MuiSwitch-track': {
                    backgroundColor: '#0CE816',
                  },
                }}
              />
            </div>

            {/* SALIDA */}
            <div className={styles.sala} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {!usuario.salida ? (
                <button 
                  onClick={() => presionarBotonSalida(usuario.id, null)}
                  className={styles.btnSalida}
                >
                  <p>Registrar Salida</p>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '13px' }}>{formatearHora(usuario.salida)}</span>
                  <button 
                    onClick={() => presionarBotonSalida(usuario.id, usuario.salida)}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.sinResultados}><p>No se encontraron usuarios.</p></div>
      )}

      {/* Modal de Confirmación Estilizado */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px',
            maxWidth: '440px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center', position: 'relative', border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '50%', display: 'inline-block' }}>
                <AlertTriangle size={36} color="#dc2626" />
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>⚠️ ¿Estás seguro?</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', marginBottom: '24px' }}>
              Estás a punto de eliminar permanentemente la hora de salida registrada para este usuario. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={cerrarModal} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#4D73F8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>✕ Cancelar</button>
              <button onClick={confirmarEliminarHora} style={{ flex: 1, padding: '10px 16px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Sí, Eliminar Hora</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}