# Project Status & Pending Ideas

## Last Update: 2026-03-14

### Recent Changes (2026-03-15)
- **AI-Powered Financial Insights**:
    - **Profit Margin & Markup**: AI suggestions now include the percentage margin (markup) for each price tier.
    - **Real-Time Margin Calculator**: Added a live profit/margin monitor in the Inventory tab that updates as the user changes prices.
- **Enhanced Inventory Operations**:
    - **Auto-Increment Scanning**: The QR scanner now automatically increments the product count by +1 per scan, allowing for "series scanning" without manual input.
    - **Visual Feedback**: Added success notifications and row highlighting (green pulse) when a product is scanned during inventory audits.
- **Global Text Padronization (All Caps)**:
    - **Enforced Uppercase**: Titles, Descriptions, Marketplace Titles, and Variation Names are now automatically converted to uppercase across the ERP and in AI-generated content.
    - **Placeholders**: All input placeholders were updated to follow the uppercase convention.
- **E-commerce Stability**:
    - **Build Fixes**: Resolved Vercel build errors by fixing font dependencies (switching to Inter to avoid missing Geist errors) and adding missing libraries (`lucide-react`, `supabase-js`).
- **Core Improvements**:
    - **Internal Observations**: Verified and ensured the persistence of internal product observations in the database.
    - **NCM Identification**: Updated the AI NCM identification prompt for better accuracy and formatting.

### Recent Changes (2026-03-14)
- **Multi-Repo Architecture**: Project successfully migrated from a monorepo (`moveismorantehub`) to a decentralized multi-repo structure inside `morante-hub`.
    - **erp-admin** (React/Vite) isolated.
    - **erp-store** (Next.js) isolated.
    - **erp-api** (Node/Express) isolated.
    - **erp-automation** consolidated.
- **Dependency Isolation**: Individual `node_modules` and `package.json` for each repository to prevent version conflicts.
- **Centralized Governance**: New root `README.md` and repository organization.
- **Master Orchestration**: Added a root `package.json` to manage all repositories simultaneously using `concurrently`. Now `npm run dev` in the root starts Admin, Store, API, and Automation.

- **Extra Dimensions (PRO MAX)**:
    - Enabled **real-time editing of Width, Height, and Depth** directly from the label customizer for technical labels.
- **Price Label Shortcut**: 
    - Added a **"Modo Preço"** quick action button in the header and sidebar for immediate setup of price tags.
- **Label Printing System (Premium Upgrade)**: 
    - Implemented "Premium" visual standard for all labels: refined typography, higher contrast, and subtle shadows.
    - Added **High-Quality Export**: New "Baixar PNG" button using `html2canvas` for high-resolution label saving.
    - **Design Architect (Obrigações Separadas)**:
    - **Identidade de Marca vs Identificação de Produtos**: Sistema agora separa etiquetas funcionais (Preço, QR Code) de etiquetas de design (Logo Morante, 100% MDF).
    - **Navegação Contextual**: Links específicos no menu "Estoque" (para rótulos) e no menu "Design" (para identidade visual).
    - **Interface Simplificada**: Remoção de filtros de categoria na área de etiquetas para reduzir poluição visual e focar na busca direta.
    - **Deep Linking**: Acesso direto via produto via parâmetros de URL (`?productId=...`), que pré-seleciona apenas presets relevantes de identificação.
    - **Intelligent Layout**: Labels now automatically expand the QR Code and branding when other elements are disabled.
    - **Visual Refinement**: SKU/Code now has a dedicated background badge for better legibility on physical prints.
- **Sales Order Healing (Data Integrity)**:
    - **Kaline Estevão (Order 1548)**: Fixed legacy data format that was causing "R$ 0,00" display and UI crashes. Restored total value of **R$ 3.951,00** and normalized payment fields.
    - **Criado Mudo Aroma**: Restored product from draft state to active catalog using a direct Supabase script (bypass MCP error).
    - **Legacy Support**: Updated the `OrderHistoryRow` and `PaymentsSummary` types to handle old order data formats gracefully, preventing future UI breakages.
- **Product Draft Removal**:
    - **Unified Product Catalog**: Completely removed the "Rascunhos" (Drafts) functionality from the Product, Service, and Contact (Person) modules to simplify the UI and prevent data synchronization issues.
    - **Auto-Save Removal**: Disabled background auto-saving for these modules while keeping it active for Sales Orders (as requested).
- **Product Variation Overhaul (Premium UX)**:
    - **Card-Based Management**: Variations are now displayed as sleek cards instead of a crowded table, providing a cleaner overview of the product grid.
    - **Detailed Edit Modal**: Clicking a variation opens a dedicated modal for fine-tuned adjustments of Stock, Minimum Stock, Sale Price, and Cost Price.
    - **Smart Sync System**: Added explicit "Sync with Parent" toggles for Name, Price, and Cost, ensuring consistency across versions while allowing manual overrides when needed.
    - **Enhanced Financial Controls**: Each variation now has its own Cost Price field with sync logic, allowing for accurate profit calculation even on complex product mixes.
- **UI/UX Branding**: Updated page titles and subtitles across the label system to follow the "ERP Móveis Morante" premium branding guidelines.




### Pending Ideas
- [ ] Implement advanced error handling if camera permissions are denied.
- [ ] Add a toggle button inside the scanner to switch cameras manually.
- [ ] Optimize build chunks as suggested by Vite.
- [ ] Add a "Regenerate Code" button in the Product Form to allow updating SKU based on a modified description.


### Project Rules (from user_global)
- Siga princípio de código limpo e modularizado.
- Sempre salve ideias e planos pendentes em um arquivo.
- Economize o máximo de cota do plano de assinatura.
- Diferencie ambiente dev e prod em rotas e variáveis.
- Relate bugs imediatamente.
- Pergunte em caso de ambiguidade.
