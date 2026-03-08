import React, { useState, useRef, useEffect } from 'react';
import { getSettings, AppSettings, subscribeToSettings } from '../../pages/utils/settingsService';
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
    summary?: string;
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
    const [settings, setSettings] = useState<AppSettings>(getSettings());

    useEffect(() => {
        const unsubscribe = subscribeToSettings((newSettings) => {
            setSettings(newSettings);
        });
        return () => unsubscribe();
    }, []);

    const aiName = settings.aiPrompts.aiName || 'Lisandro';
    const aiAvatar = settings.aiPrompts.aiAvatar || ''; 
    
    const STORAGE_KEY = 'lisandro_chat_history';
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const initialMsg: Message = { 
            role: 'assistant', 
            content: `Olá! Sou ${aiName}, seu assistente de IA. Como posso ajudar hoje? Posso criar produtos, pedidos ou tirar dúvidas!`, 
            timestamp: new Date() 
        };

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const now = new Date().getTime();
                const recentMessages = parsed.filter((m: any) => {
                    const msgDate = new Date(m.timestamp).getTime();
                    return (now - msgDate) < SEVEN_DAYS_MS;
                }).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));

                return recentMessages.length > 0 ? recentMessages : [initialMsg];
            } catch (e) {
                return [initialMsg];
            }
        }
        return [initialMsg];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isCallMode, setIsCallMode] = useState(false);
    const [pendingActionData, setPendingActionData] = useState<any>(null);
    const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(() => {
        return localStorage.getItem('lisandro_auto_speak') === 'true';
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<any>(null);
    const [adjustingField, setAdjustingField] = useState<string | null>(null);
    const [adjustmentText, setAdjustmentText] = useState("");
    const [confirmedFields, setConfirmedFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        localStorage.setItem('lisandro_auto_speak', String(isAutoSpeakEnabled));
    }, [isAutoSpeakEnabled]);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = 'pt-BR';
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                window.speechSynthesis.cancel();
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const transcript = event.results[i][0].transcript;
                        setInput(prev => {
                            const newText = (prev + ' ' + transcript).trim();
                            if (isCallMode) {
                                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                                silenceTimerRef.current = setTimeout(() => {
                                    handleSendRequest(newText);
                                }, 1200);
                            }
                            return newText;
                        });
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                window.speechSynthesis.cancel();
            };

            recognitionRef.current.onerror = (event: any) => {
                if (event.error === 'no-speech') return;
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                setIsCallMode(false);
                toast.error("Erro no reconhecimento de voz.");
            };

            recognitionRef.current.onend = () => {
                if (isCallMode) {
                    try { recognitionRef.current.start(); } catch (e) { }
                } else {
                    setIsListening(false);
                }
            };
        }
    }, [isCallMode]);

    const toggleListening = () => {
        if (isListening) {
            setIsCallMode(false);
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (!recognitionRef.current) {
                toast.error("Reconhecimento de voz não suportado.");
                return;
            }
            recognitionRef.current.start();
        }
    };

    const toggleAutoSpeak = () => {
        const newValue = !isAutoSpeakEnabled;
        setIsAutoSpeakEnabled(newValue);
        if (!newValue) {
            window.speechSynthesis.cancel();
        }
    };

    const toggleCallMode = () => {
        if (isCallMode) {
            setIsCallMode(false);
            recognitionRef.current?.stop();
        } else {
            setIsCallMode(true);
            setIsAutoSpeakEnabled(true);
            if (!isListening) {
                recognitionRef.current?.start();
            }
        }
    };

    const speak = (text: string) => {
        if (!isAutoSpeakEnabled) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.35; // Increased rate for speed
        utterance.pitch = 0.85;

        const voices = window.speechSynthesis.getVoices();
        const naturalVoices = voices.filter(v => v.lang.includes('pt-BR'));
        const preferredVoice = naturalVoices.find(v =>
            v.name.includes('Daniel') ||
            v.name.includes('Ricardo') ||
            v.name.includes('Felipe') ||
            v.name.includes('Google português') ||
            (!v.name.includes('Maria') && !v.name.includes('Luciana') && !v.name.includes('Yaritza'))
        ) || naturalVoices[0];

        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        handleSendRequest(input);
    };

    const handleSendRequest = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        try {
            const intentData = await aiService.detectIntent(text, settings.aiPrompts.taskDetection, pendingActionData);

            if (intentData.intent && intentData.intent !== 'chat') {
                const newData = { ...(pendingActionData || {}), ...intentData.data };

                if (intentData.status === 'incomplete') {
                    setPendingActionData(newData);
                    setMessages(prev => [...prev, { role: 'assistant', content: intentData.summary || "Faltam detalhes.", timestamp: new Date() }]);
                    speak(intentData.summary || "Faltam detalhes.");
                } else {
                    setPendingActionData(null);
                    const actionMsg: Message = {
                        role: 'assistant',
                        content: intentData.summary || "Finalizar?",
                        timestamp: new Date(),
                        isAction: true,
                        actionType: intentData.intent,
                        actionData: newData,
                        actionStatus: 'pending'
                    };
                    setMessages(prev => [...prev, actionMsg]);
                    speak(intentData.summary || "Finalizar?");
                }
            } else {
                const chatData = await aiService.chat(text, settings.aiPrompts.generalChat, pendingActionData);
                setMessages(prev => [...prev, { role: 'assistant', content: chatData.answer, timestamp: new Date() }]);
                speak(chatData.answer);
            }
        } catch (error) {
            toast.error("Erro na IA.");
            setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdjustment = async (msgIndex: number, field: string) => {
        if (!adjustmentText.trim()) return;

        setIsLoading(true);
        const msg = messages[msgIndex];
        const prevData = msg.actionData;
        const fieldLabel = labelMap[field] || field;

        try {
            const prompt = `O usuário está corrigindo o campo "${fieldLabel}" do rascunho anterior. 
            DADO ANTERIOR: "${prevData[field]}"
            CORREÇÃO DO USUÁRIO: "${adjustmentText}"
            DADOS TOTAIS ATUAIS: ${JSON.stringify(prevData)}
            
            Retorne o JSON atualizado com base nessa correção. 
            Se a correção afetar outros campos (ex: mudou produto, pode mudar preço), atualize-os também.
            ${settings.aiPrompts.taskDetection}`;

            const response = await aiService.detectIntent(adjustmentText, prompt, prevData);

            if (response.intent && response.intent !== 'chat') {
                const newData = { ...prevData, ...response.data };
                setMessages(prev => prev.map((m, i) => i === msgIndex ? {
                    ...m,
                    actionData: newData,
                    summary: response.summary || `Ajustei ${fieldLabel}.`
                } : m));

                speak(response.summary || `Ajustei ${fieldLabel}.`);
            }

            setAdjustingField(null);
            setAdjustmentText("");
        } catch (error) {
            toast.error("Erro no ajuste.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFieldConfirmation = (field: string) => {
        setConfirmedFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
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
                toast.success(`${itemType === 'service' ? 'Serviço' : 'Produto'} criado!`);
            } else if (msg.actionType === 'create_order') {
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
                    items: [],
                    observation: `IA: ${msg.actionData.product_name || ""} ${msg.actionData.delivery_time ? `| Ent: ${msg.actionData.delivery_time}` : ""}`,
                    status: 'draft'
                };
                await saveOrder(orderData as Order);
                toast.success("Pedido rascunho criado!");
            }

            setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, actionStatus: 'success', content: 'Salvo com sucesso! ✨' } : m));
        } catch (error) {
            toast.error("Erro ao salvar.");
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
                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggleCallMode}
                                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${isCallMode ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-white/60'}`}
                                title={isCallMode ? "Desligar Chamada" : "Iniciar Chamada de Voz"}
                            >
                                <i className={`bi ${isCallMode ? 'bi-telephone-fill' : 'bi-telephone'}`}></i>
                                {isCallMode && <span className="text-[10px] font-black uppercase">Em Call</span>}
                            </button>
                            <button
                                onClick={toggleAutoSpeak}
                                className={`p-2 rounded-lg transition-all ${isAutoSpeakEnabled ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                                title={isAutoSpeakEnabled ? "Desativar Voz" : "Ativar Voz"}
                            >
                                <i className={`bi ${isAutoSpeakEnabled ? 'bi-volume-up-fill' : 'bi-volume-mute'}`}></i>
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <i className="bi bi-dash-lg"></i>
                            </button>
                        </div>
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
                                            <div className="mt-4 flex flex-col gap-2">
                                                <div className="group relative">
                                                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm cursor-help hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                                                <i className={`bi ${msg.actionType === 'create_order' ? 'bi-cart-check' : 'bi-box-seam'}`}></i>
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Dados Pronto</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2">
                                                            {msg.actionData.product_name || msg.actionData.description || "Novo registro"}
                                                        </p>

                                                        <div className="absolute bottom-full left-0 mb-4 w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 hidden group-hover:block transition-all animate-slide-up z-[100] cursor-default" onClick={e => e.stopPropagation()}>
                                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-blue-500"></div>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revisão Rápida</h5>
                                                                <div className="flex gap-1">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                                                {Object.entries(msg.actionData).map(([key, value]) => {
                                                                    if (['intent', 'status', 'summary'].includes(key)) return null;
                                                                    const isAdjusting = adjustingField === key;
                                                                    const isConfirmed = confirmedFields[key];

                                                                    return (
                                                                        <div key={key} className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${isConfirmed ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800'}`}>
                                                                            <div className="flex justify-between items-center gap-3">
                                                                                <div className="flex flex-col min-w-0">
                                                                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{labelMap[key] || key}</span>
                                                                                    <span className={`text-[11px] font-bold truncate ${isConfirmed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                                                        {String(formatValue(key, value))}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex gap-1 shrink-0">
                                                                                    <button
                                                                                        onClick={() => toggleFieldConfirmation(key)}
                                                                                        className={`p-1.5 rounded-lg transition-all ${isConfirmed ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white dark:bg-slate-800 text-slate-300 hover:text-emerald-600 border border-slate-100 dark:border-slate-700'}`}
                                                                                        title="OK"
                                                                                    >
                                                                                        <i className="bi bi-check-lg"></i>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setAdjustingField(key)}
                                                                                        className={`p-1.5 rounded-lg transition-all ${isAdjusting ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-300 hover:text-rose-600 border border-slate-100 dark:border-slate-700'}`}
                                                                                        title="Editar"
                                                                                    >
                                                                                        <i className="bi bi-x-lg"></i>
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                            {isAdjusting && (
                                                                                <div className="flex flex-col gap-2 mt-1 animate-slide-up">
                                                                                    <input
                                                                                        autoFocus
                                                                                        value={adjustmentText}
                                                                                        onChange={e => setAdjustmentText(e.target.value)}
                                                                                        onKeyDown={e => e.key === 'Enter' && handleAdjustment(idx, key)}
                                                                                        placeholder="Novo valor..."
                                                                                        className="w-full bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/50 outline-none text-[11px] font-medium"
                                                                                    />
                                                                                    <div className="flex gap-2">
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setAdjustingField(null);
                                                                                                setAdjustmentText("");
                                                                                            }}
                                                                                            className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                                                                        >
                                                                                            X
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleAdjustment(idx, key)}
                                                                                            className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700"
                                                                                        >
                                                                                            OK
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <button
                                                                onClick={() => confirmAction(idx)}
                                                                className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group/btn"
                                                            >
                                                                SALVAR
                                                                <i className="bi bi-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => confirmAction(idx)}
                                                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <i className="bi bi-check-lg"></i>
                                                        SALVAR
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setInput("");
                                                            if (isCallMode) recognitionRef.current?.start();
                                                            else toggleListening();
                                                        }}
                                                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <i className="bi bi-chat-left-text"></i>
                                                        AJUSTAR
                                                    </button>
                                                </div>
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
                        <div className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isListening ? "Ouvindo você..." : "Diga: 'Crie um sofá de R$ 2000'..."}
                                    className={`w-full pl-5 pr-20 py-3 bg-slate-100 dark:bg-slate-950 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 ${isListening ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                                />
                                <div className="absolute right-2 top-1.5 flex gap-1">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-1.5 rounded-xl transition-all ${isListening && !isCallMode ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'}`}
                                        title="Falar"
                                    >
                                        <i className={`bi ${isListening && !isCallMode ? 'bi-mic-fill' : 'bi-mic'}`}></i>
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        <i className="bi bi-send-fill"></i>
                                    </button>
                                </div>
                            </div>
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
