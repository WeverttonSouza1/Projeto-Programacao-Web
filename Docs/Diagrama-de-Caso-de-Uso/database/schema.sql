-- ==============================================================================
-- 1. EXTENSÕES E TIPOS (ENUMS)
-- ==============================================================================
-- Habilita a geração nativa de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums para controle rígido de status
CREATE TYPE user_role AS ENUM ('COMUM', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ATIVO', 'BANIDO', 'AGUARDANDO_EXCLUSAO');
CREATE TYPE product_status AS ENUM ('AGUARDANDO_VALIDACAO', 'ATIVO', 'PAUSADO', 'REMOVIDO');
CREATE TYPE payment_status AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'REEMBOLSADO');
CREATE TYPE order_status AS ENUM ('ABERTO', 'CONCLUIDO', 'EM_MEDIACAO', 'CANCELADO');
CREATE TYPE withdrawal_status AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO');
CREATE TYPE report_status AS ENUM ('PENDENTE', 'RESOLVIDO');

-- ==============================================================================
-- 2. GESTÃO DE CONTAS E USUÁRIOS
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'COMUM',
    status user_status DEFAULT 'ATIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_billing (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    pix_key VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. GESTÃO DE CATÁLOGO (PRODUTOS E CATEGORIAS)
-- ==============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status product_status DEFAULT 'AGUARDANDO_VALIDACAO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ex: "Chroma Set", "Faca Godly"
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

-- ==============================================================================
-- 4. COMUNICAÇÃO E AVALIAÇÕES
-- ==============================================================================
CREATE TABLE product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 5. FLUXO DE COMPRA (CARRINHO E PEDIDOS)
-- ==============================================================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status payment_status DEFAULT 'PENDENTE',
    order_status order_status DEFAULT 'ABERTO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE order_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. FINANCEIRO E ADMINISTRAÇÃO
-- ==============================================================================
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    requested_amount NUMERIC(10, 2) NOT NULL CHECK (requested_amount > 0),
    status withdrawal_status DEFAULT 'PENDENTE',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'PENDENTE',
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);