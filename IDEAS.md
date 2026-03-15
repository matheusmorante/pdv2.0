# Pendências e Ideias de Implementação

## ✅ Concluído
- [x] **Correção do Bug de Tela Branca**: Robustez adicionada ao `PersonFormModal.tsx` e `formatters.ts` para lidar com dados nulos/corrompidos (especialmente nomes como "Estevam" que podiam estar travando).
- [x] **Refinamento de Etiquetas**:
    - [x] Opção de imprimir com ou sem Preço.
    - [x] Opção de imprimir com ou sem QR Code.
    - [x] Preset "Móveis e Colchões" removido conforme solicitado (usar Móveis em Geral).
    - [x] Configurações persistentes no LocalStorage.
- [x] **Escaner Global de Estoque**:
    - [x] Botão "Escanear Produto" na página principal de estoque agora localiza o produto e abre o modal de lançamento automaticamente.
- [x] **Balanço e Inventário**:
    - [x] Scanner integrado na folha de auditoria para foco rápido no item.
    - [x] Scanner integrado no lançamento manual de estoque.
- [x] **Conferência de Compras**:
    - [x] Modal de conferência de recebimento no pedido de compra com suporte a scanner para bipa e incrementar quantidade.

## 🔜 Próximas Implementações (Ideias)
- [ ] **Etiqueta de Prateleira (Gôndola)**: Novo preset de etiqueta maior (ex: 100x30mm) com descrição grande e preço focado para prateleiras.
- [ ] **Modo "Check-out" de Entrega**: Scanner para conferir todos os itens de um pedido antes de carregar o caminhão.
- [ ] **Consulta de Preço Rápida**: Tela simplificada para o cliente (ou vendedor) bipar um produto e ver o preço e variações disponíveis.
- [ ] **Localização Bin-to-Bin**: Scanner para registrar em qual corredor/prateleira um produto foi guardado.

## 🐛 Bugs Conhecidos / Observações
- A página de clientes agora está protegida contra dados mal-formatados ou nulos vindo do banco.
