import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "../../lib/db";
import { getSessionUser } from "../../lib/session";

// Separa os pedidos comprados pelo usuário das vendas recebidas por ele.
async function getOrders(userId) {
    const purchasesResult = await pool.query(
        `
        SELECT id, total_amount, payment_status, order_status, created_at
        FROM orders
        WHERE buyer_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    const salesResult = await pool.query(
        `
        SELECT DISTINCT
            o.id,
            o.total_amount,
            o.payment_status,
            o.order_status,
            o.created_at,
            buyer.name AS buyer_name
        FROM orders o
        INNER JOIN users buyer ON o.buyer_id = buyer.id
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN product_variants pv ON oi.variant_id = pv.id
        INNER JOIN products p ON pv.product_id = p.id
        WHERE p.seller_id = $1
        ORDER BY o.created_at DESC
        `,
        [userId]
    );

    return {
        purchases: purchasesResult.rows,
        sales: salesResult.rows,
    };
}

function formatPrice(value) {
    return Number(value || 0).toFixed(2).replace(".", ",");
}

// Renderiza a mesma estrutura visual para compras e vendas.
function OrderList({ title, orders, emptyText }) {
    return (
        <section className="dashboard-card">
            <h2>{title}</h2>

            {orders.length === 0 ? (
                <p>{emptyText}</p>
            ) : (
                <div className="dashboard-list">
                    {orders.map((order) => (
                        <div className="dashboard-list-item" key={order.id}>
                            <div>
                                <span className="status-pill">{order.order_status}</span>
                            </div>
                            <div>
                                <h3>Pedido {order.id}</h3>
                                <p>R$ {formatPrice(order.total_amount)} - {order.payment_status}</p>
                                {order.buyer_name && <p>Comprador: {order.buyer_name}</p>}
                            </div>
                            <Link href={`/pedidos/${order.id}`} className="btn">
                                Abrir chat
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// Valida a sessão no servidor antes de carregar compras e vendas particulares.
export default async function PedidosPage() {
    const user = await getSessionUser();

    if (!user) {
        redirect("/");
    }

    const { purchases, sales } = await getOrders(user.id);

    return (
        <main className="dashboard-page">
            <div className="container">
                <h1>Pedidos</h1>

                <div className="dashboard-actions">
                    <Link href="/dashboard" className="btn">
                        Dashboard
                    </Link>
                    <Link href="/carrinho" className="btn btn-buy-custom">
                        Carrinho
                    </Link>
                </div>

                <div className="dashboard-list">
                    <OrderList
                        title="Minhas compras"
                        orders={purchases}
                        emptyText="Você ainda não realizou compras."
                    />
                    <OrderList
                        title="Minhas vendas"
                        orders={sales}
                        emptyText="Você ainda não recebeu vendas."
                    />
                </div>
            </div>
        </main>
    );
}
