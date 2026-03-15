import React, { useState } from 'react';
import SectionCard from '../../../components/SectionCard';

const SystemDocs = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const sections = [
        {
            title: "Gestão de Estoque & FIFO",
            icon: "bi-box-seam",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        O sistema utiliza a lógica <b>FIFO (First-In, First-Out)</b> para garantir que o custo da mercadoria vendida reflita o lote mais antigo disponível.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Funcionamento Lógico:</h4>
                        <ul className="list-disc list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <li><b>Entradas:</b> Toda entrada de estoque (Compra ou Ajuste Inicial) cria um registro de movimento do tipo <code>entry</code> com seu custo unitário específico.</li>
                            <li><b>Baixas de Venda:</b> Ao finalizar um pedido, o sistema busca todas as <code>entries</code> do produto com saldo positivo, ordenadas pela data mais antiga.</li>
                            <li><b>Vínculo de Lote:</b> Cada movimentação de saída é vinculada ao ID da entrada original via campo <code>parentMoveId</code>.</li>
                            <li><b>Margem de Lucro:</b> Relatórios futuros calculam o lucro baseando-se no custo real vinculado ao item vendido, não no custo atual do cadastro.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Processamento de Pedidos de Venda",
            icon: "bi-cart-check",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        O ciclo de vida de um pedido envolve múltiplos serviços para garantir integridade fiscal, de estoque e financeira.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Etapas de Salvamento:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <li><b>Validação:</b> Verifica campos obrigatórios e disponibilidade de estoque (se configurado).</li>
                            <li><b>Persistência:</b> O pedido é salvo na tabela <code>sales_orders</code>.</li>
                            <li><b>Regras de Negócio:</b> Aciona o <code>orderHistoryService</code> para processar automações.</li>
                            <li><b>Baixa Automática:</b> Se o status configurado for atingido, os movimentos de estoque são gerados e o saldo do produto atualizado.</li>
                        </ol>
                    </div>
                </div>
            )
        },
        {
            title: "Vendedor & Automação de Perfil",
            icon: "bi-person-badge",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        A escolha do vendedor no pedido é simplificada através de autocomplete inteligente baseado na tabela de perfis e funcionários.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2">Lógica de Seleção:</h4>
                        <ul className="list-disc list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <li><b>SmartInput:</b> Utiliza o componente compartilhado que realiza buscas em tempo real e permite seleção rápida via teclado.</li>
                            <li><b>Filtro de Ativos:</b> Apenas funcionários marcados como ativos e com cargos definidos aparecem nas sugestões automáticas.</li>
                            <li><b>Rastreabilidade:</b> O nome do vendedor é gravado no pedido para relatórios de comissões futuras.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Financeiro & Conciliação",
            icon: "bi-bank",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        O sistema financeiro gerencia contas a pagar/receber e integrações com adquirentes (Rede).
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Conciliação Rede:</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                            Um serviço de polling no <code>AppLayout</code> verifica periodicamente transações pendentes via API da Rede.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const filteredSections = sections.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-20 max-w-6xl mx-auto">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                    <i className="bi bi-book-half text-blue-600" />
                    Documentação do Sistema
                </h1>
                <p className="text-sm text-slate-500 font-medium italic">
                    Referência técnica para administradores sobre a lógica e comportamento do Morante Hub.
                </p>
            </header>

            <div className="relative max-w-md">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Pesquisar lógica do sistema..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredSections.map((section, idx) => (
                    <SectionCard
                        key={idx}
                        title={section.title}
                        icon={`bi ${section.icon}`}
                        iconBg="bg-slate-100 dark:bg-slate-800"
                    >
                        {section.content}
                    </SectionCard>
                ))}
            </div>

            <footer className="mt-12 p-8 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Sync Status: 2026 Manual Audit</p>
                <p className="text-xs text-slate-300 dark:text-slate-700 font-bold uppercase tracking-tight">Antigravity Hub Documentation Engine v1.0</p>
            </footer>
        </div>
    );
};

export default SystemDocs;
