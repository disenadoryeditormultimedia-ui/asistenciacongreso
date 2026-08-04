// app/layout.tsx
import "./globals.css"; // Esto carga los estilos de Tailwind en toda tu app

export const metadata = {
  title: "Mi Sistema",
  description: "Panel de control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}