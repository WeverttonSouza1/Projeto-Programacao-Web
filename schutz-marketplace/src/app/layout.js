import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Schutz - Marketplace de Ativos",
  description: "Segurança total em transações de ativos e script em games.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <nav>
          <Link href="/" target="_self" rel="prev">Home</Link>
          <Link href="/carrinho" target="_self" >Carrinho</Link>
          <Link href="/dashboard" target="_self" rel="next">Meus Anúncios</Link>
          <Link href="/login" target="_self" rel="next">Entrar</Link>
        </nav>

        {children}

      </body>
    </html>
  );
}