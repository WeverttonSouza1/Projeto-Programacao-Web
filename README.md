# Schutz Marketplace

Marketplace acadêmico para anúncios, compra e gerenciamento de produtos digitais, scripts e itens de jogos.

## Sobre o Projeto

O **Schutz Marketplace** foi desenvolvido para a disciplina de Programação para Web. A proposta é criar uma plataforma inspirada em marketplaces como GGMAX e Mercado Livre, com foco em produtos digitais relacionados a jogos.

O sistema permite que visitantes naveguem pelos anúncios, usuários autenticados comprem produtos, vendedores gerenciem seus anúncios e compradores conversem com vendedores após a compra.

## Tecnologias Utilizadas

- **Next.js** com App Router
- **React**
- **JavaScript e JSX**
- **CSS puro**
- **PostgreSQL**
- **pg** para conexão com o banco
- **bcryptjs** para criptografia de senhas
- **JWT em cookie httpOnly** para sessão autenticada
- **Route Handlers do Next.js** para criação das APIs em `src/app/api`

## Funcionalidades Implementadas

- Cadastro de usuários.
- Login com senha criptografada.
- Sessão autenticada com JWT.
- Proteção de páginas privadas no servidor.
- Perfil público de usuário e vendedor.
- Listagem de anúncios na home, catálogo, busca e categorias.
- Página de detalhes do anúncio.
- Perguntas em anúncios.
- Respostas do vendedor ou administrador.
- Carrinho integrado ao PostgreSQL.
- Checkout com criação de pedido.
- Atualização de estoque ao finalizar compra.
- Página de pedidos do usuário.
- Detalhes do pedido.
- Chat pós-compra entre comprador e vendedor.
- Página de dashboard do usuário.
- Página de gerenciamento de anúncios do vendedor.
- Layout responsivo para desktop e celular.
- Tema claro e escuro.

## Páginas Principais

- `/` - página inicial.
- `/busca` - resultado da pesquisa de anúncios.
- `/categorias` - listagem de categorias.
- `/categorias/jogos/[slug]` - anúncios de uma categoria/jogo.
- `/anuncio/[id]` - detalhes do anúncio.
- `/perfil/[id]` - perfil público do usuário/vendedor.
- `/carrinho` - carrinho do usuário autenticado.
- `/checkout` - finalização da compra.
- `/pedidos` - compras e vendas do usuário.
- `/pedidos/[id]` - detalhes do pedido e chat pós-compra.
- `/dashboard` - resumo do usuário autenticado.
- `/meus-anuncios` - anúncios do vendedor autenticado.

## Endpoints da API

### Autenticação

- `POST /api/auth/register` - cadastra um novo usuário.
- `POST /api/auth/login` - autentica o usuário e cria a sessão.
- `GET /api/auth/me` - retorna os dados públicos do usuário autenticado.
- `POST /api/auth/logout` - encerra a sessão.

### Usuários

- `GET /api/users/[id]` - retorna dados públicos do perfil.

### Perguntas

- `POST /api/questions` - cria uma pergunta em um anúncio ativo.
- `PUT /api/questions` - registra a resposta do vendedor ou administrador.

### Carrinho

- `GET /api/cart` - lista os itens do carrinho.
- `POST /api/cart` - adiciona um item ao carrinho.
- `PUT /api/cart` - atualiza a quantidade de um item.
- `DELETE /api/cart` - remove um item do carrinho.

### Pedidos

- `POST /api/orders` - finaliza a compra e cria o pedido.
- `GET /api/orders/[id]/chat` - lista mensagens do chat do pedido.
- `POST /api/orders/[id]/chat` - envia mensagem no chat do pedido.

## Banco de Dados

O projeto utiliza PostgreSQL. O script de criação das tabelas está em:

```text
Docs/database/schema.sql
```

Principais tabelas utilizadas:

- `users`
- `categories`
- `products`
- `product_variants`
- `product_images`
- `product_questions`
- `cart_items`
- `orders`
- `order_items`
- `order_chats`
- `reviews`
- `reports`
- `withdrawals`

## Segurança

O projeto possui algumas medidas básicas de segurança aplicadas no back-end:

- Senhas armazenadas com hash usando `bcryptjs`.
- Sessão com JWT assinado.
- JWT salvo em cookie `httpOnly`, evitando acesso direto pelo JavaScript do navegador.
- Consultas SQL parametrizadas com `$1`, `$2`, etc.
- Validação de usuário logado antes de acessar carrinho, checkout, pedidos, dashboard e meus anúncios.
- Controle de permissão no chat do pedido, permitindo acesso apenas ao comprador, vendedor ou administrador.
- As APIs não retornam `password_hash` nem dados sensíveis do usuário.

## Como Executar o Projeto

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as informações do PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=schutz_marketplace
JWT_SECRET=sua_chave_secreta
```

### 3. Criar o banco de dados

Crie um banco no PostgreSQL com o mesmo nome informado em `DB_NAME` e execute o script:

```text
Docs/database/schema.sql
```

### 4. Rodar o projeto em modo desenvolvimento

```bash
npm run dev
```

Depois acesse:

```text
http://localhost:3000
```

## Scripts Disponíveis

- `npm run dev` - inicia o servidor de desenvolvimento.
- `npm run build` - gera a versão de produção.
- `npm run start` - inicia a versão de produção após o build.
- `npm run lint` - executa a verificação de lint.

## Deploy

O projeto ainda não possui deploy público nesta entrega. A execução e apresentação serão realizadas em ambiente local.

## Modelagem do Sistema

### Diagrama de Casos de Uso

![Diagrama de Casos de Uso](https://github.com/WeverttonSouza1/Projeto-Programacao-Web/blob/52fc00e4596236ac76d9a7d2ac05a6af3b2e47e8/Imagens/Diagrama-de-Caso-de-Uso.png)

### Diagrama de Classes
![image alt](https://github.com/WeverttonSouza1/Projeto-Programacao-Web/blob/1c7ff29f2a8232ae98459b53647fcf856ee7bb5e/Docs/Diagrama-de-Caso-de-Uso/Diagrama-de-Classes.png)

### Protótipo de Interfaces em Baixa Fidelidade

https://www.figma.com/design/HzTkVAauzDbXRDVsE5MqeP/Projeto-de-Desenvolvimento-Web?node-id=0-1&t=0w3fwY9MkLDV6PKE-1

## Status da Entrega

O projeto atende aos principais requisitos da Entrega 03, com integração entre front-end, APIs REST em Next.js e banco de dados PostgreSQL. As funcionalidades principais de autenticação, perfil, perguntas, carrinho, checkout, pedidos e chat pós-compra estão implementadas de forma funcional para apresentação.
