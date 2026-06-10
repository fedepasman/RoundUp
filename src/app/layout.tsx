import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: {
    default: "RoundUp",
    template: "%s · RoundUp",
  },
  description: "Seguimiento de alumnos en entrenamiento: asistencia, mediciones y evolución.",
  applicationName: "RoundUp Training Tracker",
};

export const viewport: Viewport = {
  themeColor: "#c4233b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
// deployment flag 1781060746
