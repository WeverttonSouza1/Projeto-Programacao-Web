import Link from "next/link";

export default function Footer() {
  return (
    <footer>

      <div className="footer-container">

        <div className="footer-column">
          <h3>SOBRE</h3>

          <div className="schutz-nav-left">
            {/* Falta o simbolodo */}
            <div className="schutz-nav-left">
              <Link href="/" className="schutz-logo">
                <span className='text-logo'>SCHUTZ</span>
              </Link>
            </div>
          </div>

          <p>
            A Schutz é uma plataforma de marketplace digital que conecta compradores e vendedores de ativos e serviços relacionados a jogos. Nossa missão é proporcionar um ambiente seguro, confiável e eficiente para transações de produtos digitais / serviços desejados, garantindo a satisfação de nossos usuários.
          </p>

          <div className="socials">
            <Link href="/">D</Link>
            <Link href="/">Y</Link>
            <Link href="/">F</Link>
            <Link href="/">I</Link>
          </div>
        </div>

        <div className="footer-column">
          <h3>ACESSO RÁPIDO</h3>

          <div className="footer-links">
            <Link href="/dashboard">Anunciar</Link>
            <Link href="#">Blog</Link>
            <Link href="/categorias">Categorias</Link>
            <Link href="/carrinho">Carrinho</Link>
            <Link href="/pedidos">Pedidos</Link>
          </div>
        </div>

        <div className="footer-column">
          <h3>COMO FUNCIONA</h3>

          <div className="footer-links">
            <Link href="#">Como funciona</Link>
            <Link href="#">Perguntas frequentes</Link>
            <Link href="#">Vantagens</Link>
            <Link href="#">Tarifas e prazos</Link>
            <Link href="#">Formas de pagamento</Link>
            <Link href="#">Verificador de contas</Link>
          </div>
        </div>

        <div className="footer-column">
          <h3>INSTITUCIONAL</h3>

          <div className="footer-links">
            <Link href="#">Termos de uso</Link>
            <Link href="#">Programa de recompensa</Link>
            <Link href="#">Política de privacidade</Link>
            <Link href="#">Política de reembolso</Link>
            <Link href="#">Trabalhe conosco</Link>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>Copyright © SCHUTZ MARKET 2026</p>
        <p>CNPJ: 00.000.000/0000-00</p>
      </div>

    </footer>
  );
}
