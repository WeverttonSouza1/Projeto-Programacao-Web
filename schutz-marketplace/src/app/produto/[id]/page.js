import Link from 'next/link';

export default function Produto() {
    return (
        <main className="product-page">
            <div className="product-category">
                <span className="category-badge">Murder Mystery 2</span>
            </div>
            <div className="product-container">
                <section className="details-column">
                    <div className="card-announcement-header item-card-base">
                        <div className='card-image-product-header'>
                            <div className='main-image-card'>
                                <img src="/temporaria.webp" alt="Imagem do Produto" className="image-product-header" />
                            </div>
                            <div>
                                <p>colocar opções de imagem</p>
                            </div>
                        </div>
                        <div>
                            <div>
                                <h1 className="product-title">[PROMOÇÃO + BRINDE] Facas Godlys, Sets e Chromas - MM2</h1>
                            </div>
                            <div className="card-info-product">
                                <ul className="info-product">
                                    <li>
                                        <div className="stock-info">
                                            <span>DISPONÍVEIS</span>
                                            <h5>23</h5>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="sales-info">
                                            <hr className="vertical-divider" />
                                        </div>
                                    </li>
                                    <li>
                                        <div className="sales-info">
                                            <span>VENDIDOS</span>
                                            <h5>23</h5>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="seller-info">Vendido por: <strong>Renato</strong> | ★ 4.9 (120 avaliações)</p>
                            </div>
                        </div>
                    </div>

                    <div className="features-section">
                        <div className="features-card item-card-base">
                            <div className="features-header">
                                <h2 className="section-title">Características</h2>
                            </div>
                            <div>
                                <table className="features-table">
                                    <tbody>
                                        <tr>
                                            <td className='label-td'><strong>Categoria</strong></td>
                                            <td>Armas</td>
                                        </tr>
                                        <tr>
                                            <td className='label-td'><strong>Categoria</strong></td>
                                            <td>Armas</td>
                                        </tr>
                                        <tr>
                                            <td className='label-td'><strong>Categoria</strong></td>
                                            <td>Armas</td>
                                        </tr>
                                        <tr>
                                            <td className='label-td'><strong>Categoria</strong></td>
                                            <td>Armas</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="description-card item-card-base">
                        <h2 className="section-title">Descrição do Anúncio</h2>
                        <hr className="announcement-divider" />
                        <div className="description-text">
                            <p>⚡ <strong>ENTREGA AUTOMÁTICA OU IMEDIATA!</strong> ⚡</p>
                            <p>Escolha o seu item nas opções ao lado. Todos os itens são 100% legítimos e transferidos de forma segura dentro do jogo.</p>
                            <ul>
                                <li><strong>Chroma Set:</strong> Todas as armas chroma do jogo incluídas.</li>
                                <li><strong>Godly Avulsa:</strong> Facas selecionadas com os melhores preços do mercado.</li>
                                <li><strong>Brinde:</strong> Na compra de qualquer Set, ganhe uma faca lendária aleatória!</li>
                            </ul>
                            <p className="security-warning">🔒 <em>Transação intermediada com a segurança total do Schutz Market.</em></p>
                        </div>
                    </div>
                </section>

                {/* Right: Purchase box / Checkout */}
                <aside className="purchase-column">
                    <div className="fixed-checkout-card item-card-base">
                        <span className="stock-status">● Disponível</span>

                        <div className="price-container">
                            <span className="price-label">A partir de</span>
                            <h2 className="price-value">R$ 15,00</h2>
                        </div>

                        <form className="product-purchase-form">
                            <label htmlFor="item-select">Escolha o Item:</label>
                            <select id="item-select" className="market-input">
                                <option value="chroma-set">Chroma Set — R$ 150,00</option>
                                <option value="godly-faca">Faca Godly Aleatória — R$ 25,00</option>
                                <option value="fundo-perfil">Set Completo Antigo — R$ 85,00</option>
                            </select>

                            <label htmlFor="quantity">Quantidade:</label>
                            <input type="number" id="quantity" min="1" defaultValue="1" className="market-input qty-input" />

                            <Link href="/carrinho" className="btn btn-buy-custom">
                                🛒 Adicionar ao Carrinho
                            </Link>
                        </form>

                        <div className="purchase-guarantees">
                            <p>✓ Reembolso se não receber o item</p>
                            <p>✓ Suporte do vendedor via chat privado</p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}