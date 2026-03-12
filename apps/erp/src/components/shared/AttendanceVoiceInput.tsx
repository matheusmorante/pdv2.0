import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { aiService } from "../../pages/utils/aiService";
import { attendanceService } from "../../pages/utils/attendanceService";
import { useAuth } from "../../context/AuthContext";
import { AttendanceLog } from "../../pages/types/attendance.type";
import { crmIntelligenceService } from "../../pages/utils/crmIntelligenceService";
import { PatternFormat } from "react-number-format";

const AttendanceVoiceInput = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerPhone, setCustomerPhone] = useState("");
    const [suggestedAction, setSuggestedAction] = useState<{ type: string, data: any, label: string } | null>(null);
    const { profile } = useAuth();
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = 'pt-BR';
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                }
                if (currentTranscript) {
                    setTranscript(prev => (prev + " " + currentTranscript).trim());
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Erro no reconhecimento de voz:", event.error);
                setIsRecording(false);
                toast.error("Erro ao capturar voz.");
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, []);

    const startRecording = () => {
        if (!recognitionRef.current) {
            toast.error("Reconhecimento de voz não suportado neste navegador.");
            return;
        }
        setIsRecording(true);
        recognitionRef.current.start();
        toast.info("Gravando... Fale agora.");
    };

    const pauseRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            toast.info("Gravação pausada.");
        }
    };

    const clearTranscript = () => {
        setTranscript("");
        setSuggestedAction(null);
        toast.info("Transcrição limpa.");
    };

    const processAttendance = async () => {
        if (!transcript.trim()) {
            toast.warn("Nenhum relato capturado.");
            return;
        }

        setIsProcessing(true);
        let structuredData = {};
        
        try {
            if (customerPhone.replace(/\D/g, '').length >= 10) {
                const intelligence = await crmIntelligenceService.analyzeCustomerIntent(customerPhone, transcript);
                if (intelligence) {
                    structuredData = {
                        ...intelligence,
                        product: intelligence.matched_product?.name || intelligence.extracted_data?.product_name,
                        reason: intelligence.summary,
                        next_step: intelligence.intent === 'ASSISTANCE' ? `Abrir assistência para: ${intelligence.matched_product?.name}` : intelligence.summary
                    };

                    if (intelligence.intent === 'ASSISTANCE' && intelligence.matched_product) {
                        setSuggestedAction({
                            type: 'ASSISTANCE',
                            data: intelligence,
                            label: `Agendar Assistência: ${intelligence.matched_product.name}`
                        });
                    } else if (intelligence.intent === 'DESIRE') {
                        setSuggestedAction({
                            type: 'DESIRE',
                            data: intelligence.extracted_data,
                            label: `Registrar Desejo: ${intelligence.extracted_data.product_name}`
                        });
                    }
                }
            } else {
                const prompt = `Analise este relato de atendimento de um vendedor de móveis para extrair BI estratégico.
                RELATO: "${transcript}"
                
                Responda APENAS um objeto JSON com estes campos (use "Não informado" se não souber):
                {
                    "customer_name": "Nome do cliente",
                    "product": "Produto de interesse",
                    "closed_sale": boolean (se a venda foi fechada),
                    "lost_reason": "Motivo da não venda (Preço, Prazo, Modelo, etc)",
                    "positive_points": ["lista de elogios"],
                    "negative_points": ["lista de críticas/pontos negativos"],
                    "main_objection": "Por que o cliente não comprou?",
                    "sentiment": "Sentimento (Positivo, Negativo, Neutro)",
                    "priority": "Nível de interesse (Quente, Morno, Frio)",
                    "next_step": "Ação recomendada para o vendedor"
                }`;

                const aiResponse = await aiService.chat(prompt, "Você é um analista de BI especializado em varejo de móveis.");
                let cleanJson = aiResponse.answer.trim();
                if (cleanJson.startsWith('```json')) {
                    cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
                } else {
                    const match = cleanJson.match(/\{[\s\S]*\}/);
                    if (match) cleanJson = match[0];
                }
                structuredData = JSON.parse(cleanJson);
            }
        } catch (error) {
            console.error("Erro no processamento da IA (Mas o log será salvo):", error);
            toast.warn("IA falhou, mas salvando o relato bruto para análise posterior.");
        }

        try {
            const log: AttendanceLog = {
                date: new Date().toISOString(),
                salesperson_name: profile?.full_name || "Vendedor",
                customer_phone: customerPhone || undefined,
                transcript: transcript,
                structured_data: structuredData as any
            };

            await attendanceService.saveLog(log);
            toast.success("Atendimento registrado com sucesso! ✨");
            
            if (!suggestedAction) {
                setTimeout(() => {
                    setTranscript("");
                    setCustomerPhone("");
                    setIsOpen(false);
                }, 1500);
            }
        } catch (saveError) {
            console.error("Erro fatal ao salvar atendimento:", saveError);
            toast.error("Erro crítico ao salvar no banco de dados.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-24 z-[9998] flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-80 p-5 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-2xl text-white shadow-lg ${isRecording ? 'bg-rose-500 animate-pulse shadow-rose-200' : 'bg-blue-600 shadow-blue-200'} transition-all`}>
                                <i className={`bi ${isRecording ? 'bi-mic-fill' : 'bi-headset'} text-lg`}></i>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 leading-tight">Voz BI Morante</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Feedback Estratégico</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
                            <i className="bi bi-x-lg text-xs"></i>
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 font-medium leading-relaxed">
                        Relate o atendimento para análise de BI.
                    </p>

                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Telefone do Cliente (Opcional)</label>
                            <PatternFormat
                                format="(##) #####-####"
                                value={customerPhone}
                                onValueChange={(values) => setCustomerPhone(values.value)}
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            />
                        </div>

                        {suggestedAction && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 animate-bounce">
                                <p className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 mb-2 ml-1">Lisandro Sugere:</p>
                                <button
                                    onClick={async () => {
                                        toast.info(`Executando: ${suggestedAction.label}`);
                                        setSuggestedAction(null);
                                        setTranscript("");
                                        setCustomerPhone("");
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                                >
                                    {suggestedAction.label}
                                </button>
                                <button 
                                    onClick={() => setSuggestedAction(null)}
                                    className="w-full mt-2 text-[8px] font-black uppercase text-slate-400 hover:text-slate-600"
                                >
                                    Ignorar Sugestão
                                </button>
                            </div>
                        )}

                        <div className="relative group">
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Diga ou digite o que aconteceu no atendimento..."
                                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-200 italic resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all custom-scrollbar leading-relaxed"
                            />
                            {!isRecording && !transcript && (
                                <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-400 transition-colors">Aguardando Relato</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <i className="bi bi-mic-fill text-sm"></i>
                                {transcript ? 'Continuar' : 'Gravar'}
                            </button>
                        ) : (
                            <button
                                onClick={pauseRecording}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <i className="bi bi-pause-fill text-sm"></i>
                                Pausar
                            </button>
                        )}

                        {transcript && (
                            <>
                                <button
                                    onClick={clearTranscript}
                                    className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center"
                                    title="Limpar tudo"
                                >
                                    <i className="bi bi-trash3 text-sm"></i>
                                </button>

                                <button
                                    onClick={processAttendance}
                                    disabled={isProcessing}
                                    className="px-5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <i className="bi bi-send-fill text-sm"></i>
                                            <span>Enviar BI</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800' : 'bg-emerald-600 shadow-emerald-200 dark:shadow-none'}`}
                title="Novo Log de Atendimento (BI)"
            >
                <i className={`bi ${isOpen ? 'bi-x' : 'bi-headset'} text-xl`}></i>
            </button>
        </div>
    );
};

export default AttendanceVoiceInput;
