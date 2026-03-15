import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
    title?: string;
    closeOnScan?: boolean;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ 
    isOpen, 
    onClose, 
    onScan, 
    title = "Escanear Produto",
    closeOnScan = true
}) => {
    const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const qrContainerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
                scannerRef.current = null;
                setScannerInstance(null);
            } catch (err) {
                console.warn("Erro ao parar scanner:", err);
            }
        }
    };

    const startScanner = async () => {
        if (!isOpen || isInitializing) return;
        
        setIsInitializing(true);
        setError(null);
        
        try {
            // Garante limpeza de instâncias fantasmas antes de começar
            await stopScanner();
            
            // Pequeno delay para garantir que o DOM está pronto e estável
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const readerElem = document.getElementById("qr-reader");
            if (!readerElem) {
                throw new Error("Elemento de leitura não encontrado no DOM.");
            }

            const qrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = qrCode;
            setScannerInstance(qrCode);

            await qrCode.start(
                { facingMode: "environment" },
                {
                    fps: 20,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const size = Math.floor(minEdge * 0.75);
                        return { width: size, height: size };
                    },
                    aspectRatio: 1.0
                },
                (decodedText: string) => {
                    onScan(decodedText);
                    if (closeOnScan) {
                        onClose();
                    }
                },
                () => { /* ignorar erros de frames */ }
            );
        } catch (err: any) {
            console.error("Falha Crítica no Scanner:", err);
            setError(err.message || "Erro ao acessar a câmera. Verifique se outra aba está usando a câmera ou as permissões do navegador.");
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            {title}
                        </h3>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                            Aponte a câmera para o QR Code ou Código de Barras
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>

                <div className="p-8">
                    <div id="qr-reader" className="w-full rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-black relative min-h-[300px] flex items-center justify-center">
                        {isInitializing && (
                            <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Iniciando Câmera...</p>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 z-30 bg-rose-600/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                                <i className="bi bi-camera-video-off text-4xl text-white mb-4" />
                                <p className="text-xs font-black uppercase text-white tracking-widest mb-4 leading-relaxed">
                                    {error}
                                </p>
                                <button
                                    onClick={startScanner}
                                    className="px-6 py-3 bg-white text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        )}

                        {!error && !isInitializing && (
                            <div className="absolute inset-0 pointer-events-none z-10">
                                <div className="w-full h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan-line top-0" />
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        {error && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50 flex items-center gap-4">
                                <i className="bi bi-exclamation-octagon-fill text-rose-600" />
                                <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
                                    Se o problema persistir, cheque as configurações de privacidade do navegador.
                                </p>
                            </div>
                        )}
                        
                        {!error && (
                            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                <i className="bi bi-info-circle-fill text-blue-500 text-xl" />
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 leading-snug">
                                    Certifique-se de que o código esteja bem iluminado e centralizado no quadrado.
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            {error && (
                                <button 
                                    onClick={startScanner}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-emerald-700 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <i className="bi bi-arrow-clockwise" /> Reiniciar
                                </button>
                            )}
                            <button 
                                onClick={onClose}
                                className={`py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl ${error ? 'w-1/3 bg-slate-100 text-slate-400' : 'w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'}`}
                            >
                                {error ? 'Sair' : 'Cancelar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scan-line {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                .animate-scan-line {
                    position: absolute;
                    animation: scan-line 3s ease-in-out infinite;
                }
                #qr-reader button {
                    background-color: #3b82f6 !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 12px !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    cursor: pointer !important;
                    margin-top: 10px !important;
                }
                #qr-reader img {
                    display: none !important;
                }
                #qr-reader__dashboard_section_csr button {
                    display: inline-block !important;
                }
            `}} />
        </div>
    );
};

export default QRScannerModal;
