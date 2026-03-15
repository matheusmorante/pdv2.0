import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
    title?: string;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan, title = "Escanear Produto" }) => {
    const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
    const scannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let qrCode: Html5Qrcode | null = null;

        const startScanner = async () => {
            if (isOpen && !scanner) {
                // Pequeno delay para garantir que o elemento #qr-reader está no DOM
                await new Promise(resolve => setTimeout(resolve, 100));
                
                try {
                    qrCode = new Html5Qrcode("qr-reader");
                    setScanner(qrCode);

                    await qrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        (decodedText: string) => {
                            onScan(decodedText);
                            qrCode?.stop().then(() => {
                                setScanner(null);
                                onClose();
                            }).catch((err: any) => console.error("Erro ao parar scanner:", err));
                        },
                        (errorMessage: string) => {
                            // Erros de scan (não encontrou QR) são ignorados para não poluir o console
                        }
                    );
                } catch (err: any) {
                    console.error("Falha ao iniciar o scanner:", err);
                }
            }
        };

        startScanner();

        return () => {
            if (qrCode && qrCode.isScanning) {
                qrCode.stop().catch((err: any) => console.error("Erro no cleanup do scanner:", err));
            }
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
                    <div id="qr-reader" className="w-full rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-black relative">
                        {/* Scanner Laser Animation (Overlay) */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <div className="w-full h-0.5 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan-line top-0" />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <i className="bi bi-info-circle-fill text-blue-500 text-xl" />
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 leading-snug">
                                Certifique-se de que o código esteja bem iluminado e centralizado no quadrado.
                            </p>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            Cancelar Escaneamento
                        </button>
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
