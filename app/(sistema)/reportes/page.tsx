import TablaReportes from '../../../components/TablaReportes'; // <-- Tres veces ../


export default function Page() {
 return (
  
        <div className="contDinamico">      
            <div className="ContGenTabla">
          
              <h1>Reportes del Evento</h1>
               <TablaReportes />
             
            </div>  
        </div>

    
  );
}
