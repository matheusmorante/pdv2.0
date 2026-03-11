import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { aiService } from "../../pages/utils/aiService";
import { attendanceService } from "../../pages/utils/attendanceService";
import { useAuth } from "../../context/AuthContext";
import { AttendanceLog } from "../../pages/types/attendance.type";

const AttendanceVoiceInput = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
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
        setTranscript("");
        setIsRecording(true);
        recognitionRef.current.start();
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAttendance = async () => {
        if (!transcript.trim()) {
            toast.warn("Nenhum relato capturado.");
            return;
        }

        setIsProcessing(true);
        try {
            const prompt = `Analise este relato de atendimento de um vendedor de móveis e extraia informações estratégicas de BI no formato JSON.
            RELATO: "${transcript}"
            
            FORMATO ESPERADO:
            {
                "product": "nome do produto citado",
                "reason": "motivo principal (Preço, Modelo, Prazo, Só olhando, etc)",
                "objections": ["lista detalhada de objeções"],
                "sentiment": "sentimento do cliente (Positivo, Negativo, Neutro)",
                "customer_profile": "descrição curta do perfil do cliente (ex: Casal jovem, Reformando casa, Decorador)",
                "priority": "nível de interesse (Quente, Morno, Frio)",
                "value_estimate": 0,
                "suggestions": ["sugestões de produtos alternativos ou ações"],
                "next_step": "ação imediata recomendada para o vendedor"
            }
            Responda APENAS o JSON.`;

            const aiResponse = await aiService.chat(prompt, "Você é um analista de BI especializado em varejo de móveis.");
            let cleanJson = aiResponse.answer.trim();
            if (cleanJson.startsWith('```json')) {
                cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
            } else {
                const match = cleanJson.match(/\{[\s\S]*\}/);
                if (match) cleanJson = match[0];
            }
            
            const structuredData = JSON.parse(cleanJson);

            const log: AttendanceLog = {
                date: new Date().toISOString(),
                salesperson_name: profile?.full_name || "Vendedor",
                transcript: transcript,
                structured_data: structuredData
            };

            await attendanceService.saveLog(log);
            toast.success("BI de Atendimento registrado com sucesso! ✨");
            setTranscript("");
            setIsOpen(false);
        } catch (error) {
            console.error("Erro ao processar BI:", error);
            toast.error("Erro ao processar relato de BI.");
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
                        Diga o que aconteceu no atendimento (produto, motivo da não venda, objeções).
                    </p>

                    <div className="relative mb-4 group">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Diga ou digite o que aconteceu no atendimento (produto, motivo da não venda, objeções)..."
                            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-200 italic resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all custom-scrollbar leading-relaxed"
                        />
                        {!isRecording && !transcript && (
                            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-400 transition-colors">Aguardando Input</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <i className="bi bi-record-circle text-sm"></i>
                                Gravar
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <i className="bi bi-stop-circle text-sm"></i>
                                Parar
                            </button>
                        )}

                        {transcript && !isRecording && (
                            <button
                                onClick={processAttendance}
                                disabled={isProcessing}
                                className="px-5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center"
                            >
                                {isProcessing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="bi bi-send-fill text-sm"></i>}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800' : 'bg-emerald-600 shadow-emerald-200 dark:shadow-none'}`}
                title="Novo Log de Atendimento (BI)"
            >
                <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-headset'} text-xl`}></i>
            </button>
        </div>
    );
};

export default AttendanceVoiceInput;
