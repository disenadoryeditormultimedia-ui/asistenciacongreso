'use client';

import TablaAsistencia from '@/components/TablaAsistencia';

export default function AsistenciaPage() {
  return (
    <div style={{ width: '100%', padding: '4px' }}>
      <h1 style={{ textAlign: 'left', fontSize: '28px', fontWeight: '400', margin: '0 0 24px 0', color: '#1c1b1f' }}>
        Control de Asistencia
      </h1>
      
      {/* Componente de la tabla segmentada y limpia */}
      <TablaAsistencia />
    </div>
  );
}