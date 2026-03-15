# Regras de Negócio e Inteligência - Móveis Morante Hub

Este documento contém a lógica de montagem de pedidos, precificação e endereçamento para referência por IAs e desenvolvedores.

## 📦 1. Estrutura de Pedidos e Produtos
- **Preços de Venda**: 
  - Linha **Jully**: Geralmente precificada com foco em giro rápido (ex: R$ 999 em kits).
  - Linha **California**: Produtos premium (ex: R$ 2.199).
  - **Kits e Combos**: Quando um item composto é vendido, o sistema deve subtrair o estoque dos itens individuais (componentes).
- **Frete**: Calculado com base na diferença entre o Subtotal dos Itens e o Valor Final acordado com o cliente.
  - *Exemplo*: Itens (3806) + Frete (145) = R$ 3.951.

## 📍 2. Lógica de Endereçamento e Logística
- **Parsing de Endereço**: O sistema utiliza a função `parseAddressString` para extrair rua, número, bairro e cidade de strings únicas.
- **Padrão de Coordenadas (HeatMap)**:
  - Bairros de Colombo: Guaraituba, Maracanã, Alto Maracanã, Fátima, etc.
  - Bairros de Balsa Nova: Centro, Moradias Iguaço (Coordenadas: -49.6300, -25.5800).
  - A análise regional agrupa pedidos por Bairro (Normalizado em caixa alta).

## 🛡️ 3. Regras de Estoque
- **Baixa Automática**: Ocorre de acordo com a configuração em `settingsService.ts`. Geralmente ativada para status 'Agendado' (scheduled) ou 'Atendido' (delivered).
- **Estorno**: Cancelamento de pedidos deve reverter a movimentação de estoque caso o pedido já tenha sido processado.

## 📱 4. Comunicação CRM
- **Protocolo WhatsApp**: Sempre incluir o nome do cliente, referência do pedido e link para o Google Maps se for entrega.
- **Identificação de Intenção**: A IA deve cruzar a fala do cliente ("meu guarda-roupa") com a tabela de compras históricas para assistência rápida.
