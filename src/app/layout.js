import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "DebateFlow — Debates Moderados por IA",
  description:
    "Plataforma de debates estructurados con análisis de IA en tiempo real. Detecta falacias, ambigüedades y errores lógicos para que ambos participantes aprendan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
