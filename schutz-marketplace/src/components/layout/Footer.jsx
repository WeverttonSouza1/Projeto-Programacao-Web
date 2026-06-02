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
                <a href="#">D</a>
                <a href="#">Y</a>
                <a href="#">F</a>
                <a href="#">I</a>
              </div>
            </div>

            <div className="footer-column">
              <h3>ACESSO RÁPIDO</h3>

              <div className="footer-links">
                <a href="#">Anunciar</a>
                <a href="#">Blog</a>
                <a href="#">Perguntas frequentes</a>
                <a href="#">Categorias</a>
                <a href="#">Central de ajuda</a>
              </div>
            </div>

            <div className="footer-column">
              <h3>COMO FUNCIONA</h3>

              <div className="footer-links">
                <a href="#">Como funciona</a>
                <a href="#">Vantagens</a>
                <a href="#">Tarifas e prazos</a>
                <a href="#">Formas de pagamento</a>
                <a href="#">Verificador de contas</a>
              </div>
            </div>

            <div className="footer-column">
              <h3>INSTITUCIONAL</h3>

              <div className="footer-links">
                <a href="#">Termos de uso</a>
                <a href="#">Programa de recompensa</a>
                <a href="#">Política de privacidade</a>
                <a href="#">Política de reembolso</a>
                <a href="#">Trabalhe conosco</a>
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
