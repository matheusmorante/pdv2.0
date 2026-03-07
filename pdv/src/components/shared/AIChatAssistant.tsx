import React, { useState, useRef, useEffect } from 'react';
import { getSettings } from '../../pages/utils/settingsService';
import { toast } from 'react-toastify';
import { saveProduct } from '../../pages/utils/productService';
import { saveOrder } from '../../pages/utils/orderHistoryService';
import Product from '../../pages/types/product.type';
import Order from '../../pages/types/order.type';
import { aiService } from '../../pages/utils/aiService';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isAction?: boolean;
    actionType?: 'create_product' | 'create_order' | 'create_service';
    actionData?: any;
    actionStatus?: 'pending' | 'success' | 'error';
}

const labelMap: Record<string, string> = {
    product_name: 'Produto',
    productName: 'Produto',
    price: 'Preço',
    unitPrice: 'Preço',
    delivery_time: 'Horário de Entrega',
    delivery_date: 'Data de Entrega',
    delivery_address: 'Rua/Endereço',
    payment_method: 'Forma de Pagamento',
    customer_name: 'Cliente',
    customerName: 'Cliente',
    customer_zip_code: 'CEP',
    cep: 'CEP',
    customer_number: 'Número',
    number: 'Número',
    customer_apartment: 'Complemento',
    complement: 'Complemento',
    neighborhood: 'Bairro',
    city: 'Cidade',
    description: 'Descrição',
    category: 'Categoria',
    stock: 'Estoque',
    details: 'Detalhes/Obs',
    observation: 'Observação',
    quantity: 'Quantidade'
};

const formatValue = (key: string, value: any) => {
    if (!value && value !== 0) return '-';
    
    if (key === 'price' || key === 'unitPrice' || key === 'amount') {
        const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
        if (!isNaN(num) && typeof num === 'number') {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
        }
    }
    return value;
};

const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const settings = getSettings();
    const aiName = settings.aiPrompts.aiName || 'Lizandro';
    const aiAvatar = settings.aiPrompts.aiAvatar || ''; // Path or URL
    
    // Use the dynamic name in the initial message
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: `Olá! Sou ${aiName}, seu assistente de IA. Como posso ajudar hoje? Posso criar produtos, pedidos ou tirar dúvidas!`, 
            timestamp: new Date() 
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // First, detect intent
            const intentData = await aiService.detectIntent(input, settings.aiPrompts.taskDetection);

            if (intentData.intent && intentData.intent !== 'chat') {
                const summary = intentData.summary || `Entendido! Identifiquei que você quer criar um ${intentData.intent === 'create_order' ? 'pedido' : 'item'}. Deseja confirmar?`;
                const actionMsg: Message = {
                    role: 'assistant',
                    content: summary,
                    timestamp: new Date(),
                    isAction: true,
                    actionType: intentData.intent,
                    actionData: intentData.data,
                    actionStatus: 'pending'
                };
                setMessages(prev => [...prev, actionMsg]);
            } else {
                // Just chat
                const chatData = await aiService.chat(input, settings.aiPrompts.generalChat);
                setMessages(prev => [...prev, { role: 'assistant', content: chatData.answer, timestamp: new Date() }]);
            }
        } catch (error) {
            toast.error("Erro ao conectar com o servidor de IA.");
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um problema ao processar sua solicitação. Verifique se o servidor de IA está rodando.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmAction = async (msgIndex: number) => {
        const msg = messages[msgIndex];
        if (!msg.actionData) return;

        try {
            if (msg.actionType === 'create_product' || msg.actionType === 'create_service') {
                const itemType = msg.actionType === 'create_service' ? 'service' : 'product';
                const price = typeof msg.actionData.price === 'string' 
                    ? parseFloat(msg.actionData.price.replace(/[^\d.,]/g, '').replace(',', '.')) 
                    : (msg.actionData.price || 0);
                
                const productData: Partial<Product> = {
                    description: msg.actionData.description || msg.actionData.product_name || "Novo Item via IA",
                    unitPrice: isNaN(price) ? 0 : price,
                    category: msg.actionData.category || (itemType === 'service' ? "Serviços" : "Geral"),
                    itemType: itemType,
                    active: true,
                    stock: msg.actionData.stock || 0
                };
                await saveProduct(productData as Product);
                toast.success(`${itemType === 'service' ? 'Serviço' : 'Produto'} criado com sucesso!`);
            } else if (msg.actionType === 'create_order') {
                // Simplified order creation
                const orderData: Partial<Order> = {
                    orderType: 'sale',
                    customerData: { 
                        fullName: msg.actionData.customerName || msg.actionData.customer_name || "Consumidor Final", 
                        phone: "", 
                        fullAddress: { 
                            cep: msg.actionData.customer_zip_code || "", 
                            street: msg.actionData.delivery_address || "", 
                            number: msg.actionData.customer_number || "", 
                            neighborhood: "", 
                            city: "", 
                            complement: msg.actionData.customer_apartment || "", 
                            observation: "" 
                        } 
                    },
                    items: [], // Would need refinement to add items by name
                    observation: `Criado via IA. Detalhes: ${msg.actionData.product_name || ""} ${msg.actionData.delivery_time ? `| Entrega: ${msg.actionData.delivery_time}` : ""}`,
                    status: 'draft'
                };
                await saveOrder(orderData as Order);
                toast.success("Pedido de venda rascunho criado com sucesso!");
            }

            setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, actionStatus: 'success', content: 'Ação executada com sucesso! ✨' } : m));
        } catch (error) {
            toast.error("Erro ao executar ação da IA.");
            setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, actionStatus: 'error' } : m));
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-slide-up">
                    <header className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden">
                                {aiAvatar ? (
                                    <img src={aiAvatar} alt={aiName} className="w-full h-full object-cover" />
                                ) : (
                                    <i className="bi bi-robot text-2xl"></i>
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-widest">{aiName}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[10px] uppercase font-bold text-white/70">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                            <i className="bi bi-dash-lg"></i>
                        </button>
                    </header>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex flex-shrink-0 items-center justify-center overflow-hidden mt-1">
                                            {aiAvatar ? (
                                                <img src={aiAvatar} alt={aiName} className="w-full h-full object-cover" />
                                            ) : (
                                                <i className="bi bi-robot text-indigo-600 dark:text-indigo-400"></i>
                                            )}
                                        </div>
                                    )}
                                    <div className={`px-5 py-3 rounded-2xl text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-200 dark:shadow-none font-medium' 
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                                    }`}>
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.role === 'assistant' 
                                                ? msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                                    part.startsWith('**') && part.endsWith('**') 
                                                        ? <strong key={i}>{part.slice(2, -2)}</strong> 
                                                        : part
                                                  )
                                                : msg.content
                                            }
                                        </div>

                                        {msg.isAction && msg.actionStatus === 'pending' && (
                                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-slate-900 dark:text-slate-100">
                                                <div className="flex flex-col gap-2 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                                    {Object.entries(msg.actionData).map(([key, value]) => {
                                                        const label = labelMap[key] || key;
                                                        const formattedValue = formatValue(key, value);
                                                        if (key === 'intent' || key === 'summary') return null;
                                                        
                                                        return (
                                                            <div key={key} className="flex justify-between items-start gap-4">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{label}:</span>
                                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-right">{String(formattedValue)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <details className="group">
                                                    <summary className="text-[9px] font-black uppercase tracking-widest text-slate-400/50 cursor-pointer list-none flex items-center gap-1 hover:text-slate-400 transition-colors">
                                                        <i className="bi bi-chevron-right group-open:rotate-90 transition-transform"></i>
                                                        Ver Dados Técnicos (JSON)
                                                    </summary>
                                                    <pre className="mt-2 text-[9px] font-mono whitespace-pre-wrap text-slate-500/70 dark:text-slate-500 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                        {JSON.stringify(msg.actionData, null, 2)}
                                                    </pre>
                                                </details>
                                                
                                                <button 
                                                    onClick={() => confirmAction(idx)}
                                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <i className="bi bi-check-circle-fill"></i>
                                                    Confirmar e Criar Agora
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-600 mt-1 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2 animate-pulse">
                                <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Diga: 'Crie um sofá de R$ 2000'..."
                                className="w-full pl-5 pr-14 py-3 bg-slate-100 dark:bg-slate-950 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 overflow-hidden ${
                    isOpen ? 'bg-slate-800 dark:bg-slate-700 rotate-90' : 'bg-indigo-600 shadow-indigo-300 dark:shadow-none'
                }`}
            >
                {isOpen ? (
                    <i className="bi bi-x-lg text-2xl"></i>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                         {aiAvatar ? (
                             <img src={aiAvatar} alt={aiName} className="w-full h-full object-cover" />
                         ) : (
                             <i className="bi bi-robot text-3xl"></i>
                         )}
                         <span className="absolute top-3 right-3 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full z-10"></span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default AIChatAssistant;
