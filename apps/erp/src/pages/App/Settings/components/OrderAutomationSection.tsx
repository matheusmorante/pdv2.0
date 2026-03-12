import React from 'react';
import { AppSettings } from '../../../utils/settingsService';
import { PatternFormat as PatternFormatBase } from "react-number-format";
const PatternFormat = PatternFormatBase as any;

interface OrderAutomationSectionProps {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

const OrderAutomationSection = ({ settings, onChange }: OrderAutomationSectionProps) => {
    return (
        <div className="flex flex-col">
            <div className="p-8 bg-emerald-50/30 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                        <i className="bi bi-magic text-2xl"></i>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight uppercase">Automação de Pedidos</h4>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-0.5">Ações automáticas após a criação do pedido</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => onChange('orderAutomation.autoPrintReceipt', !settings.orderAutomation.autoPrintReceipt)}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-4 ${settings.orderAutomation.autoPrintReceipt ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'}`}
                    >
                        <i className={`bi bi-receipt text-2xl ${settings.orderAutomation.autoPrintReceipt ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                        <div className="flex-1">
                            <span className="block text-xs font-black uppercase tracking-widest text-slate-400">Impressão</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Imprimir Recibo</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.orderAutomation.autoPrintReceipt ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                            {settings.orderAutomation.autoPrintReceipt && <i className="bi bi-check-lg text-xs"></i>}
                        </div>
                    </div>

                    <div 
                        onClick={() => onChange('orderAutomation.autoPrintDeliveryOrder', !settings.orderAutomation.autoPrintDeliveryOrder)}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-4 ${settings.orderAutomation.autoPrintDeliveryOrder ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'}`}
                    >
                        <i className={`bi bi-truck text-2xl ${settings.orderAutomation.autoPrintDeliveryOrder ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                        <div className="flex-1">
                            <span className="block text-xs font-black uppercase tracking-widest text-slate-400">Logística</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Pedido de Entrega</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.orderAutomation.autoPrintDeliveryOrder ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                            {settings.orderAutomation.autoPrintDeliveryOrder && <i className="bi bi-check-lg text-xs"></i>}
                        </div>
                    </div>

                    <div 
                        onClick={() => onChange('orderAutomation.autoSendWhatsAppDelivery', !settings.orderAutomation.autoSendWhatsAppDelivery)}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-4 ${settings.orderAutomation.autoSendWhatsAppDelivery ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'}`}
                    >
                        <i className={`bi bi-whatsapp text-2xl ${settings.orderAutomation.autoSendWhatsAppDelivery ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                        <div className="flex-1">
                            <span className="block text-xs font-black uppercase tracking-widest text-slate-400">WhatsApp</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Enviar para Entrega</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.orderAutomation.autoSendWhatsAppDelivery ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                            {settings.orderAutomation.autoSendWhatsAppDelivery && <i className="bi bi-check-lg text-xs"></i>}
                        </div>
                    </div>

                    <div 
                        onClick={() => onChange('orderAutomation.autoSendCustomerOrder', !settings.orderAutomation.autoSendCustomerOrder)}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-4 ${settings.orderAutomation.autoSendCustomerOrder ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'}`}
                    >
                        <i className={`bi bi-person-check text-2xl ${settings.orderAutomation.autoSendCustomerOrder ? 'text-emerald-500' : 'text-slate-300'}`}></i>
                        <div className="flex-1">
                            <span className="block text-xs font-black uppercase tracking-widest text-slate-400">WhatsApp</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Enviar para Cliente</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.orderAutomation.autoSendCustomerOrder ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                            {settings.orderAutomation.autoSendCustomerOrder && <i className="bi bi-check-lg text-xs"></i>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone da Equipe de Entrega</label>
                    <PatternFormat
                        format="(##) #####-####"
                        mask="_"
                        value={settings.orderAutomation.deliveryPhone}
                        onValueChange={(values: any) => onChange('orderAutomation.deliveryPhone', values.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-emerald-100 font-bold"
                    />
                </div>
            </div>
        </div>
    );
};

export default OrderAutomationSection;
