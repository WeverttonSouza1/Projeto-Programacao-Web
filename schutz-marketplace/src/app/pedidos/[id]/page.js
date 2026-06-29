import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "../../../lib/db";
import { getSessionUser } from "../../../lib/session";
import OrderChat from "../../../components/orders/OrderChat";

// Busca o pedido e seus itens somente quando o usuário tem permissão de acesso.
async function getOrderData(orderId, user) {
    const orderResult = await pool.query(
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
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        WHERE o.id = $1
          AND (
              o.buyer_id = $2
              OR p.seller_id = $2
              OR $3 = 'ADMIN'
          )
        LIMIT 1
        `,
        // A permissão faz parte da consulta: comprador, vendedor ou ADMIN podem acessar.
        [orderId, user.id, user.role]
    );

    if (orderResult.rows.length === 0) {
        return null;
    }

    const itemsResult = await pool.query(
        `
        SELECT
            oi.id,
            oi.unit_price,
            oi.quantity,
            pv.name AS variant_name,
            p.title AS product_title,
            seller.name AS seller_name
        FROM order_items oi
        INNER JOIN product_variants pv ON oi.variant_id = pv.id
        INNER JOIN products p ON pv.product_id = p.id
        INNER JOIN users seller ON p.seller_id = seller.id
        WHERE oi.order_id = $1
        ORDER BY p.title ASC
        `,
        [orderId]
    );

    return {
        order: orderResult.rows[0],
        items: itemsResult.rows,
    };
}

function formatPrice(value) {
    return Number(value || 0).toFixed(2).replace(".", ",");
}

// Protege a página e mostra o pedido apenas para um participante autorizado.
export default async function PedidoPage({ params }) {
    const user = await getSessionUser();

    if (!user) {
        redirect("/");
    }

    const { id } = await params;
    const data = await getOrderData(id, user);

    if (!data) {
        return (
            <main className="dashboard-page">
                <div className="container">
                    <h1>Pedido não encontrado</h1>
                    <section className="dashboard-card">
                        <p>Esse pedido não existe ou você não tem permissão para acessá-lo.</p>
                        <Link href="/pedidos" className="btn">
                            Voltar para pedidos
                        </Link>
                    </section>
                </div>
            </main>
        );
    }

    const { order, items } = data;

    return (
        <main className="dashboard-page">
            <div className="container">
                <h1>Pedido</h1>

                <div className="dashboard-actions">
                    <Link href="/pedidos" className="btn">
                        Voltar para pedidos
                    </Link>
                    <Link href="/dashboard" className="btn btn-buy-custom">
                        Dashboard
                    </Link>
                </div>

                <div className="order-page-layout">
                    <div className="left-order">
                        <div className="order-detail-layout">
                            <section className="dashboard-card">
                                <h2>Resumo do pedido</h2>
                                <p>Pedido: {order.id}</p>
                                <p>Comprador: {order.buyer_name}</p>
                                <p>Total: R$ {formatPrice(order.total_amount)}</p>
                                <p>Pagamento: {order.payment_status}</p>
                                <p>Status: {order.order_status}</p>
                                <p>Criado em: {new Date(order.created_at).toLocaleString("pt-BR")}</p>
                            </section>
                        </div>

                        <section className="dashboard-card">
                            <h2>Itens do pedido</h2>

                            <div className="order-items">
                                {items.map((item) => (
                                    <div className="order-item-row" key={item.id}>
                                        <h3>{item.product_title}</h3>
                                        <p>{item.variant_name}</p>
                                        <p>Vendedor: {item.seller_name}</p>
                                        <p>
                                            {item.quantity}x R$ {formatPrice(item.unit_price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="order-chat-sidebar">
                        <OrderChat orderId={order.id} />
                    </aside>
                </div>
            </div>
        </main>
    );
}
