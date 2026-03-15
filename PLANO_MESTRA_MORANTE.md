# 🎯 Plano Mestra Morante: Inteligência & CRM

Este documento consolida todas as frentes estratégicas do ecossistema Móveis Morante Hub.

---

## 🎙️ 1. BI por Voz (Sales Intelligence)
**Objetivo:** Capturar o "porquê não comprou" e o comportamento do cliente no balcão via áudio.
- [x] **Captura de Voz:** Implementada no botão `Voz BI Morante`.
- [x] **Persistência Resiliente:** Logs salvos mesmo se a IA falhar.
- [x] **Análise Inteligente:** Cruzamento com histórico de compras.
- [ ] **Exportação NotebookLM:** Gerar CSV mensal formatado para análise profunda de padrões.
- [ ] **Salvamento de Áudio Físico:** Implementar upload do `.wav` original para o Supabase Storage (atualmente salvamos a transcrição).

## 🧠 2. CRM Inteligente e "Me Avise"
**Objetivo:** Reativar vendas e facilitar assistências com contexto histórico.
- [x] **Detecção de Intenção:** Identifica se o cliente quer assistência, comprar algo novo ou apenas uma dúvida.
- [x] **Match de Histórico:** A IA identifica automaticamente de qual produto o cliente está falando baseada no que ele já comprou (ex: "meu guarda-roupa" -> "Guarda-roupa Topázio 6 portas").
- [ ] **Monitoramento de Desejos:** Tabela `customer_desires` para monitorar itens que o cliente quis e não tinha em estoque.
- [ ] **Alerta de Salvados:** Automação que avisa o vendedor quando um 'Salvado' (usado) entra em estoque e coincide com o desejo de um cliente.

## 📱 3. WhatsApp Automático & Seguro
**Objetivo:** Agilizar comunicação sem risco de banimento.
- [x] **Envio Direto (Graph API):** Implementado para Entrega, Assistência e Pedido.
- [ ] **Fila de Mensagens:** Implementar um pequeno delay entre envios automáticos para simular ritmo humano.
- [ ] **Gestão de Opt-Out:** Adicionar checkbox "Aceita receber notificações" no cadastro de clientes.

## 🛠️ 4. Assistência Automática
**Objetivo:** Abrir pedido de assistência em 1 clique.
- [x] **Draft System:** Identificação do produto mencionado na conversa.
- [ ] **Auto-Preenchimento:** Quando a IA detecta 'ASSISTANCE', ela já preenche o formulário de assistência com o ID do produto histórico e a descrição do problema.

---

## 📅 Próximos Passos (Prioridade)
1. **Executar Scripts SQL:** Criar tabelas `attendance_logs` e `customer_desires` no Supabase.
23. **Setup NotebookLM:** Criar pasta compartilhada no Drive para os CSVs de análise.
4. **Filtro de Salvados:** Implementar a lógica de comparação "Novo Item x Desejos Pendentes".

---

## 🛡️ Regras de Ouro: WhatsApp Anti-Bloqueio
Para garantir que a conta da Móveis Morante nunca seja suspensa:

1. **Interação Primeiro:** Priorizar o envio de mensagens para clientes que já iniciaram uma conversa. 
2. **Templates Oficiais:** Usar apenas mensagens pré-aprovadas pela Meta para iniciar conversas (notificações de entrega, etc).
3. **Botão de Sair:** Sempre oferecer uma forma clara do cliente parar de receber mensagens ("Digite SAIR para não receber mais avisos").
4. **Volume Controlado:** Evitar disparos de centenas de mensagens no mesmo segundo. O sistema agora usa a Graph API que gerencia isso, mas a supervisão humana é o filtro final.
5. **Contexto é Rei:** A IA Lisandro garante que a mensagem seja ultra-personalizada ("Olá João, sobre o seu Guarda-roupa comprado em Janeiro..."), o que reduz denúncias de spam quase a zero.
