# 🚀 Morante-Hub

Este é o ecossistema centralizado do projeto **Móveis Morante**, agora estruturado como um **Multi-Repo** para maior estabilidade, modularidade e facilidade de deploy.

## 📂 Estrutura do Ecossistema

O projeto foi dividido em quatro repositórios independentes:

1.  **[`erp-admin`](./erp-admin)**: Painel administrativo interno construído com **React + Vite**. É a ferramenta central para gestão de estoque, pedidos e clientes.
2.  **[`erp-store`](./erp-store)**: E-commerce voltado para o cliente final, construído com **Next.js**. Otimizado para SEO e performance.
3.  **[`erp-api`](./erp-api)**: Servidor de Inteligência Artificial e regras de negócio complexas, utilizando **Node.js** e **Gemini AI**.
4.  **[`erp-automation`](./erp-automation)**: Scripts de automação e bots para integração de processos.

## 🛠️ Outros Recursos

-   **[`supabase`](./supabase)**: Definições de schema e configurações do banco de dados.
-   **[`shared-utils`](./shared-utils)**: Scripts de manutenção, migração de dados e utilitários legados.
-   **[`docs-planos`](./docs-planos)**: Documentação estratégica e planejamentos do projeto.

### Global Development Environment (Orchestrator)
You can now start all services simultaneously from the root directory:

```bash
# First time setup
npm run install:all

# Run all services (Admin, Store, API, Automation)
npm run dev
```

### ERP Admin (Admin Panel)
```bash
cd erp-admin
npm install
npm run dev
```

### ERP Store (E-commerce)
```bash
cd erp-store
npm install
npm run dev
```

### ERP API (AI Server)
```bash
cd erp-api
npm install
npm start
```

### ERP Automation (Automation Scripts)
```bash
cd erp-automation
npm install
npm start
```

---

## 📜 Regras e Padrões
Consulte o arquivo [`RULES.md`](./RULES.md) para diretrizes de desenvolvimento e o [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) para o Roadmap atual.
