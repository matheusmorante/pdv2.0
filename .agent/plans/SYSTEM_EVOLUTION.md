# 🚀 Plano de Evolução do Sistema (ERP + Ecommerce)

Este plano consolida todos os objetivos pendentes para a finalização e evolução do ecossistema Móveis Morante. O foco é máxima eficiência, automação total e integração inteligente.

## 🎙️ 1. Inteligência de Vendas (Voice BI) - **Prioridade Alta**
*Objetivo: Capturar feedbacks de balcão e transformar em insights estratégicos via Gemini.*

- [x] **Infraestrutura Base:** Criada tabela `attendance_logs` e serviço de salvamento.
- [x] **Componente de Voz:** Botão flutuante `AttendanceVoiceInput` integrado ao ERP.
- [ ] **Refinamento de Extração:** Melhorar o prompt para incluir sentimentos e sugestões de estoque.
- [ ] **Dashboard de BI:** Criar tela no ERP para visualizar os padrões de perda de venda capturados.

## 📦 2. Sistema de Rascunhos e Autosave
- [x] **Produtos e Pessoas:** Logica de autosave implementada.
- [x] **Limpeza:** `draftCleanupService.ts` configurado (seguros contra deleção acidental).
- [ ] **Interface:** Adicionar aba ou filtro de "Rascunhos" nas listagens de Produtos, Clientes e Pedidos.
- [ ] **Serviços:** Estender autosave para o formulário de serviços.

## 🛒 3. E-commerce & Integração
- [ ] **Catálogo Online:** Garantir que todos os produtos com `active: true` apareçam no ecommerce.
- [ ] **Checkout Inteligente:** Integrar pedidos gerados no ecommerce diretamente no `orders` do ERP.
- [ ] **Notificações:** Webhooks para avisar vendedores via WhatsApp/Notificação interna quando houver nova venda online.

## 🧪 4. Infraestrutura & Automação (Antigravity Mode)
- [ ] **Deploy Automático:** Ajustar Vercel para apontar para `apps/erp` e `apps/ecommerce` corretamente.
- [ ] **Audit Total:** Rodar scripts de acessibilidade e performance em todas as telas principais.
- [ ] **Documentação:** Manter `ARCHITECTURE.md` atualizado com as novas rotas de IA.

## 🚫 Removido / Descontinuado
- [x] **Bling Integration:** Removido do escopo para simplificar e focar em sistema próprio robusto.

---

## 🛠️ Configuração de Autonomia (Modo Full Auto)
O agente agora opera sob o regime de **"Always Proceed"**:
- Execução de comandos de terminal automática.
- Criação de artefatos sem interrupção.
- Acesso total a arquivos do workspace para análise cruzada.
