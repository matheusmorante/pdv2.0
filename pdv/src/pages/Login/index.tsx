import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simple delay for "realistic" feel
        setTimeout(() => {
            const success = login(password);
            if (success) {
                toast.success('Bem-vindo ao PDV ERP!');
                navigate('/');
            } else {
                toast.error('Senha incorreta.');
                setIsSubmitting(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 p-8 sm:p-12 border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-all duration-500">
                    <div className="flex flex-col items-center mb-10 group">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-300 dark:shadow-blue-900/30 flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <span className="text-white font-black text-3xl italic leading-none">P</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">PDV ERP</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mt-3">Gestão de Móveis e Serviços</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Senha de Acesso</label>
                            <div className="relative group">
                                <i className="bi bi-shield-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl pl-12 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-center tracking-widest"
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none mt-2 group"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Entrar no Sistema</span>
                                    <i className="bi bi-arrow-right text-lg group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            ` }} />
        </div>
    );
};

export default Login;
