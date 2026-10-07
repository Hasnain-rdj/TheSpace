import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TheSpace — Deep Cosmos & Multiverse Interactive Visualization',
  description:
    'A high-fidelity spatial exploration engine inspired by NASA Eyes on the Solar System. Seamlessly zoom from macroscopic multiverse bubbles down to galaxies, solar systems, planetary surfaces, and microscopic Calabi-Yau quantum dimensions.',
  keywords: [
    'NASA Eyes',
    'Three.js',
    'React Three Fiber',
    'Space exploration',
    'Solar System',
    'Exoplanets',
    'Black Holes',
    'Gargantua',
    'Multiverse',
    'Quantum Foam',
  ],
  authors: [{ name: 'TheSpace WebGL Lab' }],
};

export const viewport: Viewport = {
  themeColor: '#030308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#030308]" suppressHydrationWarning>
      <body
        className="h-full w-full overflow-hidden bg-[#030308] antialiased select-none"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
