import BarraNavegacion from '../../components/Nav'; 

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mainLayout">
      <BarraNavegacion />
      <main className="contentArea">
        {children}
      </main>
    </div>
  );
}