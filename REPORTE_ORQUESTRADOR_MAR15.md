# 🎯 Reporte do Orquestrador: Morante-Hub (15 de Março de 2026)

## 📊 Análise de Lacunas (Gap Analysis)
O ecossistema Morante-Hub está em transição da **Fase 1 (Saneamento)** para a **Fase 2 (Escalabilidade Lucrativa)**. 

### Lacunas Identificadas:
1.  **Fuga de Margem (Resolvido em Código)**: O paradoxo de 2025 (faturamento alto / lucro estagnado) era agravado por sugestões de preços que não consideravam taxas de cartão e custos fixos da operação Colombo.
2.  **Controle Híbrido (Resolvido em Código)**: Não havia distinção entre o que está no Showroom (Colombo) e o que está no Depósito Central.
3.  **Carga Cognitiva**: Muitos processos manuais para cálculo de materiais (Puxadores) e títulos de marketplace.

---

## 🚀 Priorização MoSCoW (Fase 2 - Atual)

### 🔴 Must Have (Obrigatório)
*   **Gestão de Estoque Híbrida**: Showroom vs Depósito. (Implementado: `showroomStock` / `warehouseStock`)
*   **AI Profit Margin + Fee**: Inclusão de 4% de taxa de máquina nas sugestões da IA. (Implementado)
*   **Padronização ALL CAPS**: UX consistente para integração com marketplaces. (Implementado)
*   **Correção de Deploy Vercel**: Padronização do diretório de saída para `dist` no ERP. (Implementado)

### 🟡 Should Have (Desejável)
*   **Calculadora de Puxadores**: Embutida no formulário técnico. (Implementado)
*   **Análise de Desejos (CRM)**: Cruzamento de buscas não atendidas com estoque. (Bloqueado por infraestrutura de DB)

### 🟢 Could Have (Poderia ter)
*   **Templates de WhatsApp**: Automação de pré-venda com IA.
*   **BOM Dinâmica**: Refinamento de variações baseado em acabamentos (ex: belichemilao.csv).

### ⚪ Won't Have (Não agora)
*   **Rastreamento de Logística Própria**: Adiado para a Fase 3 (Logtech).

---

## 🛠️ Modificações Realizadas

### 1. `api/server.js` (Cérebro Financeiro)
*   Refinamento do `systemPrompt` para sugestão de preços.
*   Inclusão explícita de taxas de cartão (4%) e custos operacionais de Colombo nos cálculos de margem sugeridos pela IA Lizandro.

### 2. `erp/src/pages/types/product.type.ts`
*   Novos campos: `showroomStock`, `warehouseStock`.
*   Suporte para sincronização de saldo total.

### 3. `erp/src/pages/App/Products/components/tabs/ProductInventoryTab.tsx`
*   Interface atualizada para entrada de estoque por localidade.
*   Cálculo automático: `Total = Showroom + Depósito`.

### 4. `erp/src/pages/App/Stock/LabelPrinting/LabelItem.tsx`
*   **Layout Vertical Revolucionário**: SKU e Nome do produto agora em um bloco vertical à esquerda.
*   **QR Code Maximizado**: Liberação de espaço total à direita para leitura instantânea por scanners.
*   **Preset de Identificação**: Preço desativado por padrão para foco em logística.

### 5. `erp/src/pages/App/Stock/components/StockList.tsx`
*   **Busca Inteligente**: Corrigido bug onde buscas/scans por SKU de variação não encontravam o produto. Agora o filtro percorre todas as variações.

### 6. `erp/vite.config.ts` & `erp/vercel.json`
*   Padronização do diretório de saída: Alterado de `build` para `dist`.
*   Resolução do erro de deploy na Vercel ("No Output Directory named dist found").

---

## 📋 Próximos Passos Sugeridos
1.  **Sincronização ERP-Automation**: Garantir que as baixas no Showroom reflitam instantaneamente na API de estoque.
2.  **Batch Release (Lote)**: Criar interface para importação em lote de notas fiscais de entrada para atualizar `warehouseStock`.
3.  **Análise de BOM**: Processar `belichemilao.csv` para criar variações automáticas de tecido e acabamento no ERP.

**Assinado:** *Antigravity - Orquestrador de Inteligência Morante-Hub*
