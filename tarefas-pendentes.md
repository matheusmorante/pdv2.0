# Tarefas Pendentes - Projeto PDV/ERP

## 🐛 Bugs e Correções Críticas
- [ ] **Erro de Sincronização de Pedidos**: Corrigir `TypeError` ao acessar `date` no `useDashboardData.ts`.
- [x] **Persistência de Datas**: Garantir que todas as datas no sistema usem o formato ISOinternamente e PT-BR apenas para exibição. (Concluído).
- [x] **Unificação de Modais**: Integrar OrderDetails e OrderEdit. (Concluído).

## 🗺️ HeatMap Regional
- [x] **Reimplementação**: HeatMap funcionando com MapLibre. (Concluído).
- [x] **Métricas**: Suporta filtros por Valor, Lucro e Contagem. (Concluído).
- [ ] **Geolocalização**: Adicionar coordenadas para bairros novos reportados nas vendas.

## 📦 Logística e Estoque
- [x] **Scanner QR/Barcode**:
    - [x] Implementado no Inventário (com foco automático).
    - [x] Implementado no Lançamento Manual.
    - [x] Implementado no Recebimento de Compras (Conferência).
- [x] **Etiquetas de Envio**: Implementada página de impressão de etiquetas Morante Label.
- [x] **Filtros de Data**: Refinados filtros de "Este Mês" (competência) vs "Últimos 30 dias" (rolling).
- [ ] **Status de Pedido**: Sincronizar status 'Atendido' com o fluxo de estoque.

## 🛠️ Infraestrutura DEV/PROD
- [ ] **Variáveis de Ambiente**: Revisar rotas de API e Supabase para garantir funcionamento perfeito em ambos os ambientes conforme a nova regra.
