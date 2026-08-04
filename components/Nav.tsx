'use client';

import { usePathname, useRouter } from 'next/navigation';

import styles from './Nav.module.css';

import Link from 'next/link';

import { LayoutDashboard, UserCheck, BarChart3, LogOut } from 'lucide-react';



export default function BarraNavegacion() {

const pathname = usePathname();

const router = useRouter();



const handleLogout = () => {

// 1. Limpieza de sesión (Opcional: borra tokens o datos si los usas)

localStorage.clear();

sessionStorage.clear();


console.log('Sesión cerrada correctamente');



// 2. Redireccionar reemplazando el historial del navegador para que no puedan volver atrás

router.replace('/');

};



return (

<div className={styles.ContNav}>


<div className={styles.ContTitNav}>

<div className={styles.icono}>

<UserCheck size={20} color="white" />

</div>

<h2>Admin 5to Congreso</h2>

<p>Portal de administrador</p>

</div>



<nav>

<Link href="/dash" className={`${styles.link} ${pathname === '/dash' ? styles.active : ''}`}>

<LayoutDashboard size={20} className={styles.icononav}/>

Dashboard

</Link>



<Link href="/asistencia" className={`${styles.link} ${pathname === '/asistencia' ? styles.active : ''}`}>

<UserCheck size={20} className={styles.icononav}/>

Asistencia

</Link>



<Link href="/reportes" className={`${styles.link} ${pathname === '/reportes' ? styles.active : ''}`}>

<BarChart3 size={20} className={styles.icononav}/>

Reportes

</Link>

</nav>



{/* Botón de Agregar Usuario */}

<Link href="/registro">

<button type="button" className={styles.BtnAgregar}>+ Agregar usuario</button>

</Link>



{/* Botón para Cerrar Sesión */}

<button

type="button"

onClick={handleLogout}

className={styles.BtnLogout}

>

<LogOut size={18} className={styles.iconoLogout} />

Cerrar sesión

</button>



</div>

);

} 

